import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getDatabase,
  users,
  leagues,
  leagueSeasons,
  leagueSettings,
  teams,
  teamSeasons,
  players,
  playerSeasons,
  playerWeeklyStats,
  rosterPlayers,
  matchups,
  eq,
  generateUniqueSlug,
} from './index';
import type { ScoringRules } from '@fantasy-platform/types';

// Load environment variables
dotenv.config({ path: '../../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DATA_DIR = path.join(__dirname, '../seed-data');

// Helper to parse CSV
function parseCSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    // Handle quoted values
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Last value

    const row: any = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      row[header] = value === '' ? null : value;
    });
    return row;
  });
}

async function seed() {
  console.log('🌱 Seeding database...');

  const db = getDatabase();

  try {
    // =========================================================================
    // CLEAR EXISTING DATA
    // =========================================================================
    console.log('\n🗑️  Clearing existing data...');

    await db.delete(matchups);
    await db.delete(rosterPlayers);
    await db.delete(playerWeeklyStats);
    await db.delete(playerSeasons);
    await db.delete(players);
    await db.delete(teamSeasons);
    await db.delete(teams);
    await db.delete(leagueSettings);
    await db.delete(leagueSeasons);
    await db.delete(leagues);
    await db.delete(users);

    console.log('✓ Database cleared');

    // =========================================================================
    // USERS
    // =========================================================================
    console.log('\n👥 Creating users...');

    // Hash admin password
    const adminPasswordHash = await bcrypt.hash('admin', 10);

    const [user1, user2, user3, user4, user5, user6, user7, user8] = await db
      .insert(users)
      .values([
        { email: 'admin@example.com', passwordHash: adminPasswordHash, name: 'Admin' },
        { email: 'sarah@example.com', passwordHash: 'hashed_password', name: 'Sarah' },
        { email: 'mike@example.com', passwordHash: 'hashed_password', name: 'Mike' },
        { email: 'jessica@example.com', passwordHash: 'hashed_password', name: 'Jessica' },
        { email: 'chris@example.com', passwordHash: 'hashed_password', name: 'Chris' },
        { email: 'amanda@example.com', passwordHash: 'hashed_password', name: 'Amanda' },
        { email: 'david@example.com', passwordHash: 'hashed_password', name: 'David' },
        { email: 'emily@example.com', passwordHash: 'hashed_password', name: 'Emily' },
      ])
      .returning();

    console.log('✓ Created 8 users (admin@example.com / admin)');

    // =========================================================================
    // LEAGUE & SEASON
    // =========================================================================
    console.log('\n🏈 Creating league...');
    const leagueName = 'The Championship League';
    const leagueSlug = await generateUniqueSlug(leagueName);

    const [league] = await db
      .insert(leagues)
      .values({
        name: leagueName,
        slug: leagueSlug,
        commissionerId: user1.id,
      })
      .returning();

    console.log(`✓ Created league: ${league.name} (Commissioner: ${user1.name})`);

    const [season2024] = await db
      .insert(leagueSeasons)
      .values({
        leagueId: league.id,
        season: 2024,
        status: 'active',
      })
      .returning();

    console.log('✓ Created 2024 season');

    // =========================================================================
    // LEAGUE SETTINGS
    // =========================================================================
    console.log('\n⚙️  Creating league settings...');

    // Define scoring rules with explicit typing to ensure type safety
    const scoringRules: ScoringRules = {
      passing: {
        yards: { type: 'base', value: 0.04 },
        touchdowns: { type: 'base', value: 4 },
        interceptions: { type: 'base', value: -2 },
        completions: {type: 'base', value: 0},
        bonuses: [
          {
            name: '300 Yard Game',
            points: 3,
            when: [{ stat: 'passingYards', operator: '>=', value: 300 }],
          },
        ],
      },
      rushing: {
        yards: { type: 'base', value: 0.1 },
        touchdowns: { type: 'base', value: 6 },
        attempts: {type: 'base', value: 0},
        bonuses: [
          {
            name: '100 Yard Game',
            points: 3,
            when: [{ stat: 'rushingYards', operator: '>=', value: 100 }],
          },
        ],
      },
      receiving: {
        receptions: {
          type: 'position-specific',
          default: 0.5,
          byPosition: {
            TE: 1.5, // TE Premium
            WR: 1.0,
            RB: 0.5,
          },
        },
        yards: { type: 'base', value: 0.1 },
        touchdowns: { type: 'base', value: 6 },
        targets: {type: 'base', value: 0},
        bonuses: [
          {
            name: '100 Yard Game',
            points: 3,
            when: [{ stat: 'receivingYards', operator: '>=', value: 100 }],
          },
        ],
      },
      fumbles: {
        lost: { type: 'base', value: -2 },
      },
      twoPointConversions: { type: 'base', value: 2 },
    };

    await db.insert(leagueSettings).values({
      leagueSeasonId: season2024.id,
      teamCount: 8,
      rosterPositions: {
        QB: 1,
        RB: 2,
        WR: 2,
        TE: 1,
        FLEX: 1,
        BENCH: 6,
      },
      playoffTeams: 4,
      playoffStartWeek: 15,
      tradeDeadlineWeek: 11,
      scoringRules,
    });

    console.log('✓ Created league settings (TE Premium scoring)');

    // =========================================================================
    // TEAMS
    // =========================================================================
    console.log('\n🏆 Creating teams...');
    const [team1, team2, team3, team4, team5, team6, team7, team8] = await db
      .insert(teams)
      .values([
        { leagueId: league.id, ownerId: user1.id, name: "Admin's All-Stars" },
        { leagueId: league.id, ownerId: user2.id, name: "Sarah's Squad" },
        { leagueId: league.id, ownerId: user3.id, name: "Mike's Monsters" },
        { leagueId: league.id, ownerId: user4.id, name: "Jessica's Juggernauts" },
        { leagueId: league.id, ownerId: user5.id, name: "Chris's Crushers" },
        { leagueId: league.id, ownerId: user6.id, name: "Amanda's Avengers" },
        { leagueId: league.id, ownerId: user7.id, name: "David's Destroyers" },
        { leagueId: league.id, ownerId: user8.id, name: "Emily's Eagles" },
      ])
      .returning();

    console.log('✓ Created 8 teams');

    // =========================================================================
    // TEAM SEASONS
    // =========================================================================
    console.log('\n📊 Creating team seasons...');
    const [ts1, ts2, ts3, ts4, ts5, ts6, ts7, ts8] = await db
      .insert(teamSeasons)
      .values([
        { teamId: team1.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
        { teamId: team2.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
        { teamId: team3.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
        { teamId: team4.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
        { teamId: team5.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
        { teamId: team6.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
        { teamId: team7.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
        { teamId: team8.id, leagueSeasonId: season2024.id, wins: 0, losses: 0, ties: 0 },
      ])
      .returning();

    console.log('✓ Created 8 team seasons');

    // =========================================================================
    // PLAYERS (from CSV seed data)
    // =========================================================================
    console.log('\n⭐ Importing NFL players from CSV...');

    const playersCSVPath = path.join(SEED_DATA_DIR, 'players-2024.csv');
    if (!fs.existsSync(playersCSVPath)) {
      console.error('❌ players-2024.csv not found!');
      console.error('Run: pnpm --filter @fantasy-platform/database generate-seed-data');
      process.exit(1);
    }

    const playerData = parseCSV(playersCSVPath);
    console.log(`  Found ${playerData.length} players in CSV`);

    // Create players
    const createdPlayers = await db
      .insert(players)
      .values(
        playerData.map((p, i) => ({
          nflId: `espn_${i + 1}`,
          name: p.name,
        }))
      )
      .returning();

    console.log(`✓ Created ${createdPlayers.length} players`);

    // Create player seasons
    await db.insert(playerSeasons).values(
      createdPlayers.map((player, i) => ({
        playerId: player.id,
        season: 2024,
        nflTeam: playerData[i].team,
        position: playerData[i].position,
        status: 'active',
        jerseyNumber: parseInt(playerData[i].jersey_number),
      }))
    );

    console.log(`✓ Created ${createdPlayers.length} player seasons (2024)`);

    // Import weekly stats
    console.log('\n📊 Importing weekly stats from CSV...');
    const statsCSVPath = path.join(SEED_DATA_DIR, 'player-stats-2024.csv');

    if (!fs.existsSync(statsCSVPath)) {
      console.error('❌ player-stats-2024.csv not found!');
      process.exit(1);
    }

    const statsData = parseCSV(statsCSVPath);
    console.log(`  Found ${statsData.length} stat entries in CSV`);

    // Create a map of player name -> player ID
    const playerNameToId = new Map(
      createdPlayers.map((p, i) => [playerData[i].name, p.id])
    );

    // Convert CSV stats to DB format
    const weeklyStatsToInsert = statsData.map((stat) => ({
      playerId: playerNameToId.get(stat.player_name)!,
      season: 2024,
      weekNumber: parseInt(stat.week_number),
      passingYards: stat.passing_yards ? parseInt(stat.passing_yards) : null,
      passingTds: stat.passing_tds ? parseInt(stat.passing_tds) : null,
      passingInts: stat.passing_ints ? parseInt(stat.passing_ints) : null,
      completions: stat.completions ? parseInt(stat.completions) : null,
      attempts: stat.attempts ? parseInt(stat.attempts) : null,
      rushingYards: stat.rushing_yards ? parseInt(stat.rushing_yards) : null,
      rushingTds: stat.rushing_tds ? parseInt(stat.rushing_tds) : null,
      rushingAttempts: stat.rushing_attempts ? parseInt(stat.rushing_attempts) : null,
      receptions: stat.receptions ? parseInt(stat.receptions) : null,
      receivingYards: stat.receiving_yards ? parseInt(stat.receiving_yards) : null,
      receivingTds: stat.receiving_tds ? parseInt(stat.receiving_tds) : null,
      targets: stat.targets ? parseInt(stat.targets) : null,
      fumblesLost: stat.fumbles_lost ? parseInt(stat.fumbles_lost) : null,
    }));

    // Insert in chunks
    const chunkSize = 500;
    for (let i = 0; i < weeklyStatsToInsert.length; i += chunkSize) {
      const chunk = weeklyStatsToInsert.slice(i, i + chunkSize);
      await db.insert(playerWeeklyStats).values(chunk);
      console.log(
        `  Inserted ${Math.min(i + chunkSize, weeklyStatsToInsert.length)} / ${
          weeklyStatsToInsert.length
        } stats`
      );
    }

    console.log(`✓ Created ${weeklyStatsToInsert.length} weekly stat entries`);

    // =========================================================================
    // ROSTERS
    // =========================================================================
    console.log('\n📋 Adding players to rosters...');

    // Get player seasons to know positions
    const allPlayerSeasons = await db
      .select()
      .from(playerSeasons)
      .where(eq(playerSeasons.season, 2024));

    // Helper to get players by position
    const getPlayersByPosition = (position: string, count: number) => {
      return allPlayerSeasons
        .filter(ps => ps.position === position)
        .slice(0, count)
        .map(ps => ps.playerId);
    };

    // Team 1 roster (Admin's All-Stars) - full roster
    const team1Roster = [];
    const qbs = getPlayersByPosition('QB', 2);
    const rbs = getPlayersByPosition('RB', 4);
    const wrs = getPlayersByPosition('WR', 4);
    const tes = getPlayersByPosition('TE', 2);

    if (qbs[0]) team1Roster.push({ teamSeasonId: ts1.id, playerId: qbs[0], slotType: 'QB' });
    if (rbs[0]) team1Roster.push({ teamSeasonId: ts1.id, playerId: rbs[0], slotType: 'RB' });
    if (rbs[1]) team1Roster.push({ teamSeasonId: ts1.id, playerId: rbs[1], slotType: 'RB' });
    if (wrs[0]) team1Roster.push({ teamSeasonId: ts1.id, playerId: wrs[0], slotType: 'WR' });
    if (wrs[1]) team1Roster.push({ teamSeasonId: ts1.id, playerId: wrs[1], slotType: 'WR' });
    if (tes[0]) team1Roster.push({ teamSeasonId: ts1.id, playerId: tes[0], slotType: 'TE' });
    if (rbs[2]) team1Roster.push({ teamSeasonId: ts1.id, playerId: rbs[2], slotType: 'FLEX' });
    // Bench
    if (qbs[1]) team1Roster.push({ teamSeasonId: ts1.id, playerId: qbs[1], slotType: 'BENCH' });
    if (rbs[3]) team1Roster.push({ teamSeasonId: ts1.id, playerId: rbs[3], slotType: 'BENCH' });
    if (wrs[2]) team1Roster.push({ teamSeasonId: ts1.id, playerId: wrs[2], slotType: 'BENCH' });
    if (wrs[3]) team1Roster.push({ teamSeasonId: ts1.id, playerId: wrs[3], slotType: 'BENCH' });
    if (tes[1]) team1Roster.push({ teamSeasonId: ts1.id, playerId: tes[1], slotType: 'BENCH' });

    if (team1Roster.length > 0) {
      await db.insert(rosterPlayers).values(team1Roster);
    }

    // Team 2 roster (Sarah's Squad) - use next set of players
    const team2Roster = [];
    const qbs2 = getPlayersByPosition('QB', 4).slice(2);
    const rbs2 = getPlayersByPosition('RB', 8).slice(4);
    const wrs2 = getPlayersByPosition('WR', 8).slice(4);
    const tes2 = getPlayersByPosition('TE', 4).slice(2);

    if (qbs2[0]) team2Roster.push({ teamSeasonId: ts2.id, playerId: qbs2[0], slotType: 'QB' });
    if (rbs2[0]) team2Roster.push({ teamSeasonId: ts2.id, playerId: rbs2[0], slotType: 'RB' });
    if (rbs2[1]) team2Roster.push({ teamSeasonId: ts2.id, playerId: rbs2[1], slotType: 'RB' });
    if (wrs2[0]) team2Roster.push({ teamSeasonId: ts2.id, playerId: wrs2[0], slotType: 'WR' });
    if (wrs2[1]) team2Roster.push({ teamSeasonId: ts2.id, playerId: wrs2[1], slotType: 'WR' });
    if (tes2[0]) team2Roster.push({ teamSeasonId: ts2.id, playerId: tes2[0], slotType: 'TE' });
    if (wrs2[2]) team2Roster.push({ teamSeasonId: ts2.id, playerId: wrs2[2], slotType: 'FLEX' });
    // Bench
    if (qbs2[1]) team2Roster.push({ teamSeasonId: ts2.id, playerId: qbs2[1], slotType: 'BENCH' });
    if (rbs2[2]) team2Roster.push({ teamSeasonId: ts2.id, playerId: rbs2[2], slotType: 'BENCH' });
    if (rbs2[3]) team2Roster.push({ teamSeasonId: ts2.id, playerId: rbs2[3], slotType: 'BENCH' });
    if (wrs2[3]) team2Roster.push({ teamSeasonId: ts2.id, playerId: wrs2[3], slotType: 'BENCH' });
    if (tes2[1]) team2Roster.push({ teamSeasonId: ts2.id, playerId: tes2[1], slotType: 'BENCH' });

    if (team2Roster.length > 0) {
      await db.insert(rosterPlayers).values(team2Roster);
    }

    // Team 3 roster (Mike's Monsters) - smaller partial roster
    const team3Roster = [];
    const qbs3 = getPlayersByPosition('QB', 6).slice(4);
    const rbs3 = getPlayersByPosition('RB', 12).slice(8);
    const wrs3 = getPlayersByPosition('WR', 12).slice(8);
    const tes3 = getPlayersByPosition('TE', 6).slice(4);

    if (qbs3[0]) team3Roster.push({ teamSeasonId: ts3.id, playerId: qbs3[0], slotType: 'QB' });
    if (rbs3[0]) team3Roster.push({ teamSeasonId: ts3.id, playerId: rbs3[0], slotType: 'RB' });
    if (wrs3[0]) team3Roster.push({ teamSeasonId: ts3.id, playerId: wrs3[0], slotType: 'WR' });
    if (tes3[0]) team3Roster.push({ teamSeasonId: ts3.id, playerId: tes3[0], slotType: 'TE' });

    if (team3Roster.length > 0) {
      await db.insert(rosterPlayers).values(team3Roster);
    }

    console.log(`✓ Added players to ${team1Roster.length > 0 ? '3' : '0'} team rosters`);

    // =========================================================================
    // MATCHUPS (Week 1)
    // =========================================================================
    console.log('\n🗓️  Creating Week 1 matchups...');
    await db.insert(matchups).values([
      {
        leagueSeasonId: season2024.id,
        weekNumber: 1,
        team1SeasonId: ts1.id,
        team2SeasonId: ts2.id,
      },
      {
        leagueSeasonId: season2024.id,
        weekNumber: 1,
        team1SeasonId: ts3.id,
        team2SeasonId: ts4.id,
      },
      {
        leagueSeasonId: season2024.id,
        weekNumber: 1,
        team1SeasonId: ts5.id,
        team2SeasonId: ts6.id,
      },
      {
        leagueSeasonId: season2024.id,
        weekNumber: 1,
        team1SeasonId: ts7.id,
        team2SeasonId: ts8.id,
      },
    ]);

    console.log('✓ Created 4 matchups for Week 1');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Summary:');
    console.log('  - 8 users');
    console.log('  - 1 league (The Championship League)');
    console.log('  - 1 season (2024, active)');
    console.log('  - 8 teams with team seasons');
    console.log(`  - ${createdPlayers.length} NFL players with 2024 data`);
    console.log(`  - ${weeklyStatsToInsert.length} weekly stat entries (weeks 1-10)`);
    console.log('  - 3 teams with rosters');
    console.log('  - 4 Week 1 matchups');
    console.log('\n🔑 Login credentials:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
