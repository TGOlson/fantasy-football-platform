import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  matchups,
  leagueSeasons,
  eq,
  and,
} from '@fantasy-platform/database/schema';

export const matchupsRouter = router({
  // Get matchups for a league/week
  getByLeagueWeek: publicProcedure
    .input(
      z.object({
        leagueId: z.string(),
        weekNumber: z.number().int().min(1).max(18),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get league season
      const leagueSeason = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { and, eq }) =>
          and(
            eq(leagueSeasons.leagueId, input.leagueId),
            eq(leagueSeasons.year, input.season)
          ),
      });

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
          const homeTeam = await db.query.teams.findFirst({
            where: (teams, { eq }) => eq(teams.id, matchup.homeTeamId),
          });

          const homeFranchise = homeTeam
            ? await db.query.franchises.findFirst({
                where: (franchises, { eq }) =>
                  eq(franchises.id, homeTeam.franchiseId),
              })
            : null;

          const homeOwner = homeTeam
            ? await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.id, homeTeam.ownerId),
                columns: { id: true, name: true },
              })
            : null;

          // Get away franchise details (nullable for BYE weeks)
          let awayFranchise = null;
          let awayOwner = null;
          let awayTeam = null;

          if (matchup.awayTeamId) {
            const awayTeamId = matchup.awayTeamId;
            awayTeam = await db.query.teams.findFirst({
              where: (teams, { eq }) => eq(teams.id, awayTeamId),
            });

            awayFranchise = awayTeam
              ? await db.query.franchises.findFirst({
                  where: (franchises, { eq }) =>
                    eq(franchises.id, awayTeam.franchiseId),
                })
              : null;

            awayOwner = awayTeam
              ? await db.query.users.findFirst({
                  where: (users, { eq }) => eq(users.id, awayTeam.ownerId),
                  columns: { id: true, name: true },
                })
              : null;
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
                    wins: homeTeam?.wins || 0,
                    losses: homeTeam?.losses || 0,
                    ties: homeTeam?.ties || 0,
                  },
                }
              : null,
            away: awayFranchise
              ? {
                  id: awayFranchise.id,
                  name: awayFranchise.name,
                  owner: awayOwner,
                  record: {
                    wins: awayTeam?.wins || 0,
                    losses: awayTeam?.losses || 0,
                    ties: awayTeam?.ties || 0,
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
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const matchup = await db.query.matchups.findFirst({
        where: (matchups, { eq }) => eq(matchups.id, input.id),
      });

      if (!matchup) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Matchup not found',
        });
      }

      // Get home franchise details
      const homeTeam = await db.query.teams.findFirst({
        where: (teams, { eq }) => eq(teams.id, matchup.homeTeamId),
      });

      const homeFranchise = homeTeam
        ? await db.query.franchises.findFirst({
            where: (franchises, { eq }) =>
              eq(franchises.id, homeTeam.franchiseId),
          })
        : null;

      const homeOwner = homeTeam
        ? await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, homeTeam.ownerId),
            columns: { id: true, name: true, email: true },
          })
        : null;

      // Get away franchise details
      let awayFranchise = null;
      let awayOwner = null;
      let awayTeam: Awaited<
        ReturnType<typeof db.query.teams.findFirst>
      > | null = null;

      if (matchup.awayTeamId) {
        const awayTeamId = matchup.awayTeamId;
        awayTeam = await db.query.teams.findFirst({
          where: (teams, { eq }) => eq(teams.id, awayTeamId),
        });

        const awayFranchiseId = awayTeam?.franchiseId;

        awayFranchise = awayFranchiseId
          ? await db.query.franchises.findFirst({
              where: (franchises, { eq }) => eq(franchises.id, awayFranchiseId),
            })
          : null;

        awayOwner = awayTeam
          ? await db.query.users.findFirst({
              where: (users, { eq }) => eq(users.id, awayTeam.ownerId),
              columns: { id: true, name: true, email: true },
            })
          : null;
      }

      return {
        ...matchup,
        home: homeFranchise
          ? {
              id: homeFranchise.id,
              name: homeFranchise.name,
              owner: homeOwner,
              seasonStats: homeTeam,
            }
          : null,
        away: awayFranchise
          ? {
              id: awayFranchise.id,
              name: awayFranchise.name,
              owner: awayOwner,
              seasonStats: awayTeam,
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
      const { db } = ctx;

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
      const updateData: {
        updatedAt: Date;
        homeScore?: string;
        awayScore?: string;
      } = { updatedAt: new Date() };

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
