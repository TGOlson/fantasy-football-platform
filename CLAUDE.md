# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Context

**Always read [README.md](./README.md)** for tech stack, project structure, and commands.

Fantasy football platform for serious redraft leagues that have outgrown ESPN/Yahoo/Sleeper but don't want MFL's terrible UX. The wedge is scoring engine flexibility—position-specific scoring, conditional bonuses, median standings—with data viz that helps owners make better decisions.

**Target:** Commissioners of engaged leagues willing to pay for flexibility. Not casual users, not dynasty (yet).

**Roadmap:**

- Now: Scoring engine for serious redraft
- Soon: Keepers, then IDP
- Later: Full dynasty

## Approach

Act as product thinker, architect, and engineer—not just code executor.

**Architecture:** If you see a better way to structure something, say so. Don't just make the current approach work—propose better alternatives when they exist.

**Product thinking:** If a requested feature seems non-critical or there's a more valuable alternative, bring it up. Challenge assumptions. Suggest what might actually be more useful rather than just implementing what was asked.

**Goal:** Make good decisions together, not just write code on command.

## Design Guidelines

**Current approach:** Use default Mantine components in simple layouts. Just get everything into place. We'll improve design later—don't spend time on polish now.

## Code Style

- Use `type` over `interface`
- Strict types first—avoid optionals and defaults unless required
- No over-engineering—only build what's needed now
- Keep TODOs in `TODO.md` files (root or relevant sub-dir)

### Database & API

- Stack: Prisma (ORM) + Pothos (GraphQL schema builder) + GraphQL Codegen (client types)
- After schema changes: run `pnpm db:generate` then `pnpm codegen`
- GraphQL schema in `apps/api/src/graphql/schema/`, client queries in `.graphql` files in `apps/web/src/graphql/`
- Generated types go to `src/generated/` in each package (e.g., `apps/web/src/generated/graphql.ts`)

### Authorization

**Core principle:** All league resources accessed through `league(slug)` query. Auth happens once at league level.

```graphql
# ✅ Correct: Start at league, drill down
league(slug: $slug) {        # ← Auth checked once here
  team(teamId: $id) { ... }  # ← No auth needed
  matchup(...) { ... }       # ← No auth needed
}

# ❌ Wrong: Top-level queries for league resources
team(id: $id) { ... }        # ← Don't create these!
matchup(...) { ... }
```

**Rules:**
- Auth check via `requireLeagueAccess()` in `league(slug)` resolver only
- No auth on nested fields - if you're in the league, you can see everything
- Split queries for better caching: static data (team info) separate from dynamic data (weekly matchups)
- Exceptions: `myLeagues`, `me`, `nflSeason` are OK as top-level queries

### Context Providers

**AuthProvider** (`apps/web/src/providers/auth-provider.tsx`):
- Usage: `const { user, token, login, logout } = useAuth()`
- Provides: Current user info, JWT token, auth actions
- Scope: Wraps entire app via `RootLayout`

**NFLSeasonProvider** (`apps/web/src/providers/nfl-season-provider.tsx`):
- Usage: `const { currentYear, currentWeek } = useNFLSeasonContext()`
- Provides: Current NFL season and week (hardcoded for now, will be date-based later)
- Scope: Wraps entire app (inside `QueryProvider`)
- Purpose: Default redirects, week navigation bounds

**LeagueProvider** (`apps/web/src/providers/league-provider.tsx`):
- Usage: `const { league, season, myTeam } = useLeagueContext()`
- Provides: League, season, and user's team for current league context
- Scope: Only wraps `/:leagueSlug/:year` routes
- Note: NOT available in `AppLayout` (wraps routes before LeagueProvider), use separate query if needed there

## Development Notes

- Early stage: we can break things freely, no backwards compatibility concerns
- No migrations needed yet—just `pnpm db:push`
- Don't run `pnpm` commands (eg. `dev`, `typecheck`)—ask the user to run these
- Suggest useful `pnpm` commands after relevant changes, eg.
  - After schema changes: run `pnpm db:generate` to update Prisma Client
  - After GraphQL schema changes: run `pnpm codegen` to update typed hooks
- **Testing:** Don't write tests unless asked. Can suggest tests conceptually.
- **Ask first:** Before creating files outside existing patterns or major refactors. No need to ask for standard pattern implementations.
- Use react-hook-form for form state, don't manage form state manually

## Code Organization

- **No re-exports.** Import from source files directly (e.g., `@fantasy-platform/types/player`). Use wildcard package exports so paths stay clean.
- **Feature isolation.** Prefer adding new files over spreading changes across many files. If a feature requires changing 3+ files or core abstractions, discuss options first.

## Reference Docs

Files in `working-docs/` are working documents, potentially outdated. Don't read `working-docs/old/` unless explicitly asked.
