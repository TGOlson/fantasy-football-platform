import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { getDatabase, teams, users, leagues, eq } from '@fantasy-platform/database';

export const teamsRouter = router({
  // Get team by ID with roster
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      // Get the team
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id))
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

      // TODO: Get roster when roster table is implemented
      const roster: never[] = [];

      return {
        ...team,
        owner: owner || null,
        league: league || null,
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

      // Check if team exists
      const [existingTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id))
        .limit(1);

      if (!existingTeam) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
        });
      }

      // Verify the user owns this team
      if (existingTeam.ownerId !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this team',
        });
      }

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

  // Get all teams in a league
  getByLeague: publicProcedure
    .input(z.object({ leagueId: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      // Get all teams for this league
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      // Get owner info for each team
      const teamsWithOwners = await Promise.all(
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

          return {
            ...team,
            owner: owner || null,
          };
        })
      );

      return teamsWithOwners;
    }),
});
