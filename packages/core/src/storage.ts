import { DEFAULT_SETTINGS } from "./activities";
import { createInitialState } from "./engine";
import type { LazilessState, LogEntry } from "./types";

/** Key used by both localStorage (web) and AsyncStorage (mobile). */
export const STORAGE_KEY = "laziless:state:v1";

export function serializeState(state: LazilessState): string {
  return JSON.stringify(state);
}

function isLogEntry(v: unknown): v is LogEntry {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.activityId === "string" &&
    (e.status === "done" || e.status === "skipped") &&
    typeof e.at === "number"
  );
}

/**
 * Parse stored state defensively. Anything missing or malformed falls back to
 * defaults so a bad value in storage can never brick the app.
 */
export function deserializeState(raw: string | null | undefined, now: number): LazilessState {
  if (!raw) return createInitialState(now);
  try {
    const data = JSON.parse(raw) as Partial<LazilessState> | null;
    if (!data || data.version !== 1) return createInitialState(now);
    const settings = { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) };
    return {
      version: 1,
      settings,
      log: Array.isArray(data.log) ? data.log.filter(isLogEntry) : [],
      nextReminderAt: typeof data.nextReminderAt === "number" ? data.nextReminderAt : null,
      currentActivityId: typeof data.currentActivityId === "string" ? data.currentActivityId : null,
    };
  } catch {
    return createInitialState(now);
  }
}
