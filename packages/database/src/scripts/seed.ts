import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../client';
import {
  users,
  leagues,
  franchises,
  leagueSeasons,
  leagueSettings,
  franchiseSeasons,
  players,
  playerSeasons,
  playerWeeklyStats,
  weeklyLineups,
  matchups,
  nflGames,
  eq,
} from '../schema';
import { generateUniqueSlug } from '../lib/slug';
import type { ScoringRules } from '@fantasy-platform/types/scoring';
import { NFL_TEAMS } from '@fantasy-platform/types/player';

// Load environment variables
dotenv.config({ path: '../../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DATA_DIR = path.join(__dirname, './seed-data');

// Helper to parse CSV
function parseCSV(filePath: string): Record<string, string | null>[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
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
    values.push(currentValue);

    const row: Record<string, string | null> = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      row[header] = value === '' ? null : value;
    });
    return row;
  });
}

const getValue = (row: Record<string, string | null>, key: string) => {
  const value = row[key];

  if (!value) {
    throw new Error(
      `Unable to find key: "${key}" in row: ${JSON.stringify(row)}`
    );
  }

  return value;
};

async function seed() {
  console.log('🌱 Seeding database...');

  const db = getDatabase();

  try {
    // =========================================================================
    // CLEAR EXISTING DATA
    // =========================================================================
    console.log('\n🗑️  Clearing existing data...');

    await db.delete(weeklyLineups);
    await db.delete(matchups);
    await db.delete(nflGames);
    await db.delete(playerWeeklyStats);
    await db.delete(playerSeasons);
    await db.delete(players);
    await db.delete(franchiseSeasons);
    await db.delete(leagueSettings);
    await db.delete(leagueSeasons);
    await db.delete(franchises);
    await db.delete(leagues);
    await db.delete(users);

    console.log('✓ Database cleared');

    // =========================================================================
    // USERS
    // =========================================================================
    console.log('\n👥 Creating users...');

    const adminPasswordHash = await bcrypt.hash('admin', 10);

    const [user1, user2, user3, user4, user5, user6, user7, user8] = await db
      .insert(users)
      .values([
        {
          email: 'admin@example.com',
          passwordHash: adminPasswordHash,
          name: 'Admin',
        },
        {
          email: 'sarah@example.com',
          passwordHash: 'hashed_password',
          name: 'Sarah',
        },
        {
          email: 'mike@example.com',
          passwordHash: 'hashed_password',
          name: 'Mike',
        },
        {
          email: 'jessica@example.com',
          passwordHash: 'hashed_password',
          name: 'Jessica',
        },
        {
          email: 'chris@example.com',
          passwordHash: 'hashed_password',
          name: 'Chris',
        },
        {
          email: 'amanda@example.com',
          passwordHash: 'hashed_password',
          name: 'Amanda',
        },
        {
          email: 'david@example.com',
          passwordHash: 'hashed_password',
          name: 'David',
        },
        {
          email: 'emily@example.com',
          passwordHash: 'hashed_password',
          name: 'Emily',
        },
      ])
      .returning();

    console.log('✓ Created 8 users (admin@example.com / admin)');

    // =========================================================================
    // LEAGUE
    // =========================================================================
    console.log('\n🏈 Creating league...');
    const leagueName = 'The Championship League';
    const leagueSlug = await generateUniqueSlug(db, leagueName);

    const [league] = await db
      .insert(leagues)
      .values({
        name: leagueName,
        slug: leagueSlug,
      })
      .returning();

    console.log(`✓ Created league: ${league.name}`);

    // =========================================================================
    // FRANCHISES
    // =========================================================================
    console.log('\n🏆 Creating franchises...');

    const franchiseNames = [
      "Admin's All-Stars",
      "Sarah's Squad",
      "Mike's Monsters",
      "Jessica's Juggernauts",
      "Chris's Crushers",
      "Amanda's Avengers",
      "David's Destroyers",
      "Emily's Eagles",
    ];

    const createdFranchises = await db
      .insert(franchises)
      .values(franchiseNames.map((name) => ({ leagueId: league.id, name })))
      .returning();

    console.log(`✓ Created ${createdFranchises.length} franchises`);

    // =========================================================================
    // LEAGUE SEASON
    // =========================================================================
    console.log('\n📅 Creating 2024 season...');

    const [season2024] = await db
      .insert(leagueSeasons)
      .values({
        leagueId: league.id,
        year: 2024,
        status: 'active',
        commissionerId: user1.id,
      })
      .returning();

    console.log('✓ Created 2024 season');

    // =========================================================================
    // LEAGUE SETTINGS
    // =========================================================================
    console.log('\n⚙️  Creating league settings...');

    const scoringRules: ScoringRules = {
      passing: {
        yards: { type: 'base', value: 0.04 },
        touchdowns: { type: 'base', value: 4 },
        interceptions: { type: 'base', value: -2 },
        completions: { type: 'base', value: 0 },
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
        attempts: { type: 'base', value: 0 },
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
          byPosition: { TE: 1.5, WR: 1.0, RB: 0.5 },
        },
        yards: { type: 'base', value: 0.1 },
        touchdowns: { type: 'base', value: 6 },
        targets: { type: 'base', value: 0 },
        bonuses: [
          {
            name: '100 Yard Game',
            points: 3,
            when: [{ stat: 'receivingYards', operator: '>=', value: 100 }],
          },
        ],
      },
      misc: {
        fumblesLost: { type: 'base', value: -2 },
        twoPointConversions: { type: 'base', value: 2 },
        bonuses: [],
      },
      bonuses: [],
    };

    await db.insert(leagueSettings).values({
      leagueSeasonId: season2024.id,
      scoringRules,
      rosterSlots: [
        { type: 'starter', positions: ['QB'] },
        { type: 'starter', positions: ['RB'] },
        { type: 'starter', positions: ['RB'] },
        { type: 'starter', positions: ['WR'] },
        { type: 'starter', positions: ['WR'] },
        { type: 'starter', positions: ['TE'] },
        { type: 'starter', positions: ['RB', 'WR', 'TE'] },
        { type: 'bench' },
      ],
      playoffTeams: 4,
      playoffStartWeek: 15,
      tradeDeadlineWeek: 11,
    });

    console.log('✓ Created league settings (TE Premium scoring)');

    // =========================================================================
    // FRANCHISE SEASONS
    // =========================================================================
    console.log('\n📊 Creating franchise seasons...');

    const userList = [user1, user2, user3, user4, user5, user6, user7, user8];
    const createdFranchiseSeasons = await db
      .insert(franchiseSeasons)
      .values(
        createdFranchises.map((franchise, i) => ({
          franchiseId: franchise.id,
          leagueSeasonId: season2024.id,
          ownerId: userList[i].id,
        }))
      )
      .returning();

    console.log(
      `✓ Created ${createdFranchiseSeasons.length} franchise seasons`
    );

    // =========================================================================
    // PLAYERS (from CSV seed data)
    // =========================================================================
    console.log('\n⭐ Importing NFL players from CSV...');

    const playersCSVPath = path.join(SEED_DATA_DIR, 'players-2024.csv');
    if (!fs.existsSync(playersCSVPath)) {
      console.error('❌ players-2024.csv not found!');
      console.error(
        'Run: pnpm --filter @fantasy-platform/database generate-seed-data'
      );
      process.exit(1);
    }

    const playerData = parseCSV(playersCSVPath);
    console.log(`  Found ${playerData.length} players in CSV`);

    const createdPlayers = await db
      .insert(players)
      .values(
        playerData.map((p, i) => ({
          nflId: `espn_${i + 1}`,
          name: getValue(p, 'name'),
        }))
      )
      .returning();

    console.log(`✓ Created ${createdPlayers.length} players`);

    await db.insert(playerSeasons).values(
      createdPlayers.map((player, i) => ({
        playerId: player.id,
        season: 2024,
        nflTeam: getValue(playerData[i], 'team'),
        position: getValue(playerData[i], 'position'),
        status: 'active',
        jerseyNumber: parseInt(getValue(playerData[i], 'jersey_number')),
      }))
    );

    console.log(`✓ Created ${createdPlayers.length} player seasons (2024)`);

    // =========================================================================
    // PLAYER WEEKLY STATS
    // =========================================================================
    console.log('\n📊 Importing weekly stats from CSV...');

    const statsCSVPath = path.join(SEED_DATA_DIR, 'player-stats-2024.csv');
    if (!fs.existsSync(statsCSVPath)) {
      console.error('❌ player-stats-2024.csv not found!');
      process.exit(1);
    }

    const statsData = parseCSV(statsCSVPath);
    console.log(`  Found ${statsData.length} stat entries in CSV`);

    const playerNameToId = new Map(
      createdPlayers.map((p, i) => [playerData[i].name, p.id])
    );

    const weeklyStatsToInsert = statsData.map((stat) => ({
      playerId: playerNameToId.get(stat.player_name)!,
      season: 2024,
      weekNumber: parseInt(getValue(stat, 'week_number')),
      passingYards: stat.passing_yards ? parseInt(stat.passing_yards) : null,
      passingTds: stat.passing_tds ? parseInt(stat.passing_tds) : null,
      passingInts: stat.passing_ints ? parseInt(stat.passing_ints) : null,
      completions: stat.completions ? parseInt(stat.completions) : null,
      attempts: stat.attempts ? parseInt(stat.attempts) : null,
      rushingYards: stat.rushing_yards ? parseInt(stat.rushing_yards) : null,
      rushingTds: stat.rushing_tds ? parseInt(stat.rushing_tds) : null,
      rushingAttempts: stat.rushing_attempts
        ? parseInt(stat.rushing_attempts)
        : null,
      receptions: stat.receptions ? parseInt(stat.receptions) : null,
      receivingYards: stat.receiving_yards
        ? parseInt(stat.receiving_yards)
        : null,
      receivingTds: stat.receiving_tds ? parseInt(stat.receiving_tds) : null,
      targets: stat.targets ? parseInt(stat.targets) : null,
      fumblesLost: stat.fumbles_lost ? parseInt(stat.fumbles_lost) : null,
    }));

    const chunkSize = 500;
    for (let i = 0; i < weeklyStatsToInsert.length; i += chunkSize) {
      const chunk = weeklyStatsToInsert.slice(i, i + chunkSize);
      await db.insert(playerWeeklyStats).values(chunk);
    }

    console.log(`✓ Created ${weeklyStatsToInsert.length} weekly stat entries`);

    // =========================================================================
    // NFL GAMES (fake schedule for 2024)
    // =========================================================================
    console.log('\n🏟️  Creating NFL game schedule...');

    const nflGamesToInsert: {
      season: number;
      weekNumber: number;
      homeTeam: string;
      awayTeam: string;
      kickoffAt: Date;
    }[] = [];

    for (let week = 1; week <= 10; week++) {
      // Create 16 games per week (32 teams / 2)
      const shuffled = [...NFL_TEAMS].sort(() => Math.random() - 0.5);
      for (let i = 0; i < 16; i++) {
        const homeTeam = shuffled[i * 2];
        const awayTeam = shuffled[i * 2 + 1];
        // Stagger kickoff times: Thursday (1), Sunday early (8), Sunday late (4), Sunday night (1), Monday (2)
        let dayOffset = 0;
        let hour = 13;
        if (i === 0) {
          dayOffset = -3;
          hour = 20;
        } // Thursday night
        else if (i < 9) {
          dayOffset = 0;
          hour = 13;
        } // Sunday 1pm
        else if (i < 13) {
          dayOffset = 0;
          hour = 16;
        } // Sunday 4pm
        else if (i === 13) {
          dayOffset = 0;
          hour = 20;
        } // Sunday night
        else {
          dayOffset = 1;
          hour = 20;
        } // Monday night

        const kickoffAt = new Date(
          2024,
          8 + Math.floor(week / 5),
          (week % 4) * 7 + 8 + dayOffset,
          hour,
          0,
          0
        );
        nflGamesToInsert.push({
          season: 2024,
          weekNumber: week,
          homeTeam: homeTeam.code,
          awayTeam: awayTeam.code,
          kickoffAt,
        });
      }
    }

    await db.insert(nflGames).values(nflGamesToInsert);
    console.log(`✓ Created ${nflGamesToInsert.length} NFL games`);

    // =========================================================================
    // WEEKLY LINEUPS - Create for all 10 weeks
    // =========================================================================
    console.log('\n📋 Creating weekly lineups...');

    const allPlayerSeasons = await db
      .select()
      .from(playerSeasons)
      .where(eq(playerSeasons.season, 2024));

    const playersByPosition: Record<string, string[]> = {
      QB: [],
      RB: [],
      WR: [],
      TE: [],
    };
    for (const ps of allPlayerSeasons) {
      if (playersByPosition[ps.position]) {
        playersByPosition[ps.position].push(ps.playerId);
      }
    }

    const regularSeasonWeeks = 10;
    const allLineupEntries: {
      franchiseSeasonId: string;
      weekNumber: number;
      playerId: string;
      rosterSlotIndex: number;
    }[] = [];

    // Assign players to franchises (each franchise gets unique players)
    let qbIdx = 0,
      rbIdx = 0,
      wrIdx = 0,
      teIdx = 0;

    for (const fs of createdFranchiseSeasons) {
      // Build roster for this franchise
      const qb1 = playersByPosition.QB[qbIdx++];
      const qb2 = playersByPosition.QB[qbIdx++];
      const rb1 = playersByPosition.RB[rbIdx++];
      const rb2 = playersByPosition.RB[rbIdx++];
      const rb3 = playersByPosition.RB[rbIdx++];
      const rb4 = playersByPosition.RB[rbIdx++];
      const wr1 = playersByPosition.WR[wrIdx++];
      const wr2 = playersByPosition.WR[wrIdx++];
      const wr3 = playersByPosition.WR[wrIdx++];
      const wr4 = playersByPosition.WR[wrIdx++];
      const te1 = playersByPosition.TE[teIdx++];
      const te2 = playersByPosition.TE[teIdx++];

      // Create lineup for each week (same lineup each week for simplicity)
      // Slot indices match rosterSlots array: [QB, RB, RB, WR, WR, TE, FLEX, BENCH...]
      for (let week = 1; week <= regularSeasonWeeks; week++) {
        // Starters
        if (qb1)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: qb1,
            rosterSlotIndex: 0, // QB slot
          });
        if (rb1)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: rb1,
            rosterSlotIndex: 1, // RB1 slot
          });
        if (rb2)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: rb2,
            rosterSlotIndex: 2, // RB2 slot
          });
        if (wr1)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: wr1,
            rosterSlotIndex: 3, // WR1 slot
          });
        if (wr2)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: wr2,
            rosterSlotIndex: 4, // WR2 slot
          });
        if (te1)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: te1,
            rosterSlotIndex: 5, // TE slot
          });
        if (rb3)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: rb3,
            rosterSlotIndex: 6, // FLEX slot
          });
        // Bench
        if (qb2)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: qb2,
            rosterSlotIndex: 7, // Bench slot
          });
        if (rb4)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: rb4,
            rosterSlotIndex: 7, // Bench slot (same index, multiple bench spots)
          });
        if (wr3)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: wr3,
            rosterSlotIndex: 7, // Bench slot
          });
        if (wr4)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: wr4,
            rosterSlotIndex: 7, // Bench slot
          });
        if (te2)
          allLineupEntries.push({
            franchiseSeasonId: fs.id,
            weekNumber: week,
            playerId: te2,
            rosterSlotIndex: 7, // Bench slot
          });
      }
    }

    // Insert lineups in chunks
    for (let i = 0; i < allLineupEntries.length; i += chunkSize) {
      const chunk = allLineupEntries.slice(i, i + chunkSize);
      await db.insert(weeklyLineups).values(chunk);
    }

    console.log(`✓ Created ${allLineupEntries.length} weekly lineup entries`);

    // =========================================================================
    // MATCHUPS - Generate schedule for all weeks
    // =========================================================================
    console.log('\n🗓️  Generating matchup schedule...');

    function generateRoundRobin(
      ids: string[]
    ): { home: string; away: string }[][] {
      const teams = [...ids];
      const numTeams = teams.length;
      const schedule: { home: string; away: string }[][] = [];

      for (let round = 0; round < numTeams - 1; round++) {
        const weekMatchups: { home: string; away: string }[] = [];
        for (let i = 0; i < numTeams / 2; i++) {
          weekMatchups.push({ home: teams[i], away: teams[numTeams - 1 - i] });
        }
        schedule.push(weekMatchups);
        const lastTeam = teams.pop()!;
        teams.splice(1, 0, lastTeam);
      }
      return schedule;
    }

    const franchiseSeasonIds = createdFranchiseSeasons.map((fs) => fs.id);
    const baseSchedule = generateRoundRobin(franchiseSeasonIds);

    const fullSchedule: { home: string; away: string }[][] = [];
    let iteration = 0;
    while (fullSchedule.length < regularSeasonWeeks) {
      for (const week of baseSchedule) {
        if (fullSchedule.length >= regularSeasonWeeks) break;
        if (iteration % 2 === 1) {
          fullSchedule.push(week.map((m) => ({ home: m.away, away: m.home })));
        } else {
          fullSchedule.push([...week]);
        }
      }
      iteration++;
    }

    const matchupsToInsert = fullSchedule.flatMap((weekMatchups, weekIndex) =>
      weekMatchups.map((m) => ({
        leagueSeasonId: season2024.id,
        weekNumber: weekIndex + 1,
        homeFranchiseSeasonId: m.home,
        awayFranchiseSeasonId: m.away,
        isPlayoff: false,
      }))
    );

    await db.insert(matchups).values(matchupsToInsert);
    console.log(
      `✓ Created ${matchupsToInsert.length} matchups for ${regularSeasonWeeks} weeks`
    );

    // =========================================================================
    // SCORE MATCHUPS
    // =========================================================================
    console.log('\n🎯 Calculating matchup scores...');

    function calculatePlayerScore(
      stats: {
        passingYards: number | null;
        passingTds: number | null;
        passingInts: number | null;
        rushingYards: number | null;
        rushingTds: number | null;
        receptions: number | null;
        receivingYards: number | null;
        receivingTds: number | null;
        fumblesLost: number | null;
      },
      position: string
    ): number {
      let score = 0;
      score += (stats.passingYards || 0) * 0.04;
      score += (stats.passingTds || 0) * 4;
      score += (stats.passingInts || 0) * -2;
      score += (stats.rushingYards || 0) * 0.1;
      score += (stats.rushingTds || 0) * 6;

      const pprValue = position === 'TE' ? 1.5 : position === 'WR' ? 1.0 : 0.5;
      score += (stats.receptions || 0) * pprValue;
      score += (stats.receivingYards || 0) * 0.1;
      score += (stats.receivingTds || 0) * 6;
      score += (stats.fumblesLost || 0) * -2;

      if ((stats.passingYards || 0) >= 300) score += 3;
      if ((stats.rushingYards || 0) >= 100) score += 3;
      if ((stats.receivingYards || 0) >= 100) score += 3;

      return Math.round(score * 100) / 100;
    }

    const allMatchups = await db
      .select()
      .from(matchups)
      .where(eq(matchups.leagueSeasonId, season2024.id));
    const allLineups = await db.select().from(weeklyLineups);
    const allStats = await db
      .select()
      .from(playerWeeklyStats)
      .where(eq(playerWeeklyStats.season, 2024));

    const lineupsByFranchiseWeek = new Map<string, typeof allLineups>();
    for (const l of allLineups) {
      const key = `${l.franchiseSeasonId}-${l.weekNumber}`;
      if (!lineupsByFranchiseWeek.has(key)) lineupsByFranchiseWeek.set(key, []);
      lineupsByFranchiseWeek.get(key)!.push(l);
    }

    const statsByPlayerWeek = new Map<string, (typeof allStats)[0]>();
    for (const s of allStats) {
      statsByPlayerWeek.set(`${s.playerId}-${s.weekNumber}`, s);
    }

    const positionByPlayer = new Map<string, string>();
    for (const ps of allPlayerSeasons) {
      positionByPlayer.set(ps.playerId, ps.position);
    }

    function getFranchiseScore(
      franchiseSeasonId: string,
      week: number
    ): number {
      const lineup =
        lineupsByFranchiseWeek.get(`${franchiseSeasonId}-${week}`) || [];
      // Starters are slots 0-6 (based on rosterSlots config)
      const starters = lineup.filter((l) => l.rosterSlotIndex < 7);
      let total = 0;
      for (const starter of starters) {
        const stats = statsByPlayerWeek.get(`${starter.playerId}-${week}`);
        const position = positionByPlayer.get(starter.playerId) || 'RB';
        if (stats) total += calculatePlayerScore(stats, position);
      }
      return Math.round(total * 100) / 100;
    }

    for (const matchup of allMatchups) {
      const homeScore = getFranchiseScore(
        matchup.homeFranchiseSeasonId,
        matchup.weekNumber
      );
      const awayScore = matchup.awayFranchiseSeasonId
        ? getFranchiseScore(matchup.awayFranchiseSeasonId, matchup.weekNumber)
        : null;

      await db
        .update(matchups)
        .set({
          homeScore: homeScore.toString(),
          awayScore: awayScore?.toString() || null,
          completedAt: new Date(), // Mark as completed
          updatedAt: new Date(),
        })
        .where(eq(matchups.id, matchup.id));
    }

    console.log(`✓ Scored ${allMatchups.length} matchups`);

    // =========================================================================
    // CALCULATE STANDINGS
    // =========================================================================
    console.log('\n📊 Calculating standings...');

    const scoredMatchups = await db
      .select()
      .from(matchups)
      .where(eq(matchups.leagueSeasonId, season2024.id));

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
    for (const fs of createdFranchiseSeasons) {
      franchiseStats.set(fs.id, {
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      });
    }

    for (const m of scoredMatchups) {
      const homeScore = m.homeScore ? parseFloat(m.homeScore) : 0;
      const awayScore = m.awayScore ? parseFloat(m.awayScore) : 0;

      const homeStats = franchiseStats.get(m.homeFranchiseSeasonId)!;
      const awayStats = m.awayFranchiseSeasonId
        ? franchiseStats.get(m.awayFranchiseSeasonId)
        : null;

      homeStats.pointsFor += homeScore;
      if (awayStats) {
        awayStats.pointsFor += awayScore;
        homeStats.pointsAgainst += awayScore;
        awayStats.pointsAgainst += homeScore;

        if (homeScore > awayScore) {
          homeStats.wins++;
          awayStats.losses++;
        } else if (awayScore > homeScore) {
          homeStats.losses++;
          awayStats.wins++;
        } else {
          homeStats.ties++;
          awayStats.ties++;
        }
      }
    }

    for (const [fsId, stats] of franchiseStats) {
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
        .where(eq(franchiseSeasons.id, fsId));
    }

    const standingsList = Array.from(franchiseStats.entries())
      .map(([fsId, stats]) => ({ fsId, ...stats }))
      .sort((a, b) =>
        b.wins !== a.wins ? b.wins - a.wins : b.pointsFor - a.pointsFor
      );

    console.log('✓ Standings calculated');
    console.log('\n  Standings:');
    standingsList.forEach((s, i) => {
      console.log(
        `    ${i + 1}. ${s.wins}-${s.losses}-${s.ties} (${s.pointsFor.toFixed(1)} PF)`
      );
    });

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Summary:');
    console.log('  - 8 users');
    console.log('  - 1 league (The Championship League)');
    console.log('  - 8 franchises');
    console.log('  - 1 season (2024, active)');
    console.log('  - 8 franchise seasons with standings');
    console.log(`  - ${createdPlayers.length} NFL players`);
    console.log(`  - ${weeklyStatsToInsert.length} weekly stat entries`);
    console.log(`  - ${nflGamesToInsert.length} NFL games`);
    console.log(`  - ${allLineupEntries.length} weekly lineup entries`);
    console.log(`  - ${matchupsToInsert.length} matchups (all scored)`);
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
