import raw from "../data/opportunities.json";
import type { Opportunity } from "./types";

export const opportunities: Opportunity[] = raw as Opportunity[];

export const ALL_STATES: string[] = Array.from(
  new Set(
    opportunities.flatMap((o) => (o.states === "all" ? [] : o.states))
  )
).sort();

export const ALL_COUNTRIES: string[] = Array.from(
  new Set(
    opportunities.flatMap((o) => {
      if (o.countries && o.countries.length > 0) return o.countries;
      if (o.country) return [o.country];
      return [];
    })
  )
).sort();
