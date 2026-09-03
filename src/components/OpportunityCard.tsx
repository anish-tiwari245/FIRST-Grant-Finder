import { useState } from "react";
import { useBookmarks } from "../context/BookmarksContext";
import { useInView } from "../hooks/useInView";
import type { ApplicationStatus, Opportunity } from "../types";
import { daysAgo, deadlineCountdownLabel, formatDate, formatDeadline, isClosingSoon } from "../utils/date";

const STALE_AFTER_DAYS = 60;

const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  "not-started": "Not started",
  applied: "Applied",
  submitted: "Submitted",
  awarded: "Awarded",
  rejected: "Rejected",
};

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView<HTMLElement>();
  const { isBookmarked, toggleBookmark, getEntry, setStatus, setNote } = useBookmarks();
  const bookmarked = isBookmarked(opportunity.id);
  const entry = getEntry(opportunity.id);
  const soon = isClosingSoon(opportunity.deadline);
  const rolling = opportunity.deadline === "rolling";
  const verifiedDaysAgo = daysAgo(opportunity.verifiedOn);
  const stale = verifiedDaysAgo > STALE_AFTER_DAYS;
  const states = opportunity.countries?.length
    ? opportunity.countries.join(", ")
    : opportunity.country
      ? opportunity.country
      : opportunity.international
        ? "Any country (global sponsor)"
        : opportunity.states === "all"
          ? "All states"
          : opportunity.states.join(", ");
  const statesLabel =
    opportunity.country || opportunity.countries?.length
      ? "Country"
      : opportunity.international
        ? "Availability"
        : "Eligible states";

  return (
    <article
      ref={ref}
      className={`card card--${opportunity.type}${soon ? " card--soon" : ""}${inView ? " card--in" : ""}`}
    >
      <div className="card__stripe" aria-hidden="true" />
      <div className="card__body">
        <div className="card__toprow">
          <span className={`tag tag--${opportunity.type}`}>
            <span className="tag__icon" aria-hidden="true">
              {opportunity.type === "grant" ? "◆" : "▲"}
            </span>
            {opportunity.type === "grant" ? "Grant" : "Sponsorship"}
          </span>
          <div className="card__toprowright">
            <span className={`statuspill statuspill--${opportunity.status}`}>{opportunity.status}</span>
            <button
              type="button"
              className={`card__bookmark${bookmarked ? " card__bookmark--active" : ""}`}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark this opportunity"}
              title={bookmarked ? "Remove bookmark" : "Bookmark this opportunity"}
              onClick={() => toggleBookmark(opportunity.id)}
            >
              {bookmarked ? "★" : "☆"}
            </button>
          </div>
        </div>

        <p className="card__org">{opportunity.org}</p>
        <h3 className="card__name">{opportunity.name}</h3>
        <p className="card__desc">{opportunity.description}</p>

        <div className="card__meta">
          <div className="card__metaitem">
            <span className="card__metalabel">Programs</span>
            <span className="card__chips">
              {opportunity.programs.map((p) => (
                <span key={p} className="chip">
                  {p}
                </span>
              ))}
            </span>
          </div>
          <div className="card__metaitem">
            <span className="card__metalabel">{statesLabel}</span>
            <span className="card__metavalue">{states}</span>
          </div>
          <div className="card__metaitem">
            <span className="card__metalabel">Team status</span>
            <span className="card__metavalue">
              {opportunity.eligibility === "both"
                ? "Rookie & veteran"
                : opportunity.eligibility === "rookie-only"
                  ? "Rookie only"
                  : "Veteran only"}
            </span>
          </div>
          <div className="card__metaitem">
            <span className="card__metalabel">Amount</span>
            <span className="card__metavalue">{opportunity.amount}</span>
          </div>
        </div>

        {opportunity.details && (
          <>
            <button
              type="button"
              className={`card__detailstoggle${open ? " card__detailstoggle--open" : ""}`}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="card__detailschevron" aria-hidden="true">
                &rsaquo;
              </span>
              {open ? "Hide requirements" : "Requirements & how to apply"}
            </button>
            <div className={`card__details${open ? " card__details--open" : ""}`}>
              <div className="card__detailsinner">
                <p>{opportunity.details}</p>
              </div>
            </div>
          </>
        )}

        {bookmarked && (
          <div className="card__tracker">
            <div className="card__trackerrow">
              <label className="card__trackerlabel" htmlFor={`tracker-status-${opportunity.id}`}>
                Application status
              </label>
              <select
                id={`tracker-status-${opportunity.id}`}
                className={`card__trackerselect card__trackerselect--${entry.status}`}
                value={entry.status}
                onChange={(e) => setStatus(opportunity.id, e.target.value as ApplicationStatus)}
              >
                {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="card__trackernote"
              placeholder="Notes (contact, submitted date, next steps...)"
              value={entry.note}
              onChange={(e) => setNote(opportunity.id, e.target.value)}
              rows={2}
            />
          </div>
        )}

        <div className="card__footer">
          <div className={`deadline${rolling ? " deadline--rolling" : ""}${soon ? " deadline--soon" : ""}`}>
            {soon && <span className="deadline__dot" aria-hidden="true" />}
            <div className="deadline__text">
              <span className="deadline__date">
                {rolling ? "Rolling" : formatDeadline(opportunity.deadline)}
              </span>
              <span className="deadline__countdown">{deadlineCountdownLabel(opportunity.deadline)}</span>
            </div>
          </div>
          <a className="card__apply" href={opportunity.link} target="_blank" rel="noreferrer">
            Apply <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        <p className={`card__verified${stale ? " card__verified--stale" : ""}`}>
          {stale ? "⚠ " : ""}
          Verified {formatDate(opportunity.verifiedOn)}
          {stale ? " — worth double-checking" : ""}
        </p>
      </div>
    </article>
  );
}
