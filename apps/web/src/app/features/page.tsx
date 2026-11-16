import { DEFAULT_ACTIVITIES, INTERVAL_OPTIONS } from "@laziless/core";

import { Card, CtaBand, Section } from "~/app/_components/marketing/blocks";
import { features, roadmap } from "~/content/site";
import { JsonLd, breadcrumbLd, pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "Random tiny tasks, custom intervals, active hours, snooze and skip, streaks and private on-device storage. See everything Laziless does to help you beat laziness.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Features", path: "/features" }])} />

      <header className="page-x pt-16">
        <p className="text-sm font-bold tracking-wide text-emerald-600 uppercase">Features</p>
        <h1 className="text-title mt-3 font-extrabold lg:w-[70%]">
          Small nudges, built around your day
        </h1>
        <p className="mt-5 text-lg text-stone-600 lg:w-1/2 dark:text-stone-300">
          Laziless gives you one tiny task at a time, at a pace you choose, only during the hours
          you&apos;re active. Here is everything it does.
        </p>
      </header>

      <Section title="Core features">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} {...f} />
          ))}
        </div>
      </Section>

      <Section
        title="How often does it nudge you?"
        intro={`You choose the interval: every ${INTERVAL_OPTIONS.join(", ").replace(/, (\d+)$/, " or $1")} minutes. The default is every 30 minutes, inside active hours you set (9:00 to 21:00 by default).`}
      >
        <div className="flex flex-wrap gap-2">
          {INTERVAL_OPTIONS.map((m) => (
            <span
              key={m}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                m === 30
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-stone-700 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-800"
              }`}
            >
              {m} min{m === 30 ? " (default)" : ""}
            </span>
          ))}
        </div>
      </Section>

      <Section
        split
        title="What tiny tasks are included?"
        intro={`${DEFAULT_ACTIVITIES.length} built-in activities across hydration, movement, stretching, breathing, eye rest and tidying, plus any you add yourself.`}
      >
        <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="bg-stone-100 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800 dark:text-stone-400">
              <tr>
                <th scope="col" className="px-5 py-3">Activity</th>
                <th scope="col" className="hidden px-5 py-3 sm:table-cell">Type</th>
                <th scope="col" className="px-5 py-3 text-right">Takes about</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {DEFAULT_ACTIVITIES.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 font-medium">
                    <span aria-hidden>{a.emoji}</span> {a.title}
                  </td>
                  <td className="hidden px-5 py-3 capitalize text-stone-500 sm:table-cell">{a.category}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap tabular-nums text-stone-500">
                    {a.durationSec < 60 ? `${a.durationSec} sec` : `${Math.round(a.durationSec / 60)} min`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Roadmap" title="Coming next">
        <ul className="grid gap-5 md:grid-cols-3">
          {roadmap.map((r) => (
            <li
              key={r.title}
              className="rounded-3xl border border-dashed border-stone-300 p-6 dark:border-stone-700"
            >
              <h3 className="font-bold">{r.title}</h3>
              <p className="mt-2 text-stone-600 dark:text-stone-300">{r.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </>
  );
}
