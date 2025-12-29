import { builder } from '../builder';

// Hardcoded for now - will refactor to date-based logic later
const CURRENT_SEASON = 2024;
const CURRENT_WEEK = 5; // Weeks 1-4 are complete in seed data

// Define the shape of NFLSeason
type NFLSeasonShape = {
  year: number;
  currentWeek: number;
};

// NFLSeason type
const NFLSeason = builder.objectRef<NFLSeasonShape>('NFLSeason').implement({
  fields: (t) => ({
    year: t.exposeInt('year'),
    currentWeek: t.exposeInt('currentWeek'),
  }),
});

// Query to get current NFL season info (no auth required - public data)
builder.queryField('nflSeason', (t) =>
  t.field({
    type: NFLSeason,
    resolve: (): NFLSeasonShape => ({
      year: CURRENT_SEASON,
      currentWeek: CURRENT_WEEK,
    }),
  })
);
