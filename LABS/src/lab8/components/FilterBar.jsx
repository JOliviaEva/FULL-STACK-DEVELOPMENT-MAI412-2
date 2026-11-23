import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { SORT_OPTIONS, STATUS_KEYS, STATUS_META } from "../lib/format.js";
import { inputClass } from "./ui.jsx";

function Select({ id, label, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-soft">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {children}
      </select>
    </div>
  );
}

// The text lives in local state so typing is never interrupted, and is copied to the URL
// (and so to the API) 300 ms after the last keystroke. Remount it (key) to reset it.
function SearchBox({ value, onChange }) {
  const [text, setText] = useState(value);
  const settled = useDebouncedValue(text, 300);

  useEffect(() => {
    if (settled !== value) onChange("q", settled);
  }, [settled, value, onChange]);

  return (
    <div>
      <label htmlFor="filter-q" className="mb-1 block text-xs font-medium text-ink-soft">
        Search
      </label>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
        <input
          id="filter-q"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Name, email, campus…"
          className={`${inputClass} pl-9`}
        />
      </div>
    </div>
  );
}

// Search box, status pills and dropdowns. Every change becomes a query parameter on GET /api/applications.
export default function FilterBar({ filters, programmes, campuses, officers, resetKey, onChange, onClear }) {
  const active = Object.entries(filters).some(([key, value]) => value && !(key === "sort" && value === "newest"));

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="space-y-4 rounded-xl border border-paper-line/80 bg-paper-light p-4 shadow-paper sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1.3fr_1.1fr_1fr]">
        <SearchBox key={resetKey} value={filters.q} onChange={onChange} />

        <Select id="filter-programme" label="Programme" value={filters.programmeId} onChange={(v) => onChange("programmeId", v)}>
          <option value="">All programmes</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <Select id="filter-campus" label="Campus" value={filters.campusId} onChange={(v) => onChange("campusId", v)}>
          <option value="">All campuses</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select id="filter-officer" label="Officer" value={filters.officerId} onChange={(v) => onChange("officerId", v)}>
          <option value="">Any officer</option>
          <option value="none">Unassigned</option>
          {officers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>

        <Select id="filter-sort" label="Sort by" value={filters.sort} onChange={(v) => onChange("sort", v)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
        {[{ value: "", label: "All statuses" }, ...STATUS_KEYS.map((s) => ({ value: s, label: STATUS_META[s].label, color: STATUS_META[s].color }))].map((s) => {
          const on = filters.status === s.value;
          return (
            <button
              key={s.value || "all"}
              type="button"
              aria-pressed={on}
              onClick={() => onChange("status", s.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                on ? "border-plum-500 bg-plum-500 text-white" : "border-paper-line bg-white text-ink-soft hover:border-plum-300"
              }`}
            >
              {s.color && <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />}
              {s.label}
            </button>
          );
        })}
        {active && (
          <button type="button" onClick={onClear} className="ml-auto text-sm font-medium text-plum-500 hover:text-plum-700 hover:underline">
            Clear filters
          </button>
        )}
      </div>
    </form>
  );
}
