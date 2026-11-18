"use client";

import {
  CATEGORY_INFO,
  STORAGE_KEY,
  addDays,
  countsByActivity,
  countsByPeriod,
  currentStreak,
  deserializeState,
  doneByCategory,
  doneByHour,
  entriesBetween,
  longestStreak,
  startOfDay,
  summarize,
  type LazilessState,
  type Summary,
} from "@laziless/core";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ColumnChart, type ChartColumn, type ChartSeries } from "~/app/_components/stats/column-chart";

const RANGES = [
  { id: "7d", label: "7 days", days: 7, periodDays: 1, labelEvery: 1 },
  { id: "30d", label: "30 days", days: 30, periodDays: 1, labelEvery: 7 },
  { id: "12w", label: "12 weeks", days: 84, periodDays: 7, labelEvery: 3 },
] as const;
type Range = (typeof RANGES)[number];

const DONE: ChartSeries = { key: "done", label: "Done", markClass: "bg-chart-done" };
const SKIPPED: ChartSeries = { key: "skipped", label: "Skipped", markClass: "bg-chart-skipped" };

const card =
  "rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900";

function readLocalState(): LazilessState {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (e.g. private mode): treat as no history.
  }
  return deserializeState(raw, Date.now());
}

/**
 * Stats from the Laziless history saved in this browser. History isn't synced
 * to the account yet, so this reads the same local storage the app writes.
 */
export function AccountStats() {
  const [data, setData] = useState<{ state: LazilessState; now: number } | null>(null);

  useEffect(() => {
    const load = () => setData({ state: readLocalState(), now: Date.now() });
    load();
    // Update live when the app is open in another tab.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!data) {
    return (
      <div aria-hidden className="mt-10 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-stone-200/60 dark:bg-stone-800/60" />
        ))}
      </div>
    );
  }

  if (data.state.log.length === 0) {
    return (
      <div className={`${card} mt-10 text-center sm:p-10`}>
        <p aria-hidden className="text-4xl">
          📊
        </p>
        <h2 className="mt-3 text-xl font-bold">No activity yet</h2>
        <p className="mx-auto mt-2 max-w-md text-stone-600 dark:text-stone-400">
          Your stats come from the Laziless app in this browser. Do a few tiny tasks and
          they&apos;ll show up here.
        </p>
        <Link
          href="/demo"
          className="mt-6 inline-block rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
        >
          Open the app
        </Link>
      </div>
    );
  }

  return <StatsView state={data.state} now={data.now} />;
}

function StatsView({ state, now }: { state: LazilessState; now: number }) {
  const [range, setRange] = useState<Range>(RANGES[0]);

  const { log, settings } = state;
  const today = startOfDay(new Date(now));
  const end = addDays(today, 1);
  const start = addDays(today, -(range.days - 1));

  const entries = entriesBetween(log, start, end);
  const summary = summarize(entries, settings);
  const allTime = summarize(log, settings);

  // Only compare with the previous period if there was history back then;
  // otherwise every number would show as a big jump from zero.
  const firstAt = log.reduce((min, e) => Math.min(min, e.at), Infinity);
  const previous =
    firstAt < start.getTime()
      ? summarize(entriesBetween(log, addDays(start, -range.days), start), settings)
      : null;
  const vs = `previous ${range.label}`;
  const streak = currentStreak(log, new Date(now));
  const bestStreak = longestStreak(log);

  const periodName = range.periodDays === 1 ? "day" : "week";
  const periods = countsByPeriod(entries, start, range.periodDays, range.days / range.periodDays);
  const periodColumns: ChartColumn[] = periods.map((p, i) => ({
    id: String(p.start.getTime()),
    axisLabel:
      (periods.length - 1 - i) % range.labelEvery === 0
        ? range.id === "7d"
          ? p.start.toLocaleDateString([], { weekday: "short" })
          : formatShortDate(p.start)
        : undefined,
    title:
      range.periodDays === 1
        ? p.start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
        : `Week of ${formatShortDate(p.start)}`,
    values: { done: p.done, skipped: p.skipped },
  }));

  const hourColumns: ChartColumn[] = doneByHour(entries).map((done, h) => ({
    id: String(h),
    axisLabel: h % 6 === 0 ? formatHour(h) : undefined,
    title: `${formatHour(h)} – ${formatHour((h + 1) % 24)}`,
    values: { done },
  }));

  return (
    <div className="mt-10 space-y-10">
      <section aria-labelledby="all-time-heading">
        <h2
          id="all-time-heading"
          className="text-sm font-bold tracking-wide text-stone-500 uppercase dark:text-stone-400"
        >
          All time
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="🔥 Current streak" value={String(streak)} detail={plural(streak, "day")} />
          <StatTile label="🏆 Best streak" value={String(bestStreak)} detail={plural(bestStreak, "day")} />
          <StatTile
            label="✅ Tasks done"
            value={allTime.done.toLocaleString()}
            detail={`since ${formatShortDate(new Date(firstAt))}`}
          />
        </div>
      </section>

      <section aria-labelledby="range-heading" className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="range-heading" className="sr-only">
            Last {range.label}
          </h2>
          <div
            role="group"
            aria-label="Date range"
            className="inline-flex rounded-2xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900"
          >
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={r.id === range.id}
                onClick={() => setRange(r)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  r.id === range.id
                    ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                }`}
              >
                Last {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Tasks done"
            value={summary.done.toLocaleString()}
            delta={previous && <Delta diff={summary.done - previous.done} vs={vs} />}
          />
          <StatTile
            label="Completion rate"
            value={formatRate(summary)}
            delta={
              previous &&
              summary.completionRate !== null &&
              previous.completionRate !== null && (
                <Delta
                  diff={Math.round((summary.completionRate - previous.completionRate) * 100)}
                  unit=" pts"
                  vs={vs}
                />
              )
            }
          />
          <StatTile
            label="Active time"
            value={formatMinutes(summary.activeMinutes)}
            delta={
              previous && (
                <Delta diff={summary.activeMinutes - previous.activeMinutes} unit=" min" vs={vs} />
              )
            }
          />
          <StatTile
            label="Active days"
            value={String(summary.activeDays)}
            detail={`of ${range.days}`}
            delta={previous && <Delta diff={summary.activeDays - previous.activeDays} vs={vs} />}
          />
        </div>

        <div className={card}>
          <h3 className="font-bold">Tasks per {periodName}</h3>
          <div className="mt-3">
            <ColumnChart
              label={`Tasks per ${periodName}, last ${range.label}`}
              series={[DONE, SKIPPED]}
              columns={periodColumns}
              periodName={periodName}
            />
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div className={card}>
            <h3 className="font-bold">By category</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Completed tasks</p>
            <CategoryBars entries={entries} state={state} totalDone={summary.done} />
          </div>

          <div className={card}>
            <h3 className="font-bold">Time of day</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Completed tasks by hour</p>
            <div className="mt-3">
              <ColumnChart
                label={`Completed tasks by hour, last ${range.label}`}
                series={[DONE]}
                columns={hourColumns}
                periodName="hour"
              />
            </div>
          </div>
        </div>

        <div className={card}>
          <h3 className="font-bold">Activities</h3>
          <ActivityTable entries={entries} state={state} />
        </div>
      </section>

      <p className="text-center text-xs text-stone-400">
        Worked out from the Laziless history saved in this browser. It isn&apos;t synced to your
        account yet.
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
  delta,
}: {
  label: string;
  value: string;
  /** Small text after the value, e.g. "days" or "of 30". */
  detail?: string;
  delta?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">
        {value}
        {detail && (
          <span className="ml-1.5 text-base font-semibold text-stone-500 dark:text-stone-400">{detail}</span>
        )}
      </p>
      {delta}
    </div>
  );
}

/**
 * Change vs the previous period (`vs`, e.g. "previous 7 days"). Arrow and
 * words carry the direction, so it never relies on color.
 */
function Delta({ diff, unit = "", vs }: { diff: number; unit?: string; vs: string }) {
  if (diff === 0) {
    return <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Same as {vs}</p>;
  }
  const up = diff > 0;
  return (
    <p className="mt-1 text-sm">
      <span className={`font-semibold ${up ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
        <span aria-hidden>{up ? "▲" : "▼"}</span>
        <span className="sr-only">{up ? "Up" : "Down"}</span> {Math.abs(diff).toLocaleString()}
        {unit}
      </span>{" "}
      <span className="text-stone-500 dark:text-stone-400">vs {vs}</span>
    </p>
  );
}

/** Ranked bars, one hue: categories by completed tasks, most first. */
function CategoryBars({
  entries,
  state,
  totalDone,
}: {
  entries: LazilessState["log"];
  state: LazilessState;
  totalDone: number;
}) {
  const rows = doneByCategory(entries, state.settings);
  if (rows.length === 0) {
    return <p className="mt-4 text-stone-500 dark:text-stone-400">Nothing done in this range yet.</p>;
  }
  const max = rows[0]?.done ?? 1;
  return (
    <ul className="mt-5 space-y-3">
      {rows.map((r) => {
        const info = CATEGORY_INFO[r.category];
        return (
          <li key={r.category} className="grid grid-cols-[6.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm">
            <span className="font-medium">
              <span aria-hidden>{info.emoji}</span> {info.label}
            </span>
            <span className="h-2.5">
              <span
                className="block h-full rounded-r-[4px] bg-chart-done"
                style={{ width: `${(r.done / max) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums">
              <span className="font-semibold">{r.done}</span>{" "}
              <span className="text-stone-500 dark:text-stone-400">{Math.round((r.done / totalDone) * 100)}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ActivityTable({ entries, state }: { entries: LazilessState["log"]; state: LazilessState }) {
  const rows = countsByActivity(entries, state.settings);
  if (rows.length === 0) {
    return <p className="mt-4 text-stone-500 dark:text-stone-400">No tasks in this range yet.</p>;
  }
  return (
    <table className="mt-4 w-full text-left text-sm">
      <thead className="text-stone-500 dark:text-stone-400">
        <tr>
          <th scope="col" className="pb-2 font-semibold">
            Activity
          </th>
          <th scope="col" className="pb-2 text-right font-semibold">
            Done
          </th>
          <th scope="col" className="pb-2 text-right font-semibold">
            Skipped
          </th>
          <th scope="col" className="pb-2 text-right font-semibold">
            Rate
          </th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {rows.map((r) => (
          <tr key={r.activityId} className="border-t border-stone-100 dark:border-stone-800">
            <th scope="row" className="py-2 pr-3 font-normal">
              <span aria-hidden>{r.activity?.emoji ?? "•"}</span> {r.activity?.title ?? "Removed activity"}
            </th>
            <td className="py-2 text-right">{r.done}</td>
            <td className="py-2 text-right">{r.skipped}</td>
            <td className="py-2 pl-3 text-right">{Math.round((r.done / (r.done + r.skipped)) * 100)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatHour(h: number): string {
  return new Date(2000, 0, 1, h).toLocaleTimeString([], { hour: "numeric" });
}

function formatRate(s: Summary): string {
  return s.completionRate === null ? "–" : `${Math.round(s.completionRate * 100)}%`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
