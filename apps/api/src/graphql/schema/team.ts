import { builder } from '../builder';

// Franchise type
builder.prismaObject('Franchise', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    league: t.relation('league'),
    teams: t.relation('teams'),
  }),
});

// Team type
builder.prismaObject('Team', {
  fields: (t) => ({
    id: t.exposeID('id'),
    wins: t.exposeInt('wins'),
    losses: t.exposeInt('losses'),
    ties: t.exposeInt('ties'),
    pointsFor: t.field({
      type: 'Float',
      resolve: (team) => team.pointsFor.toNumber(),
    }),
    pointsAgainst: t.field({
      type: 'Float',
      resolve: (team) => team.pointsAgainst.toNumber(),
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    franchise: t.relation('franchise'),
    leagueSeason: t.relation('leagueSeason'),
    owner: t.relation('owner'),
  }),
});
