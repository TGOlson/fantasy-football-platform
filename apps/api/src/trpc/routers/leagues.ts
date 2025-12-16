import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import {
  getDatabase,
  leagues,
  leagueSeasons,
  leagueSettings,
  teams,
  users,
  eq,
  desc,
  type ScoringRulesJson,
  type RosterPositionsJson,
} from '@fantasy-platform/database';

export const leaguesRouter = router({
  // Get all leagues (with their most recent season)
  list: publicProcedure.query(async () => {
    const db = getDatabase();

    const allLeagues = await db.select().from(leagues);

    // For each league, get the most recent season
    const leaguesWithSeasons = await Promise.all(
      allLeagues.map(async (league) => {
        const [recentSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(eq(leagueSeasons.leagueId, league.id))
          .orderBy(desc(leagueSeasons.season))
          .limit(1);

        return {
          ...league,
          currentSeason: recentSeason || null,
        };
      })
    );

    return leaguesWithSeasons;
  }),

  // Get league by ID with teams and settings for active season
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

      // Get commissioner info
      const [commissioner] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, league.commissionerId))
        .limit(1);

      // Get active season (or most recent)
      const [activeSeason] = await db
        .select()
        .from(leagueSeasons)
        .where(eq(leagueSeasons.leagueId, input.id))
        .orderBy(desc(leagueSeasons.season))
        .limit(1);

      // Get settings for the active season
      let settings = null;
      if (activeSeason) {
        const [leagueSettingsData] = await db
          .select()
          .from(leagueSettings)
          .where(eq(leagueSettings.leagueSeasonId, activeSeason.id))
          .limit(1);
        settings = leagueSettingsData || null;
      }

      // Get teams for this league
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.id));

      return {
        ...league,
        commissioner: commissioner || null,
        activeSeason: activeSeason || null,
        settings,
        teams: leagueTeams,
      };
    }),

  // Create new league with season and settings (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'League name is required'),
        season: z.number().int().min(2020, 'Season must be 2020 or later'),
        teamCount: z.number().int().min(2).max(20).optional(),
        rosterPositions: z.custom<RosterPositionsJson>().optional(),
        scoringRules: z.custom<ScoringRulesJson>().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Create the league (commissioner is current user)
      const [newLeague] = await db
        .insert(leagues)
        .values({
          name: input.name,
          commissionerId: ctx.user.userId,
        })
        .returning();

      // Create the first season
      const [newSeason] = await db
        .insert(leagueSeasons)
        .values({
          leagueId: newLeague.id,
          season: input.season,
          status: 'setup',
        })
        .returning();

      // Create default settings
      const defaultRosterPositions: RosterPositionsJson = {
        QB: 1,
        RB: 2,
        WR: 2,
        TE: 1,
        FLEX: 1,
        BENCH: 6,
      };

      const defaultScoringRules: ScoringRulesJson = {
        passing: {
          yards: { type: 'base', value: 0.04 },
          touchdowns: { type: 'base', value: 4 },
          interceptions: { type: 'base', value: -2 },
        },
        rushing: {
          yards: { type: 'base', value: 0.1 },
          touchdowns: { type: 'base', value: 6 },
        },
        receiving: {
          receptions: { type: 'base', value: 1.0 },
          yards: { type: 'base', value: 0.1 },
          touchdowns: { type: 'base', value: 6 },
        },
        fumbles: {
          lost: { type: 'base', value: -2 },
        },
        twoPointConversions: { type: 'base', value: 2 },
      };

      await db.insert(leagueSettings).values({
        leagueSeasonId: newSeason.id,
        teamCount: input.teamCount || 10,
        rosterPositions: input.rosterPositions || defaultRosterPositions,
        scoringRules: input.scoringRules || defaultScoringRules,
      });

      return {
        id: newLeague.id,
        name: newLeague.name,
        commissionerId: newLeague.commissionerId,
        season: newSeason.season,
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
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      // Verify the user is commissioner
      if (existingLeague.commissionerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the commissioner can update league settings',
        });
      }

      // Build update object with only provided fields
      const updateData: { name?: string; updatedAt: Date } = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) {
        updateData.name = input.name;
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
        commissionerId: updatedLeague.commissionerId,
        createdAt: updatedLeague.createdAt,
        updatedAt: updatedLeague.updatedAt,
      };
    }),
});
