import { useMemo, useRef, useState } from "react";
import type { Opportunity } from "../types";
import { buildMonthGrid, toDateKey } from "../utils/date";
import { OpportunityCard } from "./OpportunityCard";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_PER_DAY = 3;

interface DayEvent {
  opportunity: Opportunity;
  kind: "opens" | "closes";
}

function eventDomId(opportunityId: string, kind: "opens" | "closes") {
  return `cal-event-${opportunityId}-${kind}`;
}

export function CalendarView({ opportunities }: { opportunities: Opportunity[] }) {
  const today = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const highlightTimeout = useRef<number | undefined>(undefined);

  const byDate = useMemo(() => {
    const map: Record<string, DayEvent[]> = {};
    for (const o of opportunities) {
      if (o.opensOn) {
        (map[o.opensOn] ??= []).push({ opportunity: o, kind: "opens" });
      }
      if (o.deadline !== "rolling") {
        (map[o.deadline] ??= []).push({ opportunity: o, kind: "closes" });
      }
    }
    return map;
  }, [opportunities]);

  const rolling = useMemo(
    () => opportunities.filter((o) => o.deadline === "rolling"),
    [opportunities]
  );

  const todayKey = toDateKey(today);
  const grid = buildMonthGrid(monthDate.getFullYear(), monthDate.getMonth());
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const monthEvents = useMemo(() => {
    const seen = new Set<string>();
    const list: { dateKey: string; event: DayEvent }[] = [];
    for (const date of grid) {
      const key = toDateKey(date);
      for (const event of byDate[key] ?? []) {
        const dedupeKey = `${key}-${event.opportunity.id}-${event.kind}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        list.push({ dateKey: key, event });
      }
    }
    return list.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [grid, byDate]);

  const goToMonth = (delta: number) => {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  const goToday = () => {
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const jumpTo = (opportunityId: string, kind: "opens" | "closes") => {
    const domId = eventDomId(opportunityId, kind);
    const el = document.getElementById(domId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlighted(domId);
    window.clearTimeout(highlightTimeout.current);
    highlightTimeout.current = window.setTimeout(() => setHighlighted(null), 1800);
  };

  return (
    <div className="calendar">
      <div className="calendar__nav">
        <button type="button" className="calendar__navbtn" onClick={() => goToMonth(-1)} aria-label="Previous month">
          &lsaquo;
        </button>
        <span className="calendar__label">{monthLabel}</span>
        <button type="button" className="calendar__navbtn" onClick={() => goToMonth(1)} aria-label="Next month">
          &rsaquo;
        </button>
        <button type="button" className="calendar__today" onClick={goToday}>
          Today
        </button>
        <div className="calendar__legend">
          <span className="calendar__legenditem">
            <span className="calendar__dot calendar__dot--opens" /> opens
          </span>
          <span className="calendar__legenditem">
            <span className="calendar__dot calendar__dot--closes" /> closes
          </span>
        </div>
      </div>

      <div className="calendar__weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="calendar__grid">
        {grid.map((date) => {
          const key = toDateKey(date);
          const events = byDate[key] ?? [];
          const inMonth = date.getMonth() === monthDate.getMonth();
          const isToday = key === todayKey;
          const visible = events.slice(0, MAX_CHIPS_PER_DAY);
          const overflow = events.length - visible.length;

          return (
            <div
              key={key}
              className={`calendar__cell${inMonth ? "" : " calendar__cell--out"}${isToday ? " calendar__cell--today" : ""}${events.length === 0 ? " calendar__cell--empty" : ""}`}
            >
              <span className="calendar__daynum">{date.getDate()}</span>
              {visible.length > 0 && (
                <div className="calendar__chips">
                  {visible.map(({ opportunity, kind }) => (
                    <button
                      type="button"
                      key={`${opportunity.id}-${kind}`}
                      className={`calendar__chip calendar__chip--${kind}`}
                      title={`${kind === "opens" ? "Opens" : "Closes"}: ${opportunity.name}`}
                      onClick={() => jumpTo(opportunity.id, kind)}
                    >
                      {opportunity.name}
                    </button>
                  ))}
                  {overflow > 0 && <span className="calendar__chipmore">+{overflow} more</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {monthEvents.length > 0 && (
        <div className="calendar__eventlist">
          <h3 className="calendar__daylisttitle">{monthLabel} deadlines</h3>
          <div className="grid">
            {monthEvents.map(({ dateKey, event }) => {
              const domId = eventDomId(event.opportunity.id, event.kind);
              return (
                <div
                  key={domId}
                  id={domId}
                  className={`calendar__eventcard${highlighted === domId ? " calendar__eventcard--highlight" : ""}`}
                >
                  <span className={`calendar__eventtag calendar__eventtag--${event.kind}`}>
                    {event.kind === "opens" ? "Opens" : "Closes"}{" "}
                    {new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <OpportunityCard opportunity={event.opportunity} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="calendar__rolling">
        <h3 className="calendar__daylisttitle">
          Rolling — no fixed deadline
          <span className="calendar__rollingcount">{rolling.length}</span>
        </h3>
        <p className="calendar__rollingnote">
          These don't have a specific opening or closing date, so they can't be placed on the calendar grid above —
          they're always open. Click one to see its requirements.
        </p>
        {rolling.length > 0 ? (
          <div className="grid">
            {rolling.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        ) : (
          <p className="calendar__rollingempty">No rolling opportunities match the current filters.</p>
        )}
      </div>
    </div>
  );
}
