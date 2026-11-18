import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountStats } from "~/app/_components/stats/account-stats";
import { validateRequest } from "~/server/auth";
import { logout } from "~/server/auth/actions";

export const metadata: Metadata = {
  title: "Your stats",
  robots: { index: false, follow: false },
};

const memberSince = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });

/** Signed-in only. Anyone else is sent to the login page. */
export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  return (
    <section className="page-x py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-title font-extrabold">Your stats</h1>
          <p className="mt-3 text-stone-600 dark:text-stone-400">
            Signed in as <strong className="text-stone-900 dark:text-white">{user.username}</strong> ·
            member since {memberSince.format(user.createdAt)}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-2xl border border-stone-300 px-5 py-2.5 font-bold transition hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-900"
          >
            Log out
          </button>
        </form>
      </div>

      <AccountStats />
    </section>
  );
}
