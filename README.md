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
pnpm install          # Install dependencies
docker compose up -d  # Start PostgreSQL
pnpm db:push          # Push schema to database
pnpm db:seed          # (Optional) Seed with sample data
```

## Commands

All commands run from the project root.

### Development

```bash
pnpm dev           # Run all apps (web + api)
pnpm dev:web       # Frontend only (http://localhost:5173)
pnpm dev:api       # API only (http://localhost:3000)
```

### Build & Test

```bash
pnpm build         # Build all apps
pnpm build:web     # Build frontend
pnpm build:api     # Build API
pnpm typecheck     # Typecheck all packages
pnpm test          # Run tests
pnpm test:watch    # Watch mode
```

### Formatting & Linting

```bash
pnpm format        # Format all files with Prettier
pnpm format:check  # Check formatting (for CI)
pnpm lint          # Run ESLint
```

### Database

```bash
pnpm db:generate   # Generate migration from schema changes
pnpm db:migrate    # Apply migrations
pnpm db:push       # Push schema directly (dev only)
pnpm db:studio     # Open Drizzle Studio (database GUI)
pnpm db:seed       # Seed with sample data
```

### Docker

```bash
docker compose up -d      # Start PostgreSQL
docker compose down       # Stop PostgreSQL
docker compose down -v    # Reset database (deletes all data)
docker compose logs postgres
```

## Documentation

- [docs/tech-stack.md](./docs/tech-stack.md) - Architecture and tech stack
- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines

## Environment Variables

Already configured in:

- `apps/web/.env` - Frontend configuration
- `apps/api/.env` - Backend configuration

Default database connection:

```
DATABASE_URL=postgresql://fantasy:fantasy_dev_password@localhost:5432/fantasy_platform
```
