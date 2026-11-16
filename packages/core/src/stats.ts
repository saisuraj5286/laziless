import type { LogEntry } from "./types";

/** Local-time "YYYY-MM-DD" for grouping by day. */
export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function entriesOnDay(log: LogEntry[], day: Date): LogEntry[] {
  const key = dayKey(day);
  return log.filter((e) => dayKey(new Date(e.at)) === key);
}

export function dayStats(log: LogEntry[], day: Date): { done: number; skipped: number } {
  let done = 0;
  let skipped = 0;
  for (const e of entriesOnDay(log, day)) {
    if (e.status === "done") done++;
    else skipped++;
  }
  return { done, skipped };
}

/**
 * Consecutive days (ending today) with at least one completed activity.
 * If today has nothing yet, the streak still counts from yesterday, so it
 * doesn't look "broken" first thing in the morning.
 */
export function currentStreak(log: LogEntry[], now: Date): number {
  const doneDays = new Set(
    log.filter((e) => e.status === "done").map((e) => dayKey(new Date(e.at))),
  );
  const cursor = new Date(now);
  if (!doneDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (doneDays.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
