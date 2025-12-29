import { builder } from '../builder';
import { requireLeagueAccess } from '../../lib/league-auth';

// SeasonStatus enum
export const SeasonStatus = builder.enumType('SeasonStatus', {
  values: ['SETUP', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const,
});

// LeagueSeason type
builder.prismaObject('LeagueSeason', {
  fields: (t) => ({
    id: t.exposeID('id'),
    year: t.exposeInt('year'),
    status: t.expose('status', { type: SeasonStatus }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    league: t.relation('league'),
    commissioner: t.relation('commissioner'),
    teams: t.relation('teams'),
  }),
});

// League type with currentSeason field
builder.prismaObject('League', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    seasons: t.relation('seasons'),
    franchises: t.relation('franchises'),
    // Custom field for most recent season
    currentSeason: t.prismaField({
      type: 'LeagueSeason',
      nullable: true,
      resolve: async (query, league, args, ctx) => {
        return ctx.prisma.leagueSeason.findFirst({
          ...query,
          where: { leagueId: league.id },
          orderBy: { year: 'desc' },
        });
      },
    }),
    // Custom field for a specific season by year
    season: t.prismaField({
      type: 'LeagueSeason',
      nullable: true,
      args: {
        year: t.arg.int({ required: true }),
      },
      resolve: async (query, league, args, ctx) => {
        return ctx.prisma.leagueSeason.findFirst({
          ...query,
          where: {
            leagueId: league.id,
            year: args.year,
          },
        });
      },
    }),
    // Team lookup within league
    team: t.prismaField({
      type: 'Team',
      nullable: true,
      args: {
        teamId: t.arg.id({ required: true }),
      },
      resolve: async (query, league, args, ctx) => {
        // Find team that belongs to this league
        return ctx.prisma.team.findFirst({
          ...query,
          where: {
            id: args.teamId,
            franchise: {
              leagueId: league.id,
            },
          },
        });
      },
    }),
    // Matchup lookup for a team in a specific week
    matchup: t.prismaField({
      type: 'Matchup',
      nullable: true,
      args: {
        teamId: t.arg.id({ required: true }),
        weekNumber: t.arg.int({ required: true }),
      },
      resolve: async (query, league, args, ctx) => {
        // Find the team's league season first
        const team = await ctx.prisma.team.findFirst({
          where: {
            id: args.teamId,
            franchise: { leagueId: league.id },
          },
        });

        if (!team) {
          return null;
        }

        // Find matchup where this team is either home or away
        return ctx.prisma.matchup.findFirst({
          ...query,
          where: {
            leagueSeasonId: team.leagueSeasonId,
            weekNumber: args.weekNumber,
            OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
          },
        });
      },
    }),
    // Weekly lineups for a team
    weeklyLineups: t.prismaField({
      type: ['WeeklyLineup'],
      args: {
        teamId: t.arg.id({ required: true }),
        weekNumber: t.arg.int({ required: true }),
      },
      resolve: async (query, league, args, ctx) => {
        // Verify team belongs to this league
        const team = await ctx.prisma.team.findFirst({
          where: {
            id: args.teamId,
            franchise: { leagueId: league.id },
          },
        });

        if (!team) {
          return [];
        }

        return ctx.prisma.weeklyLineup.findMany({
          ...query,
          where: {
            teamId: args.teamId,
            weekNumber: args.weekNumber,
          },
          orderBy: { rosterSlotIndex: 'asc' },
        });
      },
    }),
    // Current user's team in this league
    myTeam: t.prismaField({
      type: 'Team',
      nullable: true,
      resolve: async (query, league, args, ctx) => {
        if (!ctx.user) {
          return null;
        }

        return ctx.prisma.team.findFirst({
          ...query,
          where: {
            ownerId: ctx.user.userId,
            franchise: {
              leagueId: league.id,
            },
          },
        });
      },
    }),
  }),
});

// Query to get current user's leagues
builder.queryField('myLeagues', (t) =>
  t.prismaField({
    type: ['League'],
    authScopes: { loggedIn: true },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

      // Get all teams owned by this user
      const userTeams = await ctx.prisma.team.findMany({
        where: { ownerId: ctx.user.userId },
        include: {
          franchise: {
            include: {
              league: true,
            },
          },
        },
      });

      // Get unique league IDs
      const leagueIds = [
        ...new Set(userTeams.map((t) => t.franchise.leagueId)),
      ];

      if (leagueIds.length === 0) {
        return [];
      }

      // Fetch leagues
      return ctx.prisma.league.findMany({
        ...query,
        where: { id: { in: leagueIds } },
        orderBy: { name: 'asc' },
      });
    },
  })
);

// Query to get a specific league by slug
builder.queryField('league', (t) =>
  t.prismaField({
    type: 'League',
    nullable: true,
    authScopes: { loggedIn: true },
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

      // Find league by slug
      const league = await ctx.prisma.league.findUnique({
        where: { slug: args.slug },
      });

      if (!league) {
        return null;
      }

      // Check if user has access to this league
      await requireLeagueAccess(ctx.prisma, ctx.user.userId, league.id);

      // Return the league (Pothos will handle nested queries)
      return ctx.prisma.league.findUnique({
        ...query,
        where: { id: league.id },
      });
    },
  })
);
