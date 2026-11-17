import { type Config } from "drizzle-kit";

import { env } from "~/env";

/**
 * Migrations run from your machine with the DATABASE_URL in your local .env,
 * which should be the Supabase *direct* (or session pooler) connection string.
 * The transaction pooler used in production doesn't suit migrations.
 *
 *   pnpm db:generate   # write a new SQL migration from schema.ts (commit it)
 *   pnpm db:migrate    # apply pending migrations to the database
 */
export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["laziless_*"],
} satisfies Config;
