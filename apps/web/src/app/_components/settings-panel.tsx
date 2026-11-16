"use client";

import { INTERVAL_OPTIONS, allActivities, type LazilessState } from "@laziless/core";
import { useState } from "react";

import type { AppAction } from "~/app/_hooks/use-laziless";

const chip = (active: boolean) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-emerald-600 text-white"
      : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
  }`;

export function SettingsPanel({
  state,
  dispatch,
  soundOn,
  toggleSound,
}: {
  state: LazilessState;
  dispatch: (a: AppAction) => void;
  soundOn: boolean;
  toggleSound: () => void;
}) {
  const { settings } = state;
  const enabled = new Set(settings.enabledActivityIds);
  const [emoji, setEmoji] = useState("");
  const [title, setTitle] = useState("");

  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    dispatch({ type: "addCustomActivity", title, emoji });
    setTitle("");
    setEmoji("");
  };

  return (
    <details className="group rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-bold sm:px-6">
        <span>⚙️ Settings</span>
        <span className="text-stone-400 transition group-open:rotate-180">▾</span>
      </summary>

      <div className="space-y-7 border-t border-stone-200 p-5 sm:px-6 dark:border-stone-800">
        <div>
          <h3 className="font-semibold">Nudge me every</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTERVAL_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => dispatch({ type: "updateSettings", patch: { intervalMinutes: m } })}
                className={chip(settings.intervalMinutes === m)}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Active hours</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">No nudges outside this window.</p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="time"
              value={settings.activeStart}
              onChange={(e) =>
                e.target.value &&
                dispatch({ type: "updateSettings", patch: { activeStart: e.target.value } })
              }
              className="rounded-xl border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700"
            />
            <span className="text-stone-400">to</span>
            <input
              type="time"
              value={settings.activeEnd}
              onChange={(e) =>
                e.target.value &&
                dispatch({ type: "updateSettings", patch: { activeEnd: e.target.value } })
              }
              className="rounded-xl border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between">
          <span className="font-semibold">Chime sound</span>
          <input
            type="checkbox"
            checked={soundOn}
            onChange={toggleSound}
            className="h-5 w-5 accent-emerald-600"
          />
        </label>

        <div>
          <h3 className="font-semibold">Activities</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            A random one is picked each time.
          </p>
          <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {allActivities(settings).map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <input
                  id={`act-${a.id}`}
                  type="checkbox"
                  checked={enabled.has(a.id)}
                  onChange={() => dispatch({ type: "toggleActivity", id: a.id })}
                  className="h-5 w-5 shrink-0 accent-emerald-600"
                />
                <label htmlFor={`act-${a.id}`} className="flex flex-1 cursor-pointer items-center gap-2">
                  <span aria-hidden>{a.emoji}</span>
                  <span>{a.title}</span>
                </label>
                {a.custom && (
                  <button
                    onClick={() => dispatch({ type: "removeCustomActivity", id: a.id })}
                    className="rounded-lg px-2 py-1 text-sm text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    aria-label={`Remove ${a.title}`}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          <form onSubmit={addCustom} className="mt-4 flex gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="✨"
              maxLength={4}
              aria-label="Emoji"
              className="w-14 rounded-xl border border-stone-300 bg-transparent px-2 py-2 text-center dark:border-stone-700"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add your own tiny task…"
              aria-label="Activity name"
              className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-xl bg-stone-900 px-4 py-2 font-semibold text-white disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}
