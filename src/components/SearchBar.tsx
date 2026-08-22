interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="searchbar">
      <svg className="searchbar__icon" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="14" y1="14" x2="18.5" y2="18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="searchbar__input"
        placeholder="Search grants, sponsorships, organizations…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search opportunities"
      />
      {value && (
        <button
          type="button"
          className="searchbar__clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
}
