import { useEffect } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="uai-toasts" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`uai-toast${toast.tone === "error" ? " is-error" : ""}`}>
          {toast.tone === "error" ? <CircleAlert size={15} /> : <CircleCheck size={15} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
