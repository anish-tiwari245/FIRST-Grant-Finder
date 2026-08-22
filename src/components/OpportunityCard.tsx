import { useState } from "react";
import { useBookmarks } from "../context/BookmarksContext";
import { useInView } from "../hooks/useInView";
import type { Opportunity } from "../types";
import { daysAgo, deadlineCountdownLabel, formatDate, formatDeadline, isClosingSoon } from "../utils/date";

const STALE_AFTER_DAYS = 60;

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView<HTMLElement>();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(opportunity.id);
  const soon = isClosingSoon(opportunity.deadline);
  const rolling = opportunity.deadline === "rolling";
  const verifiedDaysAgo = daysAgo(opportunity.verifiedOn);
  const stale = verifiedDaysAgo > STALE_AFTER_DAYS;
  const states =
    opportunity.states === "all"
      ? opportunity.country
        ? opportunity.country
        : "All states"
      : opportunity.states.join(", ");
  const statesLabel = opportunity.country ? "Country" : "Eligible states";

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
