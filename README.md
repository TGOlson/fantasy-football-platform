# Fantasy Platform

Custom fantasy football platform with advanced scoring customization.

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React 19, Vite, Mantine UI, TanStack Query    |
| API      | Express, tRPC                                 |
| Database | PostgreSQL 16, Drizzle ORM                    |
| Auth     | JWT, bcryptjs                                 |
| Tooling  | TypeScript, pnpm workspaces, Prettier, ESLint |

## Project Structure

```
apps/
  web/              # React frontend (localhost:5173)
  api/              # Express + tRPC backend (localhost:3000)
packages/
  database/         # Drizzle schema + migrations
  types/            # Shared TypeScript types
```

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

TODO:

- fix lint errors
- clean up endpoints, make them smaller, more single task specific
- review working-docs/features.md, ensure "done" is correct, start on next set
- write unit tests for any complicated logic
- stand up a test db so we don't need to wrap everything in txns
- use react-form for form state
