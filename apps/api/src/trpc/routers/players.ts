import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import {
  players,
  playerSeasons,
  playerWeeklyStats,
  eq,
  and,
  like,
  desc,
} from '@fantasy-platform/database/schema';

export const playersRouter = router({
  // Get all players with filtering
  list: protectedProcedure
    .input(
      z.object({
        // TODO: should take in league id and filter out positions not used by the league
        season: z.number().int(),
        filters: z
          .object({
            position: z.string().optional(),
            team: z.string().optional(),
            search: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Build where conditions dynamically
      const conditions = [eq(playerSeasons.season, input.season)];

      const filters = input.filters;
      if (filters?.position) {
        conditions.push(eq(playerSeasons.position, filters.position));
      }

      if (filters?.team) {
        conditions.push(eq(playerSeasons.nflTeam, filters.team));
      }

      if (filters?.search) {
        // Search by player name (case-insensitive)
        conditions.push(like(players.name, `%${filters.search}%`));
      }

      // Query with join to playerSeasons
      const allPlayers = await db
        .select({
          id: players.id,
          nflId: players.nflId,
          name: players.name,
          position: playerSeasons.position,
          team: playerSeasons.nflTeam,
          status: playerSeasons.status,
          jerseyNumber: playerSeasons.jerseyNumber,
        })
        .from(players)
        .innerJoin(playerSeasons, eq(players.id, playerSeasons.playerId))
        .where(and(...conditions));

      return allPlayers;
    }),

  // Get single player by ID with season data
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const [player] = await db
        .select({
          id: players.id,
          nflId: players.nflId,
          name: players.name,
          position: playerSeasons.position,
          team: playerSeasons.nflTeam,
          status: playerSeasons.status,
          jerseyNumber: playerSeasons.jerseyNumber,
        })
        .from(players)
        .innerJoin(playerSeasons, eq(players.id, playerSeasons.playerId))
        .where(
          and(eq(players.id, input.id), eq(playerSeasons.season, input.season))
        )
        .limit(1);

      if (!player) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Player not found',
        });
      }

      return player;
    }),

  // Get weekly stats for a player
  getStats: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const stats = await db
        .select()
        .from(playerWeeklyStats)
        .where(
          and(
            eq(playerWeeklyStats.playerId, input.id),
            eq(playerWeeklyStats.season, input.season)
          )
        )
        .orderBy(desc(playerWeeklyStats.weekNumber));

      return stats;
    }),
});
