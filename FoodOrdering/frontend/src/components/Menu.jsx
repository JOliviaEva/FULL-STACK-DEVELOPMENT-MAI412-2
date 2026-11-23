import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

export default function Menu({ cart, setQty, goCart }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    api.getMenu().then(setItems).catch((e) => setError(e.message));
  }, []);

  const categories = ['All', ...new Set(items.map((i) => i.category))];
  const shown = items.filter((i) => (category === 'All' || i.category === category) && (!vegOnly || i.veg));
  const total = Object.values(cart).reduce((s, l) => s + l.item.price * l.quantity, 0);

  return (
    <section>
      {error && <p className="error">{error} — is the backend running on port 5000?</p>}
      <div className="filters">
        {categories.map((c) => (
          <button key={c} className={c === category ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
        <label className="veg-toggle">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Veg only
        </label>
      </div>

      <div className="grid">
        {shown.map((item) => {
          const qty = cart[item.id]?.quantity || 0;
          return (
            <article key={item.id} className="card">
              <div className="emoji">{item.emoji}</div>
              <h3>
                <span className={item.veg ? 'dot veg' : 'dot nonveg'} title={item.veg ? 'Veg' : 'Non-veg'} />
                {item.name}
              </h3>
              <p className="muted">{item.description}</p>
              <div className="row">
                <strong>{money(item.price)}</strong>
                {qty === 0 ? (
                  <button className="primary" onClick={() => setQty(item, 1)}>Add</button>
                ) : (
                  <div className="stepper">
                    <button onClick={() => setQty(item, qty - 1)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(item, qty + 1)}>+</button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
        {!shown.length && !error && <p className="muted">No items found.</p>}
      </div>

      {total > 0 && (
        <div className="cartbar">
          <span>{Object.keys(cart).length} item(s) · {money(total)}</span>
          <button className="primary" onClick={goCart}>View cart →</button>
        </div>
      )}
    </section>
  );
}
