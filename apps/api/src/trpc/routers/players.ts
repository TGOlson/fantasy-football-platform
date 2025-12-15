import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc.js';
import { getDatabase, players, eq, and, like } from '@fantasy-platform/database';

export const playersRouter = router({
  // Get all players with filtering
  list: publicProcedure
    .input(
      z.object({
        position: z.string().optional(),
        team: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      // Build where conditions dynamically
      const conditions = [];

      if (input.position) {
        conditions.push(eq(players.position, input.position));
      }

      if (input.team) {
        conditions.push(eq(players.team, input.team));
      }

      if (input.search) {
        // Search by player name (case-insensitive)
        conditions.push(like(players.name, `%${input.search}%`));
      }

      // Query with conditions if any exist
      const allPlayers = conditions.length > 0
        ? await db.select().from(players).where(and(...conditions))
        : await db.select().from(players);

      return allPlayers;
    }),

  // Get single player by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [player] = await db
        .select()
        .from(players)
        .where(eq(players.id, input.id))
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
