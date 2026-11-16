import { useCallback, useEffect, useState } from "react";
import { JSON_SERVER } from "./backends.js";
import { nextApplicationNo, toRecord } from "./model.js";

// Custom hook that owns the applications list and every CRUD call.
// Components get plain data and async functions; they never call fetch directly.
export function useApplications(applicationsApi = JSON_SERVER.api) {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [error, setError] = useState(null);

  // State is only set once the request settles, never synchronously.
  const fetchAll = useCallback(
    (signal) =>
      applicationsApi.list(signal).then(
        (data) => {
          setApplications(data);
          setError(null);
          setStatus("ready");
        },
        (err) => {
          if (err.name === "AbortError") return;
          setError(err.message);
          setStatus("error");
        }
      ),
    [applicationsApi]
  );

  // READ: fetch every record once when the module mounts.
  useEffect(() => {
    const controller = new AbortController();
    fetchAll(controller.signal);
    return () => controller.abort();
  }, [fetchAll]);

  function reload() {
    setStatus("loading");
    fetchAll();
  }

  // CREATE
  async function addApplication(values) {
    const now = new Date().toISOString();
    const created = await applicationsApi.create({
      applicationNo: nextApplicationNo(applications),
      ...toRecord(values),
      createdAt: now,
      updatedAt: now,
    });
    setApplications((prev) => [created, ...prev]);
    return created;
  }

  // UPDATE: PUT replaces the record, so keep the fields the form doesn't edit.
  async function updateApplication(existing, values) {
    const updated = await applicationsApi.update(existing.id, {
      ...existing,
      ...toRecord(values),
      updatedAt: new Date().toISOString(),
    });
    setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
    return updated;
  }

  // DELETE
  async function removeApplication(id) {
    await applicationsApi.remove(id);
    setApplications((prev) => prev.filter((app) => app.id !== id));
  }

  return {
    applications,
    status,
    error,
    reload,
    addApplication,
    updateApplication,
    removeApplication,
  };
}
