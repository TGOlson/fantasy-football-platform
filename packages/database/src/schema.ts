import { pgTable, text, integer, timestamp, jsonb, boolean, decimal, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// USERS
// =============================================================================

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
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
// LEAGUES (Franchise Model)
// =============================================================================

export const leagues = pgTable('leagues', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  commissionerId: text('commissioner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leaguesRelations = relations(leagues, ({ one, many }) => ({
  commissioner: one(users, {
    fields: [leagues.commissionerId],
    references: [users.id],
  }),
  seasons: many(leagueSeasons),
  teams: many(teams),
}));

export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;

// =============================================================================
// LEAGUE SEASONS
// =============================================================================

export const leagueSeasons = pgTable('league_seasons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  leagueId: text('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  season: integer('season').notNull(), // Year: 2024, 2025, etc.
  status: text('status').notNull().default('setup'), // setup, active, completed, archived
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leagueSeasonsRelations = relations(leagueSeasons, ({ one, many }) => ({
  league: one(leagues, {
    fields: [leagueSeasons.leagueId],
    references: [leagues.id],
  }),
  settings: one(leagueSettings),
  teamSeasons: many(teamSeasons),
  matchups: many(matchups),
}));

export type LeagueSeason = typeof leagueSeasons.$inferSelect;
export type NewLeagueSeason = typeof leagueSeasons.$inferInsert;

// =============================================================================
// LEAGUE SETTINGS
// =============================================================================

// Type for roster positions JSON
export type RosterPositionsJson = {
  QB?: number;
  RB?: number;
  WR?: number;
  TE?: number;
  FLEX?: number;
  BENCH?: number;
  K?: number;
  DEF?: number;
};

// Import scoring rules type from @fantasy-platform/types
import type { ScoringRules } from '@fantasy-platform/types';

// Re-export for backward compatibility
export type ScoringRulesJson = ScoringRules;

export const leagueSettings = pgTable('league_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  leagueSeasonId: text('league_season_id')
    .notNull()
    .unique()
    .references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  teamCount: integer('team_count').notNull().default(10),
  rosterPositions: jsonb('roster_positions').$type<RosterPositionsJson>().notNull(),
  playoffTeams: integer('playoff_teams').notNull().default(4),
  playoffStartWeek: integer('playoff_start_week').notNull().default(15),
  tradeDeadlineWeek: integer('trade_deadline_week').notNull().default(11),
  scoringRules: jsonb('scoring_rules').$type<ScoringRulesJson>().notNull(),
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
// TEAMS (Franchise Model)
// =============================================================================

export const teams = pgTable('teams', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  leagueId: text('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // One user can only own one team per league
  uniqueOwnerPerLeague: unique().on(table.leagueId, table.ownerId),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  league: one(leagues, {
    fields: [teams.leagueId],
    references: [leagues.id],
  }),
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  teamSeasons: many(teamSeasons),
}));

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

// =============================================================================
// TEAM SEASONS
// =============================================================================

export const teamSeasons = pgTable('team_seasons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  leagueSeasonId: text('league_season_id')
    .notNull()
    .references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  finalRank: integer('final_rank'), // Nullable until season ends
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  ties: integer('ties').notNull().default(0),
  pointsFor: decimal('points_for', { precision: 10, scale: 2 }).notNull().default('0'),
  pointsAgainst: decimal('points_against', { precision: 10, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teamSeasonsRelations = relations(teamSeasons, ({ one, many }) => ({
  team: one(teams, {
    fields: [teamSeasons.teamId],
    references: [teams.id],
  }),
  leagueSeason: one(leagueSeasons, {
    fields: [teamSeasons.leagueSeasonId],
    references: [leagueSeasons.id],
  }),
  rosterPlayers: many(rosterPlayers),
  matchupsAsTeam1: many(matchups, { relationName: 'team1' }),
  matchupsAsTeam2: many(matchups, { relationName: 'team2' }),
}));

export type TeamSeason = typeof teamSeasons.$inferSelect;
export type NewTeamSeason = typeof teamSeasons.$inferInsert;

// =============================================================================
// PLAYERS
// =============================================================================

export const players = pgTable('players', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nflId: text('nfl_id').unique(), // External NFL player ID
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playersRelations = relations(players, ({ many }) => ({
  playerSeasons: many(playerSeasons),
  weeklyStats: many(playerWeeklyStats),
  rosterPlayers: many(rosterPlayers),
}));

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

// =============================================================================
// PLAYER SEASONS
// =============================================================================

export const playerSeasons = pgTable('player_seasons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  season: integer('season').notNull(),
  nflTeam: text('nfl_team').notNull(), // One of NFL_TEAMS
  position: text('position').notNull(), // One of POSITIONS
  status: text('status').notNull().default('active'), // One of PLAYER_STATUSES
  jerseyNumber: integer('jersey_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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

export const playerWeeklyStats = pgTable('player_weekly_stats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  season: integer('season').notNull(),
  weekNumber: integer('week_number').notNull(),
  // Passing stats
  passingYards: integer('passing_yards'),
  passingTds: integer('passing_tds'),
  passingInts: integer('passing_ints'),
  completions: integer('completions'),
  attempts: integer('attempts'),
  // Rushing stats
  rushingYards: integer('rushing_yards'),
  rushingTds: integer('rushing_tds'),
  rushingAttempts: integer('rushing_attempts'),
  // Receiving stats
  receptions: integer('receptions'),
  receivingYards: integer('receiving_yards'),
  receivingTds: integer('receiving_tds'),
  targets: integer('targets'),
  // Misc
  fumblesLost: integer('fumbles_lost'),
  twoPointConversions: integer('two_point_conversions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playerWeeklyStatsRelations = relations(playerWeeklyStats, ({ one }) => ({
  player: one(players, {
    fields: [playerWeeklyStats.playerId],
    references: [players.id],
  }),
}));

export type PlayerWeeklyStat = typeof playerWeeklyStats.$inferSelect;
export type NewPlayerWeeklyStat = typeof playerWeeklyStats.$inferInsert;

// =============================================================================
// ROSTER PLAYERS
// =============================================================================

export const rosterPlayers = pgTable('roster_players', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamSeasonId: text('team_season_id')
    .notNull()
    .references(() => teamSeasons.id, { onDelete: 'cascade' }),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  slotType: text('slot_type').notNull(), // One of ROSTER_SLOTS
  acquiredAt: timestamp('acquired_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rosterPlayersRelations = relations(rosterPlayers, ({ one }) => ({
  teamSeason: one(teamSeasons, {
    fields: [rosterPlayers.teamSeasonId],
    references: [teamSeasons.id],
  }),
  player: one(players, {
    fields: [rosterPlayers.playerId],
    references: [players.id],
  }),
}));

export type RosterPlayer = typeof rosterPlayers.$inferSelect;
export type NewRosterPlayer = typeof rosterPlayers.$inferInsert;

// =============================================================================
// MATCHUPS
// =============================================================================

export const matchups = pgTable('matchups', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  leagueSeasonId: text('league_season_id')
    .notNull()
    .references(() => leagueSeasons.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  team1SeasonId: text('team1_season_id')
    .notNull()
    .references(() => teamSeasons.id, { onDelete: 'cascade' }),
  team2SeasonId: text('team2_season_id')
    .references(() => teamSeasons.id, { onDelete: 'cascade' }), // Nullable for BYE weeks
  team1Score: decimal('team1_score', { precision: 10, scale: 2 }),
  team2Score: decimal('team2_score', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const matchupsRelations = relations(matchups, ({ one }) => ({
  leagueSeason: one(leagueSeasons, {
    fields: [matchups.leagueSeasonId],
    references: [leagueSeasons.id],
  }),
  team1Season: one(teamSeasons, {
    fields: [matchups.team1SeasonId],
    references: [teamSeasons.id],
    relationName: 'team1',
  }),
  team2Season: one(teamSeasons, {
    fields: [matchups.team2SeasonId],
    references: [teamSeasons.id],
    relationName: 'team2',
  }),
}));

export type Matchup = typeof matchups.$inferSelect;
export type NewMatchup = typeof matchups.$inferInsert;
