import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { feedback } from "~/server/db/schema";
import { enforceRateLimit, honeypot } from "~/server/spam-guard";

export const feedbackRouter = createTRPCRouter({
  /** Store a feedback message. The email is optional and only used to reply. */
  send: publicProcedure
    .input(
      z.object({
        message: z.string().trim().min(3).max(2000),
        email: z.string().trim().toLowerCase().email().max(320).optional(),
        page: z.enum(["demo"]),
        website: honeypot,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.website) return { ok: true as const };
      enforceRateLimit(ctx.headers, "feedback", 10);

      await ctx.db.insert(feedback).values({
        message: input.message,
        email: input.email ?? null,
        page: input.page,
      });

      return { ok: true as const };
    }),
});
