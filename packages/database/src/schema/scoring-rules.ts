import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { leagues } from './leagues';
import { relations } from 'drizzle-orm';

// Type for scoring rules JSON structure
export type ScoringRulesJson = {
  passing?: {
    yards?: { value: number; per?: number };
    touchdowns?: { value: number; bonuses?: Array<{ condition: string; value: number }> };
    interceptions?: number;
    completions?: number;
  };
  rushing?: {
    yards?: number;
    touchdowns?: number;
    bonuses?: Array<{ condition: string; value: number }>;
  };
  receiving?: {
    receptions?: {
      default?: number;
      byPosition?: Record<string, number>; // e.g., { TE: 1.5, RB: 0.5 }
    };
    yards?: number;
    touchdowns?: number;
  };
  // Add more categories as needed
};

export const scoringRules = pgTable('scoring_rules', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  leagueId: text('league_id')
    .notNull()
    .unique()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  rules: jsonb('rules').$type<ScoringRulesJson>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const scoringRulesRelations = relations(scoringRules, ({ one }) => ({
  league: one(leagues, {
    fields: [scoringRules.leagueId],
    references: [leagues.id],
  }),
}));

export type ScoringRule = typeof scoringRules.$inferSelect;
export type NewScoringRule = typeof scoringRules.$inferInsert;
