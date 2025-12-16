# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Custom fantasy football platform with advanced scoring customization. The goal is to combine modern UX (Linear-inspired) with deep customization (MyFantasyLeague-level flexibility) to serve engaged fantasy football enthusiasts willing to pay for better tools.

## Tech Stack

See: `docs/tech-stack.md`

### Critical Components

**Scoring Engine**:
- Core competitive moat and main engineering effort
- Must support position-specific PPR (TE: 1.5, RB: 0.5, WR: 1.0)
- Yardage milestone bonuses (100 rush yds = +3 pts)
- Conditional scoring (completion % bonus if 20+ attempts)
- Decimal scoring (2 decimal places)
- Rules stored as flexible JSON in PostgreSQL JSONB
- Template library with import/export

**Stats Ingestion Pipeline**:
```
NFL Stats API (FTN Data/SportsDataIO)
  → Stats Fetcher Service (Express)
  → PostgreSQL (raw stats)
  → Scoring Engine (applies custom rules)
  → Calculated Points (cached)
  → WebSocket (live updates)
  → Frontend (React components)
```

**Caching Strategy** (from `/docs/initial/score-calculation-architecture.md`):
- **Cache raw NFL stats** - Critical for cost savings and performance
  - Live games: 30s TTL
  - Completed games: Forever (stats don't change)
  - Key: `stats:player:{playerId}:week:{week}:year:{year}`
- **Calculate scores on-the-fly** - Fast enough (9ms for full matchup)
- Score calculation cache optional for MVP, add later if needed

## Development Commands

See: `README.md`

## Design System & UX

### Visual Principles (Linear-Inspired)
- Clean, minimal, professional aesthetic
- Subtle color palette (grays with accent colors)
- Lots of whitespace, no clutter
- Smooth animations and transitions (Framer Motion)
- Dark mode support
- Information density without overwhelming users

### Key UX Patterns
- Data tables with sorting/filtering for player lists
- Inline editing where possible
- Toast notifications (not alerts)
- Loading skeletons (not spinners)
- Drag-and-drop for lineup management

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

## Data Sources

- **NFL Stats:** FTN Data API ($2,000-4,000/year) or SportsDataIO ($4,800/year for live)
- **Cost at 500 leagues:** ~$10/league/year in data costs (very affordable)

## Important Architectural Decisions

1. **Vite over Next.js:** No SSR needed (95% authenticated), simpler mental model, faster dev, clean backend separation
2. **tRPC:** Type safety and app hooks
3. **Mobile PWA over Native Apps:** Saves 6-9 months development, good mobile web beats competitors
4. **On-the-fly score calculation:** With stats caching, calculation is fast enough (9ms per matchup)

## Key Principles

1. Start simple, add complexity only when needed
2. MVP in 4-6 months beats perfect in 12 months
3. Build 20% of MFL's features to capture 80% of value
4. Desktop for admin, mobile for everything else
5. Type safety everywhere (TypeScript + Prisma)
6. Own your components (shadcn/ui copy-paste approach)
7. Linear-inspired: clean, fast, professional
8. **The scoring engine is your moat** - nail that first

## Developer notes

* Claude should never try to run services (eg. pmpm dev) or run typecheck commands to verify output
  * Always delegate that work to the user
* Always prefer types (`type Foo = ...`) over interfaces (`interface Foo ...`)
* Keep TODOs in `TODO.md` files (either in project root or located in relevant sub-dir)
* Files in `/docs/initial` can contain outdated data, don't read them unless directly instructed to
  * Files in the root of `/docs` should be kept up to date and can be a good reference when needed
