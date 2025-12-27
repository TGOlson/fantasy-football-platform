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

## Phase 1: Setup & Dependencies

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

## Phase 2: Database Migration

Convert Drizzle schema to Prisma schema.

**Tasks:**
- Convert schema.ts tables to Prisma models
- Set up relations
- Create initial migration
- Verify with Prisma Studio

**Keep Drizzle temporarily** - Run both in parallel during migration.

## Phase 3: GraphQL API Setup

Set up Pothos builder and create first GraphQL endpoint.

**Tasks:**
- Create Pothos builder with Prisma plugin
- Configure auth scopes plugin
- Create simple test schema (User type + me query)
- Add Yoga middleware to Express server
- Test with GraphQL playground

**Validation:** GraphQL playground accessible at `/graphql`, can query `me` successfully.

## Phase 4: Client Setup

Configure codegen and create first typed query in React app.

**Tasks:**
- Add codegen config
- Create first GraphQL query (current user)
- Run codegen to generate types
- Set up graphql-request client wrapper
- Replace one tRPC query with GraphQL

**Validation:** One page using generated hooks successfully.

## Phase 5: Schema Migration

Migrate tRPC routers to Pothos schema one at a time.

**Order:**
1. Auth (simple, just user queries)
2. Leagues (most complex, good to tackle early)
3. Teams
4. Players
5. Lineups
6. Matchups
7. Scoring

**For each router:**
- Create Pothos schema file
- Add queries/mutations
- Write corresponding GraphQL queries in web app
- Run codegen
- Update React components to use new hooks
- Test thoroughly
- Delete old tRPC router when confirmed working

## Phase 6: Cleanup

Remove Drizzle and tRPC completely.

**Tasks:**
- Delete all tRPC router files
- Remove Drizzle schema and migrations
- Uninstall tRPC packages
- Uninstall Drizzle packages
- Remove tRPC client setup from web app
- Update README with new stack

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

## Notes

- Run both tRPC and GraphQL in parallel during migration (different routes)
- Keep schema changes minimal during migration
- Test each phase thoroughly before moving to next
- Can pause at any phase boundary and resume later
