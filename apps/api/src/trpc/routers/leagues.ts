import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import {
  getDatabase,
  leagues,
  teams,
  scoringRules,
  eq,
  type ScoringRulesJson
} from '@fantasy-platform/database';

export const leaguesRouter = router({
  // Get all leagues
  list: publicProcedure.query(async () => {
    const db = getDatabase();

    const allLeagues = await db.select().from(leagues);

    return allLeagues;
  }),

  // Get league by ID with teams
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      // Get the league
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.id))
        .limit(1);

      if (!league) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League not found',
        });
      }

      // Get teams for this league
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.id));

      // Get scoring rules for this league
      const [scoringRule] = await db
        .select()
        .from(scoringRules)
        .where(eq(scoringRules.leagueId, input.id))
        .limit(1);

      return {
        ...league,
        teams: leagueTeams,
        scoringRules: scoringRule || null,
      };
    }),

  // Create new league with scoring rules (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'League name is required'),
        season: z.number().int().min(2020, 'Season must be 2020 or later'),
        scoringRules: z.custom<ScoringRulesJson>().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Create the league
      const [newLeague] = await db
        .insert(leagues)
        .values({
          name: input.name,
          season: input.season,
        })
        .returning();

      // Create scoring rules if provided
      if (input.scoringRules) {
        await db.insert(scoringRules).values({
          leagueId: newLeague.id,
          rules: input.scoringRules,
        });
      }

      return {
        id: newLeague.id,
        name: newLeague.name,
        season: newLeague.season,
        createdAt: newLeague.createdAt,
        updatedAt: newLeague.updatedAt,
      };
    }),

  // Update league settings (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'League name is required').optional(),
        season: z.number().int().min(2020, 'Season must be 2020 or later').optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Check if league exists
      const [existingLeague] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.id))
        .limit(1);

      if (!existingLeague) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League not found',
        });
      }

      // Build update object with only provided fields
      const updateData: { name?: string; season?: number; updatedAt: Date } = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) {
        updateData.name = input.name;
      }

      if (input.season !== undefined) {
        updateData.season = input.season;
      }

      // Update the league
      const [updatedLeague] = await db
        .update(leagues)
        .set(updateData)
        .where(eq(leagues.id, input.id))
        .returning();

      return {
        id: updatedLeague.id,
        name: updatedLeague.name,
        season: updatedLeague.season,
        createdAt: updatedLeague.createdAt,
        updatedAt: updatedLeague.updatedAt,
      };
    }),
});
