import { router } from './trpc.js';
import { healthRouter } from './routers/health.js';
import { authRouter } from './routers/auth.js';

// Root app router - combines all sub-routers
export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  // More routers will be added in Phase C:
  // leagues: leaguesRouter,
  // teams: teamsRouter,
  // players: playersRouter,
});

// Export type definition of API for frontend
export type AppRouter = typeof appRouter;
