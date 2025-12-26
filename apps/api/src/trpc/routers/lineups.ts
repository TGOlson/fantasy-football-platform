import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  weeklyLineups,
  teams,
  players,
  playerSeasons,
  eq,
  and,
} from '@fantasy-platform/database/schema';

export const lineupsRouter = router({
  // Get lineup for a franchise for a specific week
  getByFranchiseWeek: publicProcedure
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

  // Update player slot for a specific week (protected)
  updateSlot: protectedProcedure
    .input(
      z.object({
        lineupId: z.string(),
        rosterSlotIndex: z.number().int().min(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get lineup entry with franchise info
      const [lineupEntry] = await db
        .select({
          id: weeklyLineups.id,
          teamId: weeklyLineups.teamId,
          ownerId: teams.ownerId,
        })
        .from(weeklyLineups)
        .innerJoin(teams, eq(weeklyLineups.teamId, teams.id))
        .where(eq(weeklyLineups.id, input.lineupId))
        .limit(1);

      if (!lineupEntry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lineup entry not found',
        });
      }

      // Verify ownership
      if (lineupEntry.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this franchise',
        });
      }

      // Update roster slot index
      const [updated] = await db
        .update(weeklyLineups)
        .set({
          rosterSlotIndex: input.rosterSlotIndex,
          updatedAt: new Date(),
        })
        .where(eq(weeklyLineups.id, input.lineupId))
        .returning();

      return updated;
    }),

  // Add player to lineup for a specific week (protected)
  addPlayer: protectedProcedure
    .input(
      z.object({
        franchiseId: z.string(),
        playerId: z.string(),
        weekNumber: z.number().int().min(1).max(18),
        rosterSlotIndex: z.number().int().min(0),
        season: z.number().int().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      // Get team
      const leagueSeason = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { and, eq }) =>
          and(
            eq(leagueSeasons.leagueId, franchise.leagueId),
            eq(leagueSeasons.year, input.season || 2024)
          ),
      });

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      const team = await db.query.teams.findFirst({
        where: (teams, { and, eq }) =>
          and(
            eq(teams.franchiseId, franchise.id),
            eq(teams.leagueSeasonId, leagueSeason.id)
          ),
      });

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Verify ownership
      if (team.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this franchise',
        });
      }

      // Check if player already in lineup for this week
      const existing = await db.query.weeklyLineups.findFirst({
        where: (weeklyLineups, { and, eq }) =>
          and(
            eq(weeklyLineups.teamId, team.id),
            eq(weeklyLineups.weekNumber, input.weekNumber),
            eq(weeklyLineups.playerId, input.playerId)
          ),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Player already in lineup for this week',
        });
      }

      // Add player to lineup
      const [newEntry] = await db
        .insert(weeklyLineups)
        .values({
          teamId: team.id,
          weekNumber: input.weekNumber,
          playerId: input.playerId,
          rosterSlotIndex: input.rosterSlotIndex,
        })
        .returning();

      return newEntry;
    }),

  // Remove player from lineup (protected)
  removePlayer: protectedProcedure
    .input(
      z.object({
        lineupId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get lineup entry with franchise info
      const [lineupEntry] = await db
        .select({
          id: weeklyLineups.id,
          ownerId: teams.ownerId,
        })
        .from(weeklyLineups)
        .innerJoin(teams, eq(weeklyLineups.teamId, teams.id))
        .where(eq(weeklyLineups.id, input.lineupId))
        .limit(1);

      if (!lineupEntry) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lineup entry not found',
        });
      }

      // Verify ownership
      if (lineupEntry.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this franchise',
        });
      }

      // Remove from lineup
      await db
        .delete(weeklyLineups)
        .where(eq(weeklyLineups.id, input.lineupId));

      return { success: true };
    }),
});
