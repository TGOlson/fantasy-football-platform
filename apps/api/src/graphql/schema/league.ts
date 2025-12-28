import { builder } from '../builder';

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
