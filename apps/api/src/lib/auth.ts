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
  const expiresIn = (process.env.JWT_EXPIRES_IN as any) || '7d';

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
  } catch (error) {
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

import { getDatabase, teams, leagues, leagueSeasons, eq, and, users } from '@fantasy-platform/database';
import { TRPCError } from '@trpc/server';

/**
 * Check if a user is a member of a league (owns or ever owned a team in the league)
 */
export async function checkLeagueMembership(
  userId: string,
  leagueId: string
): Promise<boolean> {
  const db = getDatabase();

  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.leagueId, leagueId), eq(teams.ownerId, userId)))
    .limit(1);

  return !!team;
}

/**
 * Check if a user owns a specific team
 */
export async function checkTeamOwnership(
  userId: string,
  teamId: string
): Promise<boolean> {
  const db = getDatabase();

  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, teamId), eq(teams.ownerId, userId)))
    .limit(1);

  return !!team;
}

/**
 * Check if a user is a league admin (commissioner)
 */
export async function checkLeagueAdmin(
  userId: string,
  leagueId: string
): Promise<boolean> {
  const db = getDatabase();

  const [league] = await db
    .select()
    .from(leagues)
    .where(and(eq(leagues.id, leagueId), eq(leagues.commissionerId, userId)))
    .limit(1);

  return !!league;
}

/**
 * Check if a user is a site admin
 */
export async function checkSiteAdmin(userId: string): Promise<boolean> {
  const db = getDatabase();

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
  teamId?: string;
};

/**
 * Require that a user is a member of a league. Resolves the leagueId from various identifiers.
 * Site admins always pass this check.
 * @returns The resolved leagueId
 * @throws TRPCError if not authorized or if league/season/team not found
 */
export async function requireLeagueMembership(
  userId: string,
  identifiers: LeagueIdentifiers
): Promise<string> {
  const db = getDatabase();
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

  // Resolve leagueId from teamId if needed
  if (!resolvedLeagueId && identifiers.teamId) {
    const [team] = await db
      .select({ leagueId: teams.leagueId })
      .from(teams)
      .where(eq(teams.id, identifiers.teamId))
      .limit(1);

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      });
    }

    resolvedLeagueId = team.leagueId;
  }

  if (!resolvedLeagueId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'leagueId, leagueSeasonId, or teamId is required',
    });
  }

  // Check if site admin - they have access to everything
  const isSiteAdmin = await checkSiteAdmin(userId);
  if (isSiteAdmin) {
    return resolvedLeagueId;
  }

  // Check league membership
  const isMember = await checkLeagueMembership(userId, resolvedLeagueId);

  if (!isMember) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this league',
    });
  }

  return resolvedLeagueId;
}

/**
 * Require that a user owns a specific team.
 * Site admins always pass this check.
 * @throws TRPCError if not authorized
 */
export async function requireTeamOwnership(
  userId: string,
  teamId: string
): Promise<void> {
  // Check if site admin - they have access to everything
  const isSiteAdmin = await checkSiteAdmin(userId);
  if (isSiteAdmin) {
    return;
  }

  // Check team ownership
  const isOwner = await checkTeamOwnership(userId, teamId);

  if (!isOwner) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not own this team',
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
  userId: string,
  identifiers: { leagueId?: string; leagueSeasonId?: string }
): Promise<string> {
  const db = getDatabase();
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
  const isSiteAdmin = await checkSiteAdmin(userId);
  if (isSiteAdmin) {
    return resolvedLeagueId;
  }

  // Check if user is league admin
  const isAdmin = await checkLeagueAdmin(userId, resolvedLeagueId);

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be the league commissioner to perform this action',
    });
  }

  return resolvedLeagueId;
}
