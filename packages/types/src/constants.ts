// NFL Teams (32 teams)
export const NFL_TEAMS = [
  'ARI', // Arizona Cardinals
  'ATL', // Atlanta Falcons
  'BAL', // Baltimore Ravens
  'BUF', // Buffalo Bills
  'CAR', // Carolina Panthers
  'CHI', // Chicago Bears
  'CIN', // Cincinnati Bengals
  'CLE', // Cleveland Browns
  'DAL', // Dallas Cowboys
  'DEN', // Denver Broncos
  'DET', // Detroit Lions
  'GB',  // Green Bay Packers
  'HOU', // Houston Texans
  'IND', // Indianapolis Colts
  'JAX', // Jacksonville Jaguars
  'KC',  // Kansas City Chiefs
  'LAC', // Los Angeles Chargers
  'LAR', // Los Angeles Rams
  'LV',  // Las Vegas Raiders
  'MIA', // Miami Dolphins
  'MIN', // Minnesota Vikings
  'NE',  // New England Patriots
  'NO',  // New Orleans Saints
  'NYG', // New York Giants
  'NYJ', // New York Jets
  'PHI', // Philadelphia Eagles
  'PIT', // Pittsburgh Steelers
  'SEA', // Seattle Seahawks
  'SF',  // San Francisco 49ers
  'TB',  // Tampa Bay Buccaneers
  'TEN', // Tennessee Titans
  'WAS', // Washington Commanders
] as const;

export type NflTeam = typeof NFL_TEAMS[number];

// Fantasy Football Positions
export const POSITIONS = [
  'QB',  // Quarterback
  'RB',  // Running Back
  'WR',  // Wide Receiver
  'TE',  // Tight End
  'K',   // Kicker
  'DEF', // Defense/Special Teams
] as const;

export type Position = typeof POSITIONS[number];

// Roster Slot Types (includes FLEX and BENCH)
export const ROSTER_SLOTS = [
  'QB',
  'RB',
  'WR',
  'TE',
  'FLEX',
  'K',
  'DEF',
  'BENCH',
] as const;

export type RosterSlot = typeof ROSTER_SLOTS[number];

// Player Status
export const PLAYER_STATUSES = [
  'active',
  'injured_reserve',
  'retired',
  'practice_squad',
] as const;

export type PlayerStatus = typeof PLAYER_STATUSES[number];

// Current Season (update annually)
export const CURRENT_SEASON = 2024;
