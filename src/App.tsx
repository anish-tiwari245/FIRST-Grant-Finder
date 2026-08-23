import { useMemo, useState } from "react";
import "./App.css";
import { CalendarView } from "./components/CalendarView";
import { FilterToolbar } from "./components/FilterToolbar";
import { OpportunityCard } from "./components/OpportunityCard";
import { SearchBar } from "./components/SearchBar";
import { useBookmarks } from "./context/BookmarksContext";
import { ALL_COUNTRIES, ALL_STATES, opportunities } from "./data";
import { DEFAULT_FILTERS, isInternational, matchesCountry, matchesFilters, type Filters } from "./filters";
import { daysUntil, isClosingSoon } from "./utils/date";
import type { OpportunityStatus } from "./types";

const STATUS_ORDER: Record<OpportunityStatus, number> = {
  open: 0,
  rolling: 1,
  upcoming: 2,
  closed: 3,
};

function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<"list" | "calendar" | "bookmarks" | "international">("list");
  const [countryFilter, setCountryFilter] = useState("all");
  const { bookmarkedIds } = useBookmarks();

  const filtered = useMemo(() => {
    const matches = opportunities.filter((o) => matchesFilters(o, filters));
    return [...matches].sort((a, b) => {
      const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      const aDays = daysUntil(a.deadline);
      const bDays = daysUntil(b.deadline);
      if (aDays === null && bDays === null) return 0;
      if (aDays === null) return 1;
      if (bDays === null) return -1;
      return aDays - bDays;
    });
  }, [filters]);

  const bookmarkedFiltered = useMemo(
    () => filtered.filter((o) => bookmarkedIds.has(o.id)),
    [filtered, bookmarkedIds]
  );

  const internationalOpportunities = useMemo(
    () => opportunities.filter((o) => isInternational(o)),
    []
  );

  const internationalFiltered = useMemo(() => {
    const matches = internationalOpportunities.filter(
      (o) => matchesFilters(o, filters) && matchesCountry(o, countryFilter)
    );
    return [...matches].sort((a, b) => {
      const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      const aDays = daysUntil(a.deadline);
      const bDays = daysUntil(b.deadline);
      if (aDays === null && bDays === null) return 0;
      if (aDays === null) return 1;
      if (bDays === null) return -1;
      return aDays - bDays;
    });
  }, [internationalOpportunities, filters, countryFilter]);

  const closingSoonCount = useMemo(
    () => opportunities.filter((o) => isClosingSoon(o.deadline)).length,
    []
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <span className="header__mark">GF</span>
          <div>
            <h1 className="header__title">FIRST Grant Finder</h1>
            <p className="header__tagline">Grants &amp; sponsorships for FLL / FTC / FRC teams</p>
          </div>
        </div>
        <div className="header__stats">
          <div className="stat">
            <span className="stat__value">{opportunities.length}</span>
            <span className="stat__label">tracked</span>
          </div>
          <div className="stat stat--urgent">
            <span className="stat__value">{closingSoonCount}</span>
            <span className="stat__label">closing soon</span>
          </div>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="View">
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          className={`tabs__tab${view === "list" ? " tabs__tab--active" : ""}`}
          onClick={() => setView("list")}
        >
          Listing
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "calendar"}
          className={`tabs__tab${view === "calendar" ? " tabs__tab--active" : ""}`}
          onClick={() => setView("calendar")}
        >
          Calendar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "bookmarks"}
          className={`tabs__tab${view === "bookmarks" ? " tabs__tab--active" : ""}`}
          onClick={() => setView("bookmarks")}
        >
          Bookmarks
          {bookmarkedIds.size > 0 && <span className="tabs__count">{bookmarkedIds.size}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "international"}
          className={`tabs__tab${view === "international" ? " tabs__tab--active" : ""}`}
          onClick={() => setView("international")}
        >
          International
        </button>
      </div>

      <SearchBar
        value={filters.search}
        onChange={(search) => setFilters((f) => ({ ...f, search }))}
      />

      <FilterToolbar
        filters={filters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        states={ALL_STATES}
        countries={ALL_COUNTRIES}
        mode={view === "international" ? "country" : "state"}
        countryValue={countryFilter}
        onCountryChange={setCountryFilter}
        resultCount={
          view === "bookmarks"
            ? bookmarkedFiltered.length
            : view === "international"
              ? internationalFiltered.length
              : filtered.length
        }
        totalCount={
          view === "bookmarks"
            ? bookmarkedIds.size
            : view === "international"
              ? internationalOpportunities.length
              : opportunities.length
        }
      />

      {view === "calendar" ? (
        <CalendarView opportunities={filtered} />
      ) : view === "international" ? (
        internationalOpportunities.length === 0 ? (
          <div className="empty">
            <p>No international opportunities tracked yet.</p>
          </div>
        ) : internationalFiltered.length === 0 ? (
          <div className="empty">
            <p>No international opportunities match those filters.</p>
            <button
              type="button"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setCountryFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid">
            {internationalFiltered.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        )
      ) : view === "bookmarks" ? (
        bookmarkedIds.size === 0 ? (
          <div className="empty">
            <p>You haven't bookmarked any opportunities yet — click the star on a card to save it here.</p>
          </div>
        ) : bookmarkedFiltered.length === 0 ? (
          <div className="empty">
            <p>No bookmarked opportunities match those filters.</p>
            <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid">
            {bookmarkedFiltered.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>No opportunities match those filters.</p>
          <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
