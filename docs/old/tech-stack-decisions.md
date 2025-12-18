# Fantasy Football Platform - Tech Stack & Architecture

## Overview

This document outlines the technical decisions, architecture, and implementation approach for the custom fantasy football platform with advanced scoring customization.

---

## Core Tech Stack

### Frontend

```
Vite + React + TypeScript
├── shadcn/ui (UI components)
├── Radix UI (accessible primitives)
├── Tailwind CSS (styling)
├── Framer Motion (animations)
├── TanStack Query (data fetching/caching)
├── TanStack Table (data tables)
├── React Router (routing)
├── React Hook Form + Zod (forms/validation)
```

### Backend

```
Express + TypeScript
├── PostgreSQL (database)
├── Prisma (ORM)
├── REST API (MVP)
└── WebSockets (live features)
```

### Deployment

```
Railway or Render
├── Frontend (static site)
├── Backend (Node.js service)
└── PostgreSQL (managed database)
```

---

## Key Architectural Decisions

### 1. Vite vs Next.js

**Decision: Use Vite + React (not Next.js)**

**Reasoning:**

- ✅ **No SSR needed** - 95% of app is authenticated, client-rendered
- ✅ **Simpler mental model** - No server/client component confusion
- ✅ **Faster dev experience** - Vite HMR is noticeably faster (200ms vs 1-3s startup)
- ✅ **Complex backend needs** - Express gives full control for scoring engine, real-time features, background jobs
- ✅ **Clean separation** - Frontend and backend concerns cleanly separated
- ✅ **Less magic** - Easier to debug and understand

**When Next.js would make sense:**

- If we needed SEO for core product pages (we don't - it's authenticated)
- If we had simple CRUD API needs (we have complex scoring engine)
- If we wanted all-in-one deployment (not worth the trade-offs)

### 2. REST vs GraphQL vs tRPC

**Decision: Start with REST API, migrate to tRPC later if needed**

**Phase 1 (MVP - Leagues 1-500): REST**

**Why REST for MVP:**

- ✅ **Simple and fast** - Everyone knows it, quick to build
- ✅ **Easy debugging** - Postman, curl, browser network tab
- ✅ **HTTP caching** - Works out of the box, CDN-friendly
- ✅ **Good enough** - Data patterns aren't complex enough to warrant GraphQL

**REST API Structure:**

```
GET    /api/players?position=QB&team=KC
GET    /api/players/:id
GET    /api/leagues/:id
GET    /api/leagues/:id/roster
POST   /api/leagues/:id/lineup
GET    /api/scores/live
POST   /api/scoring-rules
```

**Phase 2 (Optional - After 500 Leagues): tRPC**

**When to migrate:**

- Type safety becomes important (sharing types across frontend/backend)
- API is stable and you're spending time on documentation
- You want better DX (autocomplete, type errors)

**Why tRPC over GraphQL:**

- ✅ Type safety without complexity
- ✅ Simpler than GraphQL (no schema, just TypeScript)
- ✅ Works with TanStack Query
- ✅ Easier migration from REST

**Skip GraphQL unless:**

- You have evidence REST is a bottleneck
- Complex nested queries become painful
- Multiple clients need flexible querying (mobile app, third-party integrations)

### 3. Mobile Strategy

**Decision: Mobile-responsive PWA (not native apps)**

**Build:**

- Mobile-first responsive web app
- Desktop-optimized for complex admin (scoring configuration, league setup)
- PWA features (offline, push notifications, add to home screen)

**Don't build (yet):**

- Native iOS/Android apps
- React Native

**Reasoning:**

- 85% of fantasy users use mobile, but for **simple tasks** (lineups, scores, waivers)
- Complex tasks (scoring config) are naturally desktop experiences
- MFL's bar is low - good mobile web beats their experience by 10x
- Saves 6-9 months and $80-120K in development
- Can add native later if there's proven demand

**Add native apps only if:**

- 30%+ users explicitly request them
- PWA hits real limitations
- You have $100K+ budget
- Native becomes competitive differentiator

---

## Project Structure

```
fantasy-platform/
├── apps/
│   ├── web/                          # Vite React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/              # shadcn/ui components
│   │   │   │   ├── fantasy/         # Domain components
│   │   │   │   └── layouts/
│   │   │   ├── pages/
│   │   │   │   ├── leagues/
│   │   │   │   ├── roster/
│   │   │   │   ├── matchup/
│   │   │   │   └── scoring/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts           # API client
│   │   │   │   └── utils.ts
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── api/                          # Express backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── players.ts
│       │   │   ├── leagues.ts
│       │   │   ├── scoring.ts
│       │   │   └── stats.ts
│       │   ├── services/
│       │   │   ├── scoring-engine.ts    # Core scoring logic
│       │   │   ├── stats-fetcher.ts     # NFL API integration
│       │   │   └── lineup-validator.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── error-handler.ts
│       │   ├── jobs/
│       │   │   └── score-calculator.ts  # Background jobs
│       │   ├── websocket/
│       │   │   └── live-scoring.ts      # Real-time updates
│       │   └── server.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   ├── player.ts
│   │   ├── league.ts
│   │   ├── scoring.ts
│   │   └── index.ts
│   │
│   ├── database/                     # Prisma
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   └── config/                       # Shared config
│       └── constants.ts
│
├── package.json                      # Root (workspaces)
├── turbo.json                        # Turborepo config (optional)
└── README.md
```

---

## MVP Feature Set (First 500 Leagues)

### Must Build (Tier 1 & 2)

**1. Custom Scoring Engine (6-8 weeks)**

- Position-specific PPR (TE: 1.5, RB: 0.5, WR: 1.0)
- Yardage milestone bonuses (100 rush yds = +3 pts)
- Conditional scoring (completion % bonus if 20+ attempts)
- Decimal scoring (2 decimal places)
- Template library (Standard, Half PPR, Full PPR, TE Premium)
- Import/export scoring configs

**2. League Management (3-4 weeks)**

- League creation and settings
- Roster management (8-20 teams)
- Standard positions (QB, RB, WR, TE, FLEX, K, DEF)
- Weekly lineup submission
- Schedule generation (head-to-head)
- Standings (W-L record, points for/against)
- Matchup view

**3. Live Scoring (2-3 weeks)**

- Real-time scoring during games (15-30s delay acceptable)
- Player stats display
- Score breakdowns (show how points calculated)
- Historical scores by week

**4. Draft Tools (4-5 weeks)**

- Snake draft (live, online)
- Draft board showing all picks
- Player search/filter
- Draft timer (commissioner override)
- Pre-draft rankings
- Draft results page

**5. Waivers & Free Agency (3-4 weeks)**

- FAAB (blind bidding)
- Waiver priority (rolling or reset)
- Free agent pickups (FCFS)
- Drop players
- Waiver processing schedule

**6. Trading System (2-3 weeks)**

- Propose trades (players for players)
- Accept/reject offers
- Commissioner approval
- Optional league voting
- Trade deadline setting
- Trade history

**7. Playoff Brackets (1-2 weeks)**

- 4 or 6 team playoffs
- Configurable playoff weeks
- Seeding based on standings
- Playoff matchup scoring

**8. Mobile-Responsive UI (ongoing)**

- Works perfectly on mobile browsers
- Desktop-optimized for admin tasks
- Smooth, fast interactions

**Total MVP timeline: 4-6 months** (2 developers full-time) or **8-12 months** (solo developer)

### Explicitly NOT Building for MVP

- ❌ Dynasty/keeper features
- ❌ Auction drafts
- ❌ Salary caps
- ❌ IDP support
- ❌ Message boards
- ❌ Analytics dashboards
- ❌ Native mobile apps
- ❌ Multi-team trades
- ❌ Draft pick trading

---

## Design System: Linear-Inspired Aesthetic

### Visual Principles

- Clean, minimal, professional
- Subtle color palette (grays with accent colors)
- Lots of whitespace
- Smooth animations and transitions
- Dark mode support
- Information density without clutter

### Component Library: shadcn/ui

**What you get:**

- 50+ production-ready components
- Built on Radix UI (accessible)
- Styled with Tailwind
- You own the code (copy-paste into project)
- Fully customizable

**Setup:**

```bash
# Initialize
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button card dialog table command
```

**Key components:**

- Command palette (⌘K)
- Data tables with sorting/filtering
- Forms with validation
- Dialogs, dropdowns, toasts
- Tabs, accordions, sheets

### Animation Library: Framer Motion

**Use for:**

- Page transitions
- Loading skeletons
- Staggered list animations
- Drag-and-drop (lineup management)
- Hover states and micro-interactions

---

## Data Flow Architecture

### Stats Ingestion Pipeline

```
NFL Stats API (SportsDataIO, FTN Data)
    ↓
Stats Fetcher Service (Express)
    ↓
PostgreSQL (raw stats)
    ↓
Scoring Engine (applies custom rules)
    ↓
Calculated Points (cached)
    ↓
WebSocket (live updates)
    ↓
Frontend (React components)
```

### Caching Strategy

**1. Player Stats Cache**

- Stats don't change once finalized
- Cache completed games forever
- Key: `stats:${playerId}:${week}:${year}`

**2. Calculation Cache**

- For identical scoring rules, cache player points
- Key: `points:${playerId}:${ruleHash}:${week}`
- Invalidate only if rules change

**3. Live Scoring**

- Update only changed stats
- Recalculate only affected players
- WebSocket broadcasts deltas, not full state

**Result:** Can serve 1000+ leagues from same cached data

---

## Scoring Engine Architecture

### Core Components

```
Input Layer
├── Player Stats (from NFL API)
│   ├── Passing: yards, TDs, INTs, completions, attempts
│   ├── Rushing: yards, TDs, fumbles, attempts
│   ├── Receiving: yards, TDs, receptions, targets
│   └── Defense: sacks, INTs, fumbles forced, points allowed

├── League Rules (from database)
│   └── Stored as flexible JSON structure

Rule Engine (Core IP)
├── Rule Parser
│   ├── Converts JSON rules to executable logic
│   └── Validates rule consistency
│
├── Rule Evaluator
│   ├── Processes stat conditions
│   ├── Applies multipliers and bonuses
│   └── Handles position-specific logic
│
└── Calculation Pipeline
    ├── Base scoring (yards, TDs)
    ├── Bonus evaluation (thresholds)
    └── Conditional modifiers

Output Layer
├── Player Points (for each player)
├── Team Scores (aggregated)
└── Audit Trail (for transparency)
```

### Data Model for Rules

```json
{
  "leagueId": "abc123",
  "scoringRules": {
    "passing": {
      "yards": { "value": 0.04, "per": 1 },
      "touchdowns": {
        "value": 4,
        "bonuses": [{ "condition": "distance >= 50", "value": 2 }]
      },
      "interceptions": -2
    },
    "rushing": {
      "yards": 0.1,
      "touchdowns": 6,
      "bonuses": [
        { "condition": "yards >= 100", "value": 3 },
        { "condition": "yards >= 150", "value": 5 }
      ]
    },
    "receiving": {
      "receptions": {
        "default": 1.0,
        "byPosition": {
          "TE": 1.5,
          "RB": 0.5
        }
      },
      "yards": 0.1,
      "touchdowns": 6
    }
  }
}
```

---

## Development Setup

### Prerequisites

```bash
node >= 18
npm >= 9
PostgreSQL >= 14
```

### Initial Setup

**1. Clone and Install**

```bash
git clone [repo]
cd fantasy-platform
npm install
```

**2. Setup Database**

```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

**3. Environment Variables**

Create `.env` files:

**Backend (`apps/api/.env`):**

```env
DATABASE_URL="postgresql://..."
NFL_API_KEY="..."
JWT_SECRET="..."
PORT=3000
```

**Frontend (`apps/web/.env`):**

```env
VITE_API_URL="http://localhost:3000"
```

**4. Run Development Servers**

```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

**Frontend:** http://localhost:5173
**Backend:** http://localhost:3000

---

## Deployment Strategy

### Phase 1: Railway (Recommended)

**Why Railway:**

- Simple deployment (push to deploy)
- Managed PostgreSQL
- Environment variables UI
- Reasonable pricing ($5/month starter)
- Great DX

**Setup:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

**Railway will create:**

- Frontend service (static site)
- Backend service (Node.js)
- PostgreSQL database (managed)

### Phase 2: Alternative - Render

**Similar to Railway:**

- Free tier available
- Managed database
- Auto-deploy from GitHub

### Phase 3: Scale Up

**When you hit 2,000+ leagues:**

- Consider AWS/GCP for better control
- Add Redis for caching
- Setup CDN for static assets
- Implement load balancing

---

## Testing Strategy

### Unit Tests

- Scoring engine logic (critical)
- Rule validation
- Data transformations

### Integration Tests

- API endpoints
- Database operations
- Score calculations end-to-end

### E2E Tests (Playwright)

- Critical user flows
- Draft process
- Lineup submission
- Score viewing

**Testing philosophy:**

- High coverage on scoring engine (this is your moat)
- Integration tests for API
- E2E for critical paths only

---

## Performance Targets

### Frontend

- **Time to Interactive:** < 2 seconds
- **Lighthouse Score:** > 90
- **Bundle Size:** < 300KB (initial)

### Backend

- **API Response Time:** < 200ms (p95)
- **Score Calculation:** < 1s for 1000 players
- **Live Updates:** < 30s delay from real game

### Database

- **Query Performance:** < 50ms (p95)
- **Concurrent Users:** Support 1000+ simultaneous

---

## Security Considerations

### Authentication

- JWT tokens (short-lived)
- Refresh token rotation
- HttpOnly cookies for web

### Authorization

- Role-based (commissioner, member, guest)
- League-level permissions
- Rate limiting on sensitive endpoints

### Data Protection

- Encrypt sensitive data at rest
- HTTPS only
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)

---

## Monitoring & Observability

### Metrics to Track

- API latency (p50, p95, p99)
- Error rates by endpoint
- Active users
- Score calculation time
- Database query performance

### Tools

- **Logging:** Winston or Pino
- **APM:** Sentry or Railway logs
- **Uptime:** UptimeRobot
- **Analytics:** PostHog or Plausible

---

## Next Steps

### Week 1-2: Setup & Architecture

- [ ] Initialize Vite + React project
- [ ] Setup Express backend
- [ ] Configure Prisma + PostgreSQL
- [ ] Setup shadcn/ui
- [ ] Create project structure
- [ ] Setup deployment pipeline

### Week 3-4: Core Data Models

- [ ] Define Prisma schema
- [ ] Create migrations
- [ ] Build scoring engine foundation
- [ ] Setup NFL stats API integration
- [ ] Implement basic REST endpoints

### Week 5-8: MVP Features

- [ ] League creation and management
- [ ] Roster management
- [ ] Scoring configuration UI
- [ ] Draft tools
- [ ] Live scoring

### Week 9-12: Polish & Launch

- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Beta user testing
- [ ] Bug fixes
- [ ] Launch to first 50 leagues

---

## Key Principles

1. **Start simple, add complexity only when needed**
2. **MVP in 4-6 months beats perfect in 12 months**
3. **Build 20% of MFL's features to capture 80% of value**
4. **Desktop for admin, mobile for everything else**
5. **Type safety everywhere (TypeScript + Prisma)**
6. **Own your components (shadcn/ui approach)**
7. **Linear-inspired: clean, fast, professional**
8. **Your moat is the scoring engine - nail that first**

---

## Resources

### Documentation

- **Vite:** https://vitejs.dev/
- **shadcn/ui:** https://ui.shadcn.com/
- **Prisma:** https://www.prisma.io/docs
- **TanStack Query:** https://tanstack.com/query/latest
- **Framer Motion:** https://www.framer.com/motion/

### Inspiration

- **Linear:** https://linear.app (design reference)
- **Sleeper:** Mobile-first fantasy platform
- **MyFantasyLeague:** Feature set reference (ignore UX)

### Community

- **r/fantasyfootball** - User research
- **r/DynastyFF** - Early adopters
- **Fantasy football podcasts** - Marketing channel

---

## Success Metrics

### Phase 1: Validation (Months 0-6)

- 50 beta leagues (free)
- 80% weekly engagement
- <5% churn in beta season

### Phase 2: Early Traction (Months 6-12)

- 500 paying leagues ($49-99/league)
- $25K-50K revenue
- 70% retention year-over-year

### Phase 3: Growth (Months 12-24)

- 2,000-5,000 leagues
- $100K-300K revenue
- Word-of-mouth growth (30%+ organic)
- Dynasty features added
- Clear path to $500K+ ARR

---

## Decision Log

| Date     | Decision               | Reasoning                                     |
| -------- | ---------------------- | --------------------------------------------- |
| Dec 2024 | Vite over Next.js      | No SSR needs, simpler, faster dev             |
| Dec 2024 | REST over GraphQL      | Simpler for MVP, add tRPC later if needed     |
| Dec 2024 | PWA over native        | Saves 6-9 months, MFL bar is low              |
| Dec 2024 | shadcn/ui              | Linear-quality components, fully customizable |
| Dec 2024 | Railway for deployment | Simple, affordable, great DX                  |

---

_Last updated: December 2024_
