import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { requireLeagueMembership, requireLeagueAdmin } from '../../lib/auth';
import {
  leagues,
  leagueSeasons,
  leagueSettings,
  franchises,
  franchiseSeasons,
  users,
  eq,
  desc,
  and,
  inArray,
} from '@fantasy-platform/database/schema';
import { generateUniqueSlug } from '@fantasy-platform/database/lib/slug';
import { CURRENT_SEASON } from '@fantasy-platform/types/player';
import type { RosterSlots } from '@fantasy-platform/types/roster';
import type { ScoringRules } from '@fantasy-platform/types/scoring';

export const leaguesRouter = router({
  // Get all leagues for the current user (leagues where they own a franchise)
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    // Get all franchise seasons owned by this user
    const userFranchiseSeasons = await db
      .select({
        franchiseId: franchiseSeasons.franchiseId,
        leagueId: franchises.leagueId,
      })
      .from(franchiseSeasons)
      .innerJoin(franchises, eq(franchiseSeasons.franchiseId, franchises.id))
      .where(eq(franchiseSeasons.ownerId, ctx.user.userId));

    const leagueIds = [...new Set(userFranchiseSeasons.map((f) => f.leagueId))];

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
          .orderBy(desc(leagueSeasons.year))
          .limit(1);

        return {
          ...league,
          currentSeason: recentSeason || null,
        };
      })
    );

    return leaguesWithSeasons;
  }),

  // Get league by slug with franchises and settings for a specific season
  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        season: z.number().int(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

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
      await requireLeagueMembership(db, ctx.user.userId, { leagueId });

      // Get the specific season
      const [season] = await db
        .select()
        .from(leagueSeasons)
        .where(
          and(
            eq(leagueSeasons.leagueId, leagueId),
            eq(leagueSeasons.year, input.season)
          )
        )
        .limit(1);

      if (!season) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Season ${input.season} not found for this league`,
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
        .where(eq(users.id, season.commissionerId))
        .limit(1);

      // Get settings for this season
      const [settings] = await db
        .select()
        .from(leagueSettings)
        .where(eq(leagueSettings.leagueSeasonId, season.id))
        .limit(1);

      // Get franchises with their season data
      const leagueFranchises = await db
        .select()
        .from(franchises)
        .where(eq(franchises.leagueId, leagueId));

      // Get franchise seasons for this season
      const franchiseSeasonsData = await db
        .select()
        .from(franchiseSeasons)
        .where(eq(franchiseSeasons.leagueSeasonId, season.id));

      // Combine franchise with season data
      const franchisesWithSeasons = await Promise.all(
        leagueFranchises.map(async (franchise) => {
          const fsSeason = franchiseSeasonsData.find(
            (fs) => fs.franchiseId === franchise.id
          );

          let owner = null;
          if (fsSeason) {
            const [ownerData] = await db
              .select({ id: users.id, name: users.name })
              .from(users)
              .where(eq(users.id, fsSeason.ownerId))
              .limit(1);
            owner = ownerData;
          }

          return {
            id: franchise.id,
            name: franchise.name,
            owner,
            franchiseSeason: fsSeason || null,
          };
        })
      );

      return {
        ...league,
        leagueId,
        commissioner: commissioner || null,
        activeSeason: season,
        settings: settings || null,
        franchises: franchisesWithSeasons,
      };
    }),

  // Get league by ID with franchises and settings for active season
  getById: protectedProcedure
    .input(z.object({ leagueId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      // Verify league membership
      await requireLeagueMembership(db, ctx.user.userId, {
        leagueId: input.leagueId,
      });

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

      // Get active season (or most recent)
      const [activeSeason] = await db
        .select()
        .from(leagueSeasons)
        .where(eq(leagueSeasons.leagueId, input.leagueId))
        .orderBy(desc(leagueSeasons.year))
        .limit(1);

      // Get commissioner info
      let commissioner = null;
      if (activeSeason) {
        const [commissionerData] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, activeSeason.commissionerId))
          .limit(1);
        commissioner = commissionerData;
      }

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

      // Get franchises for this league
      const leagueFranchises = await db
        .select()
        .from(franchises)
        .where(eq(franchises.leagueId, input.leagueId));

      return {
        ...league,
        commissioner,
        activeSeason: activeSeason || null,
        settings,
        franchises: leagueFranchises,
      };
    }),

  // Create new league with season and settings (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'League name is required'),
        // TODO: validate input json
        rosterSlots: z.custom<RosterSlots>(),
        scoringRules: z.custom<ScoringRules>(),
        playoffTeams: z.number(),
        playoffStartWeek: z.number(),
        tradeDeadlineWeek: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      // Generate unique slug for the league
      const slug = await generateUniqueSlug(db, input.name);

      // Create the league
      const [newLeague] = await db
        .insert(leagues)
        .values({
          name: input.name,
          slug,
        })
        .returning();

      // Create the first season (commissioner is current user)
      const [newSeason] = await db
        .insert(leagueSeasons)
        .values({
          leagueId: newLeague.id,
          year: CURRENT_SEASON,
          status: 'setup',
          commissionerId: ctx.user.userId,
        })
        .returning();

      await db.insert(leagueSettings).values({
        leagueSeasonId: newSeason.id,
        rosterSlots: input.rosterSlots,
        scoringRules: input.scoringRules,
        playoffTeams: input.playoffTeams,
        playoffStartWeek: input.playoffStartWeek,
        tradeDeadlineWeek: input.tradeDeadlineWeek,
      });

      return {
        id: newLeague.id,
        name: newLeague.name,
        slug: newLeague.slug,
        season: newSeason.year,
        createdAt: newLeague.createdAt,
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
      const { db } = ctx;

      // Verify league admin
      await requireLeagueAdmin(db, ctx.user.userId, {
        leagueId: input.leagueId,
      });

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
      const updateData: { name?: string; slug?: string } = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
        updateData.slug = await generateUniqueSlug(db, input.name);
      }

      if (Object.keys(updateData).length === 0) {
        return existingLeague;
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
        createdAt: updatedLeague.createdAt,
      };
    }),
});
