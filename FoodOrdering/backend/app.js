import express from 'express';
import cors from 'cors';
import { db, transaction } from './db.js';

export const app = express();
app.use(cors());
app.use(express.json());

const STATUSES = ['placed', 'preparing', 'delivered', 'cancelled'];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const bad = (msg) => new HttpError(400, msg);
const str = (v) => (typeof v === 'string' ? v.trim() : '');

// ---- Menu -------------------------------------------------------------------
const menuRow = (r) => ({ ...r, veg: !!r.veg, available: !!r.available });

function parseMenuBody(b, partial = false) {
  const out = {};
  if (!partial || b.name !== undefined) {
    out.name = str(b.name);
    if (!out.name) throw bad('name is required');
  }
  if (!partial || b.price !== undefined) {
    out.price = Number(b.price);
    if (!Number.isFinite(out.price) || out.price < 0) throw bad('price must be a non-negative number');
  }
  if (b.category !== undefined) out.category = str(b.category) || 'Main';
  if (b.description !== undefined) out.description = str(b.description);
  if (b.emoji !== undefined) out.emoji = str(b.emoji) || '🍽️';
  if (b.veg !== undefined) out.veg = b.veg ? 1 : 0;
  if (b.available !== undefined) out.available = b.available ? 1 : 0;
  return out;
}

app.get('/api/menu', (req, res) => {
  const onlyAvailable = req.query.available === 'true';
  const rows = db
    .prepare(`SELECT * FROM menu_items ${onlyAvailable ? 'WHERE available = 1' : ''} ORDER BY category, name`)
    .all();
  res.json(rows.map(menuRow));
});

app.get('/api/menu/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!row) throw new HttpError(404, 'Menu item not found');
  res.json(menuRow(row));
});

app.post('/api/menu', (req, res) => {
  const d = { category: 'Main', description: '', emoji: '🍽️', veg: 1, available: 1, ...parseMenuBody(req.body) };
  const info = db
    .prepare(
      'INSERT INTO menu_items (name, category, description, price, emoji, veg, available) VALUES (?,?,?,?,?,?,?)'
    )
    .run(d.name, d.category, d.description, d.price, d.emoji, d.veg, d.available);
  const row = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(menuRow(row));
});

// PUT / PATCH both update only the supplied fields
const updateMenu = (req, res) => {
  const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!existing) throw new HttpError(404, 'Menu item not found');
  const d = { ...existing, ...parseMenuBody(req.body, true) };
  db.prepare(
    'UPDATE menu_items SET name=?, category=?, description=?, price=?, emoji=?, veg=?, available=? WHERE id=?'
  ).run(d.name, d.category, d.description, d.price, d.emoji, d.veg, d.available, existing.id);
  res.json(menuRow(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(existing.id)));
};
app.put('/api/menu/:id', updateMenu);
app.patch('/api/menu/:id', updateMenu);

app.delete('/api/menu/:id', (req, res) => {
  const info = db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  if (!info.changes) throw new HttpError(404, 'Menu item not found');
  res.status(204).end();
});

// ---- Orders -----------------------------------------------------------------
const orderRow = (o) => ({
  id: o.id,
  customerName: o.customer_name,
  phone: o.phone,
  address: o.address,
  total: o.total,
  status: o.status,
  createdAt: o.created_at,
  items: db
    .prepare('SELECT menu_item_id AS menuItemId, name, price, quantity FROM order_items WHERE order_id = ? ORDER BY id')
    .all(o.id)
    .map((i) => ({ ...i, lineTotal: +(i.price * i.quantity).toFixed(2) })),
});

app.get('/api/orders', (req, res) => {
  const phone = str(req.query.phone);
  const rows = phone
    ? db.prepare('SELECT * FROM orders WHERE phone = ? ORDER BY id DESC').all(phone)
    : db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const orders = rows.map(orderRow);
  // grandTotal excludes cancelled orders
  const grandTotal = +orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0)
    .toFixed(2);
  res.json({ orders, count: orders.length, grandTotal });
});

app.get('/api/orders/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!row) throw new HttpError(404, 'Order not found');
  res.json(orderRow(row));
});

app.post('/api/orders', (req, res) => {
  const customerName = str(req.body.customerName);
  const phone = str(req.body.phone);
  const address = str(req.body.address);
  if (!customerName) throw bad('customerName is required');
  if (!/^[0-9+\-\s]{7,15}$/.test(phone)) throw bad('a valid phone number is required');
  if (!address) throw bad('address is required');
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) throw bad('items must be a non-empty array');

  // merge duplicate lines and validate quantities
  const wanted = new Map();
  for (const it of req.body.items) {
    const id = Number(it.menuItemId);
    const qty = Number(it.quantity);
    if (!Number.isInteger(id)) throw bad('each item needs a menuItemId');
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) throw bad('quantity must be an integer between 1 and 50');
    wanted.set(id, (wanted.get(id) || 0) + qty);
  }

  const order = transaction(() => {
    const lines = [];
    for (const [id, quantity] of wanted) {
      const m = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
      if (!m) throw bad(`menu item ${id} does not exist`);
      if (!m.available) throw bad(`${m.name} is currently unavailable`);
      lines.push({ id, name: m.name, price: m.price, quantity }); // price comes from the DB, not the client
    }
    const total = +lines.reduce((s, l) => s + l.price * l.quantity, 0).toFixed(2);
    const { lastInsertRowid: orderId } = db
      .prepare('INSERT INTO orders (customer_name, phone, address, total) VALUES (?,?,?,?)')
      .run(customerName, phone, address, total);
    const ins = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?,?,?,?,?)'
    );
    for (const l of lines) ins.run(orderId, l.id, l.name, l.price, l.quantity);
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  });
  res.status(201).json(orderRow(order));
});

// Update status and/or delivery details (items/total are immutable once placed)
const updateOrder = (req, res) => {
  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!existing) throw new HttpError(404, 'Order not found');
  const b = req.body;
  const d = {
    customer_name: b.customerName !== undefined ? str(b.customerName) : existing.customer_name,
    phone: b.phone !== undefined ? str(b.phone) : existing.phone,
    address: b.address !== undefined ? str(b.address) : existing.address,
    status: b.status !== undefined ? b.status : existing.status,
  };
  if (!d.customer_name || !d.phone || !d.address) throw bad('customerName, phone and address cannot be empty');
  if (!STATUSES.includes(d.status)) throw bad(`status must be one of: ${STATUSES.join(', ')}`);
  db.prepare('UPDATE orders SET customer_name=?, phone=?, address=?, status=? WHERE id=?').run(
    d.customer_name, d.phone, d.address, d.status, existing.id
  );
  res.json(orderRow(db.prepare('SELECT * FROM orders WHERE id = ?').get(existing.id)));
};
app.put('/api/orders/:id', updateOrder);
app.patch('/api/orders/:id', updateOrder);

app.delete('/api/orders/:id', (req, res) => {
  const info = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id); // items cascade
  if (!info.changes) throw new HttpError(404, 'Order not found');
  res.status(204).end();
});

// ---- Errors -----------------------------------------------------------------
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ error: 'Invalid JSON body' });
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});
