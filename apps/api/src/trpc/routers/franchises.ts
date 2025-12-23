import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  requireLeagueMembership,
  requireFranchiseOwnership,
} from '../../lib/auth';
import {
  franchises,
  teams,
  users,
  leagues,
  leagueSeasons,
  eq,
  and,
  desc,
} from '@fantasy-platform/database/schema';

export const franchisesRouter = router({
  // Get franchise by ID with lineup for current season (requires league membership)
  getById: protectedProcedure
    .input(
      z.object({
        franchiseId: z.string(),
        season: z.number().int().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Verify league membership
      await requireLeagueMembership(db, ctx.user.userId, {
        franchiseId: input.franchiseId,
      });

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

      // Get league info
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, franchise.leagueId))
        .limit(1);

      // Get the team
      let teamData;
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
          [teamData] = await db
            .select()
            .from(teams)
            .where(
              and(
                eq(teams.franchiseId, franchise.id),
                eq(teams.leagueSeasonId, leagueSeason.id)
              )
            )
            .limit(1);
        }
      } else {
        // Get most recent season
        const [recentLeagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(eq(leagueSeasons.leagueId, franchise.leagueId))
          .orderBy(desc(leagueSeasons.year))
          .limit(1);

        if (recentLeagueSeason) {
          [teamData] = await db
            .select()
            .from(teams)
            .where(
              and(
                eq(teams.franchiseId, franchise.id),
                eq(teams.leagueSeasonId, recentLeagueSeason.id)
              )
            )
            .limit(1);
        }
      }

      // Get owner info
      let owner = null;
      if (teamData) {
        const [ownerData] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, teamData.ownerId))
          .limit(1);
        owner = ownerData;
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
        season: z.number().int().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Get all franchises for this league
      const leagueFranchises = await db
        .select()
        .from(franchises)
        .where(eq(franchises.leagueId, input.leagueId));

      // Get season
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

      // Get owner info and team for each franchise
      const franchisesWithDetails = await Promise.all(
        leagueFranchises.map(async (franchise) => {
          let owner = null;
          let teamData = null;

          if (leagueSeason) {
            [teamData] = await db
              .select()
              .from(teams)
              .where(
                and(
                  eq(teams.franchiseId, franchise.id),
                  eq(teams.leagueSeasonId, leagueSeason.id)
                )
              )
              .limit(1);

            if (teamData) {
              const [ownerData] = await db
                .select({
                  id: users.id,
                  name: users.name,
                  email: users.email,
                })
                .from(users)
                .where(eq(users.id, teamData.ownerId))
                .limit(1);
              owner = ownerData;
            }
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
