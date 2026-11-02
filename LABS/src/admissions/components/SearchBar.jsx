import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search" }) {
  return (
    <div className="uai-search">
      <Search size={15} className="uai-search-icon" aria-hidden="true" />
      <input
        type="search"
        className="uai-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onChange("")}
        placeholder={placeholder}
        aria-label="Search applications"
      />
      {value && (
        <button type="button" className="uai-search-clear" onClick={() => onChange("")} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
