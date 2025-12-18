import { router } from './trpc';
import { healthRouter } from './routers/health';
import { authRouter } from './routers/auth';
import { leaguesRouter } from './routers/leagues';
import { franchisesRouter } from './routers/franchises';
import { playersRouter } from './routers/players';
import { lineupsRouter } from './routers/lineups';
import { matchupsRouter } from './routers/matchups';
import { scoringRouter } from './routers/scoring';
import { standingsRouter } from './routers/standings';

// Root app router - combines all sub-routers
export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  leagues: leaguesRouter,
  franchises: franchisesRouter,
  players: playersRouter,
  lineups: lineupsRouter,
  matchups: matchupsRouter,
  scoring: scoringRouter,
  standings: standingsRouter,
});

// Export type definition of API for frontend
export type AppRouter = typeof appRouter;
