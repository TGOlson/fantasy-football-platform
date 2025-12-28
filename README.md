# Fantasy Platform

Custom fantasy football platform with advanced scoring customization.

## Tech Stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React 19, Vite, Mantine UI, TanStack Query             |
| API      | Express, GraphQL Yoga, Pothos GraphQL                  |
| Database | PostgreSQL 16, Prisma ORM                              |
| Auth     | JWT, bcryptjs                                          |
| Tooling  | TypeScript, pnpm workspaces, GraphQL Codegen, Prettier |

## Project Structure

```
apps/
  web/              # React frontend (localhost:5173)
  api/              # Express + GraphQL backend (localhost:3000)
packages/
  database/         # Prisma schema + client
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
pnpm db:generate      # Generate Prisma Client
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed data

# GraphQL
pnpm codegen          # Generate typed GraphQL hooks
pnpm codegen:watch    # Watch mode for codegen

# Docker
docker compose up -d      # Start PostgreSQL
docker compose down       # Stop
docker compose down -v    # Reset (deletes data)
```

## API

**GraphQL Playground:** http://localhost:3000/graphql

The API uses GraphQL with Pothos for type-safe schema building. All queries/mutations are defined in `apps/api/src/graphql/schema/`.

**Development workflow:**

1. Update Prisma schema → `pnpm db:push`
2. Generate Prisma Client → `pnpm db:generate`
3. Add/update Pothos GraphQL types in API
4. Write GraphQL queries in web app
5. Generate typed hooks → `pnpm codegen`

TODO:

- Complete GraphQL migration (see `working-docs/graphql-migration.md`)
- fix lint errors
- review working-docs/features.md, ensure "done" is correct, start on next set
- write unit tests for any complicated logic
- stand up a test db so we don't need to wrap everything in txns
