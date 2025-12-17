import { router } from './trpc';
import { healthRouter } from './routers/health';
import { authRouter } from './routers/auth';
import { leaguesRouter } from './routers/leagues';
import { teamsRouter } from './routers/teams';
import { playersRouter } from './routers/players';
import { rostersRouter } from './routers/rosters';
import { matchupsRouter } from './routers/matchups';
import { scoringRouter } from './routers/scoring';

// Root app router - combines all sub-routers
export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  leagues: leaguesRouter,
  teams: teamsRouter,
  players: playersRouter,
  rosters: rostersRouter,
  matchups: matchupsRouter,
  scoring: scoringRouter,
});

// Export type definition of API for frontend
export type AppRouter = typeof appRouter;
