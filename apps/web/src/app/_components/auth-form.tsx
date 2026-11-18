"use client";

import { useActionState, useId } from "react";

import { type AuthFormState, login, signup } from "~/server/auth/actions";

const initialState: AuthFormState = { error: null, username: "" };

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-lg dark:border-stone-700 dark:bg-stone-900";

/** Username + password form for the login and signup pages. */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const id = useId();
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState(isSignup ? signup : login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor={`${id}-username`} className="block font-semibold">
          Username
        </label>
        <input
          id={`${id}-username`}
          name="username"
          required
          minLength={isSignup ? 3 : undefined}
          maxLength={31}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.username}
          aria-describedby={isSignup ? `${id}-username-hint` : undefined}
          className={`mt-2 ${inputClass}`}
        />
        {isSignup && (
          <p id={`${id}-username-hint`} className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            3–31 characters: letters, numbers, - and _.
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-password`} className="block font-semibold">
          Password
        </label>
        <input
          id={`${id}-password`}
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          maxLength={255}
          autoComplete={isSignup ? "new-password" : "current-password"}
          aria-describedby={isSignup ? `${id}-password-hint` : undefined}
          className={`mt-2 ${inputClass}`}
        />
        {isSignup && (
          <p id={`${id}-password-hint`} className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            At least 8 characters.
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-emerald-600 px-6 py-3.5 text-lg font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {isSignup ? (pending ? "Creating account…" : "Create account") : pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
