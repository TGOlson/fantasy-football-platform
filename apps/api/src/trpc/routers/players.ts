import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import {
  players,
  playerSeasons,
  playerWeeklyStats,
  eq,
  and,
  like,
  desc,
} from '@fantasy-platform/database';

export const playersRouter = router({
  // Get all players with filtering
  list: publicProcedure
    .input(
      z.object({
        season: z.number().int(),
        position: z.string().optional(),
        team: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Build where conditions dynamically
      const conditions = [eq(playerSeasons.season, input.season)];

      if (input.position) {
        conditions.push(eq(playerSeasons.position, input.position));
      }

      if (input.team) {
        conditions.push(eq(playerSeasons.nflTeam, input.team));
      }

      if (input.search) {
        // Search by player name (case-insensitive)
        conditions.push(like(players.name, `%${input.search}%`));
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
  getById: publicProcedure
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
  getStats: publicProcedure
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
