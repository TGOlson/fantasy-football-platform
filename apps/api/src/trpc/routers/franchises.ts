import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  requireFranchiseMembership,
  requireFranchiseOwnership,
} from '../../lib/auth';
import { franchises, eq } from '@fantasy-platform/database/schema';

export const franchisesRouter = router({
  // Get franchise by ID with lineup for current season (requires league membership)
  getById: protectedProcedure
    .input(
      z.object({
        franchiseId: z.string(),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Verify league membership
      await requireFranchiseMembership(db, ctx.user.userId, input.franchiseId);

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

      // Get league info
      const league = await db.query.leagues.findFirst({
        where: (leagues, { eq }) => eq(leagues.id, franchise.leagueId),
      });

      // Get the team
      const leagueSeason = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { eq, and }) =>
          and(
            eq(leagueSeasons.leagueId, franchise.leagueId),
            eq(leagueSeasons.year, input.season)
          ),
      });

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League seasons not found',
        });
      }

      const teamData = await db.query.teams.findFirst({
        where: (teams, { eq, and }) =>
          and(
            eq(teams.franchiseId, franchise.id),
            eq(teams.leagueSeasonId, leagueSeason.id)
          ),
      });

      // Get owner info
      let owner = null;
      if (teamData) {
        owner = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, teamData.ownerId),
          columns: {
            id: true,
            name: true,
            email: true,
          },
        });
      }

      return {
        ...franchise,
        owner,
        league: league || null,
        team: teamData || null,
      };
    }),

  // Update franchise name (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Franchise name is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      // Verify franchise ownership
      await requireFranchiseOwnership(db, ctx.user.userId, input.id);

      // Update the franchise
      const [updatedFranchise] = await db
        .update(franchises)
        .set({
          name: input.name,
        })
        .where(eq(franchises.id, input.id))
        .returning();

      return {
        id: updatedFranchise.id,
        name: updatedFranchise.name,
        leagueId: updatedFranchise.leagueId,
        createdAt: updatedFranchise.createdAt,
      };
    }),

  // Get all franchises in a league for a specific season
  getByLeague: publicProcedure
    .input(
      z.object({
        leagueId: z.string(),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get all franchises for this league
      const leagueFranchises = await db
        .select()
        .from(franchises)
        .where(eq(franchises.leagueId, input.leagueId));

      const leagueSeason = await db.query.leagueSeasons.findFirst({
        where: (leagueSeasons, { eq, and }) =>
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

      // Get owner info and team for each franchise
      const franchisesWithDetails = await Promise.all(
        leagueFranchises.map(async (franchise) => {
          let owner = null;

          const teamData = await db.query.teams.findFirst({
            where: (teams, { eq, and }) =>
              and(
                eq(teams.franchiseId, franchise.id),
                eq(teams.leagueSeasonId, leagueSeason.id)
              ),
          });

          if (teamData) {
            owner = await db.query.users.findFirst({
              where: (users, { eq }) => eq(users.id, teamData.ownerId),
              columns: {
                id: true,
                name: true,
                email: true,
              },
            });
          }

          return {
            ...franchise,
            owner,
            team: teamData,
          };
        })
      );

      return franchisesWithDetails;
    }),
});
