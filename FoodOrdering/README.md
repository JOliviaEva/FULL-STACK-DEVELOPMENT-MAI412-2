# QuickBite – Food Ordering System

React frontend + Node.js/Express backend + SQLite database (Swiggy/Zomato-style ordering).

The old JSON Server API is replaced by Express REST endpoints backed by a real database schema.
SQLite is used through Node's built-in `node:sqlite` module, so there is nothing native to compile
and no database server to install (needs **Node 22.13+**).

## Run

```bash
# terminal 1 – API on http://localhost:5000
cd backend
npm install
npm start          # npm test runs the API + persistence tests

# terminal 2 – React app on http://localhost:5173
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to port 5000. The database file is created on first start at
`backend/data/food.db` and seeded with 10 menu items.

## Features

| Customer | Backend |
|---|---|
| Browse menu, filter by category / veg | Menu stored in `menu_items` |
| Pick items and quantity in a cart | Server validates items and quantities |
| Place order with name, phone, address | Stores `orders` + `order_items` in one transaction |
| Order history (filter by phone) with per-order and grand total | Total is computed **server-side** from DB prices |
| Update order status, delete order | Status / details update, cascade delete |
| Manage Menu tab: add, edit, toggle availability, delete | Full menu CRUD |

## Schema

```
menu_items(id, name, category, description, price, emoji, veg, available)
orders(id, customer_name, phone, address, total, status, created_at)
order_items(id, order_id → orders ON DELETE CASCADE, menu_item_id → menu_items ON DELETE SET NULL,
            name, price, quantity)
```

`order_items` stores a name/price snapshot, so history stays correct if the menu changes later.
`status` is one of `placed | preparing | delivered | cancelled`.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/menu[?available=true]` | List menu |
| GET | `/api/menu/:id` | One item |
| POST | `/api/menu` | Create item |
| PUT/PATCH | `/api/menu/:id` | Update item |
| DELETE | `/api/menu/:id` | Delete item |
| GET | `/api/orders[?phone=]` | History → `{ orders, count, grandTotal }` (grand total excludes cancelled) |
| GET | `/api/orders/:id` | One order with items |
| POST | `/api/orders` | `{ customerName, phone, address, items: [{ menuItemId, quantity }] }` |
| PUT/PATCH | `/api/orders/:id` | Update `status`, `customerName`, `phone`, `address` |
| DELETE | `/api/orders/:id` | Delete order and its items |

Errors return `{ "error": "message" }` with 400 / 404 / 500.

## Demonstrating persistence

1. Start both servers, place an order in the UI (Menu → Cart → Place order).
2. Stop the backend (Ctrl+C) and start it again with `npm start`.
3. Open **My Orders**. The order is still there, read from `backend/data/food.db`.

`npm test` in `backend/` automates this: it creates orders through the API, then opens a second
connection to the database file and checks the rows are on disk.

## Using MongoDB instead

The routes in `backend/app.js` are the only place that touch the data layer. To switch, replace the
`db.prepare(...)` calls with Mongoose models (`MenuItem`, `Order` with embedded `items`) and set
`MONGODB_URI`. The API contract and React UI stay unchanged.
