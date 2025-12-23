import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT token payload
export type JwtPayload = {
  userId: string;
  email: string;
};

// Lazy getter for JWT_SECRET (only check when needed, after env is loaded)
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Generate a JWT token for a user
 */
export function signToken(payload: JwtPayload): string {
  const secret = getJwtSecret();

  // TODO: this type is kind of wrong, it should be ms.StringValue but can't figure out how to import it
  const expiresIn = (process.env.JWT_EXPIRES_IN as `${number}`) || '7d';

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return decoded;
  } catch (_error) {
    return null;
  }
}

/**
 * Hash a password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================================================
// AUTH HELPERS
// ============================================================================
import { type DBClient } from '@fantasy-platform/database/client';
import {
  franchises,
  franchiseSeasons,
  leagueSeasons,
  eq,
  and,
  users,
} from '@fantasy-platform/database/schema';
import { TRPCError } from '@trpc/server';

/**
 * Check if a user is a member of a league (owns a franchise in the league)
 */
export async function checkLeagueMembership(
  db: DBClient,
  userId: string,
  leagueId: string
): Promise<boolean> {
  // Check if user owns any franchise in this league
  const [franchise] = await db
    .select()
    .from(franchises)
    .where(eq(franchises.leagueId, leagueId))
    .limit(1);

  if (!franchise) return false;

  // Check if user owns a franchise season in this league
  const [fs] = await db
    .select()
    .from(franchiseSeasons)
    .innerJoin(franchises, eq(franchiseSeasons.franchiseId, franchises.id))
    .where(
      and(
        eq(franchises.leagueId, leagueId),
        eq(franchiseSeasons.ownerId, userId)
      )
    )
    .limit(1);

  return !!fs;
}

/**
 * Check if a user owns a specific franchise (in any season)
 */
export async function checkFranchiseOwnership(
  db: DBClient,
  userId: string,
  franchiseId: string
): Promise<boolean> {
  const [fs] = await db
    .select()
    .from(franchiseSeasons)
    .where(
      and(
        eq(franchiseSeasons.franchiseId, franchiseId),
        eq(franchiseSeasons.ownerId, userId)
      )
    )
    .limit(1);

  return !!fs;
}

/**
 * Check if a user is a league admin (commissioner for any season)
 */
export async function checkLeagueAdmin(
  db: DBClient,
  userId: string,
  leagueId: string
): Promise<boolean> {
  const [season] = await db
    .select()
    .from(leagueSeasons)
    .where(
      and(
        eq(leagueSeasons.leagueId, leagueId),
        eq(leagueSeasons.commissionerId, userId)
      )
    )
    .limit(1);

  return !!season;
}

/**
 * Check if a user is a site admin
 */
export async function checkSiteAdmin(
  db: DBClient,
  userId: string
): Promise<boolean> {
  const [user] = await db
    .select({ isSiteAdmin: users.isSiteAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.isSiteAdmin ?? false;
}

// ============================================================================
// AUTHORIZATION HELPERS (throw TRPCError on failure)
// ============================================================================

type LeagueIdentifiers = {
  leagueId?: string;
  leagueSeasonId?: string;
  franchiseId?: string;
};

/**
 * Require that a user is a member of a league. Resolves the leagueId from various identifiers.
 * Site admins always pass this check.
 * @returns The resolved leagueId
 * @throws TRPCError if not authorized or if league/season/franchise not found
 */
export async function requireLeagueMembership(
  db: DBClient,
  userId: string,
  identifiers: LeagueIdentifiers
): Promise<string> {
  let resolvedLeagueId = identifiers.leagueId;

  // Resolve leagueId from leagueSeasonId if needed
  if (!resolvedLeagueId && identifiers.leagueSeasonId) {
    const [season] = await db
      .select({ leagueId: leagueSeasons.leagueId })
      .from(leagueSeasons)
      .where(eq(leagueSeasons.id, identifiers.leagueSeasonId))
      .limit(1);

    if (!season) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'League season not found',
      });
    }

    resolvedLeagueId = season.leagueId;
  }

  // Resolve leagueId from franchiseId if needed
  if (!resolvedLeagueId && identifiers.franchiseId) {
    const [franchise] = await db
      .select({ leagueId: franchises.leagueId })
      .from(franchises)
      .where(eq(franchises.id, identifiers.franchiseId))
      .limit(1);

    if (!franchise) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Franchise not found',
      });
    }

    resolvedLeagueId = franchise.leagueId;
  }

  if (!resolvedLeagueId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'leagueId, leagueSeasonId, or franchiseId is required',
    });
  }

  // Check if site admin - they have access to everything
  const isSiteAdmin = await checkSiteAdmin(db, userId);
  if (isSiteAdmin) {
    return resolvedLeagueId;
  }

  // Check league membership
  const isMember = await checkLeagueMembership(db, userId, resolvedLeagueId);

  if (!isMember) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this league',
    });
  }

  return resolvedLeagueId;
}

/**
 * Require that a user owns a specific franchise.
 * Site admins always pass this check.
 * @throws TRPCError if not authorized
 */
export async function requireFranchiseOwnership(
  db: DBClient,
  userId: string,
  franchiseId: string
): Promise<void> {
  // Check if site admin - they have access to everything
  const isSiteAdmin = await checkSiteAdmin(db, userId);
  if (isSiteAdmin) {
    return;
  }

  // Check franchise ownership
  const isOwner = await checkFranchiseOwnership(db, userId, franchiseId);

  if (!isOwner) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not own this franchise',
    });
  }
}

/**
 * Require that a user is a league admin (commissioner).
 * Resolves the leagueId from leagueId or leagueSeasonId.
 * Site admins always pass this check.
 * @returns The resolved leagueId
 * @throws TRPCError if not authorized or if league/season not found
 */
export async function requireLeagueAdmin(
  db: DBClient,
  userId: string,
  identifiers: { leagueId?: string; leagueSeasonId?: string }
): Promise<string> {
  let resolvedLeagueId = identifiers.leagueId;

  // Resolve leagueId from leagueSeasonId if needed
  if (!resolvedLeagueId && identifiers.leagueSeasonId) {
    const [season] = await db
      .select({ leagueId: leagueSeasons.leagueId })
      .from(leagueSeasons)
      .where(eq(leagueSeasons.id, identifiers.leagueSeasonId))
      .limit(1);

    if (!season) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'League season not found',
      });
    }

    resolvedLeagueId = season.leagueId;
  }

  if (!resolvedLeagueId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'leagueId or leagueSeasonId is required',
    });
  }

  // Check if site admin - they have access to everything
  const isSiteAdmin = await checkSiteAdmin(db, userId);
  if (isSiteAdmin) {
    return resolvedLeagueId;
  }

  // Check if user is league admin
  const isAdmin = await checkLeagueAdmin(db, userId, resolvedLeagueId);

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be the league commissioner to perform this action',
    });
  }

  return resolvedLeagueId;
}
