import { DEFAULT_ACTIVITIES } from "@laziless/core";
import Link from "next/link";

import {
  Card,
  CtaBand,
  FaqList,
  Section,
  TaskCardMock,
  Testimonials,
} from "~/app/_components/marketing/blocks";
import { features, howItWorks, principles, site } from "~/content/site";
import { JsonLd, softwareAppLd } from "~/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={softwareAppLd} />

      {/* Hero */}
      <section className="page-x grid items-center gap-12 overflow-x-clip pt-10 sm:pt-20 lg:grid-cols-[55%_minmax(0,1fr)] lg:gap-[5%]">
        <div>
          <p className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Free · No sign-up · Works in your browser
          </p>
          <h1 className="text-display mt-6 font-extrabold">
            Beat laziness with <span className="text-emerald-600">tiny tasks</span>, one nudge at a
            time.
          </h1>
          <p className="mt-6 text-lg text-stone-600 lg:w-[85%] lg:text-xl dark:text-stone-300">
            {site.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="rounded-2xl bg-emerald-600 px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Try it free →
            </Link>
            <Link
              href="/features"
              className="rounded-2xl border border-stone-300 px-6 py-3.5 text-lg font-semibold transition hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-900"
            >
              See features
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-500">📱 iOS and Android app coming soon.</p>
        </div>
        <TaskCardMock />
      </section>

      {/* Definition block, phrased the way people ask (good for answer engines). */}
      <Section eyebrow="What is Laziless?" title="A habit app for people who hate habit apps" split>
        <div className="grid gap-6 text-lg text-stone-600 md:grid-cols-2 dark:text-stone-300">
          <p>
            Most habit apps ask you to commit to big goals. Laziless does the opposite: it asks
            for something so small you can do it right now, like a glass of water, a stretch or a
            flight of stairs, and then asks again a little later.
          </p>
          <p>
            Those tiny actions take 30 seconds to 2 minutes each. Over a day they add up to more
            water, more movement and fewer hours stuck in one position, without needing
            motivation or willpower.
          </p>
        </div>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="Three steps, zero willpower">
        <ol className="grid gap-5 md:grid-cols-3">
          {howItWorks.map((s, i) => (
            <li
              key={s.title}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <p className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-2xl" aria-hidden>
                  {s.emoji}
                </span>
              </p>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-stone-600 dark:text-stone-300">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow="Tiny tasks"
        title="Small enough to say yes to"
        intro="A random one each time. Turn any of them off, or add your own."
      >
        <ul className="flex flex-wrap gap-3">
          {DEFAULT_ACTIVITIES.map((a) => (
            <li
              key={a.id}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <span aria-hidden>{a.emoji}</span> {a.title}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Features" title="Everything you need, nothing that nags">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} {...f} />
          ))}
        </div>
        <Link href="/features" className="mt-8 inline-block font-semibold text-emerald-600 hover:underline">
          Explore all features →
        </Link>
      </Section>

      <Section eyebrow="Why it works" title="Why tiny tasks beat big goals">
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title} className="border-l-4 border-emerald-500 pl-5">
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-stone-600 dark:text-stone-300">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Testimonials />

      <Section eyebrow="FAQ" title="Questions people ask" split>
        <FaqList limit={5} />
        <Link href="/faq" className="mt-6 inline-block font-semibold text-emerald-600 hover:underline">
          See all questions →
        </Link>
      </Section>

      <CtaBand />
    </>
  );
}
