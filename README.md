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
│   ├── database/      # Prisma schema (coming in Milestone 2)
│   └── config/        # Shared configuration
└── docs/              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 10.26.0

### Installation

```bash
# Install dependencies
pnpm install
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

## Development Progress

- ✅ **Milestone 1:** Project Scaffolding & Infrastructure Setup
  - Monorepo structure with pnpm workspaces
  - Vite + React + TypeScript frontend with Tailwind CSS
  - Express + TypeScript backend
  - Shared types package
  - Both apps running and communicating

- 🔄 **Next:** Milestone 2 - Database & Prisma Setup

See [plan.md](./plan.md) for the full development roadmap.

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for AI assistance
- [plan.md](./plan.md) - Development plan and milestones
- [docs/](./docs/) - Architecture and design decisions

## Tech Stack

**Frontend:**
- Vite + React + TypeScript
- Tailwind CSS
- shadcn/ui (to be added)
- TanStack Query & Table

**Backend:**
- Express + TypeScript
- PostgreSQL + Prisma (to be added)
- REST API

**Deployment:**
- Railway or Render (planned)

## Environment Variables

Copy `.env.example` files to `.env` in each app:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

## License

ISC
