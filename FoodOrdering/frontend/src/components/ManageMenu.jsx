import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const blank = { name: '', category: 'Main', description: '', price: '', emoji: '🍽️', veg: true };

export default function ManageMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null); // id being edited
  const [error, setError] = useState('');

  const load = () => api.getMenu(true).then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.updateMenuItem(editing, form);
      else await api.createMenuItem(form);
      setForm(blank);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ name: item.name, category: item.category, description: item.description, price: item.price, emoji: item.emoji, veg: item.veg });
  };

  const run = (fn) => async () => {
    try { await fn(); load(); } catch (err) { setError(err.message); }
  };

  return (
    <section className="two-col">
      <div>
        <h2>Menu items</h2>
        {error && <p className="error">{error}</p>}
        <table>
          <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th></th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className={i.available ? '' : 'dim'}>
                <td>{i.emoji}</td>
                <td>{i.name}</td>
                <td>{i.category}</td>
                <td>{money(i.price)}</td>
                <td>
                  <input type="checkbox" checked={i.available}
                    onChange={run(() => api.updateMenuItem(i.id, { available: !i.available }))} />
                </td>
                <td>
                  <button onClick={() => startEdit(i)}>Edit</button>
                  <button className="danger" onClick={run(async () => {
                    if (confirm(`Delete "${i.name}"?`)) await api.deleteMenuItem(i.id);
                  })}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={save} className="panel">
        <h2>{editing ? 'Edit item' : 'Add item'}</h2>
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Category<input value={form.category} onChange={set('category')} /></label>
        <label>Description<input value={form.description} onChange={set('description')} /></label>
        <label>Price (₹)<input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} /></label>
        <label>Emoji<input value={form.emoji} onChange={set('emoji')} /></label>
        <label className="inline"><input type="checkbox" checked={form.veg} onChange={set('veg')} /> Vegetarian</label>
        <button className="primary">{editing ? 'Save changes' : 'Add item'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
      </form>
    </section>
  );
}
