import { CtaBand, Section } from "~/app/_components/marketing/blocks";
import { principles, site } from "~/content/site";
import { JsonLd, breadcrumbLd, pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Why Laziless exists: big goals are easy to postpone, tiny tasks are easy to start. Learn the idea and principles behind the tiny-task habit app.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />

      <article className="page-x grid gap-10 pt-16 lg:grid-cols-[45%_minmax(0,1fr)] lg:gap-[5%]">
        <div>
          <p className="text-sm font-bold tracking-wide text-emerald-600 uppercase">About</p>
          <h1 className="text-title mt-3 font-extrabold">
            Laziness isn&apos;t a character flaw. Big tasks are just hard to start.
          </h1>
        </div>

        <div className="space-y-5 text-lg leading-relaxed text-stone-700 lg:pt-8 dark:text-stone-300">
          <p>
            We all know we should drink more water, move more and take breaks from the screen.
            The problem isn&apos;t knowing. It&apos;s that “go to the gym” or “drink two litres
            today” feel like a lot, so we put them off, and then feel bad about it.
          </p>
          <p>
            {site.name} started from a simple idea: make every action so small that saying no
            feels sillier than just doing it. One glass of water. Ten squats. Five deep breaths.
            Then, a little later, another one.
          </p>
          <p>
            No plans to follow, no hour-long workouts, no guilt. Just a steady rhythm of tiny wins
            that quietly add up over the day.
          </p>
        </div>
      </article>

      <Section eyebrow="Our principles" title="What we believe">
        <div className="grid gap-5 md:grid-cols-3">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-stone-600 dark:text-stone-300">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="What's next" title="From the browser to your pocket" split>
        <p className="text-lg text-stone-600 dark:text-stone-300">
          The web version is where you can try {site.name} today. We&apos;re building iOS and
          Android apps next, so reminders can reach you even when your browser is closed.
        </p>
      </Section>

      <CtaBand title="Try the idea for yourself" />
    </>
  );
}
