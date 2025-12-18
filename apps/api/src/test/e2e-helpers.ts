import { getDatabase, type DBClient, users } from '@fantasy-platform/database';
import { appRouter } from '../trpc/router';
import type { Context } from '../trpc/context';
import { hashPassword, signToken } from '../lib/auth';

// ============================================================================
// Types
// ============================================================================

export type TestUser = {
  id: string;
  email: string;
  name: string;
  token: string;
};

// ============================================================================
// Transaction wrapper
// ============================================================================

class RollbackError extends Error {
  constructor() {
    super('Transaction rollback');
    this.name = 'RollbackError';
  }
}

/**
 * Run a test within a database transaction that automatically rolls back.
 * Pass the db to utility functions to create callers, users, etc.
 *
 * @example
 * ```ts
 * it('should register a new user', () => withTestTransaction(async (db) => {
 *   const caller = createCaller(db);
 *   const result = await caller.auth.register({
 *     email: 'test@example.com',
 *     password: 'password123',
 *     name: 'Test User',
 *   });
 *   expect(result.user.email).toBe('test@example.com');
 * }));
 * ```
 */
export async function withTestTransaction(
  fn: (db: DBClient) => Promise<void>
): Promise<void> {
  const db = getDatabase();

  try {
    await db.transaction(async (tx) => {
      await fn(tx as unknown as DBClient);
      throw new RollbackError();
    });
  } catch (error) {
    if (error instanceof RollbackError) return;
    throw error;
  }
}

// ============================================================================
// Utilities - pass db from withTestTransaction
// ============================================================================

/**
 * Create an unauthenticated tRPC caller
 */
export function createCaller(db: DBClient) {
  const ctx: Context = { db, req: {} as any, res: {} as any, user: null };
  return appRouter.createCaller(ctx);
}

/**
 * Create an authenticated tRPC caller for a test user
 */
export function createAuthedCaller(db: DBClient, user: TestUser) {
  const ctx: Context = {
    db,
    req: {} as any,
    res: {} as any,
    user: { userId: user.id, email: user.email },
  };
  return appRouter.createCaller(ctx);
}

/**
 * Create a test user directly in the database
 */
export async function createTestUser(
  db: DBClient,
  data: { email: string; name: string; password: string }
): Promise<TestUser> {
  const passwordHash = await hashPassword(data.password);
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name,
      passwordHash,
    })
    .returning();

  const token = signToken({ userId: user.id, email: user.email });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    token,
  };
}
