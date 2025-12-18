# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Context

**Always read [README.md](./README.md)** for tech stack, project structure, and commands.

This is a fantasy football platform targeting engaged enthusiasts who want more customization than ESPN/Yahoo but simpler than MyFantasyLeague. Linear-inspired UX (clean, fast, professional) with deep scoring flexibility.

## Design Guidelines

**Philosophy:** A serious tool for engaged fantasy players. Data-dense, efficient, and professional—but not cold. Think Linear's information density and polish, with Sleeper's utility-focused clarity. Color communicates meaning, not decoration.

**Visual Identity:**

- **Color palette:** Light mode with warm gray page backgrounds, white cards. Primary color TBD—violet feels too Yahoo. Consider deeper blue, indigo, or something more distinctive. Semantic colors:
  - Green/teal for positive (wins, good scores)
  - Red/coral for negative (injuries, losses, alerts)
  - Amber for warnings (questionable, notable info)
  - Gray for neutral/disabled
- **Color for scannability:** Use color pops to help users quickly parse information—badges, status indicators, key numbers, important callouts. Not decoration, but functional highlighting.
- **Contrast matters:** Cards should clearly lift off the page background. Borders + subtle shadows together. Table headers visually distinct from rows. Interactive elements obviously clickable. If things feel flat, add more contrast.
- **Typography:** Clean and dense. Plus Jakarta Sans for now (can revisit). Tight letter-spacing on headers. Readable at small sizes.
- **Density:** Favor information density. Users want to see their data, not scroll past padding.

**Reference points:** Linear (polish, density, professional) + Sleeper (utility, meaningful color) — light mode, more distinctive than Yahoo's purple aesthetic.

**Motion & Interaction (Framer Motion):**

- Subtle and functional, not flashy
- Quick transitions (150-200ms)
- Hover states for interactive elements
- Loading skeletons for async data
- Avoid: decorative animations, bouncy effects, anything that feels playful

**UX Patterns:**

- Dense data tables with sorting/filtering (Mantine DataTable)
- Loading skeletons, not spinners
- Toast notifications for feedback
- Inline editing where possible
- Drag-and-drop for lineups
- Empty states should be helpful, not clever

**Implementation:**

- **Design tokens first:** Colors, shadows, spacing as CSS variables or Mantine theme tokens. No hardcoded values in components.
- **Reusable components:** Build primitives once (stat displays, player rows, badges). Consistency over customization.
- **Extend Mantine's theme:** Override at theme level, not per-component.
- **Restraint:** When in doubt, leave it out. Every visual element should earn its place.

**Avoid:**

- Decorative color (color should mean something)
- Playful/cartoon-y elements (pastel rainbow badges, accent bars, bouncy animations)
- Excessive whitespace that reduces information density
- Dark mode (not our aesthetic)
- Yahoo's purple aesthetic and visual busyness
- Sleeper's darkness
- Flat, low-contrast layouts (add borders/shadows if things blend together)
- Generic SaaS blandness
- One-off styles that should be tokens or shared components

## Code Style

- Use `type` over `interface`
- Strict types first - avoid optionals and defaults unless required
- No over-engineering - only build what's needed now
- Keep TODOs in `TODO.md` files (root or relevant sub-dir)

## Development Notes

- Early stage: we can break things freely
- No migrations needed yet - just `pnpm db:push`
- No backwards compatibility concerns
- Don't run `pnpm` commands (eg. `dev`, `typecheck`, etc) - ask the user to run these
- All `pnpm` commands should be runnable from the root dir (ie. are not required to be run from a nested dir)

## Reference Docs

Files in `working-docs/` are working documents, potentially outdated. Don't read `working-docs/old/` unless explicitly asked.
