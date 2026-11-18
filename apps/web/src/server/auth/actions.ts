"use server";

import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { endSession, startSession } from "~/server/auth";
import { hashPassword, verifyPassword } from "~/server/auth/password";
import { db } from "~/server/db";
import { userTable } from "~/server/db/schema";
import { TOO_MANY_TRIES, isRateLimited } from "~/server/spam-guard";

/** What the login and signup forms show after a failed attempt. */
export type AuthFormState = {
  error: string | null;
  /** Echoed back so the form keeps what was typed. */
  username: string;
};

/** Where people land after logging in or signing up. */
const AFTER_LOGIN = "/account";

const WRONG_CREDENTIALS = "Incorrect username or password.";

const signupInput = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9_-]{3,31}$/,
      "Usernames are 3–31 characters: letters, numbers, - and _.",
    ),
  password: z
    .string()
    .min(8, "Passwords need at least 8 characters.")
    .max(255, "Passwords can be at most 255 characters."),
});

const loginInput = z.object({
  username: z.string().trim().toLowerCase().min(1).max(31),
  password: z.string().min(1).max(255),
});

function readForm(formData: FormData) {
  return {
    username: formData.get("username"),
    password: formData.get("password"),
  };
}

function typedUsername(formData: FormData): string {
  const value = formData.get("username");
  return typeof value === "string" ? value.slice(0, 31) : "";
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = typedUsername(formData);
  const parsed = signupInput.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your username and password.", username };
  }
  if (isRateLimited(await headers(), "signup", 10)) {
    return { error: TOO_MANY_TRIES, username };
  }

  const userId = generateIdFromEntropySize(10); // 16 characters
  const passwordHash = await hashPassword(parsed.data.password);

  // The unique index on username makes this safe even if two people sign up
  // with the same name at the same moment.
  const created = await db
    .insert(userTable)
    .values({ id: userId, username: parsed.data.username, passwordHash })
    .onConflictDoNothing({ target: userTable.username })
    .returning({ id: userTable.id });
  if (created.length === 0) {
    return { error: "That username is taken. Try another one.", username };
  }

  await startSession(userId);
  redirect(AFTER_LOGIN);
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = typedUsername(formData);
  const parsed = loginInput.safeParse(readForm(formData));
  if (!parsed.success) return { error: WRONG_CREDENTIALS, username };
  if (isRateLimited(await headers(), "login", 20)) {
    return { error: TOO_MANY_TRIES, username };
  }

  const [user] = await db
    .select({ id: userTable.id, passwordHash: userTable.passwordHash })
    .from(userTable)
    .where(eq(userTable.username, parsed.data.username))
    .limit(1);

  // Unknown usernames return faster than wrong passwords, which can reveal
  // which usernames exist. Signup reveals that anyway, so the real defence
  // against password guessing is the rate limit above.
  if (!user || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
    return { error: WRONG_CREDENTIALS, username };
  }

  await startSession(user.id);
  redirect(AFTER_LOGIN);
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}
