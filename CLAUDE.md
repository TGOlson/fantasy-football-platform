# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Custom fantasy football platform with advanced scoring customization. The goal is to combine modern UX (Linear-inspired) with deep customization (MyFantasyLeague-level flexibility) to serve engaged fantasy football enthusiasts willing to pay for better tools.

## Docs

- [README.md](./README.md) gives an overview of the project and useful developer commands
- [docs/tech-stack.md](./docs/tech-stack.md) give an overview of the tech stack and project structure

Important: always read `docs/tech-stack.md` to understand the core components of the system. 

## Design System & UX

### Visual Principles (Linear-Inspired)
- Clean, minimal, professional aesthetic
- Subtle color palette (grays with accent colors)
- Lots of whitespace, no clutter
- Smooth animations and transitions (Framer Motion)
- Information density without overwhelming users

### Key UX Patterns
- Data tables with sorting/filtering for player lists
- Inline editing where possible
- Toast notifications (not alerts)
- Loading skeletons (not spinners)
- Drag-and-drop for lineup management

## Key Principles

1. Start simple, add complexity only when needed
2. MVP in 4-6 months beats perfect in 12 months
3. Build 20% of MFL's features to capture 80% of value
4. Desktop for admin, mobile for everything else
5. Type safety everywhere (TypeScript + Drizzle)
6. Mantime UI components for speed and good defaults
7. Linear-inspired: clean, fast, professional
8. **The scoring engine is your moat** - nail that first

## Additional instructions

- Claude should never try to run services (eg. pmpm dev) or run typecheck commands to verify output
  - Always delegate that work to the user, ask the user to run these commands whenever needed
- Always prefer types (`type Foo = ...`) over interfaces (`interface Foo ...`)
- Keep TODOs in `TODO.md` files (either in project root or located in relevant sub-dir)
- Top level files in [docs/](./docs/) can be useful references, when needed
  - However, files in `/docs/old` can contain outdated data, don't read them unless directly instructed to
- Prefer to not add optional types or default values unless required.
  - We should default to using strict, simple types first, then expand later
- We're in early dev testing, so we can break things as needed
  - We don't need to write migrations, just drop and push updates to the db
  - We don't need backfills to old behavior, we can just break old code/data when building new features
- Prefer skeletons for loading states over spinners
