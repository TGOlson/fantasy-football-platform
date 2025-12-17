import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc.js';
import { requireLeagueMembership, requireLeagueAdmin } from '../../lib/auth.js';
import {
  getDatabase,
  playerSeasons,
  playerWeeklyStats,
  leagueSettings,
  leagueSeasons,
  eq,
  and,
} from '@fantasy-platform/database';
import { calculateScore } from '../../services/scoring-engine.js';
import type { Position } from '@fantasy-platform/types';

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
      const db = getDatabase();

      // Verify league membership
      await requireLeagueMembership(ctx.user.userId, {
        leagueSeasonId: input.leagueSeasonId,
      });

      // Get player position
      const [playerSeason] = await db
        .select({
          position: playerSeasons.position,
        })
        .from(playerSeasons)
        .where(
          and(
            eq(playerSeasons.playerId, input.playerId),
            eq(playerSeasons.season, input.season)
          )
        )
        .limit(1);

      if (!playerSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Player not found for this season',
        });
      }

      // Get player weekly stats
      const [weeklyStats] = await db
        .select()
        .from(playerWeeklyStats)
        .where(
          and(
            eq(playerWeeklyStats.playerId, input.playerId),
            eq(playerWeeklyStats.season, input.season),
            eq(playerWeeklyStats.weekNumber, input.weekNumber)
          )
        )
        .limit(1);

      if (!weeklyStats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No stats found for this player in this week',
        });
      }

      // Get league scoring rules
      const [settings] = await db
        .select({
          scoringRules: leagueSettings.scoringRules,
        })
        .from(leagueSettings)
        .where(eq(leagueSettings.leagueSeasonId, input.leagueSeasonId))
        .limit(1);

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
      const db = getDatabase();

      // Verify league membership
      await requireLeagueMembership(ctx.user.userId, {
        leagueSeasonId: input.leagueSeasonId,
      });

      const [settings] = await db
        .select({
          scoringRules: leagueSettings.scoringRules,
        })
        .from(leagueSettings)
        .where(eq(leagueSettings.leagueSeasonId, input.leagueSeasonId))
        .limit(1);

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
      const db = getDatabase();

      // Verify league admin
      await requireLeagueAdmin(ctx.user.userId, {
        leagueSeasonId: input.leagueSeasonId,
      });

      // Verify league season exists
      const [season] = await db
        .select()
        .from(leagueSeasons)
        .where(eq(leagueSeasons.id, input.leagueSeasonId))
        .limit(1);

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
