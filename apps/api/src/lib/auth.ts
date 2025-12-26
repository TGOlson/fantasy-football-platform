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
import { TRPCError } from '@trpc/server';

/**
 * Check if a user is a member of a league (owns a team in the league)
 */
export async function checkLeagueMembership(
  db: DBClient,
  userId: string,
  leagueId: string
): Promise<boolean> {
  const team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.ownerId, userId),
    with: {
      franchise: {
        columns: { leagueId: true },
      },
    },
  });

  return team?.franchise.leagueId === leagueId;
}

/**
 * Check if a user owns a specific franchise (in any season)
 */
export async function checkFranchiseOwnership(
  db: DBClient,
  userId: string,
  franchiseId: string
): Promise<boolean> {
  const team = await db.query.teams.findFirst({
    where: (teams, { eq, and }) =>
      and(eq(teams.franchiseId, franchiseId), eq(teams.ownerId, userId)),
  });

  return !!team;
}

/**
 * Check if a user is a league admin (commissioner for any season)
 */
export async function checkLeagueAdmin(
  db: DBClient,
  userId: string,
  leagueId: string
): Promise<boolean> {
  const season = await db.query.leagueSeasons.findFirst({
    where: (leagueSeasons, { eq, and }) =>
      and(
        eq(leagueSeasons.leagueId, leagueId),
        eq(leagueSeasons.commissionerId, userId)
      ),
  });

  return !!season;
}

/**
 * Check if a user is a site admin
 */
export async function checkSiteAdmin(
  db: DBClient,
  userId: string
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    columns: { isSiteAdmin: true },
  });

  return user?.isSiteAdmin ?? false;
}

// ============================================================================
// AUTHORIZATION HELPERS (throw TRPCError on failure)
// ============================================================================

/**
 * Require that a user is a member of a league.
 * Site admins always pass this check.
 * @throws TRPCError if not authorized
 */
export async function requireLeagueMembership(
  db: DBClient,
  userId: string,
  leagueId: string
): Promise<void> {
  const isSiteAdmin = await checkSiteAdmin(db, userId);
  if (isSiteAdmin) return;

  const isMember = await checkLeagueMembership(db, userId, leagueId);
  if (!isMember) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this league',
    });
  }
}

/**
 * Require that a user owns a specific team.
 * Site admins always pass this check.
 * @throws TRPCError if not authorized
 */
export async function requireTeamOwnership(
  db: DBClient,
  userId: string,
  teamId: string
): Promise<void> {
  const isSiteAdmin = await checkSiteAdmin(db, userId);
  if (isSiteAdmin) return;

  const team = await db.query.teams.findFirst({
    where: (teams, { eq, and }) =>
      and(eq(teams.id, teamId), eq(teams.ownerId, userId)),
  });

  if (!team) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not own this team',
    });
  }
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
  const isSiteAdmin = await checkSiteAdmin(db, userId);
  if (isSiteAdmin) return;

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
 * Site admins always pass this check.
 * @throws TRPCError if not authorized
 */
export async function requireLeagueAdmin(
  db: DBClient,
  userId: string,
  leagueId: string
): Promise<void> {
  const isSiteAdmin = await checkSiteAdmin(db, userId);
  if (isSiteAdmin) return;

  const isAdmin = await checkLeagueAdmin(db, userId, leagueId);
  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be the league commissioner to perform this action',
    });
  }
}

// ============================================================================
// CONVENIENCE WRAPPERS (resolve IDs then check permissions)
// ============================================================================

/**
 * Require league membership by leagueSeasonId (resolves leagueId first).
 * @throws TRPCError if season not found or not authorized
 */
export async function requireLeagueSeasonMembership(
  db: DBClient,
  userId: string,
  leagueSeasonId: string
): Promise<void> {
  const season = await db.query.leagueSeasons.findFirst({
    where: (leagueSeasons, { eq }) => eq(leagueSeasons.id, leagueSeasonId),
    columns: { leagueId: true },
  });

  if (!season) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'League season not found',
    });
  }

  await requireLeagueMembership(db, userId, season.leagueId);
}

/**
 * Require league membership by franchiseId (resolves leagueId first).
 * @throws TRPCError if franchise not found or not authorized
 */
export async function requireFranchiseMembership(
  db: DBClient,
  userId: string,
  franchiseId: string
): Promise<void> {
  const franchise = await db.query.franchises.findFirst({
    where: (franchises, { eq }) => eq(franchises.id, franchiseId),
    columns: { leagueId: true },
  });

  if (!franchise) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Franchise not found',
    });
  }

  await requireLeagueMembership(db, userId, franchise.leagueId);
}

/**
 * Require league admin by leagueSeasonId (resolves leagueId first).
 * @throws TRPCError if season not found or not authorized
 */
export async function requireLeagueSeasonAdmin(
  db: DBClient,
  userId: string,
  leagueSeasonId: string
): Promise<void> {
  const season = await db.query.leagueSeasons.findFirst({
    where: (leagueSeasons, { eq }) => eq(leagueSeasons.id, leagueSeasonId),
    columns: { leagueId: true },
  });

  if (!season) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'League season not found',
    });
  }

  await requireLeagueAdmin(db, userId, season.leagueId);
}
