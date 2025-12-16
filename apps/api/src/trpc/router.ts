import { router } from './trpc.js';
import { healthRouter } from './routers/health.js';
import { authRouter } from './routers/auth.js';
import { leaguesRouter } from './routers/leagues.js';
import { teamsRouter } from './routers/teams.js';
import { playersRouter } from './routers/players.js';
import { rostersRouter } from './routers/rosters.js';
import { matchupsRouter } from './routers/matchups.js';
import { scoringRouter } from './routers/scoring.js';

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
