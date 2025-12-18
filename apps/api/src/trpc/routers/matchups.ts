import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  getDatabase,
  matchups,
  leagueSeasons,
  leagues,
  franchiseSeasons,
  franchises,
  users,
  eq,
  and,
  desc,
} from '@fantasy-platform/database';

export const matchupsRouter = router({
  // Get matchups for a league/week
  getByLeagueWeek: publicProcedure
    .input(
      z.object({
        leagueId: z.string(),
        weekNumber: z.number().int().min(1).max(18),
        season: z.number().int().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      // Get league season
      let leagueSeason;
      if (input.season) {
        [leagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(
            and(
              eq(leagueSeasons.leagueId, input.leagueId),
              eq(leagueSeasons.year, input.season)
            )
          )
          .limit(1);
      } else {
        [leagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(eq(leagueSeasons.leagueId, input.leagueId))
          .orderBy(desc(leagueSeasons.year))
          .limit(1);
      }

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      // Get matchups for this week
      const weekMatchups = await db
        .select()
        .from(matchups)
        .where(
          and(
            eq(matchups.leagueSeasonId, leagueSeason.id),
            eq(matchups.weekNumber, input.weekNumber)
          )
        );

      // Enhance with franchise details
      const matchupsWithDetails = await Promise.all(
        weekMatchups.map(async (matchup) => {
          // Get home franchise details
          const [homeFranchiseSeason] = await db
            .select()
            .from(franchiseSeasons)
            .where(eq(franchiseSeasons.id, matchup.homeFranchiseSeasonId))
            .limit(1);

          const [homeFranchise] = homeFranchiseSeason
            ? await db
                .select()
                .from(franchises)
                .where(eq(franchises.id, homeFranchiseSeason.franchiseId))
                .limit(1)
            : [null];

          const [homeOwner] = homeFranchiseSeason
            ? await db
                .select({ id: users.id, name: users.name })
                .from(users)
                .where(eq(users.id, homeFranchiseSeason.ownerId))
                .limit(1)
            : [null];

          // Get away franchise details (nullable for BYE weeks)
          let awayFranchise = null;
          let awayOwner = null;
          let awayFranchiseSeason = null;

          if (matchup.awayFranchiseSeasonId) {
            [awayFranchiseSeason] = await db
              .select()
              .from(franchiseSeasons)
              .where(eq(franchiseSeasons.id, matchup.awayFranchiseSeasonId))
              .limit(1);

            [awayFranchise] = awayFranchiseSeason
              ? await db
                  .select()
                  .from(franchises)
                  .where(eq(franchises.id, awayFranchiseSeason.franchiseId))
                  .limit(1)
              : [null];

            [awayOwner] = awayFranchiseSeason
              ? await db
                  .select({ id: users.id, name: users.name })
                  .from(users)
                  .where(eq(users.id, awayFranchiseSeason.ownerId))
                  .limit(1)
              : [null];
          }

          return {
            id: matchup.id,
            weekNumber: matchup.weekNumber,
            homeScore: matchup.homeScore,
            awayScore: matchup.awayScore,
            isPlayoff: matchup.isPlayoff,
            completedAt: matchup.completedAt,
            home: homeFranchise
              ? {
                  id: homeFranchise.id,
                  name: homeFranchise.name,
                  owner: homeOwner,
                  record: {
                    wins: homeFranchiseSeason?.wins || 0,
                    losses: homeFranchiseSeason?.losses || 0,
                    ties: homeFranchiseSeason?.ties || 0,
                  },
                }
              : null,
            away: awayFranchise
              ? {
                  id: awayFranchise.id,
                  name: awayFranchise.name,
                  owner: awayOwner,
                  record: {
                    wins: awayFranchiseSeason?.wins || 0,
                    losses: awayFranchiseSeason?.losses || 0,
                    ties: awayFranchiseSeason?.ties || 0,
                  },
                }
              : null,
          };
        })
      );

      return matchupsWithDetails;
    }),

  // Get matchup by ID with full details
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [matchup] = await db
        .select()
        .from(matchups)
        .where(eq(matchups.id, input.id))
        .limit(1);

      if (!matchup) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Matchup not found',
        });
      }

      // Get home franchise details
      const [homeFranchiseSeason] = await db
        .select()
        .from(franchiseSeasons)
        .where(eq(franchiseSeasons.id, matchup.homeFranchiseSeasonId))
        .limit(1);

      const [homeFranchise] = homeFranchiseSeason
        ? await db
            .select()
            .from(franchises)
            .where(eq(franchises.id, homeFranchiseSeason.franchiseId))
            .limit(1)
        : [null];

      const [homeOwner] = homeFranchiseSeason
        ? await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, homeFranchiseSeason.ownerId))
            .limit(1)
        : [null];

      // Get away franchise details
      let awayFranchise = null;
      let awayOwner = null;
      let awayFranchiseSeason = null;

      if (matchup.awayFranchiseSeasonId) {
        [awayFranchiseSeason] = await db
          .select()
          .from(franchiseSeasons)
          .where(eq(franchiseSeasons.id, matchup.awayFranchiseSeasonId))
          .limit(1);

        [awayFranchise] = awayFranchiseSeason
          ? await db
              .select()
              .from(franchises)
              .where(eq(franchises.id, awayFranchiseSeason.franchiseId))
              .limit(1)
          : [null];

        [awayOwner] = awayFranchiseSeason
          ? await db
              .select({ id: users.id, name: users.name, email: users.email })
              .from(users)
              .where(eq(users.id, awayFranchiseSeason.ownerId))
              .limit(1)
          : [null];
      }

      return {
        ...matchup,
        home: homeFranchise
          ? {
              id: homeFranchise.id,
              name: homeFranchise.name,
              owner: homeOwner,
              seasonStats: homeFranchiseSeason,
            }
          : null,
        away: awayFranchise
          ? {
              id: awayFranchise.id,
              name: awayFranchise.name,
              owner: awayOwner,
              seasonStats: awayFranchiseSeason,
            }
          : null,
      };
    }),

  // Update matchup scores (protected - commissioner can manually override)
  updateScores: protectedProcedure
    .input(
      z.object({
        matchupId: z.string(),
        homeScore: z.number().optional(),
        awayScore: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get matchup with league info
      const [matchup] = await db
        .select({
          id: matchups.id,
          leagueSeasonId: matchups.leagueSeasonId,
          leagueId: leagueSeasons.leagueId,
          commissionerId: leagueSeasons.commissionerId,
        })
        .from(matchups)
        .innerJoin(leagueSeasons, eq(matchups.leagueSeasonId, leagueSeasons.id))
        .where(eq(matchups.id, input.matchupId))
        .limit(1);

      if (!matchup) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Matchup not found',
        });
      }

      // Verify commissioner
      if (matchup.commissionerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the commissioner can update matchup scores',
        });
      }

      // Update scores
      const updateData: any = { updatedAt: new Date() };
      if (input.homeScore !== undefined) {
        updateData.homeScore = input.homeScore.toString();
      }
      if (input.awayScore !== undefined) {
        updateData.awayScore = input.awayScore.toString();
      }

      const [updated] = await db
        .update(matchups)
        .set(updateData)
        .where(eq(matchups.id, input.matchupId))
        .returning();

      return updated;
    }),
});
