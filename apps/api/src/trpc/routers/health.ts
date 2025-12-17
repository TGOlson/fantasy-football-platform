import { router, publicProcedure } from '../trpc';

// Simple health check router to test tRPC
export const healthRouter = router({
  // Simple query
  check: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),
});
