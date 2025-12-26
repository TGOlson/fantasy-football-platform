import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import {
  requireLeagueSeasonMembership,
  requireLeagueSeasonAdmin,
} from '../../lib/auth';
import { leagueSettings, eq } from '@fantasy-platform/database/schema';
import { calculateScore } from '../../services/scoring-engine';
import type { Position } from '@fantasy-platform/types/player';

export const scoringRouter = router({
  // Calculate score for a single player in a specific week
  calculatePlayerScore: protectedProcedure
    .input(
      z.object({
        playerId: z.string(),
        season: z.number().int(),
        weekNumber: z.number().int().min(1).max(18),
        leagueSeasonId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Verify league membership
      await requireLeagueSeasonMembership(
        db,
        ctx.user.userId,
        input.leagueSeasonId
      );

      // Get player position
      const playerSeason = await db.query.playerSeasons.findFirst({
        where: (playerSeasons, { eq, and }) =>
          and(
            eq(playerSeasons.playerId, input.playerId),
            eq(playerSeasons.season, input.season)
          ),
        columns: {
          position: true,
        },
      });

      if (!playerSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Player not found for this season',
        });
      }

      // Get player weekly stats
      const weeklyStats = await db.query.playerWeeklyStats.findFirst({
        where: (playerWeeklyStats, { eq, and }) =>
          and(
            eq(playerWeeklyStats.playerId, input.playerId),
            eq(playerWeeklyStats.season, input.season),
            eq(playerWeeklyStats.weekNumber, input.weekNumber)
          ),
      });

      if (!weeklyStats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No stats found for this player in this week',
        });
      }

      // Get league scoring rules
      const settings = await db.query.leagueSettings.findFirst({
        where: (leagueSettings, { eq }) =>
          eq(leagueSettings.leagueSeasonId, input.leagueSeasonId),
        columns: {
          scoringRules: true,
        },
      });

      if (!settings || !settings.scoringRules) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League scoring rules not found',
        });
      }

      // Calculate score
      const scoreBreakdown = calculateScore(
        weeklyStats,
        playerSeason.position as Position,
        settings.scoringRules
      );

      return {
        playerId: input.playerId,
        season: input.season,
        weekNumber: input.weekNumber,
        position: playerSeason.position,
        stats: weeklyStats,
        ...scoreBreakdown,
      };
    }),

  // Get scoring rules for a league season
  getScoringRules: protectedProcedure
    .input(
      z.object({
        leagueSeasonId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Verify league membership
      await requireLeagueSeasonMembership(
        db,
        ctx.user.userId,
        input.leagueSeasonId
      );

      const settings = await db.query.leagueSettings.findFirst({
        where: (leagueSettings, { eq }) =>
          eq(leagueSettings.leagueSeasonId, input.leagueSeasonId),
        columns: {
          scoringRules: true,
        },
      });

      if (!settings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League settings not found',
        });
      }

      return settings.scoringRules;
    }),

  // Update scoring rules for a league season (admin only)
  updateScoringRules: protectedProcedure
    .input(
      z.object({
        leagueSeasonId: z.string(),
        scoringRules: z.any(), // We'll use any here since ScoringRules is complex
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      // Verify league admin
      await requireLeagueSeasonAdmin(db, ctx.user.userId, input.leagueSeasonId);

      // Verify league season exists
      const season = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { eq }) =>
          eq(leagueSeasons.id, input.leagueSeasonId),
      });

      if (!season) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      // Update scoring rules
      const [updated] = await db
        .update(leagueSettings)
        .set({
          scoringRules: input.scoringRules,
          updatedAt: new Date(),
        })
        .where(eq(leagueSettings.leagueSeasonId, input.leagueSeasonId))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League settings not found',
        });
      }

      return updated.scoringRules;
    }),
});
