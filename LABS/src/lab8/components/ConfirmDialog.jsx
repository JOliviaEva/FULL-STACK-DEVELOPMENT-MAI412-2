import { useEffect, useRef } from "react";
import { btnDanger, btnGhost } from "./ui.jsx";

// Modal confirmation for destructive actions. Uses the native <dialog> element,
// which gives focus trapping and Esc-to-close for free.
export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", busy = false, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => e.target === ref.current && !busy && onCancel()}
      className="m-auto w-[min(92vw,26rem)] rounded-xl bg-paper-light p-0 shadow-card backdrop:bg-ink/50"
    >
      <div className="p-5">
        <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{message}</p>
      </div>
      <div className="flex justify-end gap-2 rounded-b-xl border-t border-paper-line bg-paper px-5 py-3">
        <button type="button" onClick={onCancel} disabled={busy} className={btnGhost}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={btnDanger}>
          {busy ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
