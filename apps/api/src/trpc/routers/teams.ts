import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { requireLeagueMembership, requireTeamOwnership } from '../../lib/auth.js';
import {
  getDatabase,
  teams,
  teamSeasons,
  users,
  leagues,
  leagueSeasons,
  rosterPlayers,
  players,
  playerSeasons,
  eq,
  and,
  desc,
} from '@fantasy-platform/database';

export const teamsRouter = router({
  // Get team by ID with roster for current season (requires league membership)
  getById: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        season: z.number().int().optional(), // Defaults to most recent season
      })
    )
    .query(async ({ input, ctx }) => {
      const db = getDatabase();

      // Verify league membership
      await requireLeagueMembership(ctx.user.userId, { teamId: input.teamId });

      // Get the team
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId))
        .limit(1);

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Get owner info
      const [owner] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, team.ownerId))
        .limit(1);

      // Get league info
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, team.leagueId))
        .limit(1);

      // Get the team season (most recent if no season specified)
      let teamSeasonData;
      if (input.season) {
        // Get specific season
        const [leagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(
            and(
              eq(leagueSeasons.leagueId, team.leagueId),
              eq(leagueSeasons.season, input.season)
            )
          )
          .limit(1);

        if (leagueSeason) {
          [teamSeasonData] = await db
            .select()
            .from(teamSeasons)
            .where(
              and(
                eq(teamSeasons.teamId, team.id),
                eq(teamSeasons.leagueSeasonId, leagueSeason.id)
              )
            )
            .limit(1);
        }
      } else {
        // Get most recent season
        const [recentLeagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(eq(leagueSeasons.leagueId, team.leagueId))
          .orderBy(desc(leagueSeasons.season))
          .limit(1);

        if (recentLeagueSeason) {
          [teamSeasonData] = await db
            .select()
            .from(teamSeasons)
            .where(
              and(
                eq(teamSeasons.teamId, team.id),
                eq(teamSeasons.leagueSeasonId, recentLeagueSeason.id)
              )
            )
            .limit(1);
        }
      }

      // Get roster if team season exists
      let roster: any[] = [];
      if (teamSeasonData) {
        const rosterData = await db
          .select({
            id: rosterPlayers.id,
            slotType: rosterPlayers.slotType,
            acquiredAt: rosterPlayers.acquiredAt,
            playerId: players.id,
            playerName: players.name,
            playerNflId: players.nflId,
            position: playerSeasons.position,
            nflTeam: playerSeasons.nflTeam,
          })
          .from(rosterPlayers)
          .innerJoin(players, eq(rosterPlayers.playerId, players.id))
          .leftJoin(
            playerSeasons,
            and(
              eq(players.id, playerSeasons.playerId),
              eq(playerSeasons.season, 2024) // TODO: Make dynamic based on league season
            )
          )
          .where(eq(rosterPlayers.teamSeasonId, teamSeasonData.id));

        roster = rosterData;
      }

      return {
        ...team,
        owner: owner || null,
        league: league || null,
        teamSeason: teamSeasonData || null,
        roster,
      };
    }),

  // Update team name (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Team name is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Verify team ownership
      await requireTeamOwnership(ctx.user.userId, input.id);

      // Update the team
      const [updatedTeam] = await db
        .update(teams)
        .set({
          name: input.name,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, input.id))
        .returning();

      return {
        id: updatedTeam.id,
        name: updatedTeam.name,
        leagueId: updatedTeam.leagueId,
        ownerId: updatedTeam.ownerId,
        createdAt: updatedTeam.createdAt,
        updatedAt: updatedTeam.updatedAt,
      };
    }),

  // Get all teams in a league for a specific season
  getByLeague: publicProcedure
    .input(
      z.object({
        leagueId: z.string(),
        season: z.number().int().optional(), // Defaults to most recent
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      // Get all teams for this league
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      // Get season
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
        [leagueSeason] = await db
          .select()
          .from(leagueSeasons)
          .where(eq(leagueSeasons.leagueId, input.leagueId))
          .orderBy(desc(leagueSeasons.season))
          .limit(1);
      }

      // Get owner info and team season for each team
      const teamsWithDetails = await Promise.all(
        leagueTeams.map(async (team) => {
          const [owner] = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(eq(users.id, team.ownerId))
            .limit(1);

          // Get team season if league season exists
          let teamSeasonData = null;
          if (leagueSeason) {
            [teamSeasonData] = await db
              .select()
              .from(teamSeasons)
              .where(
                and(
                  eq(teamSeasons.teamId, team.id),
                  eq(teamSeasons.leagueSeasonId, leagueSeason.id)
                )
              )
              .limit(1);
          }

          return {
            ...team,
            owner: owner || null,
            teamSeason: teamSeasonData,
          };
        })
      );

      return teamsWithDetails;
    }),
});
