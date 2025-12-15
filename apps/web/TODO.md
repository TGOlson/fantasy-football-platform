# Web App TODOs

## Install Dependencies

All dependencies are already in package.json. Just run from the project root:

```bash
pnpm install
```

## Optional: Add shadcn/ui Components

To add pre-built components from shadcn/ui:

```bash
# Navigate to apps/web first
cd apps/web

# Then add components as needed
pnpx shadcn@latest add button
pnpx shadcn@latest add card
pnpx shadcn@latest add input
pnpx shadcn@latest add label
pnpx shadcn@latest add form
pnpx shadcn@latest add toast
pnpx shadcn@latest add dialog
pnpx shadcn@latest add table
```

## Completed

- ✅ tRPC client setup with TanStack Query
- ✅ shadcn/ui initialization with Linear-inspired design tokens
- ✅ Path aliases (@/* imports) configured

## In Progress

- 🔄 React Router setup
- 🔄 Auth context and JWT management
- 🔄 Layout components
- 🔄 Auth pages

## Future Tasks

- Add dark mode toggle
- Build player browsing UI
- Build league management UI
- Add toast notifications
- Implement command palette (⌘K)
