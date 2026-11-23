// SQLite persistence using Node's built-in node:sqlite (no native build needed).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.env.DB_FILE || path.join(here, 'data', 'food.db');
if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });

export const db = new DatabaseSync(file);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

// ---- Schema -------------------------------------------------------------
// menu_items 1 ──< order_items >── 1 orders
// order_items keeps a name/price snapshot so history stays correct if the menu changes.
db.exec(`
CREATE TABLE IF NOT EXISTS menu_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL DEFAULT 'Main',
  description TEXT    NOT NULL DEFAULT '',
  price       REAL    NOT NULL CHECK (price >= 0),
  emoji       TEXT    NOT NULL DEFAULT '🍽️',
  veg         INTEGER NOT NULL DEFAULT 1,
  available   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT NOT NULL,
  total         REAL NOT NULL,
  status        TEXT NOT NULL DEFAULT 'placed'
                CHECK (status IN ('placed','preparing','delivered','cancelled')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
  name         TEXT    NOT NULL,
  price        REAL    NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
`);

// ---- Seed data (only when the menu is empty) -------------------------------
const seed = [
  ['Margherita Pizza', 'Pizza', 'Classic tomato, mozzarella and basil', 249, '🍕', 1],
  ['Pepperoni Pizza', 'Pizza', 'Loaded with spicy pepperoni', 329, '🍕', 0],
  ['Paneer Butter Masala', 'Main', 'Creamy tomato gravy with paneer cubes', 279, '🍛', 1],
  ['Chicken Biryani', 'Main', 'Hyderabadi-style dum biryani', 299, '🍗', 0],
  ['Veg Burger', 'Burgers', 'Crispy patty, lettuce, cheese', 129, '🍔', 1],
  ['Chicken Burger', 'Burgers', 'Grilled chicken with house sauce', 169, '🍔', 0],
  ['Masala Dosa', 'South Indian', 'Crispy dosa with potato filling', 109, '🥞', 1],
  ['French Fries', 'Sides', 'Salted and crispy', 89, '🍟', 1],
  ['Chocolate Brownie', 'Dessert', 'Warm brownie with fudge', 119, '🍫', 1],
  ['Cold Coffee', 'Drinks', 'Thick and chilled', 99, '🥤', 1],
];
if (db.prepare('SELECT COUNT(*) AS c FROM menu_items').get().c === 0) {
  const ins = db.prepare(
    'INSERT INTO menu_items (name, category, description, price, emoji, veg) VALUES (?,?,?,?,?,?)'
  );
  for (const row of seed) ins.run(...row);
}

/** Run fn inside a transaction; rolls back if it throws. */
export function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
