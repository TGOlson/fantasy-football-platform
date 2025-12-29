import { builder } from '../builder';

// Player type
builder.prismaObject('Player', {
  fields: (t) => ({
    id: t.exposeID('id'),
    nflId: t.exposeString('nflId'),
    name: t.exposeString('name'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

// Franchise type
builder.prismaObject('Franchise', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    league: t.relation('league'),
    teams: t.relation('teams'),
  }),
});

// Matchup type
builder.prismaObject('Matchup', {
  fields: (t) => ({
    id: t.exposeID('id'),
    weekNumber: t.exposeInt('weekNumber'),
    homeScore: t.field({
      type: 'Float',
      resolve: (matchup) => matchup.homeScore.toNumber(),
    }),
    awayScore: t.field({
      type: 'Float',
      resolve: (matchup) => matchup.awayScore.toNumber(),
    }),
    isPlayoff: t.exposeBoolean('isPlayoff'),
    completedAt: t.expose('completedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    homeTeam: t.relation('homeTeam'),
    awayTeam: t.relation('awayTeam', { nullable: true }), // Nullable for BYE weeks
  }),
});

// WeeklyLineup type
builder.prismaObject('WeeklyLineup', {
  fields: (t) => ({
    id: t.exposeID('id'),
    weekNumber: t.exposeInt('weekNumber'),
    rosterSlotIndex: t.exposeInt('rosterSlotIndex'),
    pointsScored: t.field({
      type: 'Float',
      resolve: (lineup) => lineup.pointsScored.toNumber(),
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    team: t.relation('team'),
    player: t.relation('player'),
  }),
});

// Team type
builder.prismaObject('Team', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
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
