import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc.js';
import {
  getDatabase,
  players,
  playerSeasons,
  eq,
  and,
  like,
  sql,
} from '@fantasy-platform/database';

export const playersRouter = router({
  // Get all players with filtering (for current season: 2024)
  list: publicProcedure
    .input(
      z.object({
        position: z.string().optional(),
        team: z.string().optional(),
        search: z.string().optional(),
        season: z.number().int().optional(), // Defaults to 2024
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();
      const currentSeason = input.season || 2024;

      // Build where conditions dynamically
      const conditions = [eq(playerSeasons.season, currentSeason)];

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

  // Get single player by ID with current season data
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        season: z.number().int().optional(), // Defaults to 2024
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();
      const currentSeason = input.season || 2024;

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
          and(eq(players.id, input.id), eq(playerSeasons.season, currentSeason))
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
});
