import "server-only";

import {
  DrizzlePostgreSQLAdapter,
  type PostgreSQLSessionTable,
  type PostgreSQLUserTable,
} from "@lucia-auth/adapter-drizzle";
import { Lucia, type Session, type User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

import { env } from "~/env";
import { db } from "~/server/db";
import { sessionTable, userTable } from "~/server/db/schema";

// The casts only drop a type quirk: `.enableRLS()` (see schema.ts) types the
// table without its `enableRLS` method, which the adapter's types still list.
// The adapter only reads the columns, which are unchanged.
const adapter = new DrizzlePostgreSQLAdapter(
  db,
  sessionTable as unknown as PostgreSQLSessionTable,
  userTable as unknown as PostgreSQLUserTable,
);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // Keep the cookie across browser restarts. The session itself still
    // expires on the server (30 days, extended while it's being used).
    expires: false,
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => ({
    username: attributes.username,
    createdAt: attributes.createdAt,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

/** Columns of `userTable` that Lucia hands to `getUserAttributes`. */
interface DatabaseUserAttributes {
  username: string;
  createdAt: Date;
}

export type AuthResult = { user: User; session: Session } | { user: null; session: null };

/**
 * The current user and session, from the session cookie. Cached per request.
 *
 * Use it in pages, server actions and route handlers, not in `layout.tsx`:
 * layouts don't re-render on navigation, so they'd show a stale user.
 */
export const validateRequest = cache(async (): Promise<AuthResult> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return { user: null, session: null };

  const result = await lucia.validateSession(sessionId);
  // Next.js throws if a cookie is set while a page renders. It's allowed in
  // server actions and route handlers, so refreshing works there.
  try {
    if (result.session?.fresh) {
      const cookie = lucia.createSessionCookie(result.session.id);
      cookieStore.set(cookie.name, cookie.value, cookie.attributes);
    }
    if (!result.session) {
      const cookie = lucia.createBlankSessionCookie();
      cookieStore.set(cookie.name, cookie.value, cookie.attributes);
    }
  } catch {
    // Rendering a page: the cookie gets updated on the next action instead.
  }
  return result;
});

/** Starts a new session for the user and sets its cookie. */
export async function startSession(userId: string): Promise<void> {
  const session = await lucia.createSession(userId, {});
  const cookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(cookie.name, cookie.value, cookie.attributes);
}

/** Ends the current session (if any) and clears its cookie. */
export async function endSession(): Promise<void> {
  const { session } = await validateRequest();
  if (session) await lucia.invalidateSession(session.id);
  const cookie = lucia.createBlankSessionCookie();
  (await cookies()).set(cookie.name, cookie.value, cookie.attributes);
}
