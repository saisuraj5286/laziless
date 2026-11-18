import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "~/app/_components/auth-form";
import { validateRequest } from "~/server/auth";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  const { user } = await validateRequest();
  if (user) redirect("/account");

  return (
    <section className="page-x py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-title font-extrabold">Create an account</h1>
        <AuthForm mode="signup" />
        <p className="mt-6 text-stone-600 dark:text-stone-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
