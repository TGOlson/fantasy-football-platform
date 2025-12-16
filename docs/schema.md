# Database Schema

Complete database schema for the fantasy football platform.

**Architecture:** Multi-season support with stable league and team IDs. Leagues are "franchises" that persist across seasons.

---

## Core Tables

### users
**Purpose:** User accounts for platform authentication and ownership
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| email | text | Unique, required |
| password_hash | text | bcrypt hash |
| name | text | Display name |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

### leagues
**Purpose:** Stable league "franchises" that persist across seasons
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key - stable across seasons |
| name | text | League name (e.g., "The Championship League") |
| commissioner_id | text (UUID) | FK to users, who manages this league |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Notes:**
- This is the stable league identity
- URL: `/leagues/abc-123` shows all seasons
- Commissioner can change ownership

### league_seasons
**Purpose:** Yearly instances of a league
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| league_id | text (UUID) | FK to leagues, cascade delete |
| season | integer | Year (e.g., 2024) |
| status | text | setup, active, completed, archived |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Indexes:**
- `league_id, season` (unique) - one season per year per league

**Notes:**
- Status lifecycle: setup → active → completed → archived
- URL: `/leagues/abc-123/seasons/2024`
- Most queries will be against the active season

### teams
**Purpose:** Stable team "franchises" within a league
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key - stable across seasons |
| league_id | text (UUID) | FK to leagues, cascade delete |
| owner_id | text (UUID) | FK to users, current owner |
| name | text | Team name (e.g., "Tyler's Team") |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Notes:**
- Stable team identity within a league
- Owner can change between seasons (trades/takeovers)
- Team belongs to parent league, participates in seasons via team_seasons

### team_seasons
**Purpose:** Team participation in a specific season
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| team_id | text (UUID) | FK to teams, cascade delete |
| league_season_id | text (UUID) | FK to league_seasons, cascade delete |
| is_active | boolean | Did team play this season? (default: true) |
| final_rank | integer | Final standings position (nullable until season ends) |
| wins | integer | Season win count (default: 0) |
| losses | integer | Season loss count (default: 0) |
| ties | integer | Season tie count (default: 0) |
| points_for | decimal(10,2) | Total points scored (default: 0) |
| points_against | decimal(10,2) | Total points allowed (default: 0) |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Indexes:**
- `team_id, league_season_id` (unique) - team participates once per season
- `league_season_id` - for standings queries

**Notes:**
- Tracks season-specific performance
- `is_active = false` for teams that sat out a season
- Stats denormalized here for fast standings queries

### players
**Purpose:** Core NFL player identities (season-agnostic)
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| nfl_id | text | External NFL player ID from FTN Data/SportsDataIO (unique) |
| name | text | Player name |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Notes:**
- Stable player identity
- Position and NFL team are season-specific (see `player_seasons`)

---

## League Configuration

### league_settings
**Purpose:** All league configuration per season (roster config + scoring rules)
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| league_season_id | text (UUID) | FK to league_seasons, unique, cascade delete |
| team_count | integer | Number of teams (default: 10) |
| roster_positions | jsonb | `{QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, BENCH: 6}` |
| playoff_teams | integer | Teams that make playoffs (default: 4) |
| playoff_start_week | integer | Week playoffs begin (default: 15) |
| trade_deadline_week | integer | Last week trades allowed (default: 11) |
| scoring_rules | jsonb | Scoring configuration (see ScoringRulesJson type) |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Notes:**
- One settings config per season (can change year to year)
- Settings can be copied from previous season
- JSONB allows flexible structure

---

## Player Data

### player_seasons
**Purpose:** Season-specific player data (NFL team, position, status)
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| player_id | text (UUID) | FK to players, cascade delete |
| season | integer | Year (e.g., 2024) |
| nfl_team | text | NFL team abbreviation (KC, SF, etc.) |
| position | text | QB, RB, WR, TE, K, DEF |
| status | text | active, injured_reserve, retired, practice_squad |
| jersey_number | integer | Optional |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Indexes:**
- `player_id, season` (unique) - one entry per player per season

**Notes:**
- Position can change year-to-year (e.g., Taysom Hill)
- NFL team changes via trades/free agency
- Status tracks availability

### player_weekly_stats
**Purpose:** Weekly NFL stats for score calculations
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| player_id | text (UUID) | FK to players, cascade delete |
| season | integer | Year |
| week_number | integer | 1-18 (NFL weeks) |
| passing_yards | integer | Nullable |
| passing_tds | integer | Nullable |
| passing_ints | integer | Nullable |
| completions | integer | Nullable |
| attempts | integer | Nullable |
| rushing_yards | integer | Nullable |
| rushing_tds | integer | Nullable |
| rushing_attempts | integer | Nullable |
| receptions | integer | Nullable |
| receiving_yards | integer | Nullable |
| receiving_tds | integer | Nullable |
| targets | integer | Nullable |
| fumbles_lost | integer | Nullable |
| two_point_conversions | integer | Nullable |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Indexes:**
- `player_id, season, week_number` (unique) - one stat line per player per week
- `season, week_number` - for bulk week queries

**Notes:**
- All stat columns nullable (not all positions use all stats)
- Data sourced from FTN Data or SportsDataIO API
- Cache strategy: completed weeks never change, live weeks have 30s TTL

---

## Rosters & Matchups

### roster_players
**Purpose:** Which NFL players are on which team's roster for a specific season
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| team_season_id | text (UUID) | FK to team_seasons, cascade delete |
| player_id | text (UUID) | FK to players, cascade delete |
| slot_type | text | QB, RB, WR, TE, FLEX, BENCH, K, DEF |
| acquired_at | timestamp | When player was added to roster |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Indexes:**
- `team_season_id, player_id` (unique) - player rostered once per team per season
- `team_season_id` - for fetching team rosters

**Notes:**
- Tied to team_season (rosters are season-specific)
- Slot type determines lineup position
- BENCH = not starting, anything else = starting
- Players can be on multiple teams across different leagues/seasons

### matchups
**Purpose:** Weekly head-to-head matchups between teams
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| league_season_id | text (UUID) | FK to league_seasons, cascade delete |
| week_number | integer | 1-18 (NFL regular season weeks) |
| team1_season_id | text (UUID) | FK to team_seasons, cascade delete |
| team2_season_id | text (UUID) | FK to team_seasons, nullable for BYE weeks, cascade delete |
| team1_score | decimal(10,2) | Calculated score, nullable until week completes |
| team2_score | decimal(10,2) | Calculated score, nullable until week completes |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-set |

**Indexes:**
- `league_season_id, week_number` - for fetching weekly matchups
- `team1_season_id, team2_season_id` - for team schedule views

**Notes:**
- Scores calculated on-the-fly from player stats and cached here
- `team2_season_id` nullable supports BYE weeks (odd number of teams)
- Commissioner can manually adjust scores if needed

---

## NFL Teams

**Implementation:** Hardcoded TypeScript constants (not in database)

```typescript
// packages/types/src/nfl-teams.ts
export const NFL_TEAMS = {
  KC: { fullName: 'Kansas City Chiefs', abbr: 'KC', logo: '/logos/kc.svg' },
  SF: { fullName: 'San Francisco 49ers', abbr: 'SF', logo: '/logos/sf.svg' },
  // ... all 32 teams
} as const;
```

**Rationale:** Teams rarely change, no need for DB joins, easy to update

---

## Relationships Summary

```
users
  ├─ leagues (commissioner_id) - user manages leagues
  └─ teams (owner_id) - user owns teams

leagues (stable franchise)
  ├─ league_seasons (league_id) - league has many seasons
  └─ teams (league_id) - league has many team franchises

league_seasons
  ├─ league_settings (league_season_id) - one settings config per season
  ├─ team_seasons (league_season_id) - teams participate in this season
  └─ matchups (league_season_id) - season has many matchups

teams (stable franchise)
  └─ team_seasons (team_id) - team participates in seasons

team_seasons
  ├─ roster_players (team_season_id) - roster for this season
  └─ matchups (team1_season_id, team2_season_id) - participate in matchups

players (core identity)
  ├─ player_seasons (player_id) - season-specific data
  ├─ player_weekly_stats (player_id) - weekly stats
  └─ roster_players (player_id) - can be on multiple rosters
```

---

## Example Queries

### Get all seasons for a league
```sql
SELECT * FROM league_seasons
WHERE league_id = 'abc-123'
ORDER BY season DESC;
```

### Get current season's teams
```sql
SELECT teams.*, team_seasons.wins, team_seasons.losses
FROM teams
JOIN team_seasons ON teams.id = team_seasons.team_id
WHERE team_seasons.league_season_id = 'current-season-id'
  AND team_seasons.is_active = true
ORDER BY team_seasons.wins DESC;
```

### Get team's history across all seasons
```sql
SELECT
  ls.season,
  ts.wins,
  ts.losses,
  ts.final_rank,
  ts.points_for
FROM team_seasons ts
JOIN league_seasons ls ON ts.league_season_id = ls.id
WHERE ts.team_id = 'xyz-456'
ORDER BY ls.season DESC;
```

### Get player's roster history
```sql
SELECT
  ls.season,
  teams.name as team_name,
  rp.slot_type,
  rp.acquired_at
FROM roster_players rp
JOIN team_seasons ts ON rp.team_season_id = ts.id
JOIN teams ON ts.team_id = teams.id
JOIN league_seasons ls ON ts.league_season_id = ls.id
WHERE rp.player_id = 'player-123'
ORDER BY ls.season DESC, rp.acquired_at DESC;
```

---

## Migration Strategy

**Clean slate migration (all dev data will be cleared):**

1. Drop all existing tables
2. Create new schema in order:
   - `users` (keep existing)
   - `leagues` (new structure)
   - `league_seasons`
   - `league_settings`
   - `teams` (new structure)
   - `team_seasons`
   - `players` (simplified)
   - `player_seasons`
   - `player_weekly_stats`
   - `roster_players`
   - `matchups`

3. Re-seed with sample data for 2024 season
4. Can add historical data (2023) to test multi-season features

---

## UX Implications

**League Homepage** (`/leagues/abc-123`):
- Shows all seasons with tabs/dropdown
- Quick stats: years active, all-time champion, etc.
- Defaults to current/most recent active season

**Season View** (`/leagues/abc-123/seasons/2024`):
- Matchups, standings, rosters for this specific season
- Can navigate between seasons

**Team Profile** (`/teams/xyz-456`):
- Shows team history across all seasons
- Season-by-season stats
- All-time record

**Benefits:**
- Stable URLs for sharing
- League history and rivalries preserved
- Easy to copy settings from previous season
- Foundation for keeper leagues (post-MVP)
