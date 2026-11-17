import { feedbackRouter } from "~/server/api/routers/feedback";
import { healthRouter } from "~/server/api/routers/health";
import { waitlistRouter } from "~/server/api/routers/waitlist";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * The app itself keeps all activity data in the browser. The API only stores
 * what people choose to send: a waitlist email or a feedback message.
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  waitlist: waitlistRouter,
  feedback: feedbackRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter);
