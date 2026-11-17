import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { waitlist } from "~/server/db/schema";
import { enforceRateLimit, honeypot } from "~/server/spam-guard";

const WAITLIST_SOURCES = ["home", "features"] as const;

export const waitlistRouter = createTRPCRouter({
  /**
   * Add an email to the mobile-app waitlist. Signing up twice is fine and
   * returns the same answer, so the form never reveals who is already listed.
   */
  join: publicProcedure
    .input(
      z.object({
        email: z.string().trim().toLowerCase().email().max(320),
        source: z.enum(WAITLIST_SOURCES),
        website: honeypot,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.website) return { ok: true as const };
      enforceRateLimit(ctx.headers, "waitlist", 5);

      await ctx.db
        .insert(waitlist)
        .values({ email: input.email, source: input.source })
        .onConflictDoNothing({ target: waitlist.email });

      return { ok: true as const };
    }),
});
