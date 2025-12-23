import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  decimal,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { RosterSlot } from '@fantasy-platform/types/roster';
import type { ScoringRules } from '@fantasy-platform/types/scoring';

// Export commonly used Drizzle operators
export {
  eq,
  and,
  or,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  like,
  desc,
  asc,
} from 'drizzle-orm';

// =============================================================================
// USERS
// =============================================================================

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  isSiteAdmin: boolean('is_site_admin').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// =============================================================================
// LEAGUES
// =============================================================================

export const leagues = pgTable('leagues', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leaguesRelations = relations(leagues, ({ many }) => ({
  franchises: many(franchises),
  seasons: many(leagueSeasons),
}));

export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;

// =============================================================================
// FRANCHISES (permanent seats in a league)
// =============================================================================

export const franchises = pgTable('franchises', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueId: text('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const franchisesRelations = relations(franchises, ({ one, many }) => ({
  league: one(leagues, {
    fields: [franchises.leagueId],
    references: [leagues.id],
  }),
  franchiseSeasons: many(franchiseSeasons),
}));

export type Franchise = typeof franchises.$inferSelect;
export type NewFranchise = typeof franchises.$inferInsert;

// =============================================================================
// LEAGUE SEASONS
// =============================================================================

export const leagueSeasons = pgTable('league_seasons', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueId: text('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  status: text('status').notNull(), // setup, active, completed, archived, TODO: enum?
  commissionerId: text('commissioner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leagueSeasonsRelations = relations(
  leagueSeasons,
  ({ one, many }) => ({
    league: one(leagues, {
      fields: [leagueSeasons.leagueId],
      references: [leagues.id],
    }),
    commissioner: one(users, {
      fields: [leagueSeasons.commissionerId],
      references: [users.id],
    }),
    settings: one(leagueSettings),
    franchiseSeasons: many(franchiseSeasons),
    matchups: many(matchups),
  })
);

export type LeagueSeason = typeof leagueSeasons.$inferSelect;
export type NewLeagueSeason = typeof leagueSeasons.$inferInsert;

// =============================================================================
// LEAGUE SETTINGS
// =============================================================================

export const leagueSettings = pgTable('league_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueSeasonId: text('league_season_id')
    .notNull()
    .unique()
    .references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  scoringRules: jsonb('scoring_rules').$type<ScoringRules>().notNull(),
  rosterSlots: jsonb('roster_slots').$type<RosterSlot[]>().notNull(),
  // TODO: max number of a position on roster
  playoffTeams: integer('playoff_teams').notNull(),
  playoffStartWeek: integer('playoff_start_week').notNull(),
  tradeDeadlineWeek: integer('trade_deadline_week').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leagueSettingsRelations = relations(leagueSettings, ({ one }) => ({
  leagueSeason: one(leagueSeasons, {
    fields: [leagueSettings.leagueSeasonId],
    references: [leagueSeasons.id],
  }),
}));

export type LeagueSettings = typeof leagueSettings.$inferSelect;
export type NewLeagueSettings = typeof leagueSettings.$inferInsert;

// =============================================================================
// FRANCHISE SEASONS (a franchise's participation in a specific year)
// =============================================================================

export const franchiseSeasons = pgTable(
  'franchise_seasons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    franchiseId: text('franchise_id')
      .notNull()
      .references(() => franchises.id, { onDelete: 'cascade' }),
    leagueSeasonId: text('league_season_id')
      .notNull()
      .references(() => leagueSeasons.id, { onDelete: 'cascade' }),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Cached standings data
    wins: integer('wins').notNull().default(0),
    losses: integer('losses').notNull().default(0),
    ties: integer('ties').notNull().default(0),
    pointsFor: decimal('points_for', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    pointsAgainst: decimal('points_against', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueFranchisePerSeason: unique().on(
      table.franchiseId,
      table.leagueSeasonId
    ),
  })
);

export const franchiseSeasonsRelations = relations(
  franchiseSeasons,
  ({ one, many }) => ({
    franchise: one(franchises, {
      fields: [franchiseSeasons.franchiseId],
      references: [franchises.id],
    }),
    leagueSeason: one(leagueSeasons, {
      fields: [franchiseSeasons.leagueSeasonId],
      references: [leagueSeasons.id],
    }),
    owner: one(users, {
      fields: [franchiseSeasons.ownerId],
      references: [users.id],
    }),
    weeklyLineups: many(weeklyLineups),
    homeMatchups: many(matchups, { relationName: 'home' }),
    awayMatchups: many(matchups, { relationName: 'away' }),
    transactions: many(rosterTransactions),
  })
);

export type FranchiseSeason = typeof franchiseSeasons.$inferSelect;
export type NewFranchiseSeason = typeof franchiseSeasons.$inferInsert;

// =============================================================================
// MATCHUPS
// =============================================================================

export const matchups = pgTable('matchups', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueSeasonId: text('league_season_id')
    .notNull()
    .references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  homeFranchiseSeasonId: text('home_franchise_season_id')
    .notNull()
    .references(() => franchiseSeasons.id, { onDelete: 'cascade' }),
  awayFranchiseSeasonId: text('away_franchise_season_id').references(
    () => franchiseSeasons.id,
    {
      onDelete: 'cascade',
    }
  ), // Nullable for BYE weeks
  homeScore: decimal('home_score', { precision: 10, scale: 2 }),
  awayScore: decimal('away_score', { precision: 10, scale: 2 }),
  isPlayoff: boolean('is_playoff').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const matchupsRelations = relations(matchups, ({ one }) => ({
  leagueSeason: one(leagueSeasons, {
    fields: [matchups.leagueSeasonId],
    references: [leagueSeasons.id],
  }),
  homeFranchiseSeason: one(franchiseSeasons, {
    fields: [matchups.homeFranchiseSeasonId],
    references: [franchiseSeasons.id],
    relationName: 'home',
  }),
  awayFranchiseSeason: one(franchiseSeasons, {
    fields: [matchups.awayFranchiseSeasonId],
    references: [franchiseSeasons.id],
    relationName: 'away',
  }),
}));

export type Matchup = typeof matchups.$inferSelect;
export type NewMatchup = typeof matchups.$inferInsert;

// =============================================================================
// WEEKLY LINEUPS
// =============================================================================

export const weeklyLineups = pgTable(
  'weekly_lineups',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    franchiseSeasonId: text('franchise_season_id')
      .notNull()
      .references(() => franchiseSeasons.id, { onDelete: 'cascade' }),
    weekNumber: integer('week_number').notNull(),
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    rosterSlotIndex: integer('roster_slot_index').notNull(),
    pointsScored: decimal('points_scored', { precision: 10, scale: 2 }), // Cached
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniquePlayerPerWeek: unique().on(
      table.franchiseSeasonId,
      table.weekNumber,
      table.playerId
    ),
  })
);

export const weeklyLineupsRelations = relations(weeklyLineups, ({ one }) => ({
  franchiseSeason: one(franchiseSeasons, {
    fields: [weeklyLineups.franchiseSeasonId],
    references: [franchiseSeasons.id],
  }),
  player: one(players, {
    fields: [weeklyLineups.playerId],
    references: [players.id],
  }),
}));

export type WeeklyLineup = typeof weeklyLineups.$inferSelect;
export type NewWeeklyLineup = typeof weeklyLineups.$inferInsert;

// =============================================================================
// PLAYERS
// =============================================================================

export const players = pgTable('players', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nflId: text('nfl_id').unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playersRelations = relations(players, ({ many }) => ({
  playerSeasons: many(playerSeasons),
  weeklyStats: many(playerWeeklyStats),
  weeklyProjections: many(playerWeeklyProjections),
  weeklyLineups: many(weeklyLineups),
}));

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

// =============================================================================
// PLAYER SEASONS
// =============================================================================

export const playerSeasons = pgTable(
  'player_seasons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    season: integer('season').notNull(),
    nflTeam: text('nfl_team').notNull(),
    // position: pgEnum('position', POSITIONS), // QB, RB, WR, TE, K, DEF
    position: text('position').notNull(), // QB, RB, WR, TE, K, DEF
    status: text('status').notNull(),
    jerseyNumber: integer('jersey_number'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniquePlayerSeason: unique().on(table.playerId, table.season),
  })
);

export const playerSeasonsRelations = relations(playerSeasons, ({ one }) => ({
  player: one(players, {
    fields: [playerSeasons.playerId],
    references: [players.id],
  }),
}));

export type PlayerSeason = typeof playerSeasons.$inferSelect;
export type NewPlayerSeason = typeof playerSeasons.$inferInsert;

// =============================================================================
// PLAYER WEEKLY STATS
// =============================================================================

export const playerWeeklyStats = pgTable(
  'player_weekly_stats',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    season: integer('season').notNull(),
    weekNumber: integer('week_number').notNull(),
    // Passing
    passingYards: integer('passing_yards'),
    passingTds: integer('passing_tds'),
    passingInts: integer('passing_ints'),
    completions: integer('completions'),
    attempts: integer('attempts'),
    // Rushing
    rushingYards: integer('rushing_yards'),
    rushingTds: integer('rushing_tds'),
    rushingAttempts: integer('rushing_attempts'),
    // Receiving
    receptions: integer('receptions'),
    receivingYards: integer('receiving_yards'),
    receivingTds: integer('receiving_tds'),
    targets: integer('targets'),
    // Misc
    fumblesLost: integer('fumbles_lost'),
    twoPointConversions: integer('two_point_conversions'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniquePlayerWeek: unique().on(
      table.playerId,
      table.season,
      table.weekNumber
    ),
  })
);

export const playerWeeklyStatsRelations = relations(
  playerWeeklyStats,
  ({ one }) => ({
    player: one(players, {
      fields: [playerWeeklyStats.playerId],
      references: [players.id],
    }),
  })
);

export type PlayerWeeklyStat = typeof playerWeeklyStats.$inferSelect;
export type NewPlayerWeeklyStat = typeof playerWeeklyStats.$inferInsert;

// =============================================================================
// PLAYER WEEKLY PROJECTIONS
// =============================================================================

export type ProjectedStatsJson = {
  passingYards?: number;
  passingTds?: number;
  rushingYards?: number;
  rushingTds?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTds?: number;
};

export const playerWeeklyProjections = pgTable(
  'player_weekly_projections',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    season: integer('season').notNull(),
    weekNumber: integer('week_number').notNull(),
    projectedPoints: decimal('projected_points', {
      precision: 10,
      scale: 2,
    }).notNull(),
    projectedStats: jsonb('projected_stats').$type<ProjectedStatsJson>(),
    source: text('source').notNull(), // 'espn', 'fantasypros', 'numberfire', etc.
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniquePlayerWeekSource: unique().on(
      table.playerId,
      table.season,
      table.weekNumber,
      table.source
    ),
  })
);

export const playerWeeklyProjectionsRelations = relations(
  playerWeeklyProjections,
  ({ one }) => ({
    player: one(players, {
      fields: [playerWeeklyProjections.playerId],
      references: [players.id],
    }),
  })
);

export type PlayerWeeklyProjection =
  typeof playerWeeklyProjections.$inferSelect;
export type NewPlayerWeeklyProjection =
  typeof playerWeeklyProjections.$inferInsert;

// =============================================================================
// NFL GAMES
// =============================================================================

export const nflGames = pgTable(
  'nfl_games',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    season: integer('season').notNull(),
    weekNumber: integer('week_number').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    kickoffAt: timestamp('kickoff_at').notNull(),
    homeScore: integer('home_score'),
    awayScore: integer('away_score'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueGame: unique().on(
      table.season,
      table.weekNumber,
      table.homeTeam,
      table.awayTeam
    ),
  })
);

export type NflGame = typeof nflGames.$inferSelect;
export type NewNflGame = typeof nflGames.$inferInsert;

// =============================================================================
// ROSTER TRANSACTIONS
// =============================================================================

export type TransactionDetailsJson = {
  // For trades
  otherFranchiseSeasonId?: string;
  sentPlayerIds?: string[];
  receivedPlayerIds?: string[];
  // For waivers
  bidAmount?: number;
  waiverPriority?: number;
  // For draft
  round?: number;
  pick?: number;
  draftId?: string;
};

export const rosterTransactions = pgTable('roster_transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueSeasonId: text('league_season_id')
    .notNull()
    .references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  franchiseSeasonId: text('franchise_season_id')
    .notNull()
    .references(() => franchiseSeasons.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'add', 'drop', 'trade', 'waiver', 'draft'
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  details: jsonb('details').$type<TransactionDetailsJson>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rosterTransactionsRelations = relations(
  rosterTransactions,
  ({ one }) => ({
    leagueSeason: one(leagueSeasons, {
      fields: [rosterTransactions.leagueSeasonId],
      references: [leagueSeasons.id],
    }),
    franchiseSeason: one(franchiseSeasons, {
      fields: [rosterTransactions.franchiseSeasonId],
      references: [franchiseSeasons.id],
    }),
    player: one(players, {
      fields: [rosterTransactions.playerId],
      references: [players.id],
    }),
  })
);

export type RosterTransaction = typeof rosterTransactions.$inferSelect;
export type NewRosterTransaction = typeof rosterTransactions.$inferInsert;
