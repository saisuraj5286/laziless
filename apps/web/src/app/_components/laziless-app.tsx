"use client";

import { currentStreak, dayStats } from "@laziless/core";
import { useEffect, useState } from "react";

import { FeedbackPanel } from "~/app/_components/feedback-panel";
import { SettingsPanel } from "~/app/_components/settings-panel";
import { TaskCard } from "~/app/_components/task-card";
import { TodayLog } from "~/app/_components/today-log";
import { useLaziless } from "~/app/_hooks/use-laziless";
import { getNotifyPermission, requestNotifyPermission, type NotifyPermission } from "~/lib/notify";

function Stat({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className="text-2xl font-bold tabular-nums">
        <span aria-hidden>{emoji}</span> {value}
      </p>
      <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
        {label}
      </p>
    </div>
  );
}

function NotificationBanner() {
  const [perm, setPerm] = useState<NotifyPermission>("default");
  useEffect(() => setPerm(getNotifyPermission()), []);

  if (perm === "granted" || perm === "unsupported") return null;
  if (perm === "denied") {
    return (
      <p className="rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600 dark:bg-stone-900 dark:text-stone-400">
        🔕 Notifications are blocked. Allow them in your browser&apos;s site settings to get nudges
        while this tab is in the background.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
      <span className="flex-1">🔔 Turn on notifications so we can nudge you even when this tab is in the background.</span>
      <button
        onClick={() => void requestNotifyPermission().then(setPerm)}
        className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600"
      >
        Enable
      </button>
    </div>
  );
}

export function LazilessApp() {
  const { state, now, dispatch, soundOn, toggleSound } = useLaziless();

  if (!state) {
    return (
      <div className="page-x py-12">
        <div className="h-64 animate-pulse rounded-3xl bg-stone-200/60 lg:w-[60%] dark:bg-stone-800/60" />
      </div>
    );
  }

  const today = dayStats(state.log, new Date(now));
  const streak = currentStreak(state.log, new Date(now));

  return (
    <div className="page-x flex flex-col gap-5 py-8 sm:py-12">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-title font-extrabold">Try Laziless</h1>
          <p className="text-stone-500 dark:text-stone-400">
            Free demo. Your data stays in this browser.
          </p>
        </div>
      </header>

      {/* Left (60%): what to do now. Right: today's log and settings. */}
      <div className="grid items-start gap-5 lg:grid-cols-[60%_minmax(0,1fr)] lg:gap-[3%]">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Done today" value={today.done} emoji="✅" />
            <Stat label="Skipped" value={today.skipped} emoji="⏭️" />
            <Stat label="Day streak" value={streak} emoji="🔥" />
          </div>
          <NotificationBanner />
          <TaskCard state={state} now={now} dispatch={dispatch} />
        </div>
        <div className="flex flex-col gap-5">
          <TodayLog state={state} now={now} />
          <SettingsPanel state={state} dispatch={dispatch} soundOn={soundOn} toggleSound={toggleSound} />
          <FeedbackPanel />
        </div>
      </div>

      <p className="text-center text-xs text-stone-400">
        Keep this tab open. Nudges work while your browser is running. Your data stays on this device.
      </p>
    </div>
  );
}
