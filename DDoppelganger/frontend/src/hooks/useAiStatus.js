import { useEffect, useState } from "react";
import client from "../api/client.js";

export default function useAiStatus() {
  const [status, setStatus] = useState({ loading: true, ai_enabled: false, note: "" });

  useEffect(() => {
    let cancelled = false;
    client
      .get("/health")
      .then(({ data }) => {
        if (!cancelled) setStatus({ loading: false, ...data });
      })
      .catch(() => {
        if (!cancelled)
          setStatus({ loading: false, ai_enabled: false, note: "Backend unreachable — is uvicorn running?" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
