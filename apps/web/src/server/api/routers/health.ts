import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const healthRouter = createTRPCRouter({
  /** Cheap liveness check for the API (no database access). */
  ping: publicProcedure.query(() => ({ ok: true, at: new Date() })),
});
