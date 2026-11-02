import { Pencil, Trash2 } from "lucide-react";
import Button from "./Button.jsx";
import FitMeter from "./FitMeter.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { fitScore } from "../model.js";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function ApplicationRow({ app, isEditing, isFlashing, onEdit, onDelete }) {
  const rowClass = [isEditing && "is-editing", isFlashing && "is-flash"].filter(Boolean).join(" ");
  return (
    <tr className={rowClass || undefined}>
      <td className="uai-cell-applicant" data-label="Applicant">
        <p className="uai-name">{app.name}</p>
        <p className="uai-sub">{app.email}</p>
        <p className="uai-mono-note">
          {app.applicationNo} · {dateFormat.format(new Date(app.createdAt))}
        </p>
      </td>
      <td className="uai-cell-programme" data-label="Programme">
        <p>{app.programme}</p>
        <p className="uai-sub">{app.campus}</p>
      </td>
      <td className="uai-cell-assessment" data-label="Fit & status">
        <FitMeter score={fitScore(app.twelfthPct, app.sop)} caption={`12th: ${app.twelfthPct}%`} />
        <StatusBadge status={app.status} />
      </td>
      <td className="uai-cell-actions" data-label="Actions">
        <Button
          size="icon"
          icon={Pencil}
          onClick={() => onEdit(app)}
          aria-label={`Edit ${app.name}`}
          title="Edit"
        />
        <Button
          size="icon"
          variant="danger-ghost"
          icon={Trash2}
          onClick={() => onDelete(app)}
          aria-label={`Delete ${app.name}`}
          title="Delete"
        />
      </td>
    </tr>
  );
}
