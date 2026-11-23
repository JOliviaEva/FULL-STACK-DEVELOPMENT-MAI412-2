// Thin fetch wrapper around the Express API (replaces the old JSON Server calls).
async function request(method, url, body) {
  const res = await fetch(`/api${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  getMenu: (all = false) => request('GET', all ? '/menu' : '/menu?available=true'),
  createMenuItem: (item) => request('POST', '/menu', item),
  updateMenuItem: (id, patch) => request('PATCH', `/menu/${id}`, patch),
  deleteMenuItem: (id) => request('DELETE', `/menu/${id}`),

  getOrders: (phone) => request('GET', phone ? `/orders?phone=${encodeURIComponent(phone)}` : '/orders'),
  placeOrder: (order) => request('POST', '/orders', order),
  updateOrder: (id, patch) => request('PATCH', `/orders/${id}`, patch),
  deleteOrder: (id) => request('DELETE', `/orders/${id}`),
};

export const money = (n) => `₹${Number(n).toFixed(2)}`;
