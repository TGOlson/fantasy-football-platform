# Fantasy Platform - Development Plan

**Goal:** Build a working MVP of the fantasy football platform with custom scoring capabilities.

**Approach:** Start with solid foundations (scaffolding, infrastructure), get something working end-to-end, then layer on features systematically.

---

## Progress Overview

**Current Status:** Milestone 4 Complete ✅

- ✅ Milestone 1: Project Scaffolding & Infrastructure Setup
- ✅ Milestone 2: Database & Drizzle ORM Setup
- ✅ Milestone 3: tRPC API Infrastructure (All Phases Complete)
- ✅ Milestone 4: Frontend Foundation & Basic UI
- ✅ Milestone 5: Core Resources & Relationships
- ✅ Milestone 6: NFL Player Data Integration (Static)
- ✅ Milestone 7: Basic Scoring Engine (Foundation)
- ✅ Milestone 8: Advanced Scoring Features
- ⏳ Milestone 9: Matchup & Standings
- ⏳ Milestone 10: Stats Caching & Performance
- ⏳ Milestone 11: Polish & MVP Launch Prep

**Last Updated:** December 15, 2024 (Milestone 4 Complete - Mantine Migration)

---

## Milestone 1: Project Scaffolding & Infrastructure Setup ✅

**Goal:** Set up the monorepo structure, initialize all projects, and get basic dev environment running.

**Status:** COMPLETED (December 15, 2024)

### Tasks (omitted for brevity) 

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

## Milestone 2: Database & Drizzle ORM Setup ✅

**Goal:** Set up PostgreSQL, initialize Drizzle ORM, and create core data models.

**Status:** COMPLETED (December 15, 2024)

**Note:** Changed from Prisma to Drizzle ORM for simpler TypeScript-native schema definition.

### Tasks (omitted for brevity) 

**Success Criteria:** ✅ Database is running, migrations work, can query data via Drizzle from API.

**What Was Built:**
- PostgreSQL 16 running in Docker container
- Drizzle ORM with TypeScript-native schemas
- Five core tables: users, leagues, teams, players, scoring_rules
- Type-safe database client accessible from API
- Seed script with sample data (2 users, 1 league, 2 teams, TE Premium scoring)
- Type sharing via @fantasy-platform/types package
- Database connection test endpoint at `/api/test/db`

**Known Issues:**
- Dynamic imports required for env var loading (TODO: refactor to lazy initialization)

---

## Milestone 3: tRPC API Infrastructure ✅

**Goal:** Set up tRPC server with auth, error handling, and basic CRUD procedures with auto-generated frontend hooks.

**Status:** COMPLETED (All Phases Complete)

**Note:** Changed from REST to tRPC for type-safe APIs and auto-generated React hooks.

### Tasks (omitted for brevity) 

**Success Criteria:**
- ✅ tRPC server running with type-safe procedures
- ✅ Auth working (register, login, protected routes)
- ✅ CRUD operations for leagues, teams, players
- ⏳ Frontend can call procedures with full type safety (Next Milestone)

**What Was Built:**
- tRPC server mounted at `/trpc` endpoint
- Type-safe context with database and user authentication
- Protected procedure middleware (checks JWT)
- Auth router: register, login, me
- JWT-based authentication with bcryptjs password hashing
- Lazy initialization pattern for JWT_SECRET (env var loading)
- Health check router for testing tRPC setup
- Drizzle operators exported from database package for easy querying
- **Leagues router** (Phase C):
  - `leagues.list` - Get all leagues
  - `leagues.getById` - Get league with teams and scoring rules
  - `leagues.create` - Create league with optional scoring rules (protected)
  - `leagues.update` - Update league settings (protected)
- **Teams router** (Phase C):
  - `teams.getById` - Get team with owner and league info
  - `teams.update` - Update team name with ownership verification (protected)
  - `teams.getByLeague` - Get all teams in a league with owner info
- **Players router** (Phase C):
  - `players.list` - Get all players with optional filters (position, team, search)
  - `players.getById` - Get single player by ID

**Technical Notes:**
- Using bcryptjs instead of bcrypt (no native bindings needed)
- JWT tokens in `Authorization: Bearer <token>` header
- Protected procedures throw UNAUTHORIZED error if no valid token
- All input validation handled by Zod schemas in tRPC procedures

**Future Enhancements (Noted in apps/api/TODO.md):**
- OAuth support (Google, GitHub, etc.)
- Refresh tokens for longer sessions
- Two-factor authentication

---

## Milestone 4: Frontend Foundation & Basic UI ✅

**Goal:** Set up UI library, create layouts, and build basic pages to interact with API.

**Status:** COMPLETED (December 15, 2024)

**Note:** Switched from shadcn/ui to Mantine for better data-heavy UI components.

### Tasks (omitted for brevity) 

**Success Criteria:** ✅ Can register, login, see leagues list, browse players in polished UI.

**What Was Built:**
- **Mantine UI System** - Complete component library with excellent defaults
  - `@mantine/core` - Buttons, inputs, cards, papers, etc.
  - `@mantine/notifications` - Toast notification system
  - `mantine-datatable` - Professional data tables with sorting/filtering
  - AppShell layout with responsive sidebar
- **Authentication Flow**
  - Login/Register pages with proper validation
  - JWT token management via React Context
  - Protected routes that redirect to login
  - Auto-fetch current user on mount
- **Pages Built**
  - Dashboard with stat cards (SimpleGrid)
  - Leagues list with card grid
  - Players list with DataTable (search + filter by position)
- **tRPC Integration**
  - Client configured with auth headers
  - Auto-generated type-safe hooks
  - Works seamlessly with Mantine components

**Technical Decisions:**
- **Why Mantine over shadcn/ui**: Better for data-heavy apps (DataTable is killer)
- **Why AppShell**: Professional sidebar layout with mobile responsive built-in
- **Why DataTable**: Fantasy football = lots of tables. Mantine's DataTable has everything (sorting, filtering, row selection, sticky headers, pagination)

**What's Different from Plan:**
- Replaced shadcn/ui with Mantine (better for our use case)
- No separate AuthLayout needed (Mantine Container handles it)
- League detail page moved to next milestone

---

## Milestone 5: Core Resources & Relationships

**Goal:** Implement full data model for leagues, teams, rosters, and expand player data.

### Tasks (omitted for brevity) 

**Success Criteria:** Can create league with settings, add teams, assign players to roster, set starting lineup.

---

## Milestone 6: NFL Player Data Integration (Static)

**Goal:** Set up player data pipeline, initially with static/CSV data for development.

### Tasks (omitted for brevity) 

**Success Criteria:** Can browse NFL players, view their stats for specific weeks, search and filter.

---

## Milestone 7: Basic Scoring Engine (Foundation)

**Goal:** Build the core scoring calculation engine with simple rules.

### Tasks (omitted for brevity) 

**Success Criteria:** Can configure basic scoring rules, calculate player/team scores, see results in UI.

---

## Milestone 8: Advanced Scoring Features

**Goal:** Add position-specific PPR, bonuses, and conditional scoring.

### Tasks (omitted for brevity) 

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

## Note from elsewhere that I don't want to lose


## MVP Feature Scope

**Must Build (Tier 1 & 2):**
1. Custom Scoring Engine (6-8 weeks) - CORE MOAT
2. League Management (3-4 weeks)
3. Live Scoring (2-3 weeks)
4. Draft Tools (4-5 weeks)
5. Waivers & Free Agency (3-4 weeks)
6. Trading System (2-3 weeks)
7. Playoff Brackets (1-2 weeks)
8. Mobile-Responsive UI (ongoing)

**Explicitly NOT Building for MVP:**
- Dynasty/keeper features
- Auction drafts
- Salary caps
- IDP (Individual Defensive Player) support
- Message boards
- Analytics dashboards
- Native mobile apps

## Open questions

* Should `player_weekly_stats` have a bunch of columns of big a json blob?
* How to represent league transactions (trades, waiver, draft), one big event log?
* should we delete docs/schema.md in favor of the actual schema.ts file?
* can we auto-gen docs for the api (useful for claude to reference)
* better logging/error handling for debugging
* protected app routes by team/league
* get league `getById` is long with a lot of lookups. maybe sure all indexed
* move to json router in app? is that better?
* how is query stale time used? `staleTime: 5 * 1000, // 5 seconds`
* tests? just to make sure we don't completely break things?
* high tech feeling data viz
  * even if not super complex
  * trend lines, ranges for projections, historical scatter plot, etc
* more generic stat views per player (eg. wr can have rushes, qb can have catches, etc)

📋 Future enhancements (not urgent):
- Enhance scoring config UI (allow users to select from presets, customize rules)
- Polish the player score breakdown modal UI
- Maybe expose the scoring presets via tRPC endpoint if/when you build a league setup wizard

Looks like you've got the scoring engine foundation pretty solid! The presets in scoring-presets.ts cover the common formats well. Later when you need a league creation flow, you could add a tRPC endpoint that returns those presets for the UI to display as options.
