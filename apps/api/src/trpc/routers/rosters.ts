import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  getDatabase,
  rosterPlayers,
  teamSeasons,
  teams,
  players,
  playerSeasons,
  leagueSeasons,
  eq,
  and,
  desc,
} from '@fantasy-platform/database';

export const rostersRouter = router({
  // Get roster for a team (specific season)
  getByTeam: publicProcedure
    .input(
      z.object({
        teamId: z.string(),
        season: z.number().int().optional(), // Defaults to most recent
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

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

      // Get the team season
      let teamSeasonData;
      if (input.season) {
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

      if (!teamSeasonData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team season not found',
        });
      }

      // Get roster with player details
      const roster = await db
        .select({
          id: rosterPlayers.id,
          slotType: rosterPlayers.slotType,
          acquiredAt: rosterPlayers.acquiredAt,
          playerId: players.id,
          playerName: players.name,
          playerNflId: players.nflId,
          position: playerSeasons.position,
          nflTeam: playerSeasons.nflTeam,
          status: playerSeasons.status,
        })
        .from(rosterPlayers)
        .innerJoin(players, eq(rosterPlayers.playerId, players.id))
        .leftJoin(
          playerSeasons,
          and(
            eq(players.id, playerSeasons.playerId),
            eq(playerSeasons.season, input.season || 2024)
          )
        )
        .where(eq(rosterPlayers.teamSeasonId, teamSeasonData.id));

      return roster;
    }),

  // Add player to roster (protected)
  addPlayer: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        playerId: z.string(),
        slotType: z.enum(['QB', 'RB', 'WR', 'TE', 'FLEX', 'BENCH', 'K', 'DEF']),
        season: z.number().int().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

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

      // Verify ownership
      if (team.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this team',
        });
      }

      // Get team season
      const [leagueSeason] = await db
        .select()
        .from(leagueSeasons)
        .where(
          and(
            eq(leagueSeasons.leagueId, team.leagueId),
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

      const [teamSeason] = await db
        .select()
        .from(teamSeasons)
        .where(
          and(
            eq(teamSeasons.teamId, team.id),
            eq(teamSeasons.leagueSeasonId, leagueSeason.id)
          )
        )
        .limit(1);

      if (!teamSeason) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team season not found',
        });
      }

      // Check if player already on roster
      const [existingRosterPlayer] = await db
        .select()
        .from(rosterPlayers)
        .where(
          and(
            eq(rosterPlayers.teamSeasonId, teamSeason.id),
            eq(rosterPlayers.playerId, input.playerId)
          )
        )
        .limit(1);

      if (existingRosterPlayer) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Player already on roster',
        });
      }

      // Add player to roster
      const [newRosterPlayer] = await db
        .insert(rosterPlayers)
        .values({
          teamSeasonId: teamSeason.id,
          playerId: input.playerId,
          slotType: input.slotType,
        })
        .returning();

      return newRosterPlayer;
    }),

  // Remove player from roster (protected)
  removePlayer: protectedProcedure
    .input(
      z.object({
        rosterPlayerId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get roster player with team info
      const [rosterPlayer] = await db
        .select({
          id: rosterPlayers.id,
          teamSeasonId: rosterPlayers.teamSeasonId,
          teamId: teamSeasons.teamId,
          ownerId: teams.ownerId,
        })
        .from(rosterPlayers)
        .innerJoin(teamSeasons, eq(rosterPlayers.teamSeasonId, teamSeasons.id))
        .innerJoin(teams, eq(teamSeasons.teamId, teams.id))
        .where(eq(rosterPlayers.id, input.rosterPlayerId))
        .limit(1);

      if (!rosterPlayer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Roster player not found',
        });
      }

      // Verify ownership
      if (rosterPlayer.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this team',
        });
      }

      // Remove from roster
      await db.delete(rosterPlayers).where(eq(rosterPlayers.id, input.rosterPlayerId));

      return { success: true };
    }),

  // Update player lineup position (protected)
  updateSlot: protectedProcedure
    .input(
      z.object({
        rosterPlayerId: z.string(),
        slotType: z.enum(['QB', 'RB', 'WR', 'TE', 'FLEX', 'BENCH', 'K', 'DEF']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get roster player with team info
      const [rosterPlayer] = await db
        .select({
          id: rosterPlayers.id,
          teamSeasonId: rosterPlayers.teamSeasonId,
          teamId: teamSeasons.teamId,
          ownerId: teams.ownerId,
        })
        .from(rosterPlayers)
        .innerJoin(teamSeasons, eq(rosterPlayers.teamSeasonId, teamSeasons.id))
        .innerJoin(teams, eq(teamSeasons.teamId, teams.id))
        .where(eq(rosterPlayers.id, input.rosterPlayerId))
        .limit(1);

      if (!rosterPlayer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Roster player not found',
        });
      }

      // Verify ownership
      if (rosterPlayer.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this team',
        });
      }

      // Update slot type
      const [updated] = await db
        .update(rosterPlayers)
        .set({
          slotType: input.slotType,
          updatedAt: new Date(),
        })
        .where(eq(rosterPlayers.id, input.rosterPlayerId))
        .returning();

      return updated;
    }),
});
