"use client";

import {
  SNOOZE_MINUTES,
  enabledActivities,
  findActivity,
  formatCountdown,
  type LazilessState,
} from "@laziless/core";

import type { AppAction } from "~/app/_hooks/use-laziless";

function formatDuration(sec: number): string {
  return sec < 60 ? `~${sec} sec` : `~${Math.round(sec / 60)} min`;
}

function formatClock(ms: number, now: number): string {
  const d = new Date(ms);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const isToday = d.toDateString() === new Date(now).toDateString();
  return isToday ? `at ${time}` : `tomorrow at ${time}`;
}

export function TaskCard({
  state,
  now,
  dispatch,
}: {
  state: LazilessState;
  now: number;
  dispatch: (a: AppAction) => void;
}) {
  const activity = findActivity(state.settings, state.currentActivityId);
  const hasActivities = enabledActivities(state.settings).length > 0;

  if (activity) {
    return (
      <section className="animate-pop rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/20 sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-emerald-50/90 uppercase">
          Time for a tiny task
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-6xl leading-none" aria-hidden>
            {activity.emoji}
          </span>
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{activity.title}</h2>
            <p className="mt-1 text-emerald-50/90">{formatDuration(activity.durationSec)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => dispatch({ type: "complete" })}
            className="flex-1 rounded-2xl bg-white px-5 py-3 text-lg font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
          >
            Done ✅
          </button>
          <button
            onClick={() => dispatch({ type: "snooze" })}
            className="rounded-2xl bg-white/15 px-4 py-3 font-semibold transition hover:bg-white/25"
          >
            Snooze {SNOOZE_MINUTES} min
          </button>
          <button
            onClick={() => dispatch({ type: "skip" })}
            className="rounded-2xl px-4 py-3 font-semibold text-emerald-50/90 transition hover:bg-white/10"
          >
            Skip
          </button>
        </div>
      </section>
    );
  }

  if (state.settings.paused || state.nextReminderAt === null) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
        <p className="text-5xl" aria-hidden>
          😴
        </p>
        <h2 className="mt-3 text-2xl font-bold">Nudges are paused</h2>
        <p className="mt-1 text-stone-500 dark:text-stone-400">Take a break. We&apos;ll be here.</p>
        <button
          onClick={() => dispatch({ type: "setPaused", paused: false })}
          className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
        >
          Resume
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-sm font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
        Next tiny task in
      </p>
      <p className="mt-2 font-mono text-[clamp(2.75rem,11vw,6rem)] leading-none font-bold tabular-nums lg:text-[clamp(4rem,6vw,7rem)]">
        {formatCountdown(state.nextReminderAt - now)}
      </p>
      <p className="mt-2 text-stone-500 dark:text-stone-400">
        {formatClock(state.nextReminderAt, now)}
      </p>
      {!hasActivities && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          No activities are turned on. Enable some in Settings below.
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => dispatch({ type: "nudgeNow" })}
          disabled={!hasActivities}
          className="rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-40"
        >
          Give me one now ⚡
        </button>
        <button
          onClick={() => dispatch({ type: "setPaused", paused: true })}
          className="rounded-2xl border border-stone-300 px-5 py-3 font-semibold transition hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          Pause
        </button>
      </div>
    </section>
  );
}
