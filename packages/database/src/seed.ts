import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
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
} from './index.js';

// Load environment variables
dotenv.config({ path: '../../.env' });

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
    const [league] = await db
      .insert(leagues)
      .values({
        name: 'The Championship League',
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
      scoringRules: {
        passing: {
          yards: { value: 0.04, per: 1 },
          touchdowns: { value: 4 },
          interceptions: -2,
        },
        rushing: {
          yards: 0.1,
          touchdowns: 6,
          bonuses: [{ condition: 'yards >= 100', value: 3 }],
        },
        receiving: {
          receptions: {
            default: 1.0,
            byPosition: {
              TE: 1.5, // TE Premium
              RB: 0.5,
            },
          },
          yards: 0.1,
          touchdowns: 6,
        },
      },
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
    // PLAYERS
    // =========================================================================
    console.log('\n⭐ Creating NFL players...');
    const createdPlayers = await db
      .insert(players)
      .values([
        // QBs
        { nflId: 'mahomes', name: 'Patrick Mahomes' },
        { nflId: 'allen', name: 'Josh Allen' },
        { nflId: 'jackson', name: 'Lamar Jackson' },
        { nflId: 'burrow', name: 'Joe Burrow' },
        // RBs
        { nflId: 'mccaffrey', name: 'Christian McCaffrey' },
        { nflId: 'ekeler', name: 'Austin Ekeler' },
        { nflId: 'barkley', name: 'Saquon Barkley' },
        { nflId: 'henry', name: 'Derrick Henry' },
        { nflId: 'chubb', name: 'Nick Chubb' },
        { nflId: 'cook', name: 'Dalvin Cook' },
        // WRs
        { nflId: 'jefferson', name: 'Justin Jefferson' },
        { nflId: 'chase', name: "Ja'Marr Chase" },
        { nflId: 'hill', name: 'Tyreek Hill' },
        { nflId: 'adams', name: 'Davante Adams' },
        { nflId: 'diggs', name: 'Stefon Diggs' },
        { nflId: 'lamb', name: 'CeeDee Lamb' },
        // TEs
        { nflId: 'kelce', name: 'Travis Kelce' },
        { nflId: 'andrews', name: 'Mark Andrews' },
        { nflId: 'kittle', name: 'George Kittle' },
        { nflId: 'hockenson', name: 'TJ Hockenson' },
      ])
      .returning();

    console.log(`✓ Created ${createdPlayers.length} NFL players`);

    // =========================================================================
    // PLAYER SEASONS
    // =========================================================================
    console.log('\n📅 Creating player seasons (2024)...');
    await db.insert(playerSeasons).values([
      // QBs
      { playerId: createdPlayers[0].id, season: 2024, nflTeam: 'KC', position: 'QB', status: 'active', jerseyNumber: 15 },
      { playerId: createdPlayers[1].id, season: 2024, nflTeam: 'BUF', position: 'QB', status: 'active', jerseyNumber: 17 },
      { playerId: createdPlayers[2].id, season: 2024, nflTeam: 'BAL', position: 'QB', status: 'active', jerseyNumber: 8 },
      { playerId: createdPlayers[3].id, season: 2024, nflTeam: 'CIN', position: 'QB', status: 'active', jerseyNumber: 9 },
      // RBs
      { playerId: createdPlayers[4].id, season: 2024, nflTeam: 'SF', position: 'RB', status: 'active', jerseyNumber: 23 },
      { playerId: createdPlayers[5].id, season: 2024, nflTeam: 'LAC', position: 'RB', status: 'active', jerseyNumber: 30 },
      { playerId: createdPlayers[6].id, season: 2024, nflTeam: 'PHI', position: 'RB', status: 'active', jerseyNumber: 26 },
      { playerId: createdPlayers[7].id, season: 2024, nflTeam: 'BAL', position: 'RB', status: 'active', jerseyNumber: 22 },
      { playerId: createdPlayers[8].id, season: 2024, nflTeam: 'CLE', position: 'RB', status: 'active', jerseyNumber: 24 },
      { playerId: createdPlayers[9].id, season: 2024, nflTeam: 'NYJ', position: 'RB', status: 'active', jerseyNumber: 33 },
      // WRs
      { playerId: createdPlayers[10].id, season: 2024, nflTeam: 'MIN', position: 'WR', status: 'active', jerseyNumber: 18 },
      { playerId: createdPlayers[11].id, season: 2024, nflTeam: 'CIN', position: 'WR', status: 'active', jerseyNumber: 1 },
      { playerId: createdPlayers[12].id, season: 2024, nflTeam: 'MIA', position: 'WR', status: 'active', jerseyNumber: 10 },
      { playerId: createdPlayers[13].id, season: 2024, nflTeam: 'LV', position: 'WR', status: 'active', jerseyNumber: 17 },
      { playerId: createdPlayers[14].id, season: 2024, nflTeam: 'BUF', position: 'WR', status: 'active', jerseyNumber: 14 },
      { playerId: createdPlayers[15].id, season: 2024, nflTeam: 'DAL', position: 'WR', status: 'active', jerseyNumber: 88 },
      // TEs
      { playerId: createdPlayers[16].id, season: 2024, nflTeam: 'KC', position: 'TE', status: 'active', jerseyNumber: 87 },
      { playerId: createdPlayers[17].id, season: 2024, nflTeam: 'BAL', position: 'TE', status: 'active', jerseyNumber: 89 },
      { playerId: createdPlayers[18].id, season: 2024, nflTeam: 'SF', position: 'TE', status: 'active', jerseyNumber: 85 },
      { playerId: createdPlayers[19].id, season: 2024, nflTeam: 'MIN', position: 'TE', status: 'active', jerseyNumber: 87 },
    ]);

    console.log('✓ Created player seasons for 2024');

    // =========================================================================
    // ROSTERS
    // =========================================================================
    console.log('\n📋 Adding players to rosters...');

    // Team 1 roster (Admin's All-Stars)
    await db.insert(rosterPlayers).values([
      { teamSeasonId: ts1.id, playerId: createdPlayers[0].id, slotType: 'QB' },
      { teamSeasonId: ts1.id, playerId: createdPlayers[4].id, slotType: 'RB' },
      { teamSeasonId: ts1.id, playerId: createdPlayers[5].id, slotType: 'RB' },
      { teamSeasonId: ts1.id, playerId: createdPlayers[10].id, slotType: 'WR' },
      { teamSeasonId: ts1.id, playerId: createdPlayers[11].id, slotType: 'WR' },
      { teamSeasonId: ts1.id, playerId: createdPlayers[16].id, slotType: 'TE' },
      { teamSeasonId: ts1.id, playerId: createdPlayers[6].id, slotType: 'FLEX' },
    ]);

    // Team 2 roster (Sarah's Squad)
    await db.insert(rosterPlayers).values([
      { teamSeasonId: ts2.id, playerId: createdPlayers[1].id, slotType: 'QB' },
      { teamSeasonId: ts2.id, playerId: createdPlayers[7].id, slotType: 'RB' },
      { teamSeasonId: ts2.id, playerId: createdPlayers[8].id, slotType: 'RB' },
      { teamSeasonId: ts2.id, playerId: createdPlayers[12].id, slotType: 'WR' },
      { teamSeasonId: ts2.id, playerId: createdPlayers[13].id, slotType: 'WR' },
      { teamSeasonId: ts2.id, playerId: createdPlayers[17].id, slotType: 'TE' },
      { teamSeasonId: ts2.id, playerId: createdPlayers[14].id, slotType: 'FLEX' },
    ]);

    // Team 3 roster (Mike's Monsters) - smaller roster for testing
    await db.insert(rosterPlayers).values([
      { teamSeasonId: ts3.id, playerId: createdPlayers[2].id, slotType: 'QB' },
      { teamSeasonId: ts3.id, playerId: createdPlayers[9].id, slotType: 'RB' },
      { teamSeasonId: ts3.id, playerId: createdPlayers[15].id, slotType: 'WR' },
      { teamSeasonId: ts3.id, playerId: createdPlayers[18].id, slotType: 'TE' },
    ]);

    console.log('✓ Added players to team rosters');

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
    console.log('  - 20 NFL players with 2024 data');
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
