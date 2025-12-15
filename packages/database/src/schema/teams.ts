import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { leagues } from './leagues';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const teams = pgTable('teams', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  leagueId: text('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const teamsRelations = relations(teams, ({ one }) => ({
  league: one(leagues, {
    fields: [teams.leagueId],
    references: [leagues.id],
  }),
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
}));

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
