import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  getDatabase,
  matchups,
  leagueSeasons,
  leagues,
  teamSeasons,
  teams,
  users,
  eq,
  and,
} from '@fantasy-platform/database';

export const matchupsRouter = router({
  // Get matchups for a league/week
  getByLeagueWeek: publicProcedure
    .input(
      z.object({
        leagueId: z.string(),
        weekNumber: z.number().int().min(1).max(18),
        season: z.number().int().optional(), // Defaults to most recent
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      // Get league season
      let leagueSeason;
      if (input.season) {
        [leagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(
            and(
              eq(leagueSeasons.leagueId, input.leagueId),
              eq(leagueSeasons.season, input.season)
            )
          )
          .limit(1);
      } else {
        // Get most recent season
        const allSeasons = await db
          .select()
          .from(leagueSeasons)
          .where(eq(leagueSeasons.leagueId, input.leagueId))
          .orderBy(leagueSeasons.season);
        leagueSeason = allSeasons[allSeasons.length - 1];
      }

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      // Get matchups for this week
      const weekMatchups = await db
        .select()
        .from(matchups)
        .where(
          and(
            eq(matchups.leagueSeasonId, leagueSeason.id),
            eq(matchups.weekNumber, input.weekNumber)
          )
        );

      // Enhance with team details
      const matchupsWithDetails = await Promise.all(
        weekMatchups.map(async (matchup) => {
          // Get team 1 details
          const [team1Season] = await db
            .select()
            .from(teamSeasons)
            .where(eq(teamSeasons.id, matchup.team1SeasonId))
            .limit(1);

          const [team1] = team1Season
            ? await db
                .select()
                .from(teams)
                .where(eq(teams.id, team1Season.teamId))
                .limit(1)
            : [null];

          const [team1Owner] = team1
            ? await db
                .select({ id: users.id, name: users.name })
                .from(users)
                .where(eq(users.id, team1.ownerId))
                .limit(1)
            : [null];

          // Get team 2 details (nullable for BYE weeks)
          let team2 = null;
          let team2Owner = null;
          let team2Season = null;

          if (matchup.team2SeasonId) {
            [team2Season] = await db
              .select()
              .from(teamSeasons)
              .where(eq(teamSeasons.id, matchup.team2SeasonId))
              .limit(1);

            [team2] = team2Season
              ? await db
                  .select()
                  .from(teams)
                  .where(eq(teams.id, team2Season.teamId))
                  .limit(1)
              : [null];

            [team2Owner] = team2
              ? await db
                  .select({ id: users.id, name: users.name })
                  .from(users)
                  .where(eq(users.id, team2.ownerId))
                  .limit(1)
              : [null];
          }

          return {
            ...matchup,
            team1: team1
              ? {
                  id: team1.id,
                  name: team1.name,
                  owner: team1Owner,
                  record: {
                    wins: team1Season?.wins || 0,
                    losses: team1Season?.losses || 0,
                    ties: team1Season?.ties || 0,
                  },
                }
              : null,
            team2: team2
              ? {
                  id: team2.id,
                  name: team2.name,
                  owner: team2Owner,
                  record: {
                    wins: team2Season?.wins || 0,
                    losses: team2Season?.losses || 0,
                    ties: team2Season?.ties || 0,
                  },
                }
              : null,
          };
        })
      );

      return matchupsWithDetails;
    }),

  // Get matchup by ID with full details
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [matchup] = await db
        .select()
        .from(matchups)
        .where(eq(matchups.id, input.id))
        .limit(1);

      if (!matchup) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Matchup not found',
        });
      }

      // Get team 1 details
      const [team1Season] = await db
        .select()
        .from(teamSeasons)
        .where(eq(teamSeasons.id, matchup.team1SeasonId))
        .limit(1);

      const [team1] = team1Season
        ? await db
            .select()
            .from(teams)
            .where(eq(teams.id, team1Season.teamId))
            .limit(1)
        : [null];

      const [team1Owner] = team1
        ? await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, team1.ownerId))
            .limit(1)
        : [null];

      // Get team 2 details
      let team2 = null;
      let team2Owner = null;
      let team2Season = null;

      if (matchup.team2SeasonId) {
        [team2Season] = await db
          .select()
          .from(teamSeasons)
          .where(eq(teamSeasons.id, matchup.team2SeasonId))
          .limit(1);

        [team2] = team2Season
          ? await db
              .select()
              .from(teams)
              .where(eq(teams.id, team2Season.teamId))
              .limit(1)
          : [null];

        [team2Owner] = team2
          ? await db
              .select({ id: users.id, name: users.name, email: users.email })
              .from(users)
              .where(eq(users.id, team2.ownerId))
              .limit(1)
          : [null];
      }

      return {
        ...matchup,
        team1: team1
          ? {
              id: team1.id,
              name: team1.name,
              owner: team1Owner,
              seasonStats: team1Season,
            }
          : null,
        team2: team2
          ? {
              id: team2.id,
              name: team2.name,
              owner: team2Owner,
              seasonStats: team2Season,
            }
          : null,
      };
    }),

  // Create matchup (commissioner only)
  create: protectedProcedure
    .input(
      z.object({
        leagueId: z.string(),
        weekNumber: z.number().int().min(1).max(18),
        team1Id: z.string(),
        team2Id: z.string().optional(), // Optional for BYE weeks
        season: z.number().int().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get league and verify commissioner
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

      if (league.commissionerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the commissioner can create matchups',
        });
      }

      // Get league season
      const [leagueSeason] = await db
        .select()
        .from(leagueSeasons)
        .where(
          and(
            eq(leagueSeasons.leagueId, input.leagueId),
            eq(leagueSeasons.season, input.season || 2024)
          )
        )
        .limit(1);

      if (!leagueSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League season not found',
        });
      }

      // Get team1 season
      const [team1] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.team1Id))
        .limit(1);

      if (!team1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team 1 not found',
        });
      }

      const [team1Season] = await db
        .select()
        .from(teamSeasons)
        .where(
          and(
            eq(teamSeasons.teamId, team1.id),
            eq(teamSeasons.leagueSeasonId, leagueSeason.id)
          )
        )
        .limit(1);

      if (!team1Season) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team 1 season not found',
        });
      }

      // Get team2 season (if provided)
      let team2SeasonId = null;
      if (input.team2Id) {
        const [team2] = await db
          .select()
          .from(teams)
          .where(eq(teams.id, input.team2Id))
          .limit(1);

        if (!team2) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team 2 not found',
          });
        }

        const [team2Season] = await db
          .select()
          .from(teamSeasons)
          .where(
            and(
              eq(teamSeasons.teamId, team2.id),
              eq(teamSeasons.leagueSeasonId, leagueSeason.id)
            )
          )
          .limit(1);

        if (!team2Season) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team 2 season not found',
          });
        }

        team2SeasonId = team2Season.id;
      }

      // Create matchup
      const [newMatchup] = await db
        .insert(matchups)
        .values({
          leagueSeasonId: leagueSeason.id,
          weekNumber: input.weekNumber,
          team1SeasonId: team1Season.id,
          team2SeasonId: team2SeasonId,
        })
        .returning();

      return newMatchup;
    }),

  // Update matchup scores (protected - commissioner can manually override)
  updateScores: protectedProcedure
    .input(
      z.object({
        matchupId: z.string(),
        team1Score: z.number().optional(),
        team2Score: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get matchup with league info
      const [matchup] = await db
        .select({
          id: matchups.id,
          leagueSeasonId: matchups.leagueSeasonId,
          leagueId: leagueSeasons.leagueId,
          commissionerId: leagues.commissionerId,
        })
        .from(matchups)
        .innerJoin(leagueSeasons, eq(matchups.leagueSeasonId, leagueSeasons.id))
        .innerJoin(leagues, eq(leagueSeasons.leagueId, leagues.id))
        .where(eq(matchups.id, input.matchupId))
        .limit(1);

      if (!matchup) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Matchup not found',
        });
      }

      // Verify commissioner
      if (matchup.commissionerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the commissioner can update matchup scores',
        });
      }

      // Update scores
      const updateData: any = { updatedAt: new Date() };
      if (input.team1Score !== undefined) {
        updateData.team1Score = input.team1Score.toString();
      }
      if (input.team2Score !== undefined) {
        updateData.team2Score = input.team2Score.toString();
      }

      const [updated] = await db
        .update(matchups)
        .set(updateData)
        .where(eq(matchups.id, input.matchupId))
        .returning();

      return updated;
    }),
});
