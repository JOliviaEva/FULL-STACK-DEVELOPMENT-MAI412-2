// Props every field passes to its <input>/<select>/<textarea> so errors are
// announced by screen readers and linked to the message under the control.
export function controlProps(id, error, compact) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": compact ? undefined : `${id}-msg`,
  };
}
