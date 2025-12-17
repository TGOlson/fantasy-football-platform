# Auth & Routes Spec

## Auth Levels

### 1. Public (Unauthed)
- `/login`
- `/register`

### 2. User Auth (Logged in)
- User must have valid JWT
- Can access their user home, settings, create leagues

### 3. League Member Auth
- User must be logged in AND own (or have ever owned) a team in the league
- Can view all league pages (standings, rosters, matchups, players, settings)
- Historical access: Can view past seasons even if no longer active in league
- Cannot edit things they don't own

### 4. Team Owner Auth
- League member + owns the specific team
- Can edit their lineup, manage their roster
- Future: make trades, view their transaction history

### 5. League Admin Auth
- League member + is the commissioner (`league.commissionerId`)
- Can edit league settings, manage league
- Future: approve/reject trades, process waivers

### 6. Site Admin
- Special role for developers
- Can view/do anything across all leagues
- Implementation: Add `isSiteAdmin` boolean to users table
- Site admins bypass all auth checks

## Implementation Strategy

**Keep it simple - no complex permissions framework.**

### API (tRPC)
Current procedures:
- `publicProcedure` - unauthed
- `protectedProcedure` - user auth only

Add new procedures:
- `leagueProcedure` - requires user is in league (owns a team)
- `teamOwnerProcedure` - requires user owns the specific team
- `leagueAdminProcedure` - requires user is commissioner
- `siteAdminProcedure` - requires user is site admin

These procedures check memberships via database queries (join teams table on userId + leagueId/teamId from input).

### App (React)
- Keep `<ProtectedRoute>` for basic user auth
- Add route-level checks for league membership (redirect to home if not in league)
- UI-level checks for owner/admin features:
  - Show "Edit Lineup" button only if user owns team
  - Show "League Settings" link only if user is commissioner
  - Site admin sees everything

## Route Structure

### Current (OLD)
```
/                           → Dashboard
/leagues                    → List leagues
/leagues/:leagueId          → League detail
/leagues/:leagueId/scoring  → Scoring settings
/teams/:teamId              → Team detail
/players                    → Players list
/players/:playerId          → Player detail
```

### Proposed (NEW)
```
# Unauthed
/login
/register

# User Home (authed)
/                           → User home (list your leagues, settings, create league button)

# League Routes (authed + league member)
/:leagueSlug                → League home (current season)
                              - Standings, current week matchups, recent transactions
                              - Defaults to active season

/:leagueSlug/matchups       → All matchups for current week
/:leagueSlug/matchups/:weekNumber → Matchups for specific week
/:leagueSlug/matchups/:weekNumber/:matchupId → Single matchup detail

/:leagueSlug/players        → League player search/filter
/:leagueSlug/players/:playerId → Player detail (within league context)

/:leagueSlug/teams/:teamId  → Team roster (anyone can view)
                              - Owners see "Edit Lineup" controls

/:leagueSlug/settings       → League settings (view-only unless admin)
                              - Admins see edit controls

/:leagueSlug/:year          → Historical season view
                              - /my-league/2024 shows 2024 season standings/matchups
```

### League Slug
- Derive from league name: "The Championship League" → `the-championship-league`
- Store as `slug` column on leagues table (unique)
- Auto-generate on league creation, allow commissioner to customize

### Year in URL
**Decision needed:** Should current year be omitted from URL?

**Option A: Always include year**
- `/my-league/2025` even if 2025 is current
- Pro: Simpler routing, explicit
- Con: Slightly longer URLs

**Option B: Omit current year**
- `/my-league` shows current season
- `/my-league/2024` shows historical
- Pro: Cleaner URLs for common case
- Con: More complex routing (need to determine current season)

**Recommendation: Option A** - Always include year. Simpler implementation, more predictable. Can redirect `/:leagueSlug` → `/:leagueSlug/:currentYear` automatically.

## Data Requirements

### Database Changes
1. Add `slug` to leagues table (text, unique, indexed)
2. Add `isSiteAdmin` to users table (boolean, default false)
3. Add unique constraint on teams table for `(leagueId, ownerId)` to prevent multiple team ownership

### API Changes
1. Implement new tRPC procedures (league/team/admin/site-admin)
2. Migrate existing routers to use appropriate procedures:
   - Leagues router: most endpoints need leagueProcedure
   - Teams router: viewing = leagueProcedure, editing = teamOwnerProcedure
   - Settings router: viewing = leagueProcedure, editing = leagueAdminProcedure
3. Add helpers to check memberships:
   ```ts
   async function checkLeagueMembership(userId, leagueId) // Check if user ever owned team
   async function checkTeamOwnership(userId, teamId)
   async function checkLeagueAdmin(userId, leagueId)
   ```
4. Add slug generation utility:
   ```ts
   async function generateUniqueSlug(leagueName: string): Promise<string>
   // "The Championship League" → "the-championship-league"
   // If exists, append number: "the-championship-league-2"
   ```

### App Changes
1. Update all routes to new structure
2. Add league membership check wrapper
3. Add conditional rendering for owner/admin features
4. Update navigation to use league slug

## Decisions

1. **Year in URL:** ✅ Always include (e.g., `/my-league/2025`)
2. **League slug:** ✅ Auto-generate from league name (slugify + numeric suffix for uniqueness). Commissioners cannot customize (for now).
3. **Site admin UI:** ✅ Show special badge/indicator when viewing as site admin
4. **Historical access:** ✅ Allow read-only access to any league where user ever owned a team (check teams table, not current active status). Most platforms do this for nostalgia/records.
5. **Multiple teams:** ✅ PREVENT one user from owning multiple teams in same league (add unique constraint on `leagueId + ownerId`). Avoids collusion and conflicts. If needed for small leagues, users can create multiple accounts.
