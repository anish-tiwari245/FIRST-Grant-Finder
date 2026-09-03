export type Program = "FLL" | "FTC" | "FRC";

export type OpportunityType = "grant" | "sponsorship";

export type Eligibility = "rookie-only" | "veteran-only" | "both";

export type OpportunityStatus = "upcoming" | "open" | "closed" | "rolling";

export type ApplicationStatus = "not-started" | "applied" | "submitted" | "awarded" | "rejected";

export interface Opportunity {
  id: string;
  name: string;
  org: string;
  type: OpportunityType;
  description: string;
  programs: Program[];
  states: string[] | "all";
  eligibility: Eligibility;
  /** ISO date string (YYYY-MM-DD), or "rolling" for no fixed deadline */
  deadline: string | "rolling";
  /** ISO date string (YYYY-MM-DD) — only set where the real application-open date is known */
  opensOn?: string;
  amount: string;
  link: string;
  status: OpportunityStatus;
  /** Extra requirements / application-process detail shown when a card is expanded */
  details?: string;
  /** Set for opportunities outside the US where the "states" field doesn't apply */
  country?: string;
  /** For opportunities valid across several named countries (used for country filtering); `country` still holds the display text */
  countries?: string[];
  /** True for global/location-agnostic sponsors (in-kind product or software support) not tied to one country */
  international?: boolean;
  /** ISO date string (YYYY-MM-DD) — when this entry's details/link were last checked against the real source */
  verifiedOn: string;
}
