import { useEffect, useState } from "react";
import { describeError, isCancelled } from "../api.js";

// Loads data with `load(signal)` whenever `deps` change, and again after reload().
// Returns { data, error, loading, reload }. Old data stays visible while a new request is in flight,
// and state is only set once a request settles (never synchronously inside the effect).
export function useAsync(load, deps = []) {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const key = JSON.stringify([deps, tick]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => setResult({ key, data, error: null }),
      (err) => {
        if (isCancelled(err)) return;
        setResult((prev) => ({ key, data: prev.data, error: describeError(err).message }));
      },
    );
    return () => controller.abort();
    // `load` is a new closure every render; `key` already captures what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const settled = result.key === key;
  return {
    data: result.data,
    error: settled ? result.error : null,
    loading: !settled,
    reload: () => setTick((n) => n + 1),
  };
}
