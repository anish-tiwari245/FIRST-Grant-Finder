const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysUntil(deadline: string | "rolling", today = new Date()): number | null {
  if (deadline === "rolling") return null;
  const target = new Date(deadline + "T00:00:00");
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / MS_PER_DAY);
}

export function isClosingSoon(deadline: string | "rolling", today = new Date()): boolean {
  const days = daysUntil(deadline, today);
  return days !== null && days >= 0 && days <= 14;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDeadline(deadline: string | "rolling"): string {
  if (deadline === "rolling") return "Rolling";
  return formatDate(deadline);
}

export function daysAgo(dateStr: string, today = new Date()): number {
  const days = daysUntil(dateStr, today);
  return days === null ? 0 : -days;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns a 6-week (42 day) grid of Dates covering the given month, starting on a Sunday. */
export function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function deadlineCountdownLabel(deadline: string | "rolling", today = new Date()): string {
  if (deadline === "rolling") return "Rolling — no fixed deadline";
  const days = daysUntil(deadline, today);
  if (days === null) return "";
  if (days < 0) return `Closed ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
