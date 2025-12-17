# Fantasy Platform

The most powerful fantasy football platform.

## Getting Started

See: [docs/tech-stack.md](./docs/tech-stack.md)

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

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for AI assistance
- [docs/](./docs/) - Architecture and design decisions

## Environment Variables

Environment variables are already configured in:
- `apps/web/.env` - Frontend configuration
- `apps/api/.env` - Backend configuration (includes DATABASE_URL)

Default database connection:
```
DATABASE_URL=postgresql://fantasy:fantasy_dev_password@localhost:5432/fantasy_platform
```
