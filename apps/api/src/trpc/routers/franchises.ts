import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  requireLeagueMembership,
  requireFranchiseOwnership,
} from '../../lib/auth';
import {
  franchises,
  franchiseSeasons,
  users,
  leagues,
  leagueSeasons,
  weeklyLineups,
  players,
  playerSeasons,
  eq,
  and,
  desc,
} from '@fantasy-platform/database';

export const franchisesRouter = router({
  // Get franchise by ID with lineup for current season (requires league membership)
  getById: protectedProcedure
    .input(
      z.object({
        franchiseId: z.string(),
        season: z.number().int().optional(),
        weekNumber: z.number().int().optional(),
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
        // Get most recent season
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

      // Get owner info
      let owner = null;
      if (franchiseSeasonData) {
        const [ownerData] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, franchiseSeasonData.ownerId))
          .limit(1);
        owner = ownerData;
      }

      // Get lineup for specific week if franchise season exists
      let lineup: any[] = [];
      if (franchiseSeasonData && input.weekNumber) {
        const lineupData = await db
          .select({
            id: weeklyLineups.id,
            slotType: weeklyLineups.slotType,
            weekNumber: weeklyLineups.weekNumber,
            pointsScored: weeklyLineups.pointsScored,
            playerId: players.id,
            playerName: players.name,
            playerNflId: players.nflId,
            position: playerSeasons.position,
            nflTeam: playerSeasons.nflTeam,
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

        lineup = lineupData;
      }

      return {
        ...franchise,
        owner,
        league: league || null,
        franchiseSeason: franchiseSeasonData || null,
        lineup,
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

      // Get owner info and franchise season for each franchise
      const franchisesWithDetails = await Promise.all(
        leagueFranchises.map(async (franchise) => {
          let owner = null;
          let franchiseSeasonData = null;

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

            if (franchiseSeasonData) {
              const [ownerData] = await db
                .select({
                  id: users.id,
                  name: users.name,
                  email: users.email,
                })
                .from(users)
                .where(eq(users.id, franchiseSeasonData.ownerId))
                .limit(1);
              owner = ownerData;
            }
          }

          return {
            ...franchise,
            owner,
            franchiseSeason: franchiseSeasonData,
          };
        })
      );

      return franchisesWithDetails;
    }),
});
