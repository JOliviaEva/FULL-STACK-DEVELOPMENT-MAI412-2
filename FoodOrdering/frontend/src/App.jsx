import { useState } from 'react';
import Menu from './components/Menu.jsx';
import Cart from './components/Cart.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import ManageMenu from './components/ManageMenu.jsx';

export default function App() {
  const [tab, setTab] = useState('menu');
  const [cart, setCart] = useState({}); // { [menuItemId]: { item, quantity } }

  const setQty = (item, quantity) =>
    setCart((c) => {
      const next = { ...c };
      if (quantity <= 0) delete next[item.id];
      else next[item.id] = { item, quantity: Math.min(quantity, 50) };
      return next;
    });

  const lines = Object.values(cart);
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  const tabs = [
    ['menu', 'Menu'],
    ['cart', `Cart (${count})`],
    ['orders', 'My Orders'],
    ['manage', 'Manage Menu'],
  ];

  return (
    <>
      <header className="topbar">
        <h1>🍴 QuickBite</h1>
        <nav>
          {tabs.map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === 'menu' && <Menu cart={cart} setQty={setQty} goCart={() => setTab('cart')} />}
        {tab === 'cart' && (
          <Cart
            lines={lines}
            setQty={setQty}
            onPlaced={() => {
              setCart({});
              setTab('orders');
            }}
          />
        )}
        {tab === 'orders' && <OrderHistory />}
        {tab === 'manage' && <ManageMenu />}
      </main>
    </>
  );
}
