import { CtaBand, FaqList } from "~/app/_components/marketing/blocks";
import { JsonLd, breadcrumbLd, faqLd, pageMetadata } from "~/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers about Laziless: what it is, how often it reminds you, which tiny tasks it suggests, whether it's free, privacy, and the upcoming mobile app.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[faqLd, breadcrumbLd([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])]} />

      <div className="page-x grid gap-10 pt-16 lg:grid-cols-[35%_minmax(0,1fr)] lg:gap-[5%]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-sm font-bold tracking-wide text-emerald-600 uppercase">FAQ</p>
          <h1 className="text-title mt-3 font-extrabold">
            Frequently asked questions
          </h1>
          <p className="mt-5 text-lg text-stone-600 dark:text-stone-300">
            Everything you might want to know about Laziless and tiny-task habits.
          </p>
        </div>
        <FaqList />
      </div>

      <CtaBand />
    </>
  );
}
