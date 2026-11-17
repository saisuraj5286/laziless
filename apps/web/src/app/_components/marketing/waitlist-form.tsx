"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { formErrorMessage } from "~/lib/form-error";
import { api, type RouterInputs } from "~/trpc/react";

/** Email sign-up for the mobile-app launch. */
export function WaitlistForm({ source }: { source: RouterInputs["waitlist"]["join"]["source"] }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const join = api.waitlist.join.useMutation();

  if (join.isSuccess) {
    return (
      <p
        role="status"
        className="rounded-2xl bg-emerald-50 px-5 py-4 text-lg font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
      >
        🎉 You&apos;re on the list. We&apos;ll email you once, when the app is out.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        join.mutate({ email, source, website });
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          required
          maxLength={320}
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-lg dark:border-stone-700 dark:bg-stone-900"
        />
        <button
          type="submit"
          disabled={join.isPending}
          className="rounded-2xl bg-emerald-600 px-6 py-3.5 text-lg font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {join.isPending ? "Adding…" : "Notify me"}
        </button>
      </div>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {join.error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
          {formErrorMessage(join.error, "Please enter a valid email address.")}
        </p>
      )}
      <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
        One email when the app launches. No spam.{" "}
        <Link href="/privacy" className="underline hover:text-emerald-600">
          Privacy policy
        </Link>
      </p>
    </form>
  );
}
