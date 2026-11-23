import { useState } from 'react';
import { api, money } from '../api.js';

export default function Cart({ lines, setQty, onPlaced }) {
  const [form, setForm] = useState({ customerName: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const total = lines.reduce((s, l) => s + l.item.price * l.quantity, 0);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.placeOrder({
        ...form,
        items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity })),
      });
      localStorage.setItem('quickbite.phone', form.phone);
      onPlaced();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!lines.length) return <p className="muted">Your cart is empty. Add something tasty from the menu!</p>;

  return (
    <section className="two-col">
      <div>
        <h2>Your cart</h2>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {lines.map(({ item, quantity }) => (
              <tr key={item.id}>
                <td>{item.emoji} {item.name}</td>
                <td>
                  <div className="stepper">
                    <button onClick={() => setQty(item, quantity - 1)}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQty(item, quantity + 1)}>+</button>
                  </div>
                </td>
                <td>{money(item.price)}</td>
                <td>{money(item.price * quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan="3">Total</td><td><strong>{money(total)}</strong></td></tr>
          </tfoot>
        </table>
      </div>

      <form onSubmit={submit} className="panel">
        <h2>Delivery details</h2>
        <label>Name<input required value={form.customerName} onChange={set('customerName')} /></label>
        <label>Phone<input required value={form.phone} onChange={set('phone')} placeholder="9876543210" /></label>
        <label>Address<textarea required rows="3" value={form.address} onChange={set('address')} /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Placing…' : `Place order · ${money(total)}`}</button>
      </form>
    </section>
  );
}
