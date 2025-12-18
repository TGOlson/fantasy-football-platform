import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database client type - use this for typing db parameters
export type DBClient = ReturnType<typeof drizzle<typeof schema>>;

// Lazy singleton pattern - only creates connection when first called
let dbInstance: DBClient | null = null;

export function getDatabase(): DBClient {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = postgres(connectionString);
  dbInstance = drizzle(client, { schema });

  return dbInstance;
}

// Export all schema and types
export * from './schema';

// Export utility functions
export { slugify, generateUniqueSlug } from './lib/slug';

// Re-export constants from types package
export {
  NFL_TEAMS,
  POSITIONS,
  ROSTER_SLOTS,
  PLAYER_STATUSES,
  CURRENT_SEASON,
} from '@fantasy-platform/types';

export type {
  NflTeam,
  Position,
  RosterSlot,
  PlayerStatus,
} from '@fantasy-platform/types';

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
