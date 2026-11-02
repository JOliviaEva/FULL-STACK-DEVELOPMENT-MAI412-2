// Pill-style radio buttons. Used for the status field in the form
// and again as the status filter above the records table.
// options: [{ value, label, color?, count? }]
export default function RadioGroup({ name, legend, options, value, onChange, hideLegend = false }) {
  return (
    <fieldset className="uai-radios">
      <legend className={hideLegend ? "uai-sr-only" : "uai-label"}>{legend}</legend>
      <div className="uai-radios-row">
        {options.map((opt) => (
          <label key={opt.value} className="uai-radio">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
            <span>
              {opt.color && <i className="uai-dot" style={{ background: opt.color }} aria-hidden="true" />}
              {opt.label}
              {opt.count !== undefined && <b className="uai-radio-count">{opt.count}</b>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
