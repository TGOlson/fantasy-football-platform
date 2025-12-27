import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { requireLeagueSeasonAdmin } from '../../lib/auth';
import { leagueSettings, eq } from '@fantasy-platform/database/schema';
import type { ScoringRules } from '@fantasy-platform/types/scoring';

export const scoringRouter = router({
  // Update scoring rules for a league season (admin only)
  updateScoringRules: protectedProcedure
    .input(
      z.object({
        leagueSeasonId: z.string(),
        scoringRules: z.custom<ScoringRules>(), // TODO: validate this type
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
