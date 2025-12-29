import { prisma } from '../client';
import { Position, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const CURRENT_YEAR = 2024;

// Dummy NFL teams
const NFL_TEAMS = [
  'BUF',
  'MIA',
  'NE',
  'NYJ',
  'BAL',
  'CIN',
  'CLE',
  'PIT',
  'HOU',
  'IND',
  'JAX',
  'TEN',
  'DEN',
  'KC',
  'LV',
  'LAC',
  'DAL',
  'NYG',
  'PHI',
  'WAS',
  'CHI',
  'DET',
  'GB',
  'MIN',
  'ATL',
  'CAR',
  'NO',
  'TB',
  'ARI',
  'LAR',
  'SF',
  'SEA',
];

// Generate player names
const FIRST_NAMES = [
  'Patrick',
  'Josh',
  'Lamar',
  'Joe',
  'Justin',
  'Jalen',
  'Dak',
  'Trevor',
  'Tua',
  'Brock',
  'Christian',
  'Derrick',
  'Nick',
  'Austin',
  'Jonathan',
  'Saquon',
  'Breece',
  'Kenneth',
  'Tyreek',
  'Stefon',
  'CeeDee',
  'Justin',
  "Ja'Marr",
  'Amon-Ra',
  'Travis',
  'Mark',
  'George',
  'Dalton',
  'T.J.',
  'Sam',
];

const LAST_NAMES = [
  'Mahomes',
  'Allen',
  'Jackson',
  'Burrow',
  'Herbert',
  'Hurts',
  'Prescott',
  'Lawrence',
  'Tagovailoa',
  'Purdy',
  'McCaffrey',
  'Henry',
  'Chubb',
  'Ekeler',
  'Taylor',
  'Barkley',
  'Hall',
  'Walker',
  'Hill',
  'Diggs',
  'Lamb',
  'Jefferson',
  'Chase',
  'St. Brown',
  'Kelce',
  'Andrews',
  'Kittle',
  'Kincaid',
  'Hockenson',
  'LaPorta',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.rosterTransaction.deleteMany();
  await prisma.weeklyLineup.deleteMany();
  await prisma.matchup.deleteMany();
  await prisma.team.deleteMany();
  await prisma.leagueSeason.deleteMany();
  await prisma.leagueSettings.deleteMany();
  await prisma.franchise.deleteMany();
  await prisma.league.deleteMany();
  await prisma.playerWeeklyStat.deleteMany();
  await prisma.playerWeeklyProjection.deleteMany();
  await prisma.playerSeason.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned\n');

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('password', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      isSiteAdmin: true,
    },
  });
  console.log(`✅ Created admin: ${adminUser.email}\n`);

  // Create 19 regular users (10 for each league, admin will be in one)
  console.log('👥 Creating regular users...');
  const passwordHash = await bcrypt.hash('password', 10);
  const regularUsers = [];
  for (let i = 1; i <= 19; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        passwordHash,
      },
    });
    regularUsers.push(user);
  }
  console.log(`✅ Created ${regularUsers.length} users\n`);

  // Create NFL players
  console.log('🏈 Creating NFL players...');
  const players = [];
  for (let i = 0; i < 100; i++) {
    const position = randomElement([
      Position.QB,
      Position.RB,
      Position.WR,
      Position.TE,
      Position.K,
      Position.DEF,
    ]);
    const player = await prisma.player.create({
      data: {
        nflId: `nfl-player-${i}`,
        name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
      },
    });

    // Create player season
    await prisma.playerSeason.create({
      data: {
        playerId: player.id,
        season: CURRENT_YEAR,
        nflTeam: randomElement(NFL_TEAMS),
        positions: [position],
        status: 'ACTIVE',
        jerseyNumber: randomInt(1, 99),
      },
    });

    // Create weekly stats for 4 weeks
    for (let week = 1; week <= 4; week++) {
      const stats: Prisma.PlayerWeeklyStatCreateInput = {
        player: { connect: { id: player.id } },
        season: CURRENT_YEAR,
        weekNumber: week,
        passingYards: 0,
        passingTds: 0,
        passingInts: 0,
        completions: 0,
        attempts: 0,
        rushingYards: 0,
        rushingTds: 0,
        rushingAttempts: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTds: 0,
        targets: 0,
        fumblesLost: 0,
        twoPointConversions: 0,
      };

      if (position === Position.QB) {
        stats.passingYards = randomInt(150, 400);
        stats.passingTds = randomInt(0, 4);
        stats.passingInts = randomInt(0, 2);
        stats.completions = randomInt(15, 35);
        stats.attempts = randomInt(25, 45);
        stats.rushingYards = randomInt(0, 50);
        stats.rushingTds = randomInt(0, 1);
      } else if (position === Position.RB) {
        stats.rushingYards = randomInt(30, 150);
        stats.rushingTds = randomInt(0, 2);
        stats.rushingAttempts = randomInt(10, 25);
        stats.receptions = randomInt(0, 8);
        stats.receivingYards = randomInt(0, 80);
        stats.receivingTds = randomInt(0, 1);
      } else if (position === Position.WR || position === Position.TE) {
        stats.receptions = randomInt(2, 12);
        stats.receivingYards = randomInt(20, 150);
        stats.receivingTds = randomInt(0, 2);
        stats.targets = randomInt(4, 15);
      }

      await prisma.playerWeeklyStat.create({ data: stats });
    }

    players.push(player);
  }
  console.log(`✅ Created ${players.length} players with stats\n`);

  // Helper to create a league
  async function createLeague(
    name: string,
    slug: string,
    users: { id: string; email: string; name: string }[],
    includeAdmin: boolean
  ) {
    console.log(`🏆 Creating league: ${name}...`);

    const league = await prisma.league.create({
      data: {
        name,
        slug,
      },
    });

    // Create league settings
    const settings = await prisma.leagueSettings.create({
      data: {
        scoringRules: {
          passing: { yards: 0.04, touchdowns: 4, interceptions: -2 },
          rushing: { yards: 0.1, touchdowns: 6 },
          receiving: { receptions: 1, yards: 0.1, touchdowns: 6 },
        },
        rosterSlots: {
          QB: 1,
          RB: 2,
          WR: 2,
          TE: 1,
          FLEX: 1,
          K: 1,
          DEF: 1,
          BENCH: 6,
        },
        playoffTeams: 4,
        playoffStartWeek: 15,
        tradeDeadlineWeek: 10,
      },
    });

    // Create league season
    const commissioner = includeAdmin ? adminUser : users[0];
    const leagueSeason = await prisma.leagueSeason.create({
      data: {
        leagueId: league.id,
        year: CURRENT_YEAR,
        status: 'ACTIVE',
        commissionerId: commissioner.id,
        settingsId: settings.id,
      },
    });

    // Create 10 franchises and teams
    const leagueUsers = includeAdmin
      ? [adminUser, ...users.slice(0, 9)]
      : users.slice(0, 10);

    const franchiseNames = [
      'Thunder',
      'Lightning',
      'Dragons',
      'Warriors',
      'Knights',
      'Titans',
      'Vikings',
      'Spartans',
      'Gladiators',
      'Centurions',
    ];

    const teams = [];
    for (let i = 0; i < 10; i++) {
      const franchise = await prisma.franchise.create({
        data: {
          leagueId: league.id,
        },
      });

      const team = await prisma.team.create({
        data: {
          franchiseId: franchise.id,
          leagueSeasonId: leagueSeason.id,
          ownerId: leagueUsers[i].id,
          name: franchiseNames[i],
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        },
      });

      teams.push(team);
    }

    // Create matchups for 4 weeks
    for (let week = 1; week <= 4; week++) {
      // Create 5 matchups (10 teams / 2)
      for (let matchup = 0; matchup < 5; matchup++) {
        const homeTeamIdx = matchup * 2;
        const awayTeamIdx = matchup * 2 + 1;
        const homeTeam = teams[homeTeamIdx];
        const awayTeam = teams[awayTeamIdx];

        // Generate scores
        const homeScore = randomInt(70, 140) + Math.random();
        const awayScore = randomInt(70, 140) + Math.random();

        await prisma.matchup.create({
          data: {
            leagueSeasonId: leagueSeason.id,
            weekNumber: week,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            homeScore,
            awayScore,
            isPlayoff: false,
            completedAt: new Date(),
          },
        });

        // Update team records
        if (homeScore > awayScore) {
          await prisma.team.update({
            where: { id: homeTeam.id },
            data: {
              wins: { increment: 1 },
              pointsFor: { increment: homeScore },
              pointsAgainst: { increment: awayScore },
            },
          });
          await prisma.team.update({
            where: { id: awayTeam.id },
            data: {
              losses: { increment: 1 },
              pointsFor: { increment: awayScore },
              pointsAgainst: { increment: homeScore },
            },
          });
        } else if (awayScore > homeScore) {
          await prisma.team.update({
            where: { id: awayTeam.id },
            data: {
              wins: { increment: 1 },
              pointsFor: { increment: awayScore },
              pointsAgainst: { increment: homeScore },
            },
          });
          await prisma.team.update({
            where: { id: homeTeam.id },
            data: {
              losses: { increment: 1 },
              pointsFor: { increment: homeScore },
              pointsAgainst: { increment: awayScore },
            },
          });
        } else {
          // Tie (rare)
          await prisma.team.update({
            where: { id: homeTeam.id },
            data: {
              ties: { increment: 1 },
              pointsFor: { increment: homeScore },
              pointsAgainst: { increment: awayScore },
            },
          });
          await prisma.team.update({
            where: { id: awayTeam.id },
            data: {
              ties: { increment: 1 },
              pointsFor: { increment: awayScore },
              pointsAgainst: { increment: homeScore },
            },
          });
        }
      }
    }

    console.log(
      `✅ Created league: ${name} with 10 teams and 4 weeks of matchups\n`
    );
  }

  // Create two leagues
  await createLeague(
    'Premier Fantasy League',
    'premier-league',
    regularUsers,
    true // Include admin
  );

  await createLeague(
    'Elite Championship League',
    'elite-league',
    regularUsers.slice(9), // Different users (9-18 = 10 users)
    false // Don't include admin
  );

  console.log('🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Email: admin@example.com');
  console.log('  Password: password');
  console.log('  (Also in Premier Fantasy League)\n');
  console.log('Other users: user1@example.com through user19@example.com');
  console.log('  Password: password (for all)\n');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
