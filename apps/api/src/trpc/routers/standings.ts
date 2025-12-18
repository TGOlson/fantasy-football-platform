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
    .query(async ({ input }) => {
      return getStandings(input.leagueSeasonId);
    }),

  // Recalculate standings from matchup results
  recalculate: publicProcedure
    .input(
      z.object({
        leagueSeasonId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return calculateStandings(input.leagueSeasonId);
    }),
});
