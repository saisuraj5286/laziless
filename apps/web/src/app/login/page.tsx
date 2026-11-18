import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "~/app/_components/auth-form";
import { validateRequest } from "~/server/auth";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) redirect("/account");

  return (
    <section className="page-x py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-title font-extrabold">Log in</h1>
        <AuthForm mode="login" />
        <p className="mt-6 text-stone-600 dark:text-stone-400">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-emerald-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
