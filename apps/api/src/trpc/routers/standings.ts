import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getStandings, calculateStandings } from '../../services/standings';

export const standingsRouter = router({
  // Get standings for a league season
  getByLeagueSeason: publicProcedure
    .input(
      z.object({
        leagueSeasonId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return getStandings(ctx.db, input.leagueSeasonId);
    }),

  // Recalculate standings from matchup results
  recalculate: publicProcedure
    .input(
      z.object({
        leagueSeasonId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return calculateStandings(ctx.db, input.leagueSeasonId);
    }),
});
