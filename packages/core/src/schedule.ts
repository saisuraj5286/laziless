import type { Settings } from "./types";

const MINUTE = 60_000;

/** "HH:MM" -> minutes since midnight. Invalid input falls back to 0. */
export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return 0;
  return Math.min(23, Math.max(0, h)) * 60 + Math.min(59, Math.max(0, m));
}

function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Whether `date` falls inside the user's active hours (local time). */
export function isWithinActiveHours(date: Date, settings: Settings): boolean {
  const start = parseTime(settings.activeStart);
  const end = parseTime(settings.activeEnd);
  const m = minutesOfDay(date);
  if (start === end) return true; // treat as "all day"
  if (start < end) return m >= start && m < end;
  return m >= start || m < end; // window wraps past midnight
}

/** The next moment (strictly after `after`) the active window opens. */
export function nextWindowStart(after: Date, settings: Settings): Date {
  const start = parseTime(settings.activeStart);
  const d = new Date(after);
  d.setHours(Math.floor(start / 60), start % 60, 0, 0);
  if (d.getTime() <= after.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

/**
 * When the next nudge should fire, counting from `from`: one interval later,
 * or the start of the next active window if that lands outside active hours.
 */
export function computeNextReminder(from: Date, settings: Settings): Date {
  const candidate = new Date(from.getTime() + settings.intervalMinutes * MINUTE);
  if (isWithinActiveHours(candidate, settings)) return candidate;
  return nextWindowStart(candidate, settings);
}

/** "mm:ss" or "h:mm:ss" countdown string. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
