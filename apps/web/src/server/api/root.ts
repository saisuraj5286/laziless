import { healthRouter } from "~/server/api/routers/health";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * The first version of Laziless keeps all data in the browser, so the API only
 * has a health check. Add routers here (e.g. account sync for web + mobile).
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter);
