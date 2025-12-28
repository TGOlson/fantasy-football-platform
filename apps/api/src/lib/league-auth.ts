import type { DBClient } from '@fantasy-platform/database/client';

/**
 * Check if a user has access to a league (i.e., they own a team in the league)
 */
export async function canAccessLeague(
  prisma: DBClient,
  userId: string,
  leagueId: string
): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: {
      ownerId: userId,
      franchise: { leagueId },
    },
  });
  return !!team;
}

/**
 * Require league access or throw an error
 */
export async function requireLeagueAccess(
  prisma: DBClient,
  userId: string,
  leagueId: string
): Promise<void> {
  const hasAccess = await canAccessLeague(prisma, userId, leagueId);
  if (!hasAccess) {
    throw new Error('Not authorized to access this league');
  }
}
