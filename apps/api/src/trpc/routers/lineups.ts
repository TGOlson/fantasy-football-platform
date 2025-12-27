import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import {
  weeklyLineups,
  players,
  playerSeasons,
  eq,
  and,
} from '@fantasy-platform/database/schema';

export const lineupsRouter = router({
  // Get lineup for a franchise for a specific week
  getByFranchiseWeek: protectedProcedure
    .input(
      z.object({
        franchiseId: z.string(),
        weekNumber: z.number().int().min(1).max(18),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get the franchise
      const franchise = await db.query.franchises.findFirst({
        where: (franchises, { eq }) => eq(franchises.id, input.franchiseId),
      });

      if (!franchise) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Franchise not found',
        });
      }

      const leagueSeason = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { and, eq }) =>
          and(
            eq(leagueSeasons.leagueId, franchise.leagueId),
            eq(leagueSeasons.year, input.season)
          ),
      });

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      const teamData = await db.query.teams.findFirst({
        where: (teams, { and, eq }) =>
          and(
            eq(teams.franchiseId, franchise.id),
            eq(teams.leagueSeasonId, leagueSeason.id)
          ),
      });

      if (!teamData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Get lineup with player details
      const lineup = await db
        .select({
          id: weeklyLineups.id,
          rosterSlotIndex: weeklyLineups.rosterSlotIndex,
          weekNumber: weeklyLineups.weekNumber,
          pointsScored: weeklyLineups.pointsScored,
          playerId: players.id,
          playerName: players.name,
          playerNflId: players.nflId,
          position: playerSeasons.position,
          nflTeam: playerSeasons.nflTeam,
          status: playerSeasons.status,
        })
        .from(weeklyLineups)
        .innerJoin(players, eq(weeklyLineups.playerId, players.id))
        .leftJoin(
          playerSeasons,
          and(
            eq(players.id, playerSeasons.playerId),
            eq(playerSeasons.season, input.season || 2024)
          )
        )
        .where(
          and(
            eq(weeklyLineups.teamId, teamData.id),
            eq(weeklyLineups.weekNumber, input.weekNumber)
          )
        );

      return lineup;
    }),
});
