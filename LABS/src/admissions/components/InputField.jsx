import FormField from "./FormField.jsx";
import { controlProps } from "./controlProps.js";

export default function InputField({ name, label, error, hint, aside, type = "text", ...inputProps }) {
  const id = `uai-${name}`;
  return (
    <FormField id={id} label={label} error={error} hint={hint} aside={aside}>
      <input className="uai-input" name={name} type={type} {...controlProps(id, error)} {...inputProps} />
    </FormField>
  );
}
