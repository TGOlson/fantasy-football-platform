# Tech Stack

## Frontend (`apps/web`)

**Framework & Build**
- **Vite** - Fast build tool and dev server
- **React 19** - UI framework
- **TypeScript** - Type safety

**UI & Styling**
- **Mantine** - Component library (buttons, forms, tables, etc.)
  - `@mantine/core` - Core components
  - `@mantine/hooks` - Utility hooks
  - `@mantine/notifications` - Toast notifications
  - `@mantine/form` - Form management
  - `mantine-datatable` - Data tables (perfect for player lists, stats)
- **No Tailwind/CSS** - Mantine handles all styling via props

**Routing & State**
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching, caching (powers tRPC)

**API Client**
- **tRPC Client** - Type-safe API calls with auto-generated hooks
  - Location: `apps/web/src/lib/trpc.ts`
  - Provider: `apps/web/src/lib/trpc-provider.tsx`

---

## Backend (`apps/api`)

**Framework**
- **Express** - HTTP server
- **TypeScript** - Type safety

**API Layer**
- **tRPC Server** - Type-safe API with zero code generation
  - Location: `apps/api/src/trpc/`
  - Router: `apps/api/src/trpc/router.ts`
  - Routers: `apps/api/src/trpc/routers/`

**Database**
- **Drizzle ORM** - TypeScript-native ORM
  - Schema: `packages/database/src/schema/`
  - Client: `packages/database/src/index.ts`

**Auth**
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing

---

## Database (`packages/database`)

**Database**
- **PostgreSQL 16** - Running in Docker
- **Drizzle ORM** - Schema definition and migrations

**Schema**
- `users` - User accounts
- `leagues` - Fantasy leagues
- `teams` - Teams in leagues
- `players` - NFL players
- `scoring_rules` - Custom scoring config (JSONB)

**Tools**
- `drizzle-kit` - Schema migrations
- `tsx` - Run TypeScript seed scripts

---

## Monorepo Structure

**Package Manager**
- **pnpm** - Fast, disk-efficient package manager
- **Workspaces** - Monorepo with shared dependencies

**Workspaces**
```
apps/
  api/          - Express + tRPC backend
  web/          - Vite + React frontend
packages/
  database/     - Drizzle schemas, migrations
  types/        - Shared TypeScript types
```

---

## Development Tools

- **ESLint** - Code linting
- **TypeScript** - Type checking across all packages
- **tsx** - Run TypeScript files directly (API dev server)
- **Vite** - Frontend dev server with HMR

---

## How It All Fits Together

1. **Frontend calls API**: Uses tRPC hooks (e.g., `trpc.auth.login.useMutation()`)
2. **tRPC handles type safety**: Frontend and backend share same type definitions
3. **Backend queries database**: Uses Drizzle ORM to query PostgreSQL
4. **Database returns data**: Drizzle returns type-safe objects
5. **tRPC returns to frontend**: Types are preserved end-to-end
6. **Mantine renders UI**: Components display data with built-in styling

**Example Flow:**
```
User clicks "Login"
  → React calls trpc.auth.login.useMutation()
  → tRPC sends request to /trpc/auth.login
  → Express routes to authRouter
  → authRouter queries users table via Drizzle
  → Returns JWT + user data
  → tRPC sends typed response to frontend
  → React updates auth context
  → Mantine redirects to dashboard
```

---

## Why These Choices?

**Mantine**: Best component library for data-heavy apps (tables, stats, forms)
**tRPC**: Type safety from DB → API → Frontend (no manual API typing)
**Drizzle**: TypeScript-native ORM, simpler than Prisma
**Vite**: Fastest dev experience for React
**pnpm**: Fastest package manager, monorepo support
