import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { requireLeagueMembership, requireLeagueAdmin } from '../../lib/auth';
import {
  getDatabase,
  leagues,
  leagueSeasons,
  leagueSettings,
  teams,
  users,
  eq,
  desc,
  and,
  inArray,
  generateUniqueSlug,
  type ScoringRulesJson,
  type RosterPositionsJson,
} from '@fantasy-platform/database';
import { STANDARD_SCORING } from '../../services/scoring-presets';

export const leaguesRouter = router({
  // Get all leagues for the current user (leagues where they own a team)
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDatabase();

    // Get all teams owned by this user
    const userTeams = await db
      .select({ leagueId: teams.leagueId })
      .from(teams)
      .where(eq(teams.ownerId, ctx.user.userId));

    const leagueIds = userTeams.map((t) => t.leagueId);

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

  // Get league by slug with teams and settings for a specific season
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get the league by slug
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.slug, input.slug))
        .limit(1);

      if (!league) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League not found',
        });
      }

      const leagueId = league.id;

      // Verify league membership
      await requireLeagueMembership(ctx.user.userId, { leagueId });

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

      // Get the specific season
      const [season] = await db
        .select()
        .from(leagueSeasons)
        .where(
          and(
            eq(leagueSeasons.leagueId, leagueId),
            eq(leagueSeasons.season, input.season)
          )
        )
        .limit(1);

      if (!season) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Season ${input.season} not found for this league`,
        });
      }

      // Get settings for this season
      const [settings] = await db
        .select()
        .from(leagueSettings)
        .where(eq(leagueSettings.leagueSeasonId, season.id))
        .limit(1);

      // Get teams for this league
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, leagueId));

      return {
        ...league,
        leagueId, // Include for auth purposes
        commissioner: commissioner || null,
        activeSeason: season,
        settings: settings || null,
        teams: leagueTeams,
      };
    }),

  // Get league by ID with teams and settings for active season
  getById: protectedProcedure
    .input(z.object({ leagueId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = getDatabase();

      // Verify league membership
      await requireLeagueMembership(ctx.user.userId, { leagueId: input.leagueId });

      // Get the league
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.leagueId))
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
        .where(eq(leagueSeasons.leagueId, input.leagueId))
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
        .where(eq(teams.leagueId, input.leagueId));

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

      // Generate unique slug for the league
      const slug = await generateUniqueSlug(input.name);

      // Create the league (commissioner is current user)
      const [newLeague] = await db
        .insert(leagues)
        .values({
          name: input.name,
          slug,
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

      await db.insert(leagueSettings).values({
        leagueSeasonId: newSeason.id,
        teamCount: input.teamCount || 10,
        rosterPositions: input.rosterPositions || defaultRosterPositions,
        // TODO: should probably just require scoring rules as input
        scoringRules: input.scoringRules || STANDARD_SCORING,
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

  // Update league settings (admin only)
  update: protectedProcedure
    .input(
      z.object({
        leagueId: z.string(),
        name: z.string().min(1, 'League name is required').optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Verify league admin
      await requireLeagueAdmin(ctx.user.userId, { leagueId: input.leagueId });

      // Check if league exists
      const [existingLeague] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.leagueId))
        .limit(1);

      if (!existingLeague) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League not found',
        });
      }

      // Build update object with only provided fields
      const updateData: { name?: string; slug?: string; updatedAt: Date } = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) {
        updateData.name = input.name;
        // Regenerate slug if name changes
        updateData.slug = await generateUniqueSlug(input.name);
      }

      // Update the league
      const [updatedLeague] = await db
        .update(leagues)
        .set(updateData)
        .where(eq(leagues.id, input.leagueId))
        .returning();

      return {
        id: updatedLeague.id,
        name: updatedLeague.name,
        slug: updatedLeague.slug,
        commissionerId: updatedLeague.commissionerId,
        createdAt: updatedLeague.createdAt,
        updatedAt: updatedLeague.updatedAt,
      };
    }),
});
