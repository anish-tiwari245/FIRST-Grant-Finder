import raw from "../data/opportunities.json";
import type { Opportunity } from "./types";

export const opportunities: Opportunity[] = raw as Opportunity[];

export const ALL_STATES: string[] = Array.from(
  new Set(
    opportunities.flatMap((o) => (o.states === "all" ? [] : o.states))
  )
).sort();
