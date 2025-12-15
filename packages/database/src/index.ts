import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

// Lazy singleton pattern - only creates connection when first called
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabase() {
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
export * from './schema/index.js';

// Export commonly used Drizzle operators
export { eq, and, or, ne, gt, gte, lt, lte, isNull, isNotNull, inArray, notInArray, like, desc, asc } from 'drizzle-orm';
