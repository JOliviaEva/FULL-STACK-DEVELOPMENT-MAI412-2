import { useState } from "react";
import { Link } from "react-router-dom";
import { path } from "../config.js";
import { STATUS_KEYS, STATUS_META, formatFee } from "../lib/format.js";
import { EMPTY_APPLICATION, SOP_MAX, validateApplication } from "../lib/validate.js";
import { btnGhost, btnPrimary, inputClass } from "./ui.jsx";

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>
      )}
    </div>
  );
}

const NO_ERRORS = {};

// Used for both "new" and "edit". `initial` pre-fills it, `serverErrors` shows messages the API sent back
// (validation, duplicate email, campus not teaching the programme) and `onSubmit(values)` does the request.
export default function ApplicationForm({ initial = EMPTY_APPLICATION, programmes, officers, serverErrors = NO_ERRORS, submitting, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState({});
  const [touched, setTouched] = useState({});
  // A server message disappears once the user edits that field.
  const [edited, setEdited] = useState({ source: serverErrors, names: [] });

  const editedNames = edited.source === serverErrors ? edited.names : [];
  const shownServerErrors = Object.fromEntries(Object.entries(serverErrors).filter(([name]) => !editedNames.includes(name)));
  const errors = { ...shownServerErrors, ...clientErrors };

  // The campus list depends on the programme: only campuses that teach it (programme_campuses table).
  const programme = programmes.find((p) => String(p.id) === values.programmeId);
  const campusOptions = programme?.campuses ?? [];

  function recheck(next, name) {
    setClientErrors((prev) => {
      const { [name]: _removed, ...rest } = prev;
      const message = validateApplication(next)[name];
      return message ? { ...rest, [name]: message } : rest;
    });
  }

  function setField(name, value) {
    let next = { ...values, [name]: value };
    if (name === "programmeId") {
      const offered = programmes.find((p) => String(p.id) === value)?.campuses ?? [];
      if (!offered.some((c) => String(c.id) === values.campusId)) next = { ...next, campusId: "" };
    }
    setValues(next);
    setEdited({ source: serverErrors, names: [...editedNames, name, ...(name === "programmeId" ? ["campusId"] : [])] });
    if (touched[name] || clientErrors[name]) recheck(next, name);
  }

  function blur(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    recheck(values, name);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validateApplication(values);
    setClientErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    onSubmit(values);
  }

  const props = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: (e) => setField(name, e.target.value),
    onBlur: () => blur(name),
    "aria-invalid": errors[name] ? "true" : "false",
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: `${inputClass} ${errors[name] ? "!border-red-500" : ""}`,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-xl border border-paper-line/80 bg-paper-light p-5 shadow-paper sm:p-7">
      <fieldset className="space-y-5">
        <legend className="stamp-label mb-3">Applicant</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Full name" error={errors.name}>
            <input type="text" autoComplete="name" placeholder="e.g. Olivia John" {...props("name")} />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <input type="email" autoComplete="email" placeholder="name@example.com" {...props("email")} />
          </Field>
          <Field id="phone" label="Mobile number" error={errors.phone} hint="10 digits, starting with 6-9">
            <input type="tel" autoComplete="tel" inputMode="numeric" placeholder="9845012376" {...props("phone")} />
          </Field>
          <Field id="twelfthPct" label="12th percentage" error={errors.twelfthPct} hint="Minimum 60% to be eligible">
            <input type="number" inputMode="decimal" min="0" max="100" step="0.1" placeholder="e.g. 88.5" {...props("twelfthPct")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-paper-line pt-5">
        <legend className="stamp-label mb-3">Programme & campus</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="programmeId"
            label="Programme"
            error={errors.programmeId}
            hint={programme ? `${programme.department} · ${programme.durationYears} years · ${formatFee(programme.annualFee)} / year` : undefined}
          >
            <select {...props("programmeId")}>
              <option value="">Select a programme</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field
            id="campusId"
            label="Campus"
            error={errors.campusId}
            hint={programme ? `${campusOptions.length} campus${campusOptions.length === 1 ? "" : "es"} teach this programme` : "Choose a programme first"}
          >
            <select {...props("campusId")} disabled={!programme}>
              <option value="">{programme ? "Select a campus" : "Choose a programme first"}</option>
              {campusOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field id="officerId" label="Assigned officer" error={errors.officerId} hint="Optional. Can be changed later.">
            <select {...props("officerId")}>
              <option value="">Unassigned</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>{o.name} · {o.designation}</option>
              ))}
            </select>
          </Field>
          <Field id="status" label="Status" error={errors.status}>
            <select {...props("status")}>
              {STATUS_KEYS.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <div className="border-t border-paper-line pt-5">
        <Field id="sop" label="Statement of purpose" error={errors.sop} hint={`${values.sop.trim().length}/${SOP_MAX} characters · at least 40`}>
          <textarea rows={5} placeholder="Why do you want to join this programme?" {...props("sop")} />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-paper-line pt-5 sm:flex-row sm:justify-end">
        <Link to={path.applications} className={btnGhost}>
          Cancel
        </Link>
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
