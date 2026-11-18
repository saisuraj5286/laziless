"use client";

import { useState, type KeyboardEvent } from "react";

export interface ChartSeries {
  key: string;
  label: string;
  /** Tailwind background class for this series' marks, e.g. "bg-chart-done". */
  markClass: string;
}

export interface ChartColumn {
  id: string;
  /** Text under the axis. Leave it out to keep busy axes readable. */
  axisLabel?: string;
  /** Heading in the tooltip and the table, e.g. "Mon, Nov 17". */
  title: string;
  values: Record<string, number>;
}

/**
 * Whole-number axis ticks from 0, stepping by 1, 2 or 5 × 10ⁿ, at most 5 ticks.
 * e.g. max 3 → 0 1 2 3 · max 7 → 0 2 4 6 8 · max 12 → 0 5 10 15.
 */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const steps: number[] = [];
  for (let p = 1; p <= max; p *= 10) steps.push(p, 2 * p, 5 * p);
  const step = steps.find((s) => max / s <= 4) ?? 10 ** Math.ceil(Math.log10(max));
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}

const PLOT_HEIGHT = "h-40";

/**
 * Stacked column chart: series stack bottom to top in the order given. Hover a
 * column (or focus the chart and use the arrow keys) for its values; every
 * value is also in the "Show as table" view below the chart.
 */
export function ColumnChart({
  label,
  series,
  columns,
  periodName,
}: {
  /** What the chart shows, for screen readers, e.g. "Tasks per day". */
  label: string;
  series: ChartSeries[];
  columns: ChartColumn[];
  /** One column's unit, e.g. "day" or "hour". */
  periodName: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const totals = columns.map((c) => series.reduce((sum, s) => sum + (c.values[s.key] ?? 0), 0));
  const ticks = niceTicks(Math.max(0, ...totals));
  const top = ticks[ticks.length - 1] ?? 1;
  const pct = (v: number) => `${(v / top) * 100}%`;
  const activeColumn = active === null ? undefined : columns[active];

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = columns.length - 1;
    const current = active ?? last;
    const next =
      e.key === "ArrowLeft"
        ? Math.max(0, current - 1)
        : e.key === "ArrowRight"
          ? Math.min(last, current + 1)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : undefined;
    if (e.key === "Escape") setActive(null);
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
  }

  const readout = activeColumn
    ? `${activeColumn.title}: ${series.map((s) => `${activeColumn.values[s.key] ?? 0} ${s.label.toLowerCase()}`).join(", ")}`
    : "";

  return (
    <div>
      {series.length > 1 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span aria-hidden className={`size-2.5 rounded-[3px] ${s.markClass}`} />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-2">
        {/* Y-axis ticks */}
        <div
          aria-hidden
          className={`relative ${PLOT_HEIGHT} w-6 shrink-0 text-right text-xs text-stone-500 tabular-nums dark:text-stone-400`}
        >
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2 leading-none" style={{ bottom: pct(t) }}>
              {t}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            role="group"
            tabIndex={0}
            aria-label={`${label}. Use the left and right arrow keys to read each ${periodName}.`}
            onKeyDown={onKeyDown}
            onFocus={() => setActive((a) => a ?? columns.length - 1)}
            onBlur={() => setActive(null)}
            onPointerLeave={() => setActive(null)}
            className={`relative ${PLOT_HEIGHT} rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-8 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900`}
          >
            {/* Gridlines: solid hairlines; the baseline one step darker. */}
            {ticks.map((t) => (
              <div
                key={t}
                aria-hidden
                className={`absolute inset-x-0 border-t ${
                  t === 0 ? "border-stone-300 dark:border-stone-700" : "border-stone-100 dark:border-stone-800"
                }`}
                style={{ bottom: pct(t) }}
              />
            ))}

            <div className="absolute inset-0 flex">
              {columns.map((c, i) => {
                const segments = series
                  .map((s) => ({ s, value: c.values[s.key] ?? 0 }))
                  .filter((seg) => seg.value > 0);
                return (
                  // The whole column slot is the hover target, not just the bar.
                  <div
                    key={c.id}
                    onPointerEnter={() => setActive(i)}
                    className={`flex h-full flex-1 justify-center rounded-sm ${
                      active === i ? "bg-stone-100 dark:bg-stone-800/70" : ""
                    }`}
                  >
                    {/* Stack grows up from the baseline; 2px surface gap between segments. */}
                    <div className="flex h-full w-[70%] max-w-[24px] flex-col-reverse gap-[2px]">
                      {segments.map(({ s, value }, j) => (
                        <div
                          key={s.key}
                          className={`${s.markClass} ${j === segments.length - 1 ? "rounded-t-[4px]" : ""}`}
                          style={{ height: pct(value) }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeColumn && active !== null && (
              <Tooltip
                column={activeColumn}
                series={series}
                position={((active + 0.5) / columns.length) * 100}
              />
            )}
          </div>

          {/* X-axis labels */}
          <div aria-hidden className="mt-2 flex text-xs text-stone-500 dark:text-stone-400">
            {columns.map((c) => (
              <div key={c.id} className="flex flex-1 justify-center">
                <span className="whitespace-nowrap">{c.axisLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {readout}
      </p>

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white">
          Show as table
        </summary>
        <table className="mt-3 w-full text-left">
          <thead className="text-stone-500 dark:text-stone-400">
            <tr>
              <th scope="col" className="py-1.5 font-semibold capitalize">
                {periodName}
              </th>
              {series.map((s) => (
                <th key={s.key} scope="col" className="py-1.5 text-right font-semibold">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {columns.map((c) => (
              <tr key={c.id} className="border-t border-stone-100 dark:border-stone-800">
                <th scope="row" className="py-1.5 font-normal">
                  {c.title}
                </th>
                {series.map((s) => (
                  <td key={s.key} className="py-1.5 text-right">
                    {c.values[s.key] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function Tooltip({
  column,
  series,
  position,
}: {
  column: ChartColumn;
  series: ChartSeries[];
  /** Column centre as a percentage of the plot width. */
  position: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-full z-10 mb-3 w-max rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-stone-700 dark:bg-stone-800"
      // Shift by the same percentage as the anchor, so the tooltip never
      // overflows the chart at the first or last column.
      style={{ left: `${position}%`, transform: `translateX(-${position}%)` }}
    >
      <p className="text-xs text-stone-500 dark:text-stone-400">{column.title}</p>
      <ul className="mt-1 space-y-0.5">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`h-0.5 w-3 rounded-full ${s.markClass}`} />
            <span className="font-semibold tabular-nums">{column.values[s.key] ?? 0}</span>
            <span className="text-stone-500 dark:text-stone-400">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
