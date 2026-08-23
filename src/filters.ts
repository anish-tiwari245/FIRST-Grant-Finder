import type { Eligibility, Opportunity, Program } from "./types";
import { daysUntil } from "./utils/date";

export type DeadlineRange = "all" | "soon" | "30" | "90" | "rolling";

export interface Filters {
  search: string;
  program: Program | "all";
  state: string;
  eligibility: Eligibility | "all";
  deadlineRange: DeadlineRange;
}

export const DEFAULT_FILTERS: Filters = {
  search: "",
  program: "all",
  state: "all",
  eligibility: "all",
  deadlineRange: "all",
};

/** True for opportunities that belong in the International tab: country-specific entries, multi-country entries, or global/location-agnostic sponsors. */
export function isInternational(o: Opportunity): boolean {
  return Boolean(o.country || (o.countries && o.countries.length > 0) || o.international);
}

/** True when `o` matches the given country filter (used only in the International tab). Global sponsors match any country. */
export function matchesCountry(o: Opportunity, country: string): boolean {
  if (country === "all") return true;
  return o.country === country || Boolean(o.countries?.includes(country)) || o.international === true;
}

export function matchesFilters(o: Opportunity, f: Filters): boolean {
  const query = f.search.trim().toLowerCase();
  if (query) {
    const haystack = `${o.name} ${o.org} ${o.description}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (f.program !== "all" && !o.programs.includes(f.program)) return false;

  if (f.state !== "all") {
    if (o.country) return false;
    const stateOk = o.states === "all" || o.states.includes(f.state);
    if (!stateOk) return false;
  }

  if (f.eligibility !== "all" && o.eligibility !== "both" && o.eligibility !== f.eligibility) {
    return false;
  }

  if (f.deadlineRange !== "all") {
    if (f.deadlineRange === "rolling") {
      if (o.deadline !== "rolling") return false;
    } else {
      if (o.deadline === "rolling") return false;
      const days = daysUntil(o.deadline);
      if (days === null || days < 0) return false;
      const max = f.deadlineRange === "soon" ? 14 : f.deadlineRange === "30" ? 30 : 90;
      if (days > max) return false;
    }
  }

  return true;
}
