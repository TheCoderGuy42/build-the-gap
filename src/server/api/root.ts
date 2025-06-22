import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { pdfRouter } from "./routers/pdf";
import { s3Router } from "./routers/s3-router";
import { htmlRouter } from "./routers/html";
import { quizRouter } from "./routers/quiz";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  pdf: pdfRouter,
  html: htmlRouter,
  s3: s3Router,
  quiz: quizRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
