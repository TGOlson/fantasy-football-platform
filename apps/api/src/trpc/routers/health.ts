import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';

// Simple health check router to test tRPC
export const healthRouter = router({
  // Simple query
  check: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  // Query with input
  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => {
      return {
        message: input.message,
        uppercase: input.message.toUpperCase(),
      };
    }),

  // Test database connection
  dbTest: publicProcedure.query(async () => {
    const { getDatabase, users } = await import('@fantasy-platform/database');
    const db = getDatabase();
    const allUsers = await db.select().from(users);

    return {
      status: 'ok',
      userCount: allUsers.length,
    };
  }),
});
