import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DATA_DIR = path.join(__dirname, '../seed-data');

// Top NFL players for 2024 (real names, positions, teams)
const top60Players = [
  // QBs (Top 20)
  { name: 'Josh Allen', position: 'QB', team: 'BUF', jerseyNumber: 17 },
  { name: 'Patrick Mahomes', position: 'QB', team: 'KC', jerseyNumber: 15 },
  { name: 'Jalen Hurts', position: 'QB', team: 'PHI', jerseyNumber: 1 },
  { name: 'Lamar Jackson', position: 'QB', team: 'BAL', jerseyNumber: 8 },
  { name: 'Joe Burrow', position: 'QB', team: 'CIN', jerseyNumber: 9 },
  { name: 'Justin Herbert', position: 'QB', team: 'LAC', jerseyNumber: 10 },
  { name: 'Dak Prescott', position: 'QB', team: 'DAL', jerseyNumber: 4 },
  { name: 'Trevor Lawrence', position: 'QB', team: 'JAX', jerseyNumber: 16 },
  { name: 'Jordan Love', position: 'QB', team: 'GB', jerseyNumber: 10 },
  { name: 'Brock Purdy', position: 'QB', team: 'SF', jerseyNumber: 13 },
  { name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', jerseyNumber: 1 },
  { name: 'CJ Stroud', position: 'QB', team: 'HOU', jerseyNumber: 7 },
  { name: 'Jared Goff', position: 'QB', team: 'DET', jerseyNumber: 16 },
  { name: 'Anthony Richardson', position: 'QB', team: 'IND', jerseyNumber: 5 },
  { name: 'Matthew Stafford', position: 'QB', team: 'LAR', jerseyNumber: 9 },
  { name: 'Deshaun Watson', position: 'QB', team: 'CLE', jerseyNumber: 4 },
  { name: 'Geno Smith', position: 'QB', team: 'SEA', jerseyNumber: 7 },
  { name: 'Kirk Cousins', position: 'QB', team: 'ATL', jerseyNumber: 18 },
  { name: 'Baker Mayfield', position: 'QB', team: 'TB', jerseyNumber: 6 },
  { name: 'Derek Carr', position: 'QB', team: 'NO', jerseyNumber: 4 },

  // RBs (Top 20)
  { name: 'Christian McCaffrey', position: 'RB', team: 'SF', jerseyNumber: 23 },
  { name: 'Saquon Barkley', position: 'RB', team: 'PHI', jerseyNumber: 26 },
  { name: 'Derrick Henry', position: 'RB', team: 'BAL', jerseyNumber: 22 },
  { name: 'Breece Hall', position: 'RB', team: 'NYJ', jerseyNumber: 20 },
  { name: 'Josh Jacobs', position: 'RB', team: 'GB', jerseyNumber: 8 },
  { name: 'Bijan Robinson', position: 'RB', team: 'ATL', jerseyNumber: 7 },
  { name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', jerseyNumber: 26 },
  { name: 'Kenneth Walker III', position: 'RB', team: 'SEA', jerseyNumber: 9 },
  { name: "De'Von Achane", position: 'RB', team: 'MIA', jerseyNumber: 28 },
  { name: 'Jonathan Taylor', position: 'RB', team: 'IND', jerseyNumber: 28 },
  { name: 'Travis Etienne', position: 'RB', team: 'JAX', jerseyNumber: 1 },
  { name: 'Kyren Williams', position: 'RB', team: 'LAR', jerseyNumber: 23 },
  { name: 'David Montgomery', position: 'RB', team: 'DET', jerseyNumber: 5 },
  { name: 'Joe Mixon', position: 'RB', team: 'HOU', jerseyNumber: 28 },
  { name: 'Aaron Jones', position: 'RB', team: 'MIN', jerseyNumber: 33 },
  { name: 'Rachaad White', position: 'RB', team: 'TB', jerseyNumber: 29 },
  { name: 'James Cook', position: 'RB', team: 'BUF', jerseyNumber: 4 },
  { name: 'Rhamondre Stevenson', position: 'RB', team: 'NE', jerseyNumber: 38 },
  { name: 'Najee Harris', position: 'RB', team: 'PIT', jerseyNumber: 22 },
  { name: 'Tony Pollard', position: 'RB', team: 'TEN', jerseyNumber: 20 },

  // WRs (Top 20)
  { name: 'CeeDee Lamb', position: 'WR', team: 'DAL', jerseyNumber: 88 },
  { name: 'Tyreek Hill', position: 'WR', team: 'MIA', jerseyNumber: 10 },
  { name: 'Justin Jefferson', position: 'WR', team: 'MIN', jerseyNumber: 18 },
  { name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', jerseyNumber: 14 },
  { name: 'AJ Brown', position: 'WR', team: 'PHI', jerseyNumber: 11 },
  { name: "Ja'Marr Chase", position: 'WR', team: 'CIN', jerseyNumber: 1 },
  { name: 'Puka Nacua', position: 'WR', team: 'LAR', jerseyNumber: 17 },
  { name: 'Garrett Wilson', position: 'WR', team: 'NYJ', jerseyNumber: 5 },
  { name: 'Nico Collins', position: 'WR', team: 'HOU', jerseyNumber: 12 },
  { name: 'Brandon Aiyuk', position: 'WR', team: 'SF', jerseyNumber: 11 },
  { name: 'Cooper Kupp', position: 'WR', team: 'LAR', jerseyNumber: 10 },
  { name: 'DK Metcalf', position: 'WR', team: 'SEA', jerseyNumber: 14 },
  { name: 'Davante Adams', position: 'WR', team: 'LV', jerseyNumber: 17 },
  { name: 'DeVonta Smith', position: 'WR', team: 'PHI', jerseyNumber: 6 },
  { name: 'Chris Olave', position: 'WR', team: 'NO', jerseyNumber: 12 },
  { name: 'Drake London', position: 'WR', team: 'ATL', jerseyNumber: 5 },
  { name: 'Stefon Diggs', position: 'WR', team: 'HOU', jerseyNumber: 1 },
  { name: 'Amari Cooper', position: 'WR', team: 'BUF', jerseyNumber: 18 },
  { name: 'Terry McLaurin', position: 'WR', team: 'WAS', jerseyNumber: 17 },
  { name: 'DJ Moore', position: 'WR', team: 'CHI', jerseyNumber: 2 },

  // TEs (Top 10)
  { name: 'Travis Kelce', position: 'TE', team: 'KC', jerseyNumber: 87 },
  { name: 'Sam LaPorta', position: 'TE', team: 'DET', jerseyNumber: 87 },
  { name: 'Trey McBride', position: 'TE', team: 'ARI', jerseyNumber: 85 },
  { name: 'George Kittle', position: 'TE', team: 'SF', jerseyNumber: 85 },
  { name: 'Evan Engram', position: 'TE', team: 'JAX', jerseyNumber: 17 },
  { name: 'TJ Hockenson', position: 'TE', team: 'MIN', jerseyNumber: 87 },
  { name: 'Kyle Pitts', position: 'TE', team: 'ATL', jerseyNumber: 8 },
  { name: 'Mark Andrews', position: 'TE', team: 'BAL', jerseyNumber: 89 },
  { name: 'Dalton Kincaid', position: 'TE', team: 'BUF', jerseyNumber: 86 },
  { name: 'David Njoku', position: 'TE', team: 'CLE', jerseyNumber: 85 },
];

function generateWeeklyStats(
  playerName: string,
  position: string,
  week: number
) {
  const stats: any = {
    player_name: playerName,
    week_number: week,
  };

  // Generate realistic stats based on position
  switch (position) {
    case 'QB':
      stats.passing_yards = Math.floor(200 + Math.random() * 200);
      stats.passing_tds = Math.floor(Math.random() * 4);
      stats.passing_ints = Math.floor(Math.random() * 2);
      stats.completions = Math.floor(15 + Math.random() * 20);
      stats.attempts = Math.floor(25 + Math.random() * 20);
      stats.rushing_yards = Math.floor(Math.random() * 40);
      stats.rushing_tds = Math.random() > 0.7 ? 1 : 0;
      stats.rushing_attempts = Math.floor(Math.random() * 8);
      break;

    case 'RB':
      stats.rushing_yards = Math.floor(30 + Math.random() * 120);
      stats.rushing_tds = Math.floor(Math.random() * 2);
      stats.rushing_attempts = Math.floor(10 + Math.random() * 20);
      stats.receptions = Math.floor(Math.random() * 6);
      stats.receiving_yards = Math.floor(Math.random() * 50);
      stats.receiving_tds = Math.random() > 0.85 ? 1 : 0;
      stats.targets = stats.receptions + Math.floor(Math.random() * 3);
      stats.fumbles_lost = Math.random() > 0.9 ? 1 : 0;
      break;

    case 'WR':
      stats.receptions = Math.floor(3 + Math.random() * 10);
      stats.receiving_yards = Math.floor(40 + Math.random() * 120);
      stats.receiving_tds = Math.random() > 0.7 ? 1 : 0;
      stats.targets = stats.receptions + Math.floor(Math.random() * 4);
      stats.rushing_yards =
        Math.random() > 0.9 ? Math.floor(Math.random() * 20) : 0;
      stats.fumbles_lost = Math.random() > 0.95 ? 1 : 0;
      break;

    case 'TE':
      stats.receptions = Math.floor(2 + Math.random() * 8);
      stats.receiving_yards = Math.floor(20 + Math.random() * 80);
      stats.receiving_tds = Math.random() > 0.75 ? 1 : 0;
      stats.targets = stats.receptions + Math.floor(Math.random() * 3);
      stats.fumbles_lost = Math.random() > 0.95 ? 1 : 0;
      break;
  }

  return stats;
}

async function generateSeedData() {
  console.log('📊 Generating seed data CSVs...\n');

  // Ensure seed-data directory exists
  if (!fs.existsSync(SEED_DATA_DIR)) {
    fs.mkdirSync(SEED_DATA_DIR, { recursive: true });
  }

  // Generate players CSV
  console.log('Creating players-2024.csv...');
  const playersCSV = [
    'name,position,team,jersey_number',
    ...top60Players.map(
      (p) => `"${p.name}",${p.position},${p.team},${p.jerseyNumber}`
    ),
  ].join('\n');

  fs.writeFileSync(
    path.join(SEED_DATA_DIR, 'players-2024.csv'),
    playersCSV,
    'utf8'
  );
  console.log(`✓ Created ${top60Players.length} players\n`);

  // Generate weekly stats CSV for weeks 1-10
  console.log('Creating player-stats-2024.csv (weeks 1-10)...');
  const weeksToGenerate = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const statsRows: string[] = [
    'player_name,week_number,passing_yards,passing_tds,passing_ints,completions,attempts,rushing_yards,rushing_tds,rushing_attempts,receptions,receiving_yards,receiving_tds,targets,fumbles_lost',
  ];

  let totalStats = 0;
  for (const player of top60Players) {
    for (const week of weeksToGenerate) {
      const stats = generateWeeklyStats(player.name, player.position, week);
      statsRows.push(
        `"${stats.player_name}",${stats.week_number},${
          stats.passing_yards || ''
        },${stats.passing_tds || ''},${stats.passing_ints || ''},${
          stats.completions || ''
        },${stats.attempts || ''},${stats.rushing_yards || ''},${
          stats.rushing_tds || ''
        },${stats.rushing_attempts || ''},${stats.receptions || ''},${
          stats.receiving_yards || ''
        },${stats.receiving_tds || ''},${stats.targets || ''},${stats.fumbles_lost || ''}`
      );
      totalStats++;
    }
  }

  fs.writeFileSync(
    path.join(SEED_DATA_DIR, 'player-stats-2024.csv'),
    statsRows.join('\n'),
    'utf8'
  );
  console.log(`✓ Created ${totalStats} weekly stat entries\n`);

  console.log('✅ Seed data generation complete!\n');
  console.log('📁 Files created:');
  console.log(`  - ${SEED_DATA_DIR}/players-2024.csv`);
  console.log(`  - ${SEED_DATA_DIR}/player-stats-2024.csv`);
  console.log('\nRun `pnpm db:seed` to import this data.');
}

generateSeedData().catch(console.error);
