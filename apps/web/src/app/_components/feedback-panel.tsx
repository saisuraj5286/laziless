"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { formErrorMessage } from "~/lib/form-error";
import { api } from "~/trpc/react";

const field =
  "w-full rounded-xl border border-stone-300 bg-transparent px-3 py-2 dark:border-stone-700";

/** Collapsible "Send feedback" form for the demo page. */
export function FeedbackPanel() {
  const id = useId();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const send = api.feedback.send.useMutation({
    onSuccess: () => {
      setMessage("");
      setEmail("");
    },
  });

  return (
    <details className="group rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-bold sm:px-6">
        <span>💬 Send feedback</span>
        <span className="text-stone-400 transition group-open:rotate-180">▾</span>
      </summary>

      <div className="border-t border-stone-200 p-5 sm:px-6 dark:border-stone-800">
        {send.isSuccess ? (
          <div role="status">
            <p className="font-semibold">Thanks! We read every message.</p>
            <button
              onClick={() => send.reset()}
              className="mt-2 text-sm font-semibold text-emerald-600 hover:underline"
            >
              Send another
            </button>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              send.mutate({ message, email: email.trim() || undefined, page: "demo", website });
            }}
          >
            <label htmlFor={`${id}-message`} className="block text-sm text-stone-500 dark:text-stone-400">
              What&apos;s working, what&apos;s annoying, what&apos;s missing?
            </label>
            <textarea
              id={`${id}-message`}
              required
              minLength={3}
              maxLength={2000}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={field}
            />
            <label htmlFor={`${id}-email`} className="sr-only">
              Email (optional)
            </label>
            <input
              id={`${id}-email`}
              type="email"
              maxLength={320}
              autoComplete="email"
              placeholder="Email (optional, if you'd like a reply)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />

            {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
            <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>
            </div>

            {send.error && (
              <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
                {formErrorMessage(send.error, "Please write at least a few words, and check the email address.")}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Saved on our server.{" "}
                <Link href="/privacy" className="underline hover:text-emerald-600">
                  Privacy
                </Link>
              </p>
              <button
                type="submit"
                disabled={send.isPending || message.trim().length < 3}
                className="rounded-xl bg-stone-900 px-4 py-2 font-semibold text-white disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900"
              >
                {send.isPending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </details>
  );
}
