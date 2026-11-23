# Food Ordering System – QuickBite

**Course:** MAI412 Full Stack Development
**Team members:** _(Name 1, Reg. No.)_ · _(Name 2, Reg. No.)_
**Date:** _(fill in)_

---

## 1. Problem Statement

Develop a food ordering application like Swiggy or Zomato. A customer selects food, chooses a quantity and places an order. The system stores orders and shows the order history and the total amount.

The task is to convert an existing JSON Server based React application into a Node.js + Express application with a database, while keeping the React UI.

## 2. Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, plain CSS |
| Backend | Node.js, Express 4 |
| Database | SQLite (Node's built-in `node:sqlite`) |
| Testing | Node's built-in test runner |

## 3. System Design

### 3.1 Architecture

```
React (port 5173)  ──/api──►  Express (port 5000)  ──►  SQLite (backend/data/food.db)
```

The Vite dev server proxies `/api` calls to Express. The JSON Server endpoints were replaced by Express REST endpoints.

### 3.2 Database Schema

```
menu_items(id, name, category, description, price, emoji, veg, available)
orders(id, customer_name, phone, address, total, status, created_at)
order_items(id, order_id, menu_item_id, name, price, quantity)
```

- One order has many order items. Deleting an order deletes its items (`ON DELETE CASCADE`).
- `order_items` stores the name and price at the time of ordering, so order history stays correct if the menu changes later.
- `status` is one of `placed`, `preparing`, `delivered`, `cancelled`.

### 3.3 REST API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/menu` | List menu items |
| POST | `/api/menu` | Add a menu item |
| PUT / PATCH | `/api/menu/:id` | Update a menu item |
| DELETE | `/api/menu/:id` | Delete a menu item |
| GET | `/api/orders` | Order history with count and grand total |
| GET | `/api/orders/:id` | One order with its items |
| POST | `/api/orders` | Place an order |
| PUT / PATCH | `/api/orders/:id` | Update order status or delivery details |
| DELETE | `/api/orders/:id` | Delete an order |

The server calculates the order total from the prices stored in the database. It does not trust prices sent by the browser.

## 4. Features

- Browse the menu and filter by category or veg only
- Add items to a cart and change quantities
- Place an order with name, phone and address
- View order history with each order total and an overall total
- Update order status and delete orders
- Manage the menu: add, edit, mark unavailable, delete

## 5. How to Run

```bash
# Terminal 1 – backend
cd backend
npm install
npm start

# Terminal 2 – frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## 6. CRUD Operations

| Operation | Menu | Orders |
|---|---|---|
| Create | Add item (Manage Menu) | Place order (Cart) |
| Read | Menu page | My Orders page |
| Update | Edit item, toggle availability | Change order status |
| Delete | Delete item | Delete order |

---

## 7. Results

### 7.1 Menu page

_(Insert screenshot)_

### 7.2 Cart and placing an order

_(Insert screenshot)_

### 7.3 Order history and total amount

_(Insert screenshot)_

### 7.4 CRUD operations (update and delete)

_(Insert screenshot)_

### 7.5 Data persistence in the database

_(Insert screenshot of the order before restarting the server, then after restarting it. You can also add a screenshot of `food.db` opened in a SQLite viewer.)_

### 7.6 Test output

_(Paste the output of `npm test` from the backend folder.)_

---

## 8. Conclusion

_(Write 2–3 lines after the results are added.)_
