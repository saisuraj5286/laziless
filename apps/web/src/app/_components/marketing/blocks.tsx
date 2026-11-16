import Link from "next/link";

import { faqs, visibleTestimonials } from "~/content/site";

/**
 * Full-width section. By default the heading sits above the content; with
 * `split`, large screens put the heading on the left (35%) and content on the
 * right (the remaining width).
 */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  split = false,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  split?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`page-x mt-24 scroll-mt-28 lg:mt-32 ${
        split ? "grid gap-10 lg:grid-cols-[35%_minmax(0,1fr)] lg:gap-[5%]" : ""
      }`}
    >
      <div className={split ? "" : "lg:w-[60%]"}>
        {eyebrow && (
          <p className="text-sm font-bold tracking-wide text-emerald-600 uppercase">{eyebrow}</p>
        )}
        <h2 className="text-heading mt-3 font-extrabold">{title}</h2>
        {intro && <p className="mt-5 text-lg text-stone-600 lg:text-xl dark:text-stone-300">{intro}</p>}
      </div>
      <div className={split ? "" : "mt-10"}>{children}</div>
    </section>
  );
}

export function Card({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className="text-3xl" aria-hidden>
        {emoji}
      </p>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-stone-600 dark:text-stone-300">{body}</p>
    </div>
  );
}

/** A static picture of the in-app task prompt, for the hero. */
export function TaskCardMock() {
  return (
    <div aria-hidden className="relative mx-auto w-full sm:w-[75%] lg:w-[80%]">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-emerald-400/20 blur-2xl" />
      <div className="rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-2xl shadow-emerald-600/30">
        <p className="text-xs font-semibold tracking-wide text-emerald-50/90 uppercase">
          Time for a tiny task
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-5xl leading-none">💧</span>
          <div>
            <p className="text-xl font-bold">Drink a glass of water</p>
            <p className="text-sm text-emerald-50/90">~30 sec</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <span className="flex-1 rounded-xl bg-white px-4 py-2.5 text-center font-bold text-emerald-700">
            Done ✅
          </span>
          <span className="rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold">Snooze</span>
          <span className="rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-50/90">Skip</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          ["✅", "8", "Done today"],
          ["⏱️", "24:10", "Next task"],
          ["🔥", "5", "Day streak"],
        ].map(([e, v, l]) => (
          <div
            key={l}
            className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
          >
            <p className="font-bold tabular-nums">
              {e} {v}
            </p>
            <p className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Accessible, no-JS accordion. Answers are in the HTML, so crawlers see them. */
export function FaqList({ limit }: { limit?: number }) {
  const items = limit ? faqs.slice(0, limit) : faqs;
  return (
    <div className="divide-y divide-stone-200 rounded-3xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
      {items.map((f) => (
        <details key={f.q} className="group p-5 sm:px-6">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold">
            <h3>{f.q}</h3>
            <span className="text-stone-400 transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 text-stone-600 dark:text-stone-300">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Renders nothing in production until real testimonials are added. */
export function Testimonials() {
  const items = visibleTestimonials();
  if (items.length === 0) return null;
  return (
    <Section eyebrow="Testimonials" title="What early users say">
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <figure
            key={i}
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            {t.placeholder && (
              <span className="mb-3 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                Placeholder (dev only)
              </span>
            )}
            <blockquote className="text-stone-700 dark:text-stone-200">“{t.quote}”</blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-bold">{t.name}</span>
              {t.role && <span className="text-stone-500"> · {t.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function CtaBand({
  title = "Ready to be a little less lazy?",
  body = "Try Laziless in your browser right now. No sign-up, nothing to install.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="page-x mt-24">
      <div className="rounded-4xl bg-stone-900 px-[5%] py-14 text-center text-white sm:py-20 dark:bg-stone-100 dark:text-stone-900">
        <h2 className="text-heading font-extrabold">{title}</h2>
        <p className="mx-auto mt-4 text-lg text-stone-300 lg:w-1/2 dark:text-stone-600">{body}</p>
        <Link
          href="/demo"
          className="mt-8 inline-block w-full rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-emerald-400 sm:w-auto sm:px-10"
        >
          Start your first tiny task →
        </Link>
      </div>
    </section>
  );
}
