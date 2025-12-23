import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  weeklyLineups,
  franchiseSeasons,
  franchises,
  players,
  playerSeasons,
  leagueSeasons,
  eq,
  and,
  desc,
} from '@fantasy-platform/database/schema';

export const lineupsRouter = router({
  // Get lineup for a franchise for a specific week
  getByFranchiseWeek: publicProcedure
    .input(
      z.object({
        franchiseId: z.string(),
        weekNumber: z.number().int().min(1).max(18),
        season: z.number().int().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get the franchise
      const [franchise] = await db
        .select()
        .from(franchises)
        .where(eq(franchises.id, input.franchiseId))
        .limit(1);

      if (!franchise) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Franchise not found',
        });
      }

      // Get the franchise season
      let franchiseSeasonData;
      if (input.season) {
        const [leagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(
            and(
              eq(leagueSeasons.leagueId, franchise.leagueId),
              eq(leagueSeasons.year, input.season)
            )
          )
          .limit(1);

        if (leagueSeason) {
          [franchiseSeasonData] = await db
            .select()
            .from(franchiseSeasons)
            .where(
              and(
                eq(franchiseSeasons.franchiseId, franchise.id),
                eq(franchiseSeasons.leagueSeasonId, leagueSeason.id)
              )
            )
            .limit(1);
        }
      } else {
        const [recentLeagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(eq(leagueSeasons.leagueId, franchise.leagueId))
          .orderBy(desc(leagueSeasons.year))
          .limit(1);

        if (recentLeagueSeason) {
          [franchiseSeasonData] = await db
            .select()
            .from(franchiseSeasons)
            .where(
              and(
                eq(franchiseSeasons.franchiseId, franchise.id),
                eq(franchiseSeasons.leagueSeasonId, recentLeagueSeason.id)
              )
            )
            .limit(1);
        }
      }

      if (!franchiseSeasonData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Franchise season not found',
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
            eq(weeklyLineups.franchiseSeasonId, franchiseSeasonData.id),
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
          franchiseSeasonId: weeklyLineups.franchiseSeasonId,
          ownerId: franchiseSeasons.ownerId,
        })
        .from(weeklyLineups)
        .innerJoin(
          franchiseSeasons,
          eq(weeklyLineups.franchiseSeasonId, franchiseSeasons.id)
        )
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
      const [franchise] = await db
        .select()
        .from(franchises)
        .where(eq(franchises.id, input.franchiseId))
        .limit(1);

      if (!franchise) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Franchise not found',
        });
      }

      // Get franchise season
      const [leagueSeason] = await db
        .select()
        .from(leagueSeasons)
        .where(
          and(
            eq(leagueSeasons.leagueId, franchise.leagueId),
            eq(leagueSeasons.year, input.season || 2024)
          )
        )
        .limit(1);

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      const [franchiseSeason] = await db
        .select()
        .from(franchiseSeasons)
        .where(
          and(
            eq(franchiseSeasons.franchiseId, franchise.id),
            eq(franchiseSeasons.leagueSeasonId, leagueSeason.id)
          )
        )
        .limit(1);

      if (!franchiseSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Franchise season not found',
        });
      }

      // Verify ownership
      if (franchiseSeason.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this franchise',
        });
      }

      // Check if player already in lineup for this week
      const [existing] = await db
        .select()
        .from(weeklyLineups)
        .where(
          and(
            eq(weeklyLineups.franchiseSeasonId, franchiseSeason.id),
            eq(weeklyLineups.weekNumber, input.weekNumber),
            eq(weeklyLineups.playerId, input.playerId)
          )
        )
        .limit(1);

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
          franchiseSeasonId: franchiseSeason.id,
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
          ownerId: franchiseSeasons.ownerId,
        })
        .from(weeklyLineups)
        .innerJoin(
          franchiseSeasons,
          eq(weeklyLineups.franchiseSeasonId, franchiseSeasons.id)
        )
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
