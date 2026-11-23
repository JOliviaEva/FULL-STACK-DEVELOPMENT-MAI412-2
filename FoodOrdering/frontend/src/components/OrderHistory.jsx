import { useCallback, useEffect, useState } from 'react';
import { api, money } from '../api.js';

const STATUSES = ['placed', 'preparing', 'delivered', 'cancelled'];

export default function OrderHistory() {
  const [phone, setPhone] = useState(localStorage.getItem('quickbite.phone') || '');
  const [data, setData] = useState({ orders: [], count: 0, grandTotal: 0 });
  const [error, setError] = useState('');

  const load = useCallback(
    (p) => api.getOrders(p).then(setData).catch((e) => setError(e.message)),
    []
  );
  useEffect(() => {
    load(phone || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  async function changeStatus(id, status) {
    try {
      await api.updateOrder(id, { status });
      load(phone || undefined);
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(id) {
    if (!confirm(`Delete order #${id}? This cannot be undone.`)) return;
    try {
      await api.deleteOrder(id);
      load(phone || undefined);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          load(phone.trim() || undefined);
        }}
      >
        <input placeholder="Filter by phone number (blank = all)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="primary">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="summary">
        <div><span className="muted">Orders</span><strong>{data.count}</strong></div>
        <div><span className="muted">Total spent (excl. cancelled)</span><strong>{money(data.grandTotal)}</strong></div>
      </div>

      {!data.orders.length && <p className="muted">No orders yet.</p>}

      {data.orders.map((o) => (
        <article key={o.id} className="panel order">
          <header className="row">
            <h3>Order #{o.id}</h3>
            <span className={`badge ${o.status}`}>{o.status}</span>
          </header>
          <p className="muted">
            {new Date(o.createdAt).toLocaleString()} · {o.customerName} · {o.phone}<br />
            {o.address}
          </p>
          <ul>
            {o.items.map((i, idx) => (
              <li key={idx} className="row">
                <span>{i.quantity} × {i.name}</span>
                <span>{money(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <footer className="row">
            <strong>Total: {money(o.total)}</strong>
            <span>
              <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button className="danger" onClick={() => remove(o.id)}>Delete</button>
            </span>
          </footer>
        </article>
      ))}
    </section>
  );
}
