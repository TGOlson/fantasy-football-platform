# GraphQL Migration Plan

Migration from tRPC + Drizzle to GraphQL (Prisma + Pothos + GraphQL Code Generator).

## Stack

- **Prisma** - Schema management, migrations, type-safe queries
- **Pothos GraphQL** - Type-safe GraphQL schema builder with Prisma plugin
- **GraphQL Yoga** - Lightweight GraphQL server (Express middleware)
- **GraphQL Code Generator** - Generates typed React hooks from GraphQL queries

## Migration Flow

```
Prisma Schema → Prisma Client → Pothos Schema → GraphQL API → Codegen → Typed React Hooks
```

## Migration Philosophy

**Full cutover, no backwards compatibility:**

- Delete old files immediately, don't run tRPC and GraphQL in parallel
- Break existing code without hesitation - everything is dev
- Improve schema as we go - rename tables/columns, fix relationships, clean up inconsistencies
- Delete tRPC routers as soon as we start writing Pothos equivalents
- Delete Drizzle schema files once Prisma schema is created
- Be critical and fix anything that looks suboptimal

**It's fine to break everything - we'll fix it all by the end.**

## Phase 1: Setup & Dependencies ✅ COMPLETE

Install packages and create initial configuration files.

**API packages:**

- `prisma` (devDep)
- `@prisma/client`
- `@pothos/core`
- `@pothos/plugin-prisma`
- `@pothos/plugin-scope-auth`
- `graphql-yoga`
- `graphql`

**Web packages:**

- `@graphql-codegen/cli` (devDep)
- `@graphql-codegen/client-preset` (devDep)
- `graphql-request`

**Config files:**

- `packages/database/prisma/schema.prisma`
- `apps/api/src/graphql/builder.ts`
- `codegen.ts` (root)

## Phase 2: Database Migration ✅ COMPLETE

Convert Drizzle schema to Prisma schema and improve it.

**Tasks:**

- Convert schema.ts tables to Prisma models
- **Critically review and improve:**
  - Rename tables/columns for consistency (e.g., snake_case vs camelCase)
  - Fix any relationship issues
  - Simplify overly complex structures
  - Add missing indexes or constraints
  - Clean up any inconsistencies
- Set up relations properly
- Create initial migration
- Verify with Prisma Studio
- **Delete Drizzle schema files** (`packages/database/src/schema.ts`, etc.)

**Improvements made:**

- Added enums for `SeasonStatus`, `Position`, `PlayerStatus`, `TransactionType`
- Changed `PlayerSeason.position` to `positions: Position[]` (supports multi-position eligibility)
- Made all score/stat fields non-nullable with `@default(0)` (use timestamps to determine state)
- Made `Player.nflId` required
- Made `LeagueSeason.settings` required (flipped FK to enforce)
- Removed `PlayerWeeklyProjection.projectedStats` (YAGNI)
- Added proper indexes on frequently queried fields
- Used Prisma 6 (Prisma 7 has breaking changes)

## Phase 3: GraphQL API Setup ✅ COMPLETE

Set up Pothos builder and create first GraphQL endpoint.

**Tasks:**

- Create Pothos builder with Prisma plugin
- Configure auth scopes plugin
- Create simple test schema (User type + me query)
- Add Yoga middleware to Express server
- **Delete tRPC router setup** (`apps/api/src/trpc/`)
- Test with GraphQL playground

**Validation:** GraphQL playground accessible at `/graphql`, can query `me` successfully.

**Implementation notes:**

- Prisma Client exported from `@fantasy-platform/database/client`
- Used `graphql-scalars` for DateTime scalar (more robust than custom)
- No mutations defined yet (will add in Phase 5)
- Auth context: JWT from Authorization header → `ctx.user`
- Pothos config: uses Prisma DMMF, scope auth plugin ready

## Phase 4: Client Setup ✅ COMPLETE

Configure codegen and create first typed query in React app.

**Tasks:**

- Add codegen config
- Create first GraphQL query (current user)
- Run codegen to generate types
- Set up graphql-request client wrapper
- Replace one tRPC query with GraphQL (break the old code)
- **Delete tRPC client setup** (`apps/web/src/lib/trpc.ts`, etc.)

**Validation:** One page using generated hooks successfully (others will be broken - that's fine).

**Implementation notes:**

- GraphQL client wrapper at `apps/web/src/lib/graphql-client.ts`
- Auto-includes JWT from `localStorage.getItem('authToken')`
- Codegen config at root: `codegen.ts`
- Run `pnpm codegen` to generate types
- Uses `.graphql.ts` files with `graphql()` template tag (not separate `.graphql` files)
- Updated `root-loader.ts` to use GraphQL `Me` query
- Generated types at `apps/web/src/gql/`
- Deleted tRPC client

**What's working:**

- Authentication flow via GraphQL
- Type-safe queries with full autocomplete

**What's broken (expected):**

- `app-loader.ts` - still uses tRPC for leagues list
- All other pages still use tRPC
- Login/register might use tRPC

## Phase 5: Schema Migration 🚧 IN PROGRESS

Migrate all remaining functionality to GraphQL.

**Approach:**

- Build out all Pothos schemas (User, League, Team, Player, etc.)
- Create all queries and mutations needed
- Write GraphQL queries in web app
- Run codegen
- Fix all React components to use new hooks
- **Don't worry about breaking things - fix them all at the end**

**Schema improvements to consider:**

- Simplify complex nested queries from tRPC days
- Use GraphQL relations properly (no manual stitching)
- Flatten any awkward structures
- Improve naming consistency

## Phase 6: Testing & Documentation

Ensure everything works and update docs.

**Tasks:**

- Test all pages and functionality
- Fix any remaining broken code
- Update README with new stack and commands
- Update CLAUDE.md with new patterns
- Verify database migrations work cleanly
- Test auth flows
- Clean up any leftover files or dead code

**At this point everything should work with the new stack.**

## Auth Strategy

**Middleware-based auth:**

- Keep JWT token parsing in Express middleware
- Pass `user` to GraphQL context
- Use Pothos scope auth plugin for field-level auth

**Auth scopes:**

- `loggedIn` - User is authenticated
- `leagueMember` - User is member of league
- `teamOwner` - User owns the team
- `commissioner` - User is league commissioner

## Progress Summary

**Completed:** Phases 1-4
**Current:** Phase 5 (Schema Migration)
**Remaining:** Complete Phase 5 + Phase 6 (Testing & Documentation)

## Notes

- Can pause at any phase boundary and resume later
- Prisma schema improvements were aggressive - cleaned up many inconsistencies
- Using standard `graphql-scalars` package for DateTime
- Token storage key changed from `auth_token` to `authToken` for consistency
