import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context.js';

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  // User is authenticated, continue with the request
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now TypeScript knows user is not null
    },
  });
});
