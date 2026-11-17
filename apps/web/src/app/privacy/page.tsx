import Link from "next/link";

import { site } from "~/content/site";
import { JsonLd, breadcrumbLd, pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "How Laziless handles your data: your tasks and history stay on your device. We only store what you choose to send us, like a waitlist email or feedback.",
  path: "/privacy",
});

/** Update this whenever the policy changes. */
const LAST_UPDATED = "November 16, 2026";

function Contact() {
  if (site.contactEmail) {
    return (
      <a href={`mailto:${site.contactEmail}`} className="font-semibold text-emerald-600 hover:underline">
        {site.contactEmail}
      </a>
    );
  }
  return (
    <>
      the feedback form on the{" "}
      <Link href="/demo" className="font-semibold text-emerald-600 hover:underline">
        demo page
      </Link>{" "}
      (add your email so we can reply)
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])} />

      <article className="page-x pt-16">
        <p className="text-sm font-bold tracking-wide text-emerald-600 uppercase">Privacy</p>
        <h1 className="text-title mt-3 font-extrabold">Privacy policy</h1>
        <p className="mt-4 text-stone-500 dark:text-stone-400">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 text-lg leading-relaxed text-stone-700 lg:w-[65%] dark:text-stone-300">
          <p className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            <strong>The short version:</strong> {site.name} keeps your tasks, settings and history on
            your own device. We only store something on our servers when you choose to send it to
            us: your email for the app waitlist, or a feedback message. We don&apos;t show ads,
            don&apos;t sell data and don&apos;t use cookies.
          </p>

          <Block title="Data that stays on your device">
            <p>
              Your settings, your activities (including ones you add) and your history of done and
              skipped tasks are saved in your browser&apos;s local storage. They never leave your
              device and we can&apos;t see them. Clearing this site&apos;s data in your browser
              deletes them.
            </p>
          </Block>

          <Block title="Data you choose to send us">
            <ul className="list-disc space-y-3 pl-6">
              <li>
                <strong>App waitlist:</strong> your email address, the page you signed up on and
                the time. We use it only to tell you when the mobile app launches.
              </li>
              <li>
                <strong>Feedback:</strong> your message, the page you sent it from, the time and,
                if you add it, your email address. We use it to improve {site.name}, and your
                email only to reply to you.
              </li>
            </ul>
          </Block>

          <Block title="Where it's stored">
            <p>
              This data is stored in a database hosted by Supabase. The website is hosted by
              Vercel. Like most websites, our hosting provider may keep short-lived technical logs,
              such as IP addresses, to run the site and protect it from abuse.
            </p>
            <p>
              To stop spam, our forms briefly check how often your network has submitted them.
              This uses your IP address in memory only; we don&apos;t store it.
            </p>
          </Block>

          <Block title="What we don't do">
            <ul className="list-disc space-y-3 pl-6">
              <li>No ads, and no selling or sharing your data with anyone for marketing.</li>
              <li>No cookies and no tracking across other websites.</li>
              <li>No account is needed to use {site.name}.</li>
            </ul>
          </Block>

          <Block title="How long we keep it">
            <p>
              Waitlist emails are kept until we&apos;ve sent the launch announcement, or until you
              ask us to remove yours. Feedback is kept as long as it helps us improve{" "}
              {site.name}, and no longer than two years.
            </p>
          </Block>

          <Block title="Your choices">
            <p>
              You can ask us to show you, correct or delete anything we hold about you. Contact us
              through <Contact />.
            </p>
          </Block>

          <Block title="Children">
            <p>
              {site.name} isn&apos;t directed at children under 13, and we don&apos;t knowingly
              collect their data.
            </p>
          </Block>

          <Block title="Changes">
            <p>
              If we change this policy, we&apos;ll update the date at the top of this page. If we
              start collecting new kinds of data, for example when optional accounts arrive, we&apos;ll
              say so here before it happens.
            </p>
          </Block>
        </div>
      </article>
    </>
  );
}
