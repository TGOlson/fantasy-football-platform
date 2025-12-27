import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { requireLeagueMembership } from '../../lib/auth';
import {
  leagues,
  franchises,
  teams,
  eq,
  inArray,
} from '@fantasy-platform/database/schema';

export const leaguesRouter = router({
  // Get all leagues for the current user (leagues where they own a franchise)
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    // Get all teams owned by this user
    const userTeams = await db
      .select({
        franchiseId: teams.franchiseId,
        leagueId: franchises.leagueId,
      })
      .from(teams)
      .innerJoin(franchises, eq(teams.franchiseId, franchises.id))
      .where(eq(teams.ownerId, ctx.user.userId));

    const leagueIds = [...new Set(userTeams.map((f) => f.leagueId))];

    if (leagueIds.length === 0) {
      return [];
    }

    // Get leagues
    const userLeagues = await db
      .select()
      .from(leagues)
      .where(inArray(leagues.id, leagueIds));

    // For each league, get the most recent season
    const leaguesWithSeasons = await Promise.all(
      userLeagues.map(async (league) => {
        const recentSeason = await db.query.leagueSeasons.findFirst({
          where: (leagueSeasons, { eq }) =>
            eq(leagueSeasons.leagueId, league.id),
          orderBy: (leagueSeasons, { desc }) => [desc(leagueSeasons.year)],
        });

        return {
          ...league,
          currentSeason: recentSeason ?? null,
        };
      })
    );

    return leaguesWithSeasons;
  }),

  // Get league by slug with franchises and settings for a specific season
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get the league by slug
      const league = await db.query.leagues.findFirst({
        where: (leagues, { eq }) => eq(leagues.slug, input.slug),
      });

      if (!league) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League not found',
        });
      }

      const leagueId = league.id;

      // Verify league membership
      await requireLeagueMembership(db, ctx.user.userId, leagueId);

      // Get the specific season
      const season = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { eq, and }) =>
          and(
            eq(leagueSeasons.leagueId, leagueId),
            eq(leagueSeasons.year, input.season)
          ),
      });

      if (!season) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Season ${input.season} not found for this league`,
        });
      }

      // Get commissioner info
      const commissioner = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, season.commissionerId),
        columns: {
          id: true,
          name: true,
          email: true,
        },
      });

      // Get settings for this season
      const settings = await db.query.leagueSettings.findFirst({
        where: (leagueSettings, { eq }) =>
          eq(leagueSettings.leagueSeasonId, season.id),
      });

      // Get franchises with their season data
      const leagueFranchises = await db
        .select()
        .from(franchises)
        .where(eq(franchises.leagueId, leagueId));

      // Get teams for this season
      const teamsData = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueSeasonId, season.id));

      // Combine franchise with season data
      const franchisesWithSeasons = await Promise.all(
        leagueFranchises.map(async (franchise) => {
          const teamSeason = teamsData.find(
            (t) => t.franchiseId === franchise.id
          );

          let owner = null;
          if (teamSeason) {
            owner = await db.query.users.findFirst({
              where: (users, { eq }) => eq(users.id, teamSeason.ownerId),
              columns: { id: true, name: true },
            });
          }

          return {
            id: franchise.id,
            name: franchise.name,
            owner,
            team: teamSeason || null,
          };
        })
      );

      return {
        ...league,
        leagueId,
        commissioner: commissioner || null,
        activeSeason: season,
        settings: settings || null,
        franchises: franchisesWithSeasons,
      };
    }),
});
