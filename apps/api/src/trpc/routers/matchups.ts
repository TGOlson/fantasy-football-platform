import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { matchups, eq, and } from '@fantasy-platform/database/schema';

export const matchupsRouter = router({
  // Get matchups for a league/week
  getByLeagueWeek: protectedProcedure
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
          let awayTeam: Awaited<
            ReturnType<typeof db.query.teams.findFirst>
          > | null = null;

          if (matchup.awayTeamId) {
            const awayTeamId = matchup.awayTeamId;
            awayTeam = await db.query.teams.findFirst({
              where: (teams, { eq }) => eq(teams.id, awayTeamId),
            });

            const awayTeamFranchiseId = awayTeam?.franchiseId;

            awayFranchise = awayTeamFranchiseId
              ? await db.query.franchises.findFirst({
                  where: (franchises, { eq }) =>
                    eq(franchises.id, awayTeamFranchiseId),
                })
              : null;

            const awayTeamOwnerId = awayTeam?.ownerId;
            awayOwner = awayTeamOwnerId
              ? await db.query.users.findFirst({
                  where: (users, { eq }) => eq(users.id, awayTeamOwnerId),
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
  getById: protectedProcedure
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

        const awayTeamOwnerId = awayTeam?.ownerId;

        awayOwner = awayTeamOwnerId
          ? await db.query.users.findFirst({
              where: (users, { eq }) => eq(users.id, awayTeamOwnerId),
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
});
