# Fantasy Platform

Custom fantasy football platform with advanced scoring customization.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Mantine UI, TanStack Query |
| API | Express, tRPC |
| Database | PostgreSQL 16, Drizzle ORM |
| Auth | JWT, bcryptjs |
| Tooling | TypeScript, pnpm workspaces, Prettier, ESLint |

## Project Structure

```
apps/
  web/              # React frontend (localhost:5173)
  api/              # Express + tRPC backend (localhost:3000)
packages/
  database/         # Drizzle schema + migrations
  types/            # Shared TypeScript types
```

**Key files:**
- `packages/database/src/schema.ts` - Database schema
- `apps/api/src/trpc/router.ts` - API routes
- `apps/web/src/lib/trpc.ts` - Frontend API client

## Getting Started

**Prerequisites:** Node.js >= 18, pnpm >= 10.26.0, Docker

```bash
pnpm install          # Install dependencies
docker compose up -d  # Start PostgreSQL
pnpm db:push          # Push schema to database
pnpm db:seed          # (Optional) Seed sample data
```

## Commands

All commands run from project root.

```bash
# Development
pnpm dev              # Run all apps
pnpm dev:web          # Frontend only
pnpm dev:api          # API only

# Build & Test
pnpm build            # Build all
pnpm typecheck        # Typecheck all packages
pnpm test             # Run tests

# Formatting
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting (CI)
pnpm lint             # Run ESLint

# Database
pnpm db:push          # Push schema (dev)
pnpm db:generate      # Generate migration
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed data

# Docker
docker compose up -d      # Start PostgreSQL
docker compose down       # Stop
docker compose down -v    # Reset (deletes data)
```

## Environment Variables

Pre-configured in `apps/web/.env` and `apps/api/.env`.

```
DATABASE_URL=postgresql://fantasy:fantasy_dev_password@localhost:5432/fantasy_platform
```
