import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';

export const teamsRouter = router({
  // Get team by ID (simple, no nested entities)
  getById: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const team = await db.query.teams.findFirst({
        where: (teams, { eq }) => eq(teams.id, input.teamId),
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      return team;
    }),

  // Get franchise for a team
  getFranchise: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const team = await db.query.teams.findFirst({
        where: (teams, { eq }) => eq(teams.id, input.teamId),
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      const franchise = await db.query.franchises.findFirst({
        where: (franchises, { eq }) => eq(franchises.id, team.franchiseId),
      });

      if (!franchise) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Franchise not found',
        });
      }

      return franchise;
    }),

  // Get league season for a team
  getLeagueSeason: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const team = await db.query.teams.findFirst({
        where: (teams, { eq }) => eq(teams.id, input.teamId),
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      const leagueSeason = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { eq }) =>
          eq(leagueSeasons.id, team.leagueSeasonId),
      });

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      return leagueSeason;
    }),

  // Get current matchup for a team
  getCurrentMatchup: protectedProcedure
    .input(z.object({ teamId: z.string(), weekNumber: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const team = await db.query.teams.findFirst({
        where: (teams, { eq }) => eq(teams.id, input.teamId),
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      const matchup = await db.query.matchups.findFirst({
        where: (matchups, { and, eq, or }) =>
          and(
            eq(matchups.leagueSeasonId, team.leagueSeasonId),
            eq(matchups.weekNumber, input.weekNumber),
            or(
              eq(matchups.homeTeamId, input.teamId),
              eq(matchups.awayTeamId, input.teamId)
            )
          ),
      });

      return matchup || null;
    }),
});
