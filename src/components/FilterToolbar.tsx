import type { DeadlineRange, Filters } from "../filters";
import { DEFAULT_FILTERS } from "../filters";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  states: string[];
  countries?: string[];
  mode?: "state" | "country";
  countryValue?: string;
  onCountryChange?: (country: string) => void;
  resultCount: number;
  totalCount: number;
}

export function FilterToolbar({
  filters,
  onChange,
  states,
  countries = [],
  mode = "state",
  countryValue = "all",
  onCountryChange,
  resultCount,
  totalCount,
}: Props) {
  const isDefault =
    JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS) && (mode !== "country" || countryValue === "all");

  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <label className="toolbar__field">
          <span className="toolbar__label">Program</span>
          <select
            value={filters.program}
            onChange={(e) => onChange({ program: e.target.value as Filters["program"] })}
          >
            <option value="all">All</option>
            <option value="FLL">FLL</option>
            <option value="FTC">FTC</option>
            <option value="FRC">FRC</option>
          </select>
        </label>

        {mode === "country" ? (
          <label className="toolbar__field">
            <span className="toolbar__label">Country</span>
            <select value={countryValue} onChange={(e) => onCountryChange?.(e.target.value)}>
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="toolbar__field">
            <span className="toolbar__label">State</span>
            <select value={filters.state} onChange={(e) => onChange({ state: e.target.value })}>
              <option value="all">All states</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="toolbar__field">
          <span className="toolbar__label">Team status</span>
          <select
            value={filters.eligibility}
            onChange={(e) => onChange({ eligibility: e.target.value as Filters["eligibility"] })}
          >
            <option value="all">Rookie & veteran</option>
            <option value="rookie-only">Rookie only</option>
            <option value="veteran-only">Veteran only</option>
          </select>
        </label>

        <label className="toolbar__field">
          <span className="toolbar__label">Deadline</span>
          <select
            value={filters.deadlineRange}
            onChange={(e) => onChange({ deadlineRange: e.target.value as DeadlineRange })}
          >
            <option value="all">Any time</option>
            <option value="soon">Closing within 2 weeks</option>
            <option value="30">Next 30 days</option>
            <option value="90">Next 90 days</option>
            <option value="rolling">Rolling only</option>
          </select>
        </label>

        {!isDefault && (
          <button
            type="button"
            className="toolbar__reset"
            onClick={() => {
              onChange(DEFAULT_FILTERS);
              if (mode === "country") onCountryChange?.("all");
            }}
          >
            Reset
          </button>
        )}
      </div>

      <div className="toolbar__count">
        <strong>{resultCount}</strong> of {totalCount} opportunities
      </div>
    </div>
  );
}
