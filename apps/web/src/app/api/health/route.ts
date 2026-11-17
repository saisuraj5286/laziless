import { sql } from "drizzle-orm";

import { db } from "~/server/db";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

/**
 * Health check that also touches the database. A daily Vercel Cron calls it
 * (see vercel.json), which keeps a free Supabase project from pausing after a
 * week without activity. Uptime monitors can use it too.
 */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "up" }, { headers: noStore });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503, headers: noStore });
  }
}
