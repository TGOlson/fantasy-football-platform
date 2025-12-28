# League Context Authorization Pattern

## Overview

95% of queries happen within a league context. Instead of filtering every query, we:
1. Require `leagueId` parameter on most queries
2. Check access once at the league level
3. All nested data within that league is accessible (no further auth)

## Core Principle

**"If you're in the league, you can see everything in the league"**

- Teams, rosters, standings, settings, etc. are all visible to league members
- Updates still require proper permissions (team owner, commissioner, etc.)
- Non-league queries (`myLeagues`, `me`) are handled as edge cases with custom auth

## Files to Update

### 1. Create Auth Helper
**File:** `apps/api/src/lib/league-auth.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export async function canAccessLeague(
  prisma: PrismaClient,
  userId: string,
  leagueId: string
): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: {
      ownerId: userId,
      franchise: { leagueId }
    }
  });
  return !!team;
}

export async function requireLeagueAccess(
  prisma: PrismaClient,
  userId: string,
  leagueId: string
): Promise<void> {
  const hasAccess = await canAccessLeague(prisma, userId, leagueId);
  if (!hasAccess) {
    throw new Error('Not authorized to access this league');
  }
}
```

### 2. Update League Schema
**File:** `apps/api/src/graphql/schema/league.ts`

```typescript
import { requireLeagueAccess } from '../../lib/league-auth';

// Primary query - takes leagueId, returns league data
builder.queryField('league', (t) =>
  t.prismaField({
    type: 'League',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: { loggedIn: true },
    resolve: async (query, root, args, ctx) => {
      // Auth check happens here once
      await requireLeagueAccess(ctx.prisma, ctx.user.userId, args.id);

      // No filtering needed - user is authorized
      return ctx.prisma.league.findUniqueOrThrow({
        ...query,
        where: { id: args.id }
      });
    }
  })
);

// Keep myLeagues as-is (edge case with custom filtering)
builder.queryField('myLeagues', (t) =>
  t.prismaField({
    type: ['League'],
    authScopes: { loggedIn: true },
    resolve: async (query, root, args, ctx) => {
      const userTeams = await ctx.prisma.team.findMany({
        where: { ownerId: ctx.user.userId },
        include: { franchise: true }
      });
      const leagueIds = [...new Set(userTeams.map(t => t.franchise.leagueId))];
      return ctx.prisma.league.findMany({
        ...query,
        where: { id: { in: leagueIds } }
      });
    }
  })
);

// League type - nested fields need NO auth
builder.prismaObject('League', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),

    // All relations work without auth - already in league context
    franchises: t.relation('franchises'),
    seasons: t.relation('seasons'),

    // Convenience field - user's team in this league
    myTeam: t.field({
      type: 'Team',
      nullable: true,
      resolve: async (league, args, ctx) => {
        return ctx.prisma.team.findFirst({
          where: {
            ownerId: ctx.user.userId,
            franchise: { leagueId: league.id }
          }
        });
      }
    })
  })
});
```

### 3. Update Team Schema (if exists)
**File:** `apps/api/src/graphql/schema/team.ts`

```typescript
// Don't expose top-level teams() query
// Teams are only accessible through league context

builder.prismaObject('Team', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    // All fields/relations accessible - no auth needed
    owner: t.relation('owner'),
    franchise: t.relation('franchise'),
    roster: t.relation('roster'),
    // etc.
  })
});
```

### 4. Update Client GraphQL Queries
**File:** `apps/web/src/graphql/leagues.graphql`

```graphql
# Dashboard - list user's leagues
query MyLeagues {
  myLeagues {
    id
    name
    slug
    currentSeason {
      id
      year
      status
    }
  }
}

# League page - everything in one query
query LeaguePage($leagueId: ID!) {
  league(id: $leagueId) {
    id
    name
    slug

    currentSeason {
      year
      status
      teams {
        id
        name
        owner {
          name
          email
        }
        roster {
          id
          # ... roster fields
        }
      }
      standings {
        # ... standings fields
      }
    }

    # Get user's team
    myTeam {
      id
      name
    }
  }
}
```

### 5. Update Dashboard Page
**File:** `apps/web/src/pages/dashboard.tsx`

```typescript
import { useMyLeaguesQuery } from '../generated/graphql';
import { Skeleton } from '@mantine/core';

export function DashboardPage() {
  const { data, loading } = useMyLeaguesQuery();

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={100} />
        <Skeleton height={100} />
        <Skeleton height={100} />
      </Stack>
    );
  }

  const leagues = data?.myLeagues || [];

  // ... rest of component
}
```

## Query Patterns

### ✅ Allowed Patterns

```graphql
# User's leagues (custom filtering)
query { myLeagues { id name } }

# League-scoped (auth once, see everything)
query { league(id: "123") { teams { roster { players } } } }

# Current user (edge case)
query { me { id email } }
```

### ❌ Not Exposed

```graphql
# No top-level queries for league resources
query { teams { ... } }  # Not exposed
query { players { ... } }  # Not exposed
query { standings { ... } }  # Not exposed

# Everything goes through league context
```

## Mutation Auth (Still Required)

Updates need ownership checks even though reads don't:

```typescript
builder.mutationField('updateRoster', (t) =>
  t.field({
    type: 'Team',
    args: {
      teamId: t.arg.id({ required: true }),
      // ... other args
    },
    resolve: async (root, args, ctx) => {
      // Check ownership
      const team = await ctx.prisma.team.findUniqueOrThrow({
        where: { id: args.teamId }
      });

      if (team.ownerId !== ctx.user.userId) {
        throw new Error('Not your team');
      }

      // Proceed with update
    }
  })
);
```

## Migration Strategy

1. ✅ Create `league-auth.ts` helper
2. ✅ Add `league(id)` query with auth check
3. ✅ Update League type to expose all nested fields
4. ✅ Update client queries to use `league(id: $leagueId)`
5. ✅ Update dashboard to use React Query + skeleton loading
6. ⚠️ Don't expose top-level `teams()`, `players()`, etc. queries
7. ⚠️ Keep `myLeagues` for dashboard use
8. ⚠️ Always check ownership in mutations

## Future: Privacy Toggle

If we want public leagues later:

```prisma
model League {
  isPublic Boolean @default(false)
}
```

Then update auth:
```typescript
export async function canAccessLeague(prisma, userId, leagueId) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });

  // Public leagues are accessible to anyone
  if (league.isPublic) return true;

  // Private leagues require membership
  return await hasTeamInLeague(prisma, userId, leagueId);
}
```

## Benefits

- **Minimal auth code:** One check per league query, zero on nested fields
- **Great performance:** One auth query vs filtering every row
- **Simple mental model:** "In league = see everything"
- **Easy to debug:** Auth is explicit in resolver code
- **Type-safe:** Pothos handles everything
- **No DB changes:** Works with current schema
