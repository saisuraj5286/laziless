import { pgTableCreator, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Every table is prefixed with `laziless_` (drizzle.config.ts only manages
 * tables with that prefix).
 *
 * Every table also has Row Level Security enabled with no policies. Supabase
 * exposes the `public` schema through its auto-generated REST API; with RLS on
 * and no policies, that API can't read or write these tables. Our server
 * connects as the table owner, so it isn't affected.
 */
export const createTable = pgTableCreator((name) => `laziless_${name}`);

/** People who asked for an email when the mobile app launches. */
export const waitlist = createTable(
  "waitlist",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    /** Stored trimmed and lowercased, so each person is on the list once. */
    email: d.varchar({ length: 320 }).notNull(),
    /** Where they signed up, e.g. "home" or "features". */
    source: d.varchar({ length: 32 }).notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [uniqueIndex("laziless_waitlist_email_idx").on(t.email)],
).enableRLS();

/** Messages sent through the feedback form. */
export const feedback = createTable("feedback", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  message: d.text().notNull(),
  /** Optional: only given by people who want a reply. */
  email: d.varchar({ length: 320 }),
  /** Page the message was sent from, e.g. "demo". */
  page: d.varchar({ length: 32 }).notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
})).enableRLS();
