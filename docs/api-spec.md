# API Specification

## Overview

This app uses **tRPC** for all API communication. No REST endpoints, no GraphQL - just type-safe procedure calls.

**API Definitions:** `apps/api/src/trpc/routers/`
**Frontend Usage:** Auto-generated hooks via tRPC client

---

## Current API Endpoints

### Auth Router (`routers/auth.ts`)

| Procedure | Type | Input | Returns | Auth |
|-----------|------|-------|---------|------|
| `auth.register` | mutation | `{ email, password, name }` | `{ token, user }` | Public |
| `auth.login` | mutation | `{ email, password }` | `{ token, user }` | Public |
| `auth.me` | query | - | `{ id, email, name, createdAt }` | Protected |

**Frontend Usage:**
```tsx
const loginMutation = trpc.auth.login.useMutation();
loginMutation.mutate({ email, password });

const { data: user } = trpc.auth.me.useQuery();
```

---

### Leagues Router (`routers/leagues.ts`)

| Procedure | Type | Input | Returns | Auth |
|-----------|------|-------|---------|------|
| `leagues.list` | query | - | `League[]` | Public |
| `leagues.getById` | query | `{ id }` | `League + teams + scoringRules` | Public |
| `leagues.create` | mutation | `{ name, season, scoringRules? }` | `League` | Protected |
| `leagues.update` | mutation | `{ id, name?, season? }` | `League` | Protected |

**Frontend Usage:**
```tsx
const { data: leagues } = trpc.leagues.list.useQuery();
const { data: league } = trpc.leagues.getById.useQuery({ id: '123' });
const createMutation = trpc.leagues.create.useMutation();
```

---

### Teams Router (`routers/teams.ts`)

| Procedure | Type | Input | Returns | Auth |
|-----------|------|-------|---------|------|
| `teams.getById` | query | `{ id }` | `Team + owner + league + roster` | Public |
| `teams.update` | mutation | `{ id, name }` | `Team` | Protected* |
| `teams.getByLeague` | query | `{ leagueId }` | `Team[] + owners` | Public |

*Protected = Must be team owner

---

### Players Router (`routers/players.ts`)

| Procedure | Type | Input | Returns | Auth |
|-----------|------|-------|---------|------|
| `players.list` | query | `{ position?, team?, search? }` | `Player[]` | Public |
| `players.getById` | query | `{ id }` | `Player` | Public |

**Frontend Usage:**
```tsx
const { data: players } = trpc.players.list.useQuery({
  position: 'QB',
  search: 'mahomes'
});
```

---

## How to Add New Endpoints

### 1. Create Router File
```typescript
// apps/api/src/trpc/routers/new-router.ts
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { z } from 'zod';

export const newRouter = router({
  myProcedure: publicProcedure
    .input(z.object({ foo: z.string() }))
    .query(async ({ input }) => {
      // Your logic here
      return { bar: 'baz' };
    }),
});
```

### 2. Register in Main Router
```typescript
// apps/api/src/trpc/router.ts
import { newRouter } from './routers/new-router.js';

export const appRouter = router({
  // ... existing routers
  new: newRouter,  // ← Add this
});
```

### 3. Use in Frontend
```tsx
// Auto-magically typed!
const { data } = trpc.new.myProcedure.useQuery({ foo: 'test' });
```

---

## Future Endpoints (Planned)

### Scoring Rules Router
- `scoringRules.getByLeague` - Get scoring config
- `scoringRules.update` - Update league scoring (protected)
- `scoringRules.applyTemplate` - Use preset (PPR, Half PPR, etc.)

### Roster Management Router
- `rosters.getByTeam` - Get team's roster
- `rosters.setStarters` - Update starting lineup (protected)
- `rosters.addPlayer` - Add player to roster (protected)
- `rosters.dropPlayer` - Remove from roster (protected)

### Matchups Router
- `matchups.getByLeague` - Get weekly matchups
- `matchups.getByWeek` - Get specific week
- `matchups.calculate` - Calculate scores for matchup

### Stats Router (Future - when we have real data)
- `stats.getPlayerWeek` - Player stats for week
- `stats.calculatePoints` - Apply scoring rules to stats

### Transactions Router (Post-MVP)
- `transactions.propose` - Propose trade
- `transactions.accept` - Accept trade
- `transactions.history` - View transaction log

---

## Protected Procedures

**How Auth Works:**
1. User logs in → receives JWT token
2. Frontend stores token in `localStorage`
3. tRPC client includes token in `Authorization: Bearer <token>` header
4. Backend `protectedProcedure` middleware validates token
5. Procedure has access to `ctx.user` with `{ userId, email }`

**Creating Protected Procedures:**
```typescript
protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // ctx.user is guaranteed to exist
    const userId = ctx.user.userId;
    // ... your logic
  });
```

---

## Error Handling

**tRPC Errors:**
```typescript
throw new TRPCError({
  code: 'NOT_FOUND',  // or UNAUTHORIZED, FORBIDDEN, BAD_REQUEST
  message: 'User-friendly error message',
});
```

**Frontend Handling:**
```tsx
const mutation = trpc.something.useMutation({
  onError: (error) => {
    // error.message is the message from TRPCError
    notifications.show({ message: error.message, color: 'red' });
  },
});
```

---

## Quick Reference

**Location of Definitions:**
- Router files: `apps/api/src/trpc/routers/*.ts`
- Main router: `apps/api/src/trpc/router.ts`
- Context (auth): `apps/api/src/trpc/context.ts`
- Procedures: `apps/api/src/trpc/trpc.ts`

**Type Exports:**
```typescript
// Backend exports AppRouter type
export type AppRouter = typeof appRouter;

// Frontend imports it
import type { AppRouter } from '../../../api/src/trpc/router';
export const trpc = createTRPCReact<AppRouter>();
```

**Zero manual typing needed** - TypeScript infers everything from backend to frontend!
