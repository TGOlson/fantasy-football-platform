# Schema V2

## League Level

```
leagues
  - id, name, slug, created_at

franchises
  - id, league_id, name, created_at
```

## Season Level

```
league_seasons
  - id, league_id, year, status, commissioner_id, created_at

league_settings
  - id, league_season_id (unique)
  - scoring_rules (JSONB)
  - roster_positions (JSONB)
  - playoff_teams, playoff_start_week, trade_deadline_week
  - created_at, updated_at

franchise_seasons
  - id, franchise_id, league_season_id, owner_id
  - wins, losses, ties, points_for, points_against (cached)
  - created_at, updated_at

matchups
  - id, league_season_id, week_number
  - home_franchise_season_id, away_franchise_season_id
  - home_score, away_score (nullable decimal)
  - is_playoff (boolean)
  - completed_at (nullable timestamp)
  - created_at, updated_at
```

## Week Level

```
weekly_lineups
  - id, franchise_season_id, week_number
  - player_id, slot_type
  - points_scored (nullable decimal, cached)
  - created_at, updated_at
```

## NFL Data

```
players
  - id, nfl_id (unique), name
  - created_at, updated_at

player_seasons
  - id, player_id, season
  - nfl_team, position, status, jersey_number
  - created_at, updated_at

player_weekly_stats
  - id, player_id, season, week_number
  - passing_yards, passing_tds, passing_ints, completions, attempts
  - rushing_yards, rushing_tds, rushing_attempts
  - receptions, receiving_yards, receiving_tds, targets
  - fumbles_lost, two_point_conversions
  - created_at, updated_at

player_weekly_projections
  - id, player_id, season, week_number
  - projected_points (decimal)
  - projected_stats (JSONB)
  - source (text)
  - updated_at

nfl_games
  - id, season, week_number
  - home_team, away_team
  - kickoff_at (timestamp)
  - home_score, away_score (nullable)
  - created_at, updated_at
```

## Events

```
roster_transactions
  - id, league_season_id, franchise_season_id
  - type ('add' | 'drop' | 'trade' | 'waiver' | 'draft')
  - player_id
  - week_number
  - details (JSONB)
  - created_at
```
