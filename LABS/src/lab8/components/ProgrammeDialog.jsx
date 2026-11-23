import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { EMPTY_PROGRAMME, programmeToForm, validateProgramme } from "../lib/validate.js";
import { btnGhost, btnPrimary, inputClass } from "./ui.jsx";

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>
      )}
    </div>
  );
}

// Create / edit a programme in a modal. Mounted only while open, so it starts fresh every time.
// `serverErrors` carries the API's field messages (duplicate code, seats below admitted, campus in use…).
export default function ProgrammeDialog({ programme, campuses, serverErrors, submitting, onSubmit, onClose }) {
  const ref = useRef(null);
  const [values, setValues] = useState(programme ? programmeToForm(programme) : EMPTY_PROGRAMME);
  const [clientErrors, setClientErrors] = useState({});
  const [edited, setEdited] = useState({ source: serverErrors, names: [] });

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const editedNames = edited.source === serverErrors ? edited.names : [];
  const shown = Object.fromEntries(Object.entries(serverErrors).filter(([name]) => !editedNames.includes(name)));
  const errors = { ...shown, ...clientErrors };

  function change(name, value) {
    const next = { ...values, [name]: value };
    setValues(next);
    setEdited({ source: serverErrors, names: [...editedNames, name] });
    if (clientErrors[name]) {
      setClientErrors((prev) => {
        const { [name]: _removed, ...rest } = prev;
        const message = validateProgramme(next)[name];
        return message ? { ...rest, [name]: message } : rest;
      });
    }
  }

  const toggleCampus = (id) =>
    change("campusIds", values.campusIds.includes(id) ? values.campusIds.filter((c) => c !== id) : [...values.campusIds, id]);

  function handleSubmit(e) {
    e.preventDefault();
    const found = validateProgramme(values);
    setClientErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    onSubmit(values);
  }

  const props = (name) => ({
    id: name,
    value: values[name],
    onChange: (e) => change(name, e.target.value),
    "aria-invalid": errors[name] ? "true" : "false",
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: `${inputClass} ${errors[name] ? "!border-red-500" : ""}`,
  });

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!submitting) onClose();
      }}
      onClick={(e) => e.target === ref.current && !submitting && onClose()}
      className="m-auto w-[min(94vw,40rem)] rounded-xl bg-paper-light p-0 shadow-card backdrop:bg-ink/50"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-between border-b border-paper-line px-5 py-4 sm:px-6">
          <h2 className="font-serif text-xl font-semibold text-plum-500">{programme ? `Edit ${programme.name}` : "New programme"}</h2>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close" className="rounded p-1 text-ink-soft hover:bg-paper-dark">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
            <Field id="code" label="Code" error={errors.code} hint="e.g. BTECH-DS">
              <input type="text" placeholder="MBA" {...props("code")} />
            </Field>
            <Field id="name" label="Programme name" error={errors.name}>
              <input type="text" placeholder="e.g. MBA" {...props("name")} />
            </Field>
          </div>
          <Field id="department" label="Department / school" error={errors.department}>
            <input type="text" placeholder="School of Business & Management" {...props("department")} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="durationYears" label="Years" error={errors.durationYears}>
              <input type="number" min="1" max="6" {...props("durationYears")} />
            </Field>
            <Field id="seats" label="Seats" error={errors.seats}>
              <input type="number" min="1" {...props("seats")} />
            </Field>
            <Field id="annualFee" label="Annual fee (₹)" error={errors.annualFee}>
              <input type="number" min="0" step="1000" {...props("annualFee")} />
            </Field>
          </div>

          <fieldset aria-describedby={errors.campusIds ? "campusIds-error" : undefined}>
            <legend className="mb-2 text-sm font-medium text-ink">Taught at</legend>
            <div id="campusIds" tabIndex={-1} className="grid gap-2 sm:grid-cols-2">
              {campuses.map((c) => {
                const on = values.campusIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
                      on ? "border-plum-500 bg-plum-50 text-plum-700" : "border-paper-line bg-white text-ink-soft hover:border-plum-300"
                    }`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleCampus(c.id)} className="h-4 w-4 accent-plum-500" />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.campusIds && <p id="campusIds-error" className="mt-1.5 text-xs font-medium text-red-600">{errors.campusIds}</p>}
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 rounded-b-xl border-t border-paper-line bg-paper px-5 py-3 sm:px-6">
          <button type="button" onClick={onClose} disabled={submitting} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? "Saving…" : programme ? "Save changes" : "Create programme"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
