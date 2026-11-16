"use client";

import { entriesOnDay, findActivity, type LazilessState } from "@laziless/core";

export function TodayLog({ state, now }: { state: LazilessState; now: number }) {
  const entries = entriesOnDay(state.log, new Date(now)).reverse();

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:px-6 dark:border-stone-800 dark:bg-stone-900">
      <h2 className="font-bold">📋 Today</h2>
      {entries.length === 0 ? (
        <p className="mt-2 text-stone-500 dark:text-stone-400">
          Nothing yet. Your first tiny win is coming up.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries.map((e) => {
            const a = findActivity(state.settings, e.activityId);
            return (
              <li key={`${e.at}-${e.activityId}`} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 text-stone-400 tabular-nums">
                  {new Date(e.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
                <span aria-hidden>{a?.emoji ?? "•"}</span>
                <span className={`flex-1 ${e.status === "skipped" ? "text-stone-400 line-through" : ""}`}>
                  {a?.title ?? "Removed activity"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    e.status === "done"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                  }`}
                >
                  {e.status === "done" ? "done" : "skipped"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
