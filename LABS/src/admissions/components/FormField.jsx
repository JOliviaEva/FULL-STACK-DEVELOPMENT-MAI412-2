// Shared label + control + message layout used by every input component.
export default function FormField({ id, label, error, hint, aside, compact = false, children }) {
  return (
    <div className={`uai-field${error ? " is-error" : ""}${compact ? " is-compact" : ""}`}>
      <label htmlFor={id} className="uai-label">
        <span>{label}</span>
        {aside && <span className="uai-label-aside">{aside}</span>}
      </label>
      {children}
      {!compact && (
        <p id={`${id}-msg`} className="uai-msg" aria-live="polite">
          {error ?? hint ?? " "}
        </p>
      )}
    </div>
  );
}
