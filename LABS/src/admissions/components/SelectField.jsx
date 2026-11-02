import FormField from "./FormField.jsx";
import { controlProps } from "./controlProps.js";

// options: an array of strings, or of { value, label } objects.
export default function SelectField({ name, label, options, placeholder, error, hint, compact, ...selectProps }) {
  const id = `uai-${name}`;
  return (
    <FormField id={id} label={label} error={error} hint={hint} compact={compact}>
      <select className="uai-input uai-select" name={name} {...controlProps(id, error, compact)} {...selectProps}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const { value, label: text } = typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </FormField>
  );
}
