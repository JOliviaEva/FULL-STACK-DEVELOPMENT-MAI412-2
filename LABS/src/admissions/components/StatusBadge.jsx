import { statusMeta } from "../model.js";

export default function StatusBadge({ status }) {
  const { label, color } = statusMeta(status);
  return (
    <span className="uai-badge" style={{ "--c": color }}>
      <i className="uai-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
