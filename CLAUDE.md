# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Context

**Always read [README.md](./README.md)** for tech stack, project structure, and commands.

Fantasy football platform for serious redraft leagues that have outgrown ESPN/Yahoo/Sleeper but don't want MFL's terrible UX. The wedge is scoring engine flexibility—position-specific scoring, conditional bonuses, median standings—with data viz that helps owners make better decisions.

**Target:** Commissioners of engaged leagues willing to pay for flexibility. Not casual users, not dynasty (yet).

**Roadmap:**
- Now: Scoring engine for serious redraft
- Soon: Keepers, then IDP
- Later: Full dynasty

## Design Guidelines

**Philosophy:** Data-dense, efficient, professional. Think Linear's polish + Sleeper's utility. Light mode only. Color communicates meaning, not decoration.

**Visual Identity:**

- Light mode with warm gray backgrounds, white cards with borders + subtle shadows
- Semantic colors: green/teal (positive), red/coral (negative/alerts), amber (warnings), gray (neutral/disabled)
- Primary color TBD—avoiding Yahoo's purple. Consider deeper blue or indigo.
- High contrast: cards lift off backgrounds, headers distinct from rows, interactive elements obviously clickable
- Dense layouts—minimize padding, maximize information

**Motion:** Subtle, functional, 150-200ms transitions. Loading skeletons, not spinners. No decorative or bouncy animations.

**Implementation:**

- Design tokens (CSS variables/Mantine theme)—no hardcoded values
- Extend Mantine's theme at theme level, not per-component
- Build reusable primitives; consistency over customization
- When in doubt, leave it out

**Avoid:** Decorative color, playful elements, excessive whitespace, flat low-contrast layouts, one-off styles that should be tokens

## Code Style

- Use `type` over `interface`
- Strict types first—avoid optionals and defaults unless required
- No over-engineering—only build what's needed now
- Keep TODOs in `TODO.md` files (root or relevant sub-dir)

## Development Notes

- Early stage: we can break things freely, no backwards compatibility concerns
- No migrations needed yet—just `pnpm db:push`
- Don't run `pnpm` commands (eg. `dev`, `typecheck`)—ask the user to run these
- **Testing:** Don't write tests unless asked. Can suggest tests conceptually.
- **Ask first:** Before creating files outside existing patterns or major refactors. No need to ask for standard pattern implementations.

## Reference Docs

Files in `working-docs/` are working documents, potentially outdated. Don't read `working-docs/old/` unless explicitly asked.
