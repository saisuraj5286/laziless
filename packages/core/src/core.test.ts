import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS } from "./activities";
import { createInitialState, lazilessReducer, pickActivity } from "./engine";
import { computeNextReminder, formatCountdown, isWithinActiveHours } from "./schedule";
import {
  countsByActivity,
  countsByPeriod,
  currentStreak,
  dayStats,
  doneByCategory,
  doneByHour,
  entriesBetween,
  longestStreak,
  summarize,
} from "./stats";
import { deserializeState, serializeState } from "./storage";
import type { LazilessState, Settings } from "./types";

// Local-time helper so tests don't depend on the machine's timezone.
const at = (h: number, m = 0, day = 12) => new Date(2026, 10, day, h, m, 0, 0);
const MIN = 60_000;

describe("schedule", () => {
  const s: Settings = { ...DEFAULT_SETTINGS, intervalMinutes: 30, activeStart: "09:00", activeEnd: "21:00" };

  it("knows active hours", () => {
    expect(isWithinActiveHours(at(8, 59), s)).toBe(false);
    expect(isWithinActiveHours(at(9, 0), s)).toBe(true);
    expect(isWithinActiveHours(at(20, 59), s)).toBe(true);
    expect(isWithinActiveHours(at(21, 0), s)).toBe(false);
  });

  it("handles windows that wrap past midnight", () => {
    const night = { ...s, activeStart: "22:00", activeEnd: "02:00" };
    expect(isWithinActiveHours(at(23), night)).toBe(true);
    expect(isWithinActiveHours(at(1), night)).toBe(true);
    expect(isWithinActiveHours(at(12), night)).toBe(false);
  });

  it("schedules one interval later inside the window", () => {
    expect(computeNextReminder(at(10), s)).toEqual(at(10, 30));
  });

  it("pushes to the next morning when the interval crosses the end of the day", () => {
    expect(computeNextReminder(at(20, 45), s)).toEqual(at(9, 0, 13));
  });

  it("pushes to this morning's start when it's before the window", () => {
    expect(computeNextReminder(at(6), s)).toEqual(at(9, 0));
  });

  it("formats countdowns", () => {
    expect(formatCountdown(65_000)).toBe("01:05");
    expect(formatCountdown(3_725_000)).toBe("1:02:05");
    expect(formatCountdown(-5)).toBe("00:00");
  });
});

describe("engine", () => {
  const base = (): LazilessState => createInitialState(at(10).getTime());

  it("prompts when due and records completion", () => {
    let st = base();
    expect(st.nextReminderAt).toBe(at(10, 30).getTime());

    st = lazilessReducer(st, { type: "tick", now: at(10, 10).getTime(), rand: 0 });
    expect(st.currentActivityId).toBeNull();

    st = lazilessReducer(st, { type: "tick", now: at(10, 30).getTime(), rand: 0 });
    expect(st.currentActivityId).not.toBeNull();

    st = lazilessReducer(st, { type: "complete", now: at(10, 31).getTime() });
    expect(st.currentActivityId).toBeNull();
    expect(st.log).toHaveLength(1);
    expect(st.log[0]?.status).toBe("done");
    expect(st.nextReminderAt).toBe(at(11, 1).getTime());
  });

  it("returns the same object when nothing changes (no re-render)", () => {
    const st = base();
    expect(lazilessReducer(st, { type: "tick", now: at(10, 5).getTime(), rand: 0.5 })).toBe(st);
  });

  it("snoozes without logging", () => {
    let st = lazilessReducer(base(), { type: "nudgeNow", now: at(10).getTime(), rand: 0 });
    st = lazilessReducer(st, { type: "snooze", now: at(10).getTime() });
    expect(st.currentActivityId).toBeNull();
    expect(st.log).toHaveLength(0);
    expect(st.nextReminderAt).toBe(at(10).getTime() + 10 * MIN);
  });

  it("reschedules instead of nagging when due outside active hours", () => {
    let st = base();
    st = lazilessReducer(st, { type: "tick", now: at(23).getTime(), rand: 0 });
    expect(st.currentActivityId).toBeNull();
    expect(st.nextReminderAt).toBe(at(9, 0, 13).getTime());
  });

  it("pausing clears the schedule and unpausing restores it", () => {
    let st = lazilessReducer(base(), { type: "setPaused", now: at(10).getTime(), paused: true });
    expect(st.nextReminderAt).toBeNull();
    st = lazilessReducer(st, { type: "tick", now: at(12).getTime(), rand: 0 });
    expect(st.currentActivityId).toBeNull();
    st = lazilessReducer(st, { type: "setPaused", now: at(12).getTime(), paused: false });
    expect(st.nextReminderAt).toBe(at(12, 30).getTime());
  });

  it("adds, enables and removes custom activities", () => {
    let st = lazilessReducer(base(), { type: "addCustomActivity", now: 1, title: " Water the plants ", emoji: "🪴" });
    const custom = st.settings.customActivities[0];
    expect(custom?.title).toBe("Water the plants");
    expect(st.settings.enabledActivityIds).toContain(custom?.id);
    st = lazilessReducer(st, { type: "removeCustomActivity", now: 2, id: custom!.id });
    expect(st.settings.customActivities).toHaveLength(0);
    expect(st.settings.enabledActivityIds).not.toContain(custom?.id);
  });

  it("doesn't prompt when no activities are enabled", () => {
    let st = lazilessReducer(base(), { type: "updateSettings", now: at(10).getTime(), patch: { enabledActivityIds: [] } });
    st = lazilessReducer(st, { type: "tick", now: at(10, 30).getTime(), rand: 0 });
    expect(st.currentActivityId).toBeNull();
    expect(st.nextReminderAt).toBe(at(11).getTime());
  });

  it("avoids repeating recent activities", () => {
    const pool = [
      { id: "a", title: "A", emoji: "", durationSec: 1, category: "move" as const },
      { id: "b", title: "B", emoji: "", durationSec: 1, category: "move" as const },
    ];
    expect(pickActivity(pool, ["a"], 0)?.id).toBe("b");
    expect(pickActivity(pool, ["a", "b"], 0.99)?.id).toBe("b");
    expect(pickActivity([], [], 0)).toBeUndefined();
  });
});

describe("stats", () => {
  const log = [
    { activityId: "water", status: "done" as const, at: at(10, 0, 10).getTime() },
    { activityId: "water", status: "done" as const, at: at(10, 0, 11).getTime() },
    { activityId: "squats", status: "skipped" as const, at: at(11, 0, 12).getTime() },
    { activityId: "water", status: "done" as const, at: at(12, 0, 12).getTime() },
  ];

  it("counts per day", () => {
    expect(dayStats(log, at(15))).toEqual({ done: 1, skipped: 1 });
  });

  it("computes streaks, tolerating an empty today", () => {
    expect(currentStreak(log, at(15))).toBe(3);
    expect(currentStreak(log, at(8, 0, 13))).toBe(3);
    expect(currentStreak(log, at(8, 0, 14))).toBe(0);
  });

  it("finds the longest streak, ignoring skip-only days", () => {
    expect(longestStreak([])).toBe(0);
    expect(longestStreak(log)).toBe(3);
    const gappy = [
      { activityId: "water", status: "done" as const, at: at(9, 0, 1).getTime() },
      { activityId: "water", status: "done" as const, at: at(9, 0, 2).getTime() },
      { activityId: "water", status: "skipped" as const, at: at(9, 0, 3).getTime() },
      { activityId: "water", status: "done" as const, at: at(9, 0, 5).getTime() },
      { activityId: "water", status: "done" as const, at: at(23, 0, 5).getTime() },
    ];
    expect(longestStreak(gappy)).toBe(2);
  });

  it("filters to a half-open time range", () => {
    expect(entriesBetween(log, at(0, 0, 11), at(0, 0, 12))).toHaveLength(1);
    expect(entriesBetween(log, at(10, 0, 10), at(10, 0, 11))).toHaveLength(1);
  });

  it("summarizes done, skipped, rate, minutes and active days", () => {
    expect(summarize(log, DEFAULT_SETTINGS)).toEqual({
      done: 3,
      skipped: 1,
      completionRate: 0.75,
      activeMinutes: 2, // 3 × 30s water
      activeDays: 3,
    });
    expect(summarize([], DEFAULT_SETTINGS).completionRate).toBeNull();
  });

  it("counts per day and per week, ignoring entries outside the periods", () => {
    const daily = countsByPeriod(log, at(15, 0, 11), 1, 2);
    expect(daily.map(({ done, skipped }) => ({ done, skipped }))).toEqual([
      { done: 1, skipped: 0 },
      { done: 1, skipped: 1 },
    ]);
    expect(daily[0]?.start).toEqual(at(0, 0, 11));

    const weekly = countsByPeriod(log, at(0, 0, 6), 7, 1);
    expect(weekly[0]).toMatchObject({ done: 3, skipped: 1 });
  });

  it("counts done tasks per hour", () => {
    const hours = doneByHour(log);
    expect(hours).toHaveLength(24);
    expect(hours[10]).toBe(2);
    expect(hours[11]).toBe(0); // the 11:00 entry was skipped
    expect(hours[12]).toBe(1);
  });

  it("breaks down by activity and by category", () => {
    const byActivity = countsByActivity(log, DEFAULT_SETTINGS);
    expect(byActivity.map((r) => [r.activityId, r.done, r.skipped])).toEqual([
      ["water", 3, 0],
      ["squats", 0, 1],
    ]);
    expect(byActivity[0]?.activity?.title).toBe("Drink a glass of water");
    expect(doneByCategory(log, DEFAULT_SETTINGS)).toEqual([{ category: "hydrate", done: 3 }]);
  });
});

describe("storage", () => {
  it("round-trips state", () => {
    const st = createInitialState(at(10).getTime());
    expect(deserializeState(serializeState(st), 0)).toEqual(st);
  });

  it("falls back to defaults on garbage", () => {
    const st = deserializeState("{not json", at(10).getTime());
    expect(st.settings).toEqual(DEFAULT_SETTINGS);
    expect(deserializeState(JSON.stringify({ version: 99 }), 0).log).toEqual([]);
  });
});
