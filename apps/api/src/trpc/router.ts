import { router } from './trpc';
import { authRouter } from './routers/auth';
import { leaguesRouter } from './routers/leagues';
import { teamsRouter } from './routers/teams';
import { playersRouter } from './routers/players';
import { lineupsRouter } from './routers/lineups';
import { matchupsRouter } from './routers/matchups';
import { scoringRouter } from './routers/scoring';

// Root app router - combines all sub-routers
export const appRouter = router({
  auth: authRouter,
  leagues: leaguesRouter,
  teams: teamsRouter,
  players: playersRouter,
  lineups: lineupsRouter,
  matchups: matchupsRouter,
  scoring: scoringRouter,
});

// Export type definition of API for frontend
export type AppRouter = typeof appRouter;
