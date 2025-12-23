import { type DBClient } from '@fantasy-platform/database/client';
import {
  matchups,
  franchiseSeasons,
  franchises,
  users,
  eq,
} from '@fantasy-platform/database/schema';

// ============================================================================
// TYPES
// ============================================================================

type StandingsEntry = {
  franchiseSeasonId: string;
  franchiseId: string;
  franchiseName: string;
  ownerName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  winPct: number;
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Calculate standings from matchup results and update franchise_seasons table.
 * This should be called after matchups are scored.
 */
export async function calculateStandings(
  db: DBClient,
  leagueSeasonId: string
): Promise<StandingsEntry[]> {
  // Get all franchise seasons for this league season
  const allFranchiseSeasons = await db
    .select()
    .from(franchiseSeasons)
    .where(eq(franchiseSeasons.leagueSeasonId, leagueSeasonId));

  // Initialize stats for each franchise
  const franchiseStats = new Map<
    string,
    {
      wins: number;
      losses: number;
      ties: number;
      pointsFor: number;
      pointsAgainst: number;
    }
  >();

  for (const fs of allFranchiseSeasons) {
    franchiseStats.set(fs.id, {
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    });
  }

  // Get all scored matchups for this season
  const allMatchups = await db
    .select()
    .from(matchups)
    .where(eq(matchups.leagueSeasonId, leagueSeasonId));

  // Process each matchup
  for (const matchup of allMatchups) {
    const homeScore = matchup.homeScore ? parseFloat(matchup.homeScore) : null;
    const awayScore = matchup.awayScore ? parseFloat(matchup.awayScore) : null;

    // Skip unscored matchups
    if (homeScore === null) continue;

    const homeStats = franchiseStats.get(matchup.homeFranchiseSeasonId);
    if (homeStats) {
      homeStats.pointsFor += homeScore;
    }

    // If it's a BYE week, no opponent
    if (!matchup.awayFranchiseSeasonId || awayScore === null) {
      continue;
    }

    const awayStats = franchiseStats.get(matchup.awayFranchiseSeasonId);

    // Update points against
    if (homeStats) {
      homeStats.pointsAgainst += awayScore;
    }
    if (awayStats) {
      awayStats.pointsFor += awayScore;
      awayStats.pointsAgainst += homeScore;
    }

    // Determine winner
    if (homeScore > awayScore) {
      if (homeStats) homeStats.wins++;
      if (awayStats) awayStats.losses++;
    } else if (awayScore > homeScore) {
      if (homeStats) homeStats.losses++;
      if (awayStats) awayStats.wins++;
    } else {
      // Tie
      if (homeStats) homeStats.ties++;
      if (awayStats) awayStats.ties++;
    }
  }

  // Update franchise_seasons table with calculated stats
  for (const [franchiseSeasonId, stats] of franchiseStats) {
    await db
      .update(franchiseSeasons)
      .set({
        wins: stats.wins,
        losses: stats.losses,
        ties: stats.ties,
        pointsFor: stats.pointsFor.toFixed(2),
        pointsAgainst: stats.pointsAgainst.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(franchiseSeasons.id, franchiseSeasonId));
  }

  // Build standings response with franchise details
  const standings: StandingsEntry[] = [];

  for (const fs of allFranchiseSeasons) {
    const stats = franchiseStats.get(fs.id)!;

    // Get franchise details
    const [franchise] = await db
      .select()
      .from(franchises)
      .where(eq(franchises.id, fs.franchiseId))
      .limit(1);

    // Get owner details
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, fs.ownerId))
      .limit(1);

    const totalGames = stats.wins + stats.losses + stats.ties;
    const winPct = totalGames > 0 ? stats.wins / totalGames : 0;

    standings.push({
      franchiseSeasonId: fs.id,
      franchiseId: franchise?.id || '',
      franchiseName: franchise?.name || 'Unknown',
      ownerName: owner?.name || 'Unknown',
      wins: stats.wins,
      losses: stats.losses,
      ties: stats.ties,
      pointsFor: Math.round(stats.pointsFor * 100) / 100,
      pointsAgainst: Math.round(stats.pointsAgainst * 100) / 100,
      winPct: Math.round(winPct * 1000) / 1000,
    });
  }

  // Sort standings: wins desc, then points for desc
  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    return b.pointsFor - a.pointsFor;
  });

  return standings;
}

/**
 * Get current standings without recalculating (reads from franchise_seasons table).
 */
export async function getStandings(
  db: DBClient,
  leagueSeasonId: string
): Promise<StandingsEntry[]> {
  // Get all franchise seasons with franchise and owner info
  const allFranchiseSeasons = await db
    .select()
    .from(franchiseSeasons)
    .where(eq(franchiseSeasons.leagueSeasonId, leagueSeasonId));

  const standings: StandingsEntry[] = [];

  for (const fs of allFranchiseSeasons) {
    // Get franchise details
    const [franchise] = await db
      .select()
      .from(franchises)
      .where(eq(franchises.id, fs.franchiseId))
      .limit(1);

    // Get owner details
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, fs.ownerId))
      .limit(1);

    const totalGames = fs.wins + fs.losses + fs.ties;
    const winPct = totalGames > 0 ? fs.wins / totalGames : 0;

    standings.push({
      franchiseSeasonId: fs.id,
      franchiseId: franchise?.id || '',
      franchiseName: franchise?.name || 'Unknown',
      ownerName: owner?.name || 'Unknown',
      wins: fs.wins,
      losses: fs.losses,
      ties: fs.ties,
      pointsFor: parseFloat(fs.pointsFor) || 0,
      pointsAgainst: parseFloat(fs.pointsAgainst) || 0,
      winPct: Math.round(winPct * 1000) / 1000,
    });
  }

  // Sort standings
  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    return b.pointsFor - a.pointsFor;
  });

  return standings;
}
