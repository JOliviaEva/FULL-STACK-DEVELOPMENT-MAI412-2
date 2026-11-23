// The only file in Lab 8 that talks to the Express server. Components call these functions
// and get plain data back; they never build URLs or touch axios themselves.
//
// In development Vite proxies /sql-api to the Express server (see vite.config.js).
// For a deployed backend set VITE_SQL_API_URL, e.g. https://my-api.onrender.com/api.
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_SQL_API_URL ?? "/sql-api/api",
  timeout: 10000,
});

const data = (promise) => promise.then((res) => res.data);

// ---- applications (each row arrives joined with its programme, campus and officer) ----
// Query parameters: q, programmeId, campusId, officerId ("none" = unassigned), status, sort. Empty ones are dropped.
export function listApplications(filters = {}, signal) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
  return data(http.get("/applications", { params, signal }));
}
export const getApplication = (id, signal) => data(http.get(`/applications/${id}`, { signal })); // path parameter; includes notes
export const createApplication = (body) => data(http.post("/applications", body));
export const updateApplication = (id, body) => data(http.put(`/applications/${id}`, body));
export const patchApplication = (id, body) => data(http.patch(`/applications/${id}`, body)); // status and/or officerId
export const deleteApplication = (id) => data(http.delete(`/applications/${id}`));

// ---- notes (child rows of an application) ----
export const addNote = (applicationId, body) => data(http.post(`/applications/${applicationId}/notes`, body));
export const deleteNote = (applicationId, noteId) => data(http.delete(`/applications/${applicationId}/notes/${noteId}`));

// ---- the other tables ----
export const listProgrammes = (signal) => data(http.get("/programmes", { signal }));
export const createProgramme = (body) => data(http.post("/programmes", body));
export const updateProgramme = (id, body) => data(http.put(`/programmes/${id}`, body));
export const deleteProgramme = (id) => data(http.delete(`/programmes/${id}`));
export const listCampuses = (signal) => data(http.get("/campuses", { signal }));
export const listOfficers = (signal) => data(http.get("/officers", { signal }));
export const getStats = (signal) => data(http.get("/stats", { signal }));

// Turns any axios failure into { message, fieldErrors } for toasts and form messages.
export function describeError(err) {
  if (err.response) {
    const { message, errors } = err.response.data ?? {};
    return { message: message ?? `Request failed (HTTP ${err.response.status})`, fieldErrors: errors ?? {} };
  }
  if (err.code === "ECONNABORTED") return { message: "The server took too long to answer.", fieldErrors: {} };
  return { message: "Cannot reach the server. Is the Express API running?", fieldErrors: {} };
}

export const isCancelled = (err) => axios.isCancel(err);
