import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

// Success / error messages for every API action. Wrap the app once, call useToast() anywhere.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone) => setToast({ id: Date.now(), message, tone }), []);
  const api = useMemo(() => ({ success: (m) => notify(m, "success"), error: (m) => notify(m, "error") }), [notify]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const isError = toast?.tone === "error";

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {toast && (
          <div
            key={toast.id}
            role={isError ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-md animate-rise items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card ${
              isError ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {isError ? <XCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss message"
              className="-mr-1 ml-1 rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
