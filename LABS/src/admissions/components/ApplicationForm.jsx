import { useState } from "react";
import { Plus, RotateCcw, Save, X } from "lucide-react";
import Button from "./Button.jsx";
import InputField from "./InputField.jsx";
import SelectField from "./SelectField.jsx";
import TextAreaField from "./TextAreaField.jsx";
import RadioGroup from "./RadioGroup.jsx";
import FitMeter from "./FitMeter.jsx";
import {
  CAMPUSES,
  EMPTY_FORM,
  PROGRAMMES,
  SOP_MAX,
  STATUSES,
  fitScore,
  fitSuggestion,
  toFormValues,
  validate,
} from "../model.js";

// Used for both Create and Update. The parent remounts it (via `key`)
// whenever a different record is opened for editing.
export default function ApplicationForm({ editing, onSubmit, onCancel }) {
  const initialValues = editing ? toFormValues(editing) : EMPTY_FORM;
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validate(values);
  const errorFor = (field) => (touched[field] || submitted ? errors[field] : undefined);
  const canScore = !errors.twelfthPct && !errors.sop;
  const score = canScore ? fitScore(values.twelfthPct, values.sop) : null;

  // One handler for every input, select, textarea and radio, keyed by `name`.
  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function resetForm() {
    setValues(initialValues);
    setTouched({});
    setSubmitted(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      e.currentTarget.elements.namedItem(firstInvalid)?.focus();
      return;
    }
    setSaving(true);
    const saved = await onSubmit(values);
    setSaving(false);
    if (saved && !editing) resetForm();
  }

  const fieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errorFor(name),
  });

  return (
    <form className="uai-form" onSubmit={handleSubmit} noValidate>
      <div className="uai-panel-head">
        <div>
          <p className="uai-label">{editing ? "Update record" : "Create record"}</p>
          <h2 className="uai-h3">{editing ? `Editing ${editing.name}` : "New application"}</h2>
          {editing && <p className="uai-mono-note">{editing.applicationNo}</p>}
        </div>
        {editing && (
          <Button size="sm" icon={X} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <InputField label="Full name" autoComplete="name" placeholder="As on your 12th marksheet" {...fieldProps("name")} />

      <div className="uai-grid-2">
        <InputField label="Email" type="email" autoComplete="email" placeholder="name@example.com" {...fieldProps("email")} />
        <InputField label="Mobile" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10 digits" {...fieldProps("phone")} />
      </div>

      <div className="uai-grid-2">
        <SelectField label="Programme" options={PROGRAMMES} placeholder="Select…" {...fieldProps("programme")} />
        <SelectField label="Campus" options={CAMPUSES} placeholder="Select…" {...fieldProps("campus")} />
      </div>

      <InputField
        label="12th percentage"
        type="number"
        inputMode="decimal"
        min="0"
        max="100"
        step="0.1"
        hint="Minimum eligibility is 60%"
        {...fieldProps("twelfthPct")}
      />

      <TextAreaField
        label="Statement of purpose"
        maxLength={SOP_MAX}
        rows={4}
        placeholder="Goals, specific examples and why CHRIST…"
        {...fieldProps("sop")}
      />

      <RadioGroup
        name="status"
        legend="Application status"
        options={STATUSES}
        value={values.status}
        onChange={handleChange}
      />

      <div className="uai-preview" aria-live="polite">
        <p className="uai-label">AI screening preview</p>
        {canScore ? (
          <FitMeter score={score} caption={fitSuggestion(score)} />
        ) : (
          <p className="uai-preview-empty">Enter a valid 12th % and SOP to see the fit score.</p>
        )}
      </div>

      <div className="uai-form-actions">
        <Button type="submit" variant="primary" icon={editing ? Save : Plus} disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Add application"}
        </Button>
        <Button icon={RotateCcw} onClick={resetForm} disabled={saving}>
          {editing ? "Revert" : "Clear"}
        </Button>
      </div>
    </form>
  );
}
