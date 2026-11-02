import FormField from "./FormField.jsx";
import { controlProps } from "./controlProps.js";

export default function TextAreaField({ name, label, error, hint, value, maxLength, ...textareaProps }) {
  const id = `uai-${name}`;
  const counter = maxLength ? `${value.length} / ${maxLength}` : undefined;
  return (
    <FormField id={id} label={label} error={error} hint={hint} aside={counter}>
      <textarea
        className="uai-input"
        name={name}
        value={value}
        maxLength={maxLength}
        {...controlProps(id, error)}
        {...textareaProps}
      />
    </FormField>
  );
}
