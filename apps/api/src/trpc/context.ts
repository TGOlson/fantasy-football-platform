import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { getDatabase } from '@fantasy-platform/database';
import { verifyToken } from '../lib/auth';

// Context is created for each request
export function createContext({ req, res }: CreateExpressContextOptions) {
  // Get database connection (lazy singleton)
  const db = getDatabase();

  // Extract and verify JWT token from Authorization header
  const authHeader = req.headers.authorization;
  let user: { userId: string; email: string } | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded) {
      user = decoded;
    }
  }

  return {
    db,
    req,
    res,
    user, // Will be null if no valid token
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
