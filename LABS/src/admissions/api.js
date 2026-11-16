// REST client factory. Labs 5 & 6 point it at JSON Server (/api -> :3001) and Lab 7 at the
// Express + MongoDB server (/mern-api -> :5001); see vite.config.js for the proxies.
// Set VITE_API_URL / VITE_MERN_API_URL to point elsewhere.
async function request(url, { method = "GET", body, signal, offlineMessage } = {}) {
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
    throw new Error(offlineMessage);
  }
  if (!res.ok) {
    // Express answers with { message, errors }; JSON Server with an empty body.
    const detail = await res.json().catch(() => null);
    const reasons = detail?.errors ? Object.values(detail.errors).join(", ") : detail?.message;
    throw new Error(reasons || `${method} ${url} failed (HTTP ${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export function createApplicationsApi(baseUrl, offlineMessage) {
  const url = `${baseUrl}/applications`;
  return {
    list: (signal) => request(url, { signal, offlineMessage }),
    create: (record) => request(url, { method: "POST", body: record, offlineMessage }),
    update: (id, record) => request(`${url}/${id}`, { method: "PUT", body: record, offlineMessage }),
    remove: (id) => request(`${url}/${id}`, { method: "DELETE", offlineMessage }),
  };
}
