# Fantasy Platform - Development Plan

**Goal:** Build a working MVP of the fantasy football platform with custom scoring capabilities.

**Approach:** Start with solid foundations (scaffolding, infrastructure), get something working end-to-end, then layer on features systematically.

---

## Progress Overview

**Current Status:** Milestone 1 Complete ✅

- ✅ Milestone 1: Project Scaffolding & Infrastructure Setup
- 🔄 Milestone 2: Database & Prisma Setup (Next)
- ⏳ Milestone 3: Basic API Infrastructure
- ⏳ Milestone 4: Frontend Foundation & Basic UI
- ⏳ Milestone 5: Core Resources & Relationships
- ⏳ Milestone 6: NFL Player Data Integration (Static)
- ⏳ Milestone 7: Basic Scoring Engine (Foundation)
- ⏳ Milestone 8: Advanced Scoring Features
- ⏳ Milestone 9: Matchup & Standings
- ⏳ Milestone 10: Stats Caching & Performance
- ⏳ Milestone 11: Polish & MVP Launch Prep

**Last Updated:** December 15, 2024

---

## Milestone 1: Project Scaffolding & Infrastructure Setup ✅

**Goal:** Set up the monorepo structure, initialize all projects, and get basic dev environment running.

**Status:** COMPLETED (December 15, 2024)

### Tasks

- [x] Initialize monorepo structure (apps/web, apps/api, packages/)
- [x] Set up pnpm workspace configuration
- [x] Initialize Vite + React + TypeScript frontend (apps/web)
  - [x] Configure Tailwind CSS
  - [x] Set up basic folder structure (components, pages, lib, hooks)
- [x] Initialize Express + TypeScript backend (apps/api)
  - [x] Configure TypeScript with appropriate settings
  - [x] Set up basic folder structure (routes, services, middleware)
  - [x] Add dev server with hot reload (tsx)
- [x] Set up shared packages/types workspace
- [x] Create environment variable templates (.env.example for both apps)
- [x] Verify both apps can run concurrently and communicate

**Success Criteria:** ✅ Can run `pnpm dev` and have both frontend and backend running with hot reload.

**What Was Built:**
- Monorepo with pnpm workspaces
- Vite + React + TypeScript frontend with Tailwind CSS configured
- Express + TypeScript backend with health check endpoint
- Shared @fantasy-platform/types package
- Frontend successfully communicates with API
- Environment configuration in place
- Development workflow established

---

## Milestone 2: Database & Prisma Setup

**Goal:** Set up PostgreSQL, initialize Prisma, and create core data models.

### Tasks

- [ ] Set up local PostgreSQL database (via Docker or local install)
- [ ] Initialize Prisma in packages/database
  - [ ] Configure datasource and generator
  - [ ] Set up migration workflow
- [ ] Create initial Prisma schema with core models:
  - [ ] User model (id, email, password hash, name, timestamps)
  - [ ] League model (id, name, settings, season, timestamps)
  - [ ] Team model (id, league relation, owner relation, name, timestamps)
  - [ ] Player model (id, nfl player data, position, team affiliation)
  - [ ] ScoringRules model (id, league relation, rules as JSONB)
- [ ] Run initial migration
- [ ] Generate Prisma Client
- [ ] Create basic seed script with sample data
- [ ] Verify database connection from API

**Success Criteria:** Database is running, migrations work, can query data via Prisma Client from API.

---

## Milestone 3: Basic API Infrastructure

**Goal:** Build foundational API layer with auth, error handling, and basic CRUD endpoints.

### Tasks

- [ ] Set up Express middleware (cors, json parser, error handler)
- [ ] Implement basic error handling middleware
- [ ] Set up authentication infrastructure
  - [ ] JWT token generation and verification
  - [ ] Auth middleware to protect routes
  - [ ] Basic password hashing (bcrypt)
- [ ] Create authentication endpoints
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
  - [ ] GET /api/auth/me (protected)
- [ ] Create basic CRUD routes for core resources:
  - [ ] Leagues: GET /api/leagues, GET /api/leagues/:id, POST /api/leagues
  - [ ] Teams: GET /api/teams/:id, PATCH /api/teams/:id
  - [ ] Players: GET /api/players (with filtering/search)
- [ ] Add request validation (using Zod)
- [ ] Test endpoints with Thunder Client/Postman/curl

**Success Criteria:** Can register user, login, create league, fetch data via authenticated API calls.

---

## Milestone 4: Frontend Foundation & Basic UI

**Goal:** Set up shadcn/ui, create layouts, and build basic pages to interact with API.

### Tasks

- [ ] Initialize shadcn/ui
  - [ ] Run init command and configure
  - [ ] Add core components: button, card, input, label, form, table, dialog, toast
- [ ] Set up React Router
  - [ ] Configure routes for auth and main app
  - [ ] Create protected route wrapper
- [ ] Create basic layout components
  - [ ] AuthLayout (for login/register)
  - [ ] AppLayout (with sidebar/nav for main app)
- [ ] Implement authentication pages
  - [ ] Login page with form
  - [ ] Register page with form
  - [ ] Auth state management (Context or simple state)
- [ ] Set up API client (axios or fetch wrapper)
  - [ ] Configure base URL and auth token handling
  - [ ] Set up TanStack Query
- [ ] Create basic pages
  - [ ] Dashboard/home page
  - [ ] Leagues list page
  - [ ] League detail page (basic view)
- [ ] Add toast notifications for feedback

**Success Criteria:** Can register, login, see leagues list, view league details in a clean UI.

---

## Milestone 5: Core Resources & Relationships

**Goal:** Implement full data model for leagues, teams, rosters, and expand player data.

### Tasks

- [ ] Extend Prisma schema
  - [ ] Roster/RosterSlot models (position slots per team)
  - [ ] Week/Matchup models for scheduling
  - [ ] Add league settings (team count, roster positions, playoff settings)
- [ ] Create migration for new models
- [ ] Update seed script with realistic test data
  - [ ] Sample league with teams and rosters
  - [ ] Sample NFL players across positions
- [ ] Implement league management endpoints
  - [ ] POST /api/leagues/:id/teams (join league)
  - [ ] GET /api/leagues/:id/teams (list teams in league)
  - [ ] PATCH /api/leagues/:id/settings
- [ ] Implement roster/lineup endpoints
  - [ ] GET /api/teams/:id/roster
  - [ ] PATCH /api/teams/:id/roster (set starters)
- [ ] Build frontend pages
  - [ ] League settings page
  - [ ] Team roster page (view and manage lineup)
  - [ ] Create/edit league flow
- [ ] Add basic form validation throughout

**Success Criteria:** Can create league with settings, add teams, assign players to roster, set starting lineup.

---

## Milestone 6: NFL Player Data Integration (Static)

**Goal:** Set up player data pipeline, initially with static/CSV data for development.

### Tasks

- [ ] Extend Player schema with full NFL stats fields
  - [ ] Passing stats (yards, TDs, INTs, completions, attempts)
  - [ ] Rushing stats (yards, TDs, fumbles, attempts)
  - [ ] Receiving stats (yards, TDs, receptions, targets)
  - [ ] Weekly stats model (PlayerWeekStats with week/year)
- [ ] Source static NFL data
  - [ ] Find CSV/JSON data source for recent season (e.g., 2024)
  - [ ] Or create sample data for a few weeks
- [ ] Create data import script
  - [ ] Parse player data
  - [ ] Parse weekly stats
  - [ ] Bulk insert via Prisma
- [ ] Create player endpoints
  - [ ] GET /api/players (with search, filters by position/team)
  - [ ] GET /api/players/:id/stats (weekly stats)
- [ ] Build player browsing UI
  - [ ] Player list with TanStack Table
  - [ ] Filters and search
  - [ ] Player detail view with stats

**Success Criteria:** Can browse NFL players, view their stats for specific weeks, search and filter.

---

## Milestone 7: Basic Scoring Engine (Foundation)

**Goal:** Build the core scoring calculation engine with simple rules.

### Tasks

- [ ] Design scoring rules JSON structure
  - [ ] Define schema for base scoring (yards, TDs, etc.)
  - [ ] Define schema for bonuses (thresholds)
  - [ ] Document examples in docs/
- [ ] Implement scoring engine service (apps/api/src/services/scoring-engine.ts)
  - [ ] Rule parser (JSON → executable logic)
  - [ ] Score calculator function (stats + rules → points)
  - [ ] Support base scoring (passing, rushing, receiving yards/TDs)
  - [ ] Support simple PPR (single value, not position-specific yet)
- [ ] Create scoring rules CRUD endpoints
  - [ ] GET /api/leagues/:id/scoring-rules
  - [ ] PUT /api/leagues/:id/scoring-rules
- [ ] Implement score calculation endpoint
  - [ ] POST /api/scores/calculate (accepts player stats + rules)
  - [ ] GET /api/teams/:id/score?week=X (calculate team score for week)
- [ ] Write comprehensive tests for scoring engine
  - [ ] Unit tests for different rule types
  - [ ] Test with known player stats → expected points
- [ ] Build basic scoring config UI
  - [ ] Form to set base scoring values
  - [ ] Preview showing what scores would be for sample players

**Success Criteria:** Can configure basic scoring rules, calculate player/team scores, see results in UI.

---

## Milestone 8: Advanced Scoring Features

**Goal:** Add position-specific PPR, bonuses, and conditional scoring.

### Tasks

- [ ] Extend scoring engine to support:
  - [ ] Position-specific PPR (different values for QB/RB/WR/TE)
  - [ ] Milestone bonuses (100 rush yds, 300 pass yds, etc.)
  - [ ] Conditional scoring (if attempts >= 20, bonus for completion %)
- [ ] Update scoring rules schema and validation
- [ ] Implement condition evaluator (safely parse and evaluate conditions)
- [ ] Add scoring templates
  - [ ] Standard, Half PPR, Full PPR, TE Premium
  - [ ] Allow users to start from template and customize
- [ ] Enhance scoring config UI
  - [ ] Toggle for position-specific PPR
  - [ ] UI to add/remove bonus rules
  - [ ] Visual rule builder for conditions
- [ ] Add score breakdown feature
  - [ ] Show how each stat contributed to final score
  - [ ] Display in player card and team score view
- [ ] Test extensively with edge cases

**Success Criteria:** Can create TE Premium league, set milestone bonuses, see accurate score breakdowns.

---

## Milestone 9: Matchup & Standings

**Goal:** Implement weekly matchups, calculate winners, and display standings.

### Tasks

- [ ] Extend schema for matchups
  - [ ] Matchup model (week, team1, team2, scores)
  - [ ] Schedule generation logic
- [ ] Create matchup endpoints
  - [ ] GET /api/leagues/:id/matchups?week=X
  - [ ] GET /api/matchups/:id (detailed matchup with player scores)
- [ ] Implement standings calculation
  - [ ] Calculate W-L records from matchup results
  - [ ] Calculate points for/against
  - [ ] GET /api/leagues/:id/standings
- [ ] Build matchup UI
  - [ ] Weekly matchup view (head-to-head display)
  - [ ] Show live scores (from calculated stats)
  - [ ] Player-by-player breakdown
- [ ] Build standings page
  - [ ] Table with team records
  - [ ] Sortable by wins, points, etc.
- [ ] Add commissioner tools
  - [ ] Manually set matchups
  - [ ] Edit scores (for stat corrections)

**Success Criteria:** Can view weekly matchups, see which team won, view league standings.

---

## Milestone 10: Stats Caching & Performance

**Goal:** Implement caching layer for NFL stats and optimize score calculations.

### Tasks

- [ ] Set up Redis (local via Docker)
- [ ] Implement stats caching service
  - [ ] Cache player stats by week/year
  - [ ] TTL strategy: 30s for in-progress, forever for completed games
  - [ ] Cache key structure: `stats:player:{playerId}:week:{week}:year:{year}`
- [ ] Update stats fetching to use cache
  - [ ] Check cache first, fetch if miss
  - [ ] Parallel fetching for multiple players
- [ ] Optimize database queries
  - [ ] Add indexes on frequently queried fields
  - [ ] Use Prisma includes to avoid N+1 queries
- [ ] Add monitoring/logging
  - [ ] Log cache hit/miss rates
  - [ ] Log score calculation times
  - [ ] Add performance monitoring middleware
- [ ] Load test with sample data
  - [ ] Test with 100+ teams, multiple weeks
  - [ ] Verify sub-50ms response times

**Success Criteria:** API responses under 200ms, cache hit rate >90%, can handle 1000+ concurrent users.

---

## Milestone 11: Polish & MVP Launch Prep

**Goal:** Add final touches, improve UX, prepare for beta users.

### Tasks

- [ ] Design system polish
  - [ ] Finalize color palette (Linear-inspired)
  - [ ] Add dark mode support
  - [ ] Ensure consistent spacing and typography
- [ ] Add animations with Framer Motion
  - [ ] Page transitions
  - [ ] Loading skeletons
  - [ ] Smooth list animations
- [ ] Mobile responsiveness pass
  - [ ] Test all pages on mobile sizes
  - [ ] Adjust layouts for small screens
  - [ ] Touch-friendly interactions
- [ ] Error handling improvements
  - [ ] User-friendly error messages
  - [ ] Proper loading states everywhere
  - [ ] Form validation feedback
- [ ] Add helpful empty states
  - [ ] No leagues yet
  - [ ] No players on roster
  - [ ] No stats available
- [ ] Documentation
  - [ ] User guide for creating leagues
  - [ ] Scoring configuration guide
  - [ ] FAQ
- [ ] Deployment setup
  - [ ] Configure Railway/Render
  - [ ] Set up production database
  - [ ] Configure environment variables
  - [ ] Set up CI/CD (optional)
- [ ] Beta testing preparation
  - [ ] Create onboarding flow
  - [ ] Add feedback collection mechanism
  - [ ] Set up analytics (PostHog/Plausible)

**Success Criteria:** App looks polished, works on mobile, deployed and accessible to beta users.

---

## Future Milestones (Post-MVP)

These will be prioritized based on user feedback:

- **Live Scoring Integration:** Connect to FTN Data/SportsDataIO API for real-time stats
- **Draft Tools:** Snake draft interface with live draft board
- **Waivers & Free Agency:** FAAB bidding, waiver priority, free agent pickups
- **Trading System:** Propose/accept trades, commissioner approval
- **Playoff Brackets:** Automatic playoff seeding and matchups
- **Dynasty/Keeper Features:** Multi-season leagues, draft pick trading
- **Message Boards:** League chat and announcements
- **Analytics Dashboard:** Trade value charts, start/sit recommendations

---

## Notes

- Each milestone should result in working, testable functionality
- Commit frequently with clear messages
- Write tests for scoring engine (most critical component)
- Keep the UI simple and clean - follow Linear's aesthetic principles
- Don't over-engineer - start simple, add complexity when needed
- Focus on the scoring engine as the core differentiator

---

**Last Updated:** December 15, 2024
