import { type DBClient } from '@fantasy-platform/database/client';
import {
  matchups,
  teams,
  franchises,
  users,
  eq,
} from '@fantasy-platform/database/schema';

// ============================================================================
// TYPES
// ============================================================================

type StandingsEntry = {
  teamId: string;
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
 * Calculate standings from matchup results and update teams table.
 * This should be called after matchups are scored.
 */
export async function calculateStandings(
  db: DBClient,
  leagueSeasonId: string
): Promise<StandingsEntry[]> {
  // Get all teams for this league season
  const allTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.leagueSeasonId, leagueSeasonId));

  // Initialize stats for each team
  const teamStats = new Map<
    string,
    {
      wins: number;
      losses: number;
      ties: number;
      pointsFor: number;
      pointsAgainst: number;
    }
  >();

  for (const team of allTeams) {
    teamStats.set(team.id, {
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

    const homeStats = teamStats.get(matchup.homeTeamId);
    if (homeStats) {
      homeStats.pointsFor += homeScore;
    }

    // If it's a BYE week, no opponent
    if (!matchup.awayTeamId || awayScore === null) {
      continue;
    }

    const awayStats = teamStats.get(matchup.awayTeamId);

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

  // Update teams table with calculated stats
  for (const [teamId, stats] of teamStats) {
    await db
      .update(teams)
      .set({
        wins: stats.wins,
        losses: stats.losses,
        ties: stats.ties,
        pointsFor: stats.pointsFor.toFixed(2),
        pointsAgainst: stats.pointsAgainst.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));
  }

  // Build standings response with franchise details
  const standings: StandingsEntry[] = [];

  for (const team of allTeams) {
    const stats = teamStats.get(team.id)!;

    // Get franchise details
    const [franchise] = await db
      .select()
      .from(franchises)
      .where(eq(franchises.id, team.franchiseId))
      .limit(1);

    // Get owner details
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, team.ownerId))
      .limit(1);

    const totalGames = stats.wins + stats.losses + stats.ties;
    const winPct = totalGames > 0 ? stats.wins / totalGames : 0;

    standings.push({
      teamId: team.id,
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
 * Get current standings without recalculating (reads from teams table).
 */
export async function getStandings(
  db: DBClient,
  leagueSeasonId: string
): Promise<StandingsEntry[]> {
  // Get all teams with franchise and owner info
  const allTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.leagueSeasonId, leagueSeasonId));

  const standings: StandingsEntry[] = [];

  for (const team of allTeams) {
    // Get franchise details
    const [franchise] = await db
      .select()
      .from(franchises)
      .where(eq(franchises.id, team.franchiseId))
      .limit(1);

    // Get owner details
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, team.ownerId))
      .limit(1);

    const totalGames = team.wins + team.losses + team.ties;
    const winPct = totalGames > 0 ? team.wins / totalGames : 0;

    standings.push({
      teamId: team.id,
      franchiseId: franchise?.id || '',
      franchiseName: franchise?.name || 'Unknown',
      ownerName: owner?.name || 'Unknown',
      wins: team.wins,
      losses: team.losses,
      ties: team.ties,
      pointsFor: parseFloat(team.pointsFor) || 0,
      pointsAgainst: parseFloat(team.pointsAgainst) || 0,
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
