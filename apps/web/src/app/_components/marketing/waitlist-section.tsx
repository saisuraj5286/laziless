import { Section } from "~/app/_components/marketing/blocks";
import { WaitlistForm } from "~/app/_components/marketing/waitlist-form";
import { type RouterInputs } from "~/trpc/react";

/**
 * Mobile-app waitlist. Has id="app" so other links can jump to it. Kept out of
 * blocks.tsx so pages without the form don't ship its client code.
 */
export function WaitlistSection({ source }: { source: RouterInputs["waitlist"]["join"]["source"] }) {
  return (
    <Section id="app" eyebrow="Mobile app" title="Get the app the day it launches" split>
      <p className="text-lg text-stone-600 dark:text-stone-300">
        Laziless is coming to iOS and Android, with reminders that reach you even when your phone
        is locked. Leave your email and we&apos;ll send you one message when it&apos;s out.
      </p>
      <div className="mt-6">
        <WaitlistForm source={source} />
      </div>
    </Section>
  );
}
