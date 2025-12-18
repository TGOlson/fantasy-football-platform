# Fantasy Platform - Feature Status

A comprehensive breakdown of features: what's built, what's needed for MVP, and what comes later.

---

## Done

Features that are fully implemented and working.

### Authentication & Users

- User registration with email/password
- Login with JWT tokens
- Protected routes and endpoints
- Current user context throughout app

### League Management

- Create leagues with default settings
- View all user's leagues on dashboard
- League detail pages with tabs (Teams, Matchups, Settings)
- Multi-season infrastructure (leagues have seasons)
- Commissioner role recognition

### Scoring Engine (Core Differentiator)

- Complete scoring calculation with stat-by-stat breakdown
- Passing: yards, TDs, INTs, completions/attempts
- Rushing: yards, TDs, attempts
- Receiving: receptions (configurable PPR), yards, TDs, targets
- Fumbles lost penalty
- 2-point conversions
- Position-specific scoring support (e.g., TE Premium)
- Bonus system with conditional logic (e.g., "300 yard bonus")
- Score breakdown modal showing exactly how points were calculated

### Scoring Presets

- Standard (no PPR)
- Half PPR
- Full PPR
- TE Premium
- Standard with Bonuses

### Scoring Settings UI

- Full editing of all scoring parameters
- Organized by category (passing, rushing, receiving, misc)
- Updates saved to league settings

### Roster Management

- View team roster (starters vs bench)
- Add player to roster
- Remove player from roster
- Change player slot (QB/RB/WR/TE/FLEX/K/DEF/BENCH)

### Player Data

- Browse all NFL players
- Search by name
- Filter by position and NFL team
- Player detail page with season totals
- Weekly stats table
- Click week to see fantasy point calculation breakdown

### Matchups (Basic)

- Matchup database model
- Create matchups (commissioner)
- View matchups for a week
- Manual score override (commissioner)
- BYE week support

---

## Required for MVP

Features needed before launch. Each includes current state assessment.

### League Creation Flow

**What:** UI to create a new league with name, settings, and invite other users.
**Current State:** "Create League" button exists but does nothing. Backend `leagues.create` works but no frontend form. No invite system.
**Needed:**

- Create league modal/form
- Choose scoring preset or customize
- Set roster positions and team count
- Generate invite link or email invites

### Team Creation/Joining

**What:** Users need to join leagues and create their team.
**Current State:** Teams exist in DB, can be viewed, but no flow for users to join a league or create a team within one.
**Needed:**

- Join league via invite link
- Create team (choose name)
- Team ownership assignment

### Matchup Navigation & Display

**What:** Navigate between weeks, see current week's matchups, live scoring.
**Current State:** Matchups tab shows Week 1 only. Previous/Next buttons don't work. No automatic score calculation from rosters.
**Needed:**

- Week selector/navigation
- Auto-calculate matchup scores from starting lineups
- Current week detection (based on NFL schedule or manual)
- Live-ish score updates during games

### Standings

**What:** League standings showing W-L records, points for/against, playoff positioning.
**Current State:** `teamSeasons` table has wins/losses/ties/pointsFor/pointsAgainst columns but they're not calculated or displayed. Team cards show "0-0-0" hardcoded.
**Needed:**

- Calculate standings from matchup results
- Standings table UI (sortable)
- Playoff cutline indicator
- Points for/against totals

### Schedule Generation

**What:** Auto-generate weekly matchups for a season.
**Current State:** Matchups can be manually created by commissioner. No auto-generation.
**Needed:**

- Generate balanced schedule (each team plays others fairly)
- Handle odd number of teams (BYE weeks)
- Regular season weeks configuration
- Playoff bracket generation

### Draft System

**What:** Snake draft for league startup or annual redraft.
**Current State:** Nothing implemented. No draft tables, no UI, no logic.
**Needed:**

- Draft order setup (random, custom, previous standings)
- Draft room UI (pick queue, timer, available players)
- Snake draft logic (1-2-3...3-2-1 order)
- Auto-pick for AFK users
- Draft results → roster population

### Waivers & Free Agency

**What:** Claim players not on rosters, with priority/bidding system.
**Current State:** Can add any player to roster directly (no restrictions). No waiver wire concept.
**Needed:**

- Waiver wire (players dropped are locked for X days)
- Waiver priority (inverse of standings or FAAB)
- Waiver claims processing
- Free agent pool (unclaimed players)
- Transaction deadlines

### Trading

**What:** Propose and accept trades between teams.
**Current State:** Nothing implemented. No trade tables or endpoints.
**Needed:**

- Trade proposal (players and/or draft picks)
- Trade review (accept/reject/counter)
- Commissioner approval option
- Trade deadline enforcement
- Trade history log

### Transaction Log

**What:** History of all roster moves, trades, waiver claims.
**Current State:** No transaction logging. Roster changes happen silently.
**Needed:**

- Transaction table (type, teams involved, players, timestamp)
- Activity feed on league page
- Team transaction history

### Player Rankings/Points Display

**What:** Show fantasy points and rank in player lists.
**Current State:** Players list has "Points" and "Rank" columns but show "-". No calculation.
**Needed:**

- Calculate total season points per player
- Position rankings (WR1, WR2, etc.)
- Overall rankings
- Display in player tables

### Lineup Lock

**What:** Lock starting lineups at game time.
**Current State:** Can change roster anytime. No game-time awareness.
**Needed:**

- NFL game schedule data
- Lock players once their game starts
- Show lock status in UI
- Allow bench moves for non-locked players

### Commissioner Tools

**What:** League management powers for commissioner.
**Current State:** Commissioner can create matchups and override scores. Limited.
**Needed:**

- Edit league settings mid-season
- Force roster moves (resolve disputes)
- Process stat corrections
- Pause/resume league
- Remove inactive owners

### Error States & Loading

**What:** Polish for edge cases and async states.
**Current State:** Basic loading states exist. Some empty states missing. Error handling inconsistent.
**Needed:**

- Empty states (no leagues, empty roster, etc.)
- Error boundaries
- Retry mechanisms
- Form validation feedback

---

## Later

Features for post-MVP based on user feedback.

### Auction Draft

**What:** FAAB-style draft where teams bid on players.
**Note:** Complex UI. Snake draft covers most leagues.

### Dynasty/Keeper Features

**What:** Multi-year leagues where you keep players across seasons.
**Note:** Requires roster/contract persistence, rookie drafts, taxi squads.

### IDP (Individual Defensive Players)

**What:** Start individual defensive players instead of team DEF.
**Note:** Different scoring rules, more roster spots, niche audience.

### League Chat & Message Boards

**What:** In-app communication between league members.
**Note:** Could integrate Discord/Slack instead of building.

### Advanced Analytics

**What:** Projections, playoff odds, trade value charts, start/sit advice.
**Note:** Requires projection data source or ML models.

### Mobile App

**What:** Native iOS/Android apps.
**Note:** Current plan is mobile-responsive web first. Native later if demand.

### Real-Time Live Scoring

**What:** WebSocket-based instant score updates during games.
**Note:** Current polling approach works. WebSockets add complexity.

### Notifications

**What:** Push notifications, email alerts for trades, waivers, game start.
**Note:** Requires notification infrastructure (FCM, email service).

### League Invite Management

**What:** Invite via email, manage pending invites, resend.
**Note:** Basic invite links sufficient for MVP.

### Historical Data & Trends

**What:** View past seasons, career stats, year-over-year comparisons.
**Note:** Infrastructure supports multiple seasons. Need UI and data.

### Import/Export

**What:** Import league from ESPN/Yahoo/Sleeper. Export data.
**Note:** Each platform has different APIs. Complex integration.

### Custom Stat Categories

**What:** Add custom stats beyond standard (e.g., "yards after catch").
**Note:** Requires flexible stat schema. Most users fine with defaults.

### Playoff Bracket Visualization

**What:** Visual bracket showing playoff matchups and progression.
**Note:** Basic standings sufficient for MVP. Bracket is nice-to-have.

### User Profiles & Public Leagues

**What:** Profile pages, public league discovery, achievements.
**Note:** Social features. Focus on core fantasy first.

### Dark Mode

**What:** System-preference or toggle dark theme.
**Note:** Mantine supports it. Low effort but not critical for MVP.

### API for Third-Party Apps

**What:** Public API for integrations.
**Note:** Internal API (tRPC) exists. Public REST API later.

---

## Database Schema Status

| Table               | Status      | Notes                        |
| ------------------- | ----------- | ---------------------------- |
| users               | ✅ Complete | Auth working                 |
| leagues             | ✅ Complete | Multi-season ready           |
| league_seasons      | ✅ Complete | Season management            |
| league_settings     | ✅ Complete | Scoring rules, roster config |
| teams               | ✅ Complete | Franchise model              |
| team_seasons        | ✅ Complete | Needs standings calculation  |
| players             | ✅ Complete | NFL player data              |
| player_seasons      | ✅ Complete | Yearly player info           |
| player_weekly_stats | ✅ Complete | Stats for scoring            |
| roster_players      | ✅ Complete | Roster management            |
| matchups            | ✅ Complete | Needs auto-scoring           |
| trades              | ❌ Missing  | Needs new table              |
| transactions        | ❌ Missing  | Needs new table              |
| waivers             | ❌ Missing  | Needs new table              |
| draft_picks         | ❌ Missing  | Needs new table              |
| invites             | ❌ Missing  | Needs new table              |

---

## Priority Order for MVP

Suggested implementation order based on dependencies:

1. **League Creation Flow** - Can't test anything without creating leagues
2. **Team Creation/Joining** - Users need to get into leagues
3. **Schedule Generation** - Need matchups to play
4. **Matchup Navigation & Scoring** - Core weekly gameplay
5. **Standings** - Track who's winning
6. **Player Rankings** - Know who to pick up
7. **Draft System** - How leagues start
8. **Waivers & Free Agency** - Weekly roster management
9. **Trading** - Team-to-team deals
10. **Transaction Log** - History of moves
11. **Lineup Lock** - Fair play enforcement
12. **Commissioner Tools** - League management
13. **Error States & Loading** - Polish

---

## Open Questions

From plan.md and discovery:

- Should `player_weekly_stats` use columns or JSON blob for flexibility?
- How to represent transactions (trades, waivers, draft) - one event log table or separate?
- Where does NFL schedule data come from? Manual entry or API?
- How to handle stat corrections mid-week?
- What's the waiver processing schedule (daily? specific day?)
