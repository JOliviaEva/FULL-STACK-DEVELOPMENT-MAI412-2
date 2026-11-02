import { useEffect, useRef } from "react";
import Button from "./Button.jsx";

// Native <dialog> gives us focus trapping and Escape-to-close for free.
export default function ConfirmDialog({ open, title, children, confirmLabel = "Confirm", busy, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="uai-dialog"
      aria-labelledby="uai-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => e.target === ref.current && !busy && onCancel()}
    >
      <h3 id="uai-dialog-title" className="uai-dialog-title">
        {title}
      </h3>
      <div className="uai-dialog-body">{children}</div>
      <div className="uai-dialog-actions">
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
