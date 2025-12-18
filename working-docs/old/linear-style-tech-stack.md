# Building a Linear-Style Fantasy Platform

## Tech Stack & Design System for Fast, Scalable MVP

---

## The Linear Aesthetic: What Makes It Work

**Linear's design principles:**

- ✨ **Obsessive attention to detail** (micro-interactions, transitions)
- ⚡ **Feels fast** (optimistic updates, instant feedback)
- 🎯 **Information density without clutter** (smart use of space, typography)
- 🎨 **Subtle, sophisticated color palette** (grays, purples, blues)
- ⌨️ **Keyboard-first** (shortcuts for everything)
- 📱 **Responsive but desktop-optimized** (power users work on desktop)

**For fantasy football, this translates to:**

- Clean roster/lineup views with lots of data
- Smooth transitions between views
- Instant feedback when setting lineups
- Sophisticated filtering (by position, status, matchup)
- Dark mode support
- Feels premium, worth paying for

---

## The Recommended Tech Stack

### Core Framework

```
Next.js 14+ (App Router)
├── React 18+ with Server Components
├── TypeScript (non-negotiable for data-heavy apps)
├── App Router (better than Pages Router)
└── API Routes for backend
```

**Why:** Next.js gives you SSR, excellent performance, and scales from MVP to production. Linear uses Next.js.

---

### UI & Styling Layer

```
shadcn/ui + Tailwind CSS
├── shadcn/ui (copy-paste components)
├── Radix UI (accessible primitives)
├── Tailwind CSS (utility-first styling)
├── tailwindcss-animate (smooth transitions)
└── class-variance-authority (component variants)
```

**Why this is the secret weapon:**

**shadcn/ui** is NOT a component library you install. Instead:

1. You run CLI commands to copy components into your codebase
2. Components live in your `/components/ui` folder
3. You fully own and can customize every component
4. Built on Radix UI (accessibility + headless components)
5. Styled with Tailwind (easy to customize)

**This gives you:**

- ✅ Linear-quality components out of the box
- ✅ Full control to customize
- ✅ No black box dependencies
- ✅ Amazing DX (developer experience)

**Linear-like components you get immediately:**

- Dropdown menus
- Dialogs/modals
- Command palette (⌘K)
- Select menus with search
- Toast notifications
- Data tables
- Tabs, accordions, popovers
- Form components

---

### Animation & Motion

```
Framer Motion
├── Page transitions
├── Layout animations
├── Micro-interactions
└── Gesture handling
```

**Why:** Linear's polish comes from animations. Framer Motion makes this easy.

**Key animations to implement:**

- ✅ Smooth page transitions
- ✅ Staggered list animations (roster loading)
- ✅ Drag-and-drop for lineup management
- ✅ Hover states and micro-interactions
- ✅ Loading skeletons

---

### Data Tables & Visualization

```
TanStack Table (formerly React Table)
├── Powerful table primitives
├── Sorting, filtering, pagination
├── Virtualization for large datasets
└── Fully controlled by you

+ Recharts (for any charts/graphs)
└── Simple, composable charts
```

**Why:** Fantasy football is data-heavy. You need sophisticated tables. TanStack Table is the gold standard.

**Use cases:**

- Player lists with filters
- Season stats tables
- League standings
- Waiver wire boards

---

### State Management

```
Start simple, scale up:

Phase 1 (MVP): React Server Components + URL state
├── Server components for data fetching
├── URL params for filters/tabs
└── Local state for UI

Phase 2 (Scale): Add Zustand if needed
├── Global app state
├── Minimal boilerplate
└── Only when React state gets messy
```

**Why:** Start without a state library. Server components + URL state covers 80% of needs.

---

### Forms & Validation

```
React Hook Form + Zod
├── React Hook Form (performant forms)
├── Zod (TypeScript-first validation)
└── Works beautifully with shadcn/ui
```

**Why:** Your scoring configuration UI is complex forms. This stack makes it painless.

---

### Database & Backend

```
PostgreSQL + Prisma
├── PostgreSQL (relational data, JSONB for flex)
├── Prisma (type-safe ORM)
└── Runs on Vercel, Railway, or anywhere
```

**Why:** Scoring rules, rosters, leagues are relational data. Postgres + Prisma gives you type safety end-to-end.

---

### Deployment & Hosting

```
Vercel (recommended) or Railway
├── Vercel: Zero-config Next.js deployment
├── Railway: If you need more backend control
└── Both: Great DX, reasonable pricing
```

---

## The Complete Stack at a Glance

| Layer             | Technology                  | Why                                |
| ----------------- | --------------------------- | ---------------------------------- |
| **Framework**     | Next.js 14+ (App Router)    | SSR, performance, scales           |
| **Language**      | TypeScript                  | Type safety for data-heavy app     |
| **UI Components** | shadcn/ui                   | Linear-quality, fully customizable |
| **Primitives**    | Radix UI                    | Accessible, headless components    |
| **Styling**       | Tailwind CSS                | Utility-first, rapid iteration     |
| **Animations**    | Framer Motion               | Smooth, Linear-like polish         |
| **Data Tables**   | TanStack Table              | Powerful, flexible tables          |
| **Forms**         | React Hook Form + Zod       | Clean forms, validation            |
| **State**         | Server Components → Zustand | Start simple, scale up             |
| **Database**      | PostgreSQL + Prisma         | Type-safe, relational              |
| **Deployment**    | Vercel                      | Zero-config, great DX              |

---

## Setup: Getting Started (30 minutes)

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest fantasy-platform \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd fantasy-platform
```

### 2. Install shadcn/ui

```bash
npx shadcn-ui@latest init
```

This creates:

- `components/ui/` folder for components
- `lib/utils.ts` for utilities
- `tailwind.config.js` with proper setup

### 3. Add Core Components

```bash
# Add the components you'll need most
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add command
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
```

Each command copies the component into your project. You now own them.

### 4. Install Additional Dependencies

```bash
npm install framer-motion
npm install @tanstack/react-table
npm install react-hook-form zod @hookform/resolvers
npm install prisma @prisma/client
npm install date-fns  # useful for date formatting
```

### 5. Setup Prisma

```bash
npx prisma init
```

**You're now ready to build.** Total setup time: 30 minutes.

---

## Design System Architecture

### Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   ├── (dashboard)/              # Main app routes
│   │   ├── leagues/
│   │   │   └── [id]/
│   │   │       ├── roster/
│   │   │       ├── matchup/
│   │   │       └── scoring/
│   │   └── layout.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components (owned by you)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── fantasy/                  # Your domain components
│   │   ├── player-card.tsx
│   │   ├── lineup-slot.tsx
│   │   ├── scoring-rule-builder.tsx
│   │   └── matchup-view.tsx
│   └── layouts/
│       ├── sidebar.tsx
│       └── navbar.tsx
├── lib/
│   ├── utils.ts                  # Utility functions
│   ├── api.ts                    # API client
│   └── scoring-engine.ts         # Scoring logic
└── styles/
    └── globals.css               # Global styles + Tailwind
```

---

## Design Tokens: Linear-Inspired Palette

### Tailwind Config Customization

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Linear-inspired palette
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Fantasy-specific colors
        win: 'hsl(142, 76%, 36%)',
        loss: 'hsl(0, 84%, 60%)',
        roster: {
          qb: 'hsl(262, 83%, 58%)',
          rb: 'hsl(142, 71%, 45%)',
          wr: 'hsl(199, 89%, 48%)',
          te: 'hsl(41, 96%, 56%)',
          k: 'hsl(330, 81%, 60%)',
          def: 'hsl(24, 95%, 53%)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### CSS Variables (`globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings:
      'rlig' 1,
      'calt' 1;
  }
}
```

---

## Component Examples: Linear-Style

### 1. Player Card Component

```tsx
// components/fantasy/player-card.tsx
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  player: {
    name: string;
    position: string;
    team: string;
    status: 'active' | 'injured' | 'bye';
    points: number;
  };
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Position badge */}
            <Badge
              variant="outline"
              className="bg-roster-qb/10 text-roster-qb border-roster-qb/20"
            >
              {player.position}
            </Badge>

            {/* Player info */}
            <div>
              <p className="font-medium">{player.name}</p>
              <p className="text-sm text-muted-foreground">{player.team}</p>
            </div>
          </div>

          {/* Points */}
          <div className="text-right">
            <p className="text-2xl font-semibold">{player.points}</p>
            <p className="text-xs text-muted-foreground">pts</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
```

### 2. Command Palette (⌘K)

```tsx
// components/fantasy/command-palette.tsx
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useEffect, useState } from 'react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search players, leagues, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem>Set Lineup</CommandItem>
          <CommandItem>View Waivers</CommandItem>
          <CommandItem>Check Scores</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Players">
          <CommandItem>Justin Jefferson</CommandItem>
          <CommandItem>Christian McCaffrey</CommandItem>
          <CommandItem>Patrick Mahomes</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

### 3. Data Table with Filters

```tsx
// components/fantasy/player-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function PlayerTable({ players }) {
  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex gap-2">
        <Input placeholder="Search players..." className="max-w-xs" />
        <Badge variant="outline">QB</Badge>
        <Badge variant="outline">RB</Badge>
        <Badge variant="outline">WR</Badge>
        <Badge variant="outline">TE</Badge>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{player.position}</Badge>
                </TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell className="text-right">{player.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

## Design System Best Practices

### 1. Component Variants (CVA)

shadcn/ui uses `class-variance-authority` for variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

**Use this pattern for all your fantasy components.**

### 2. Typography System

```tsx
// components/ui/typography.tsx
export function H1({ children, className, ...props }) {
  return (
    <h1
      className={cn('text-4xl font-bold tracking-tight', className)}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className, ...props }) {
  return (
    <h2
      className={cn('text-3xl font-semibold tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

// Use throughout app for consistency
```

### 3. Animation Patterns

```tsx
// lib/animations.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 }
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
}

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

// Use consistently across components
<motion.div {...fadeIn}>
  <PlayerCard />
</motion.div>
```

---

## The "Linear Feel" Checklist

### ✅ Visual Polish

- [ ] Consistent spacing (use Tailwind's spacing scale)
- [ ] Subtle borders and shadows
- [ ] Proper contrast ratios (WCAG AA)
- [ ] Dark mode support
- [ ] Hover states on interactive elements
- [ ] Focus states (keyboard navigation)

### ✅ Motion & Animation

- [ ] Page transitions (Framer Motion)
- [ ] Loading skeletons (not spinners)
- [ ] Staggered list animations
- [ ] Smooth state changes
- [ ] Optimistic UI updates

### ✅ Interaction Patterns

- [ ] Command palette (⌘K)
- [ ] Keyboard shortcuts
- [ ] Inline editing
- [ ] Drag and drop (lineup management)
- [ ] Toast notifications (not alerts)

### ✅ Information Architecture

- [ ] Clear visual hierarchy
- [ ] Scannable data tables
- [ ] Smart defaults (pre-filled forms)
- [ ] Contextual actions (hover menus)
- [ ] Breadcrumbs for navigation

### ✅ Performance

- [ ] Sub-2-second page loads
- [ ] Instant client-side navigation
- [ ] Optimistic updates
- [ ] Loading states that don't flash
- [ ] Image optimization (next/image)

---

## Development Workflow

### Phase 1: Design System Foundation (Week 1)

1. Setup Next.js + shadcn/ui
2. Configure Tailwind with custom palette
3. Build core layout components (sidebar, navbar)
4. Setup dark mode toggle
5. Create typography system
6. Test responsive breakpoints

### Phase 2: Core Components (Week 2-3)

1. Player card component
2. Lineup slot component
3. Data table with sorting/filtering
4. Command palette
5. Forms (scoring configuration)
6. Toast notifications

### Phase 3: Pages & Features (Week 4-8)

1. League dashboard
2. Roster management
3. Matchup view
4. Live scoring
5. Waiver wire
6. Settings pages

### Phase 4: Polish (Week 9-12)

1. Animations and transitions
2. Loading states
3. Error handling
4. Keyboard shortcuts
5. Performance optimization
6. Mobile responsiveness

---

## Why This Stack Wins

### Speed to MVP

- **shadcn/ui:** Linear-quality components in minutes, not weeks
- **Tailwind:** Rapid iteration without CSS files
- **Next.js:** Full-stack in one framework

### Scalability

- **You own the components:** No vendor lock-in
- **Type safety:** TypeScript + Prisma catch errors early
- **Design tokens:** Easy to rebrand or adjust

### DX (Developer Experience)

- **Hot reload:** See changes instantly
- **Type checking:** Catch bugs before runtime
- **Component library:** Don't rebuild from scratch

### Maintainability

- **Single codebase:** No separate mobile apps
- **Clear patterns:** shadcn/ui establishes conventions
- **Great docs:** Everything is well-documented

---

## Resources to Study

### Linear-Inspired Examples

- **shadcn/ui docs:** https://ui.shadcn.com/ (study the examples)
- **Taxonomy:** https://tx.shadcn.com/ (Next.js + shadcn starter)
- **Lucide Icons:** https://lucide.dev/ (Linear uses these)

### Inspiration Sites

- **Linear.app** (obviously)
- **Height.app** (similar aesthetic)
- **Raycast.com** (clean, fast, keyboard-first)
- **Vercel Dashboard** (shadcn/ui user)

### Learn by Cloning

Build these mini-projects to master the stack:

1. **Command palette** (⌘K search)
2. **Data table with filters** (player list)
3. **Form with validation** (scoring config)
4. **Drag-and-drop** (lineup management)

---

## Final Tips

### Don't Overthink It

- Start with shadcn/ui defaults
- Customize gradually as you understand your needs
- Linear took years to get this polished - your MVP doesn't need to be perfect

### Focus on Micro-Interactions

- Hover states
- Loading indicators
- Success/error feedback
- Keyboard shortcuts

**These small details create the "feels fast, feels premium" impression.**

### Use What Linear Uses

- **Inter font** (or similar - SF Pro, -apple-system)
- **Subtle shadows** (not heavy drop shadows)
- **Muted color palette** (grays with accent colors)
- **Lots of whitespace** (don't cram UI)

---

## The Bottom Line

**This stack gets you 90% of Linear's aesthetic in 10% of the time:**

1. **Next.js + TypeScript** → Foundation
2. **shadcn/ui + Radix** → Beautiful, accessible components
3. **Tailwind CSS** → Rapid styling without CSS files
4. **Framer Motion** → Smooth animations
5. **TanStack Table** → Powerful data tables

**Setup time:** 30 minutes
**Time to first polished page:** 1-2 days
**Time to full MVP:** 4-6 weeks

You'll spend more time on business logic (scoring engine, roster management) than UI polish, which is exactly where you should be spending time.

Start with shadcn/ui, follow their patterns, and you'll have a Linear-feeling app before you know it.
