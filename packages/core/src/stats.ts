import { allActivities } from "./activities";
import type { Activity, ActivityCategory, LogEntry, Settings } from "./types";

const DAY_MS = 86_400_000;

/** Local-time "YYYY-MM-DD" for grouping by day. */
export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local midnight at the start of `d`'s day. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** `d` moved by `n` calendar days, in local time (safe across DST changes). */
export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** Whole calendar days from `from`'s day to `to`'s day. */
function daysBetween(from: Date, to: Date): number {
  // Rounding absorbs the 23h/25h days around DST changes.
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
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

/** The longest run of consecutive days with at least one completed activity. */
export function longestStreak(log: LogEntry[]): number {
  const days = [
    ...new Set(log.filter((e) => e.status === "done").map((e) => startOfDay(new Date(e.at)).getTime())),
  ].sort((a, b) => a - b);

  let best = 0;
  let run = 0;
  let prev: number | undefined;
  for (const day of days) {
    run = prev !== undefined && daysBetween(new Date(prev), new Date(day)) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

/** Entries logged in `[start, end)`. */
export function entriesBetween(log: LogEntry[], start: Date, end: Date): LogEntry[] {
  const from = start.getTime();
  const to = end.getTime();
  return log.filter((e) => e.at >= from && e.at < to);
}

export interface Summary {
  done: number;
  skipped: number;
  /** done / (done + skipped), or null when nothing was logged. */
  completionRate: number | null;
  /** Rough time spent on completed tasks, in whole minutes. */
  activeMinutes: number;
  /** Days with at least one completed task. */
  activeDays: number;
}

export function summarize(entries: LogEntry[], settings: Settings): Summary {
  const byId = new Map(allActivities(settings).map((a) => [a.id, a]));
  let done = 0;
  let skipped = 0;
  let seconds = 0;
  const days = new Set<string>();
  for (const e of entries) {
    if (e.status === "done") {
      done++;
      // Activities removed since they were logged no longer have a duration.
      seconds += byId.get(e.activityId)?.durationSec ?? 0;
      days.add(dayKey(new Date(e.at)));
    } else {
      skipped++;
    }
  }
  return {
    done,
    skipped,
    completionRate: done + skipped > 0 ? done / (done + skipped) : null,
    activeMinutes: Math.round(seconds / 60),
    activeDays: days.size,
  };
}

export interface PeriodCount {
  /** Local midnight at the start of the period. */
  start: Date;
  done: number;
  skipped: number;
}

/**
 * Done/skipped counts for `periods` back-to-back periods of `periodDays` days
 * each, the first starting on `start`'s day. Use `periodDays = 1` for a daily
 * series and 7 for weekly. Entries outside the periods are ignored.
 */
export function countsByPeriod(
  entries: LogEntry[],
  start: Date,
  periodDays: number,
  periods: number,
): PeriodCount[] {
  const first = startOfDay(start);
  const out: PeriodCount[] = Array.from({ length: periods }, (_, i) => ({
    start: addDays(first, i * periodDays),
    done: 0,
    skipped: 0,
  }));
  for (const e of entries) {
    const days = daysBetween(first, new Date(e.at));
    if (days < 0) continue;
    const bucket = out[Math.floor(days / periodDays)];
    if (bucket) bucket[e.status]++;
  }
  return out;
}

/** Completed tasks per local hour of the day; index 0 is midnight to 1am. */
export function doneByHour(entries: LogEntry[]): number[] {
  const hours = new Array<number>(24).fill(0);
  for (const e of entries) {
    if (e.status !== "done") continue;
    const h = new Date(e.at).getHours();
    hours[h] = (hours[h] ?? 0) + 1;
  }
  return hours;
}

export interface ActivityCount {
  activityId: string;
  /** Undefined when the activity has since been removed. */
  activity: Activity | undefined;
  done: number;
  skipped: number;
}

/** Per-activity counts, most completed first. */
export function countsByActivity(entries: LogEntry[], settings: Settings): ActivityCount[] {
  const byId = new Map(allActivities(settings).map((a) => [a.id, a]));
  const counts = new Map<string, ActivityCount>();
  for (const e of entries) {
    let row = counts.get(e.activityId);
    if (!row) {
      row = { activityId: e.activityId, activity: byId.get(e.activityId), done: 0, skipped: 0 };
      counts.set(e.activityId, row);
    }
    row[e.status]++;
  }
  return [...counts.values()].sort((a, b) => b.done - a.done || b.skipped - a.skipped);
}

/**
 * Completed tasks per category, most first. Categories with nothing done, and
 * activities that have since been removed, are left out.
 */
export function doneByCategory(
  entries: LogEntry[],
  settings: Settings,
): { category: ActivityCategory; done: number }[] {
  const byId = new Map(allActivities(settings).map((a) => [a.id, a]));
  const counts = new Map<ActivityCategory, number>();
  for (const e of entries) {
    if (e.status !== "done") continue;
    const category = byId.get(e.activityId)?.category;
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, done]) => ({ category, done }))
    .sort((a, b) => b.done - a.done);
}
