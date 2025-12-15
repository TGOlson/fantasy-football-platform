# Fantasy Platform

The most flexible fantasy football platform.

## Project Structure

```
fantasy-platform/
├── apps/
│   ├── web/           # Vite + React frontend
│   └── api/           # Express + TypeScript backend
├── packages/
│   ├── types/         # Shared TypeScript types
│   ├── database/      # Drizzle ORM schema and migrations
│   └── config/        # Shared configuration
└── docs/              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 10.26.0
- Docker (for PostgreSQL)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL database
docker compose up -d

# 3. Run database migrations
cd packages/database
pnpm db:generate  # Generate migration from schema
pnpm db:migrate   # Apply migration to database

# 4. (Optional) Seed with sample data
pnpm db:seed
```

### Development

```bash
# Run both frontend and API concurrently
pnpm dev

# Or run them individually:
pnpm dev:web    # Frontend only (http://localhost:5173)
pnpm dev:api    # API only (http://localhost:3000)
```

### Building

```bash
# Build both apps
pnpm build

# Or build individually:
pnpm build:web
pnpm build:api
```

### Type Checking

```bash
# Typecheck entire monorepo (all packages in parallel)
pnpm typecheck

# Or check individual packages:
pnpm --filter api typecheck
pnpm --filter web typecheck
pnpm --filter @fantasy-platform/database typecheck
```

### Database Commands

All database commands are run from `packages/database`:

```bash
cd packages/database

# Generate migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly (dev only, skips migrations)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed database with sample data
pnpm db:seed
```

### Docker Commands

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# View logs
docker compose logs postgres

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

## Development Progress

- ✅ **Milestone 1:** Project Scaffolding & Infrastructure Setup
  - Monorepo structure with pnpm workspaces
  - Vite + React + TypeScript frontend with Tailwind CSS
  - Express + TypeScript backend
  - Shared types package
  - Both apps running and communicating

- ✅ **Milestone 2:** Database & Drizzle ORM Setup
  - PostgreSQL 16 in Docker
  - Drizzle ORM with TypeScript-native schemas
  - Five core tables: users, leagues, teams, players, scoring_rules
  - Type-safe database client with lazy initialization
  - Seed script with sample data
  - Database connection verified from API

- 🔄 **Milestone 3:** tRPC API Infrastructure (In Progress)
  - ✅ Phase A: tRPC server setup with Express integration
  - ✅ Phase B: Authentication (register, login, JWT, bcryptjs)
  - ⏳ Phase C: Core CRUD procedures (leagues, teams, players)
  - ⏳ Phase D: Frontend integration with auto-generated hooks

See [plan.md](./plan.md) for the full development roadmap.

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for AI assistance
- [plan.md](./plan.md) - Development plan and milestones
- [docs/](./docs/) - Architecture and design decisions

## Tech Stack

**Frontend:**
- Vite + React + TypeScript
- Tailwind CSS
- shadcn/ui (to be added in Milestone 4)
- TanStack Query & Table (to be added)

**Backend:**
- Express + TypeScript
- PostgreSQL 16 + Drizzle ORM
- tRPC (to be added in Milestone 3)

**Database:**
- PostgreSQL 16 (Docker)
- Drizzle ORM (TypeScript-native)
- 5 core tables with relations

**Deployment:**
- Railway or Render (planned)

## Environment Variables

Environment variables are already configured in:
- `apps/web/.env` - Frontend configuration
- `apps/api/.env` - Backend configuration (includes DATABASE_URL)

Default database connection:
```
DATABASE_URL=postgresql://fantasy:fantasy_dev_password@localhost:5432/fantasy_platform
```

**Note:** `.env` files are included in the repo for local development. Do not commit production secrets.

## License

ISC
