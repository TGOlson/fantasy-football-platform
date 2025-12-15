import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  // NFL player info
  nflId: text('nfl_id').unique(), // External NFL player ID
  name: text('name').notNull(),
  position: text('position').notNull(), // QB, RB, WR, TE, K, DEF
  team: text('team'), // NFL team abbreviation (e.g., KC, SF)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
