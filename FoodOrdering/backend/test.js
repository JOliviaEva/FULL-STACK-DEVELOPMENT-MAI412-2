// Run with: npm test   (uses a throwaway DB file, then re-opens it to prove persistence)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = mkdtempSync(path.join(tmpdir(), 'food-'));
process.env.DB_FILE = path.join(dir, 'test.db');

const { app } = await import('./app.js');
const server = app.listen(0);
const base = `http://localhost:${server.address().port}/api`;
const call = async (method, url, body) => {
  const r = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, body: r.status === 204 ? null : await r.json() };
};

test.after(async () => {
  server.close();
  (await import('./db.js')).db.close(); // release the file lock (needed on Windows)
  rmSync(dir, { recursive: true, force: true });
});

test('menu CRUD', async () => {
  const list = await call('GET', '/menu');
  assert.equal(list.status, 200);
  assert.ok(list.body.length >= 10);

  const created = await call('POST', '/menu', { name: 'Test Roll', price: 50, category: 'Test' });
  assert.equal(created.status, 201);
  const id = created.body.id;

  const updated = await call('PATCH', `/menu/${id}`, { price: 75, available: false });
  assert.equal(updated.body.price, 75);
  assert.equal(updated.body.available, false);

  assert.equal((await call('POST', '/menu', { name: '', price: 1 })).status, 400);
  assert.equal((await call('DELETE', `/menu/${id}`)).status, 204);
  assert.equal((await call('GET', `/menu/${id}`)).status, 404);
});

test('order lifecycle computes total server-side and persists', async () => {
  const menu = (await call('GET', '/menu')).body;
  const [a, b] = menu;
  const created = await call('POST', '/orders', {
    customerName: 'Olivia',
    phone: '9845012376',
    address: '12 MG Road',
    items: [
      { menuItemId: a.id, quantity: 2 },
      { menuItemId: b.id, quantity: 1 },
      { menuItemId: a.id, quantity: 1 }, // duplicate line gets merged
    ],
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.items.length, 2);
  assert.equal(created.body.total, +(a.price * 3 + b.price).toFixed(2));

  const orderId = created.body.id;
  const hist = await call('GET', '/orders?phone=9845012376');
  assert.equal(hist.body.count, 1);
  assert.equal(hist.body.grandTotal, created.body.total);

  const upd = await call('PATCH', `/orders/${orderId}`, { status: 'delivered' });
  assert.equal(upd.body.status, 'delivered');
  assert.equal((await call('PATCH', `/orders/${orderId}`, { status: 'nope' })).status, 400);

  // validation
  assert.equal((await call('POST', '/orders', { customerName: 'x', phone: '9845012376', address: 'y', items: [] })).status, 400);
  assert.equal((await call('POST', '/orders', { customerName: 'x', phone: '1', address: 'y', items: [{ menuItemId: a.id, quantity: 1 }] })).status, 400);
  assert.equal((await call('POST', '/orders', { customerName: 'x', phone: '9845012376', address: 'y', items: [{ menuItemId: a.id, quantity: 0 }] })).status, 400);
});

test('data is on disk: a separate connection sees the order', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const other = new DatabaseSync(process.env.DB_FILE);
  assert.equal(other.prepare('SELECT COUNT(*) c FROM orders').get().c, 1);
  assert.equal(other.prepare('SELECT status FROM orders').get().status, 'delivered');
  assert.equal(other.prepare('SELECT COUNT(*) c FROM order_items').get().c, 2);
  other.close();
});

test('deleting an order cascades to order_items', async () => {
  const { db } = await import('./db.js');
  const [{ id }] = (await call('GET', '/orders')).body.orders;
  assert.equal((await call('DELETE', '/orders/' + id)).status, 204);
  assert.equal(db.prepare('SELECT COUNT(*) c FROM order_items').get().c, 0);
  assert.equal((await call('GET', '/orders/' + id)).status, 404);
});
