// REST client for JSON Server. In development Vite proxies /api to
// http://localhost:3001 (see vite.config.js); set VITE_API_URL to point elsewhere.
const BASE_URL = `${import.meta.env.VITE_API_URL ?? "/api"}/applications`;

async function request(url, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Network error: is JSON Server running?");
  }
  if (!res.ok) throw new Error(`${method} ${url} failed (HTTP ${res.status})`);
  return res.status === 204 ? null : res.json();
}

export const applicationsApi = {
  list: (signal) => request(BASE_URL, { signal }),
  create: (record) => request(BASE_URL, { method: "POST", body: record }),
  update: (id, record) => request(`${BASE_URL}/${id}`, { method: "PUT", body: record }),
  remove: (id) => request(`${BASE_URL}/${id}`, { method: "DELETE" }),
};
