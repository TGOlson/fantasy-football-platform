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

### Database & API

**Prisma queries:**

- Use `prisma.table.findUnique()` or `findUniqueOrThrow()` for single records by unique field
- Use `prisma.table.findFirst()` for single records by any criteria
- Use `prisma.table.findMany()` with `include` or `select` for relations
- Prisma handles relations automatically - use `include` to eagerly load

**GraphQL schema (Pothos):**

- Define types in `apps/api/src/graphql/schema/`
- Use `builder.prismaObject()` for Prisma models
- Use `t.relation()` for Prisma relations (Pothos handles queries automatically)
- Use `t.prismaField()` for custom resolvers
- Auth via `authScopes` option on fields/queries

**GraphQL queries (Client):**

- Write queries in `.graphql.ts` files using `graphql()` template tag
- Run `pnpm codegen` to generate typed hooks
- Import generated documents from `@/gql`

## Development Notes

- Early stage: we can break things freely, no backwards compatibility concerns
- No migrations needed yet—just `pnpm db:push`
- After schema changes: run `pnpm db:generate` to update Prisma Client
- After GraphQL schema changes: run `pnpm codegen` to update typed hooks
- Don't run `pnpm` commands (eg. `dev`, `typecheck`)—ask the user to run these
- **Testing:** Don't write tests unless asked. Can suggest tests conceptually.
- **Ask first:** Before creating files outside existing patterns or major refactors. No need to ask for standard pattern implementations.
- Use react-hook-form for form state, don't manage form state manually

## Code Organization

- **No re-exports.** Import from source files directly (e.g., `@fantasy-platform/types/player`). Use wildcard package exports so paths stay clean.
- **Feature isolation.** Prefer adding new files over spreading changes across many files. If a feature requires changing 3+ files or core abstractions, discuss options first.
- **Propose alternatives.** Product features and UX patterns are open to discussion—suggest better approaches when you see them.

## Reference Docs

Files in `working-docs/` are working documents, potentially outdated. Don't read `working-docs/old/` unless explicitly asked.
