import { DEFAULT_SETTINGS, SNOOZE_MINUTES, enabledActivities } from "./activities";
import { computeNextReminder, isWithinActiveHours } from "./schedule";
import type { Activity, LazilessState, LogStatus, Settings } from "./types";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
/** Older log entries are dropped to keep storage small. */
export const LOG_RETENTION_DAYS = 120;
/** How many recent activities to avoid repeating. */
const RECENT_WINDOW = 3;

/**
 * Every action carries `now` (and `rand` where randomness is needed) so the
 * reducer stays pure and is easy to test and share between web and mobile.
 */
export type LazilessAction =
  | { type: "tick"; now: number; rand: number }
  | { type: "nudgeNow"; now: number; rand: number }
  | { type: "complete"; now: number }
  | { type: "skip"; now: number }
  | { type: "snooze"; now: number; minutes?: number }
  | { type: "setPaused"; now: number; paused: boolean }
  | { type: "updateSettings"; now: number; patch: Partial<Settings> }
  | { type: "toggleActivity"; now: number; id: string }
  | { type: "addCustomActivity"; now: number; title: string; emoji?: string }
  | { type: "removeCustomActivity"; now: number; id: string }
  | { type: "replace"; state: LazilessState };

export function createInitialState(now: number, settings: Settings = DEFAULT_SETTINGS): LazilessState {
  return {
    version: 1,
    settings,
    log: [],
    nextReminderAt: settings.paused ? null : computeNextReminder(new Date(now), settings).getTime(),
    currentActivityId: null,
  };
}

/** Pick a random activity, avoiding the most recent few when there's choice. */
export function pickActivity(pool: Activity[], recentIds: string[], rand: number): Activity | undefined {
  if (pool.length === 0) return undefined;
  const recent = new Set(recentIds.slice(-RECENT_WINDOW));
  const fresh = pool.filter((a) => !recent.has(a.id));
  const choices = fresh.length > 0 ? fresh : pool;
  const index = Math.min(choices.length - 1, Math.floor(rand * choices.length));
  return choices[index];
}

function schedule(state: LazilessState, now: number): LazilessState {
  return {
    ...state,
    currentActivityId: null,
    nextReminderAt: state.settings.paused
      ? null
      : computeNextReminder(new Date(now), state.settings).getTime(),
  };
}

function prompt(state: LazilessState, rand: number): LazilessState {
  const pick = pickActivity(
    enabledActivities(state.settings),
    state.log.map((e) => e.activityId),
    rand,
  );
  if (!pick) return state;
  return { ...state, currentActivityId: pick.id };
}

function record(state: LazilessState, status: LogStatus, now: number): LazilessState {
  if (!state.currentActivityId) return state;
  const cutoff = now - LOG_RETENTION_DAYS * DAY;
  const log = [
    ...state.log.filter((e) => e.at >= cutoff),
    { activityId: state.currentActivityId, status, at: now },
  ];
  return schedule({ ...state, log }, now);
}

export function lazilessReducer(state: LazilessState, action: LazilessAction): LazilessState {
  switch (action.type) {
    case "replace":
      return action.state;

    case "tick": {
      const { settings, nextReminderAt, currentActivityId } = state;
      if (settings.paused || currentActivityId) return state;
      if (nextReminderAt === null) return schedule(state, action.now);
      if (action.now < nextReminderAt) return state; // same object -> no re-render
      // Due. Outside active hours (e.g. the app was closed overnight) or with
      // nothing enabled, just reschedule instead of nagging.
      if (!isWithinActiveHours(new Date(action.now), settings)) return schedule(state, action.now);
      const prompted = prompt(state, action.rand);
      return prompted === state ? schedule(state, action.now) : prompted;
    }

    case "nudgeNow":
      if (state.currentActivityId) return state;
      return prompt(state, action.rand);

    case "complete":
      return record(state, "done", action.now);

    case "skip":
      return record(state, "skipped", action.now);

    case "snooze":
      if (!state.currentActivityId) return state;
      return {
        ...state,
        currentActivityId: null,
        nextReminderAt: action.now + (action.minutes ?? SNOOZE_MINUTES) * MINUTE,
      };

    case "setPaused": {
      const next = { ...state, settings: { ...state.settings, paused: action.paused } };
      return schedule(next, action.now);
    }

    case "updateSettings": {
      const next = { ...state, settings: { ...state.settings, ...action.patch } };
      const timingChanged =
        "intervalMinutes" in action.patch ||
        "activeStart" in action.patch ||
        "activeEnd" in action.patch;
      return timingChanged && !next.currentActivityId ? schedule(next, action.now) : next;
    }

    case "toggleActivity": {
      const ids = new Set(state.settings.enabledActivityIds);
      if (ids.has(action.id)) ids.delete(action.id);
      else ids.add(action.id);
      return { ...state, settings: { ...state.settings, enabledActivityIds: [...ids] } };
    }

    case "addCustomActivity": {
      const title = action.title.trim();
      if (!title) return state;
      const activity: Activity = {
        id: `custom-${action.now.toString(36)}`,
        title,
        emoji: action.emoji?.trim() || "✨",
        durationSec: 60,
        category: "move",
        custom: true,
      };
      return {
        ...state,
        settings: {
          ...state.settings,
          customActivities: [...state.settings.customActivities, activity],
          enabledActivityIds: [...state.settings.enabledActivityIds, activity.id],
        },
      };
    }

    case "removeCustomActivity": {
      const next: LazilessState = {
        ...state,
        settings: {
          ...state.settings,
          customActivities: state.settings.customActivities.filter((a) => a.id !== action.id),
          enabledActivityIds: state.settings.enabledActivityIds.filter((id) => id !== action.id),
        },
      };
      return state.currentActivityId === action.id ? schedule(next, action.now) : next;
    }
  }
}
