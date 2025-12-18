# Design Spec: Linear-Inspired Fantasy Platform

## Design Philosophy

**Goal**: A clean, modern, data-dense interface that feels polished and professional. Inspired by Linear, Vercel, and Raycast - apps that handle complex information elegantly.

**Core Principles**:

- Compact without feeling cramped
- Data-heavy without overwhelming
- Subtle color accents for status/state
- Smooth micro-interactions
- Professional, not playful

---

## Current State Assessment

### What's Working

- Violet primary color (good starting point)
- Consistent use of `Paper`, `Badge`, `Stack`, `Group`
- `mantine-datatable` for data tables
- Basic responsive grid layouts

### Gaps to Address

- Sidebar: Plain text links, no icons, minimal hierarchy
- Tables: No row actions, limited visual density
- Headers: Missing breadcrumbs, context actions
- No loading skeletons
- Limited use of subtle hover/active states
- Missing iconography throughout

---

## Component Design

### 1. App Layout / Navigation

**Sidebar Structure**:

```
┌─────────────────────┐
│ Logo + App Name     │ ← Compact header (40px)
├─────────────────────┤
│ League Selector     │ ← Dropdown for multi-league
├─────────────────────┤
│ 🏠 Dashboard        │
│ 📊 Standings        │
│ 👥 My Team          │
│ 🔄 Matchups         │
│ 📋 Players          │
│ 💰 Waivers/FA       │ TODO: feature
│ 🔀 Trades           │ TODO: feature
├─────────────────────┤
│ ⚙️ League Settings  │
│ 📐 Scoring          │
├─────────────────────┤
│ User section        │ ← Avatar, name, logout
└─────────────────────┘
```

**Key Changes**:

- Add icons to all nav items (use `@tabler/icons-react`)
- League selector dropdown at top when in league context
- Collapsible sidebar option
- Active state: violet background, white text
- Hover state: subtle gray background
- Header: Remove full-width header, integrate into sidebar or use minimal top bar

**Mantine Components**:

- `AppShell` with `navbar.width: 220`
- `NavLink` with `leftSection` for icons
- `Select` or `Menu` for league selector
- `Divider` to separate nav sections
- `Avatar` for user section

### 2. Page Headers

**Pattern**:

```
┌────────────────────────────────────────────────┐
│ Breadcrumb (dimmed): League > Teams > Team X   │
│ Title: Team Name          [Actions] [Status]   │
│ Subtitle: Owner • Record • Context info        │
└────────────────────────────────────────────────┘
```

**Mantine Components**:

- `Breadcrumbs` with `separator="›"`
- `Group` for title row
- `ActionIcon` for header actions
- `Badge` for status indicators

### 3. Stat Cards

**Current**: Paper with label + large number
**Enhanced**:

```
┌─────────────────┐
│ Label      [i]  │  ← Optional info tooltip
│ 127.5          │  ← Large value
│ +12.3 ↑        │  ← Optional trend/comparison
└─────────────────┘
```

**Styling**:

- Subtle border (`borderColor: 'gray.2'`)
- No heavy shadows
- Compact padding (`p="sm"`)
- Trend colors: green for positive, red for negative

**Mantine Components**:

- `Paper` with `withBorder`
- `Tooltip` for info icons
- `ThemeIcon` for trend indicators

### 4. Data Tables (Player List, Roster)

**Column Types**:

- **Player Cell**: Avatar + Name + Team/Position badge
- **Stat Cell**: Right-aligned numbers, monospace optional
- **Status Cell**: Colored badge (active/injured/bye)
- **Action Cell**: Hover-reveal action icons

**Table Styling**:

```tsx
<DataTable
  withTableBorder
  borderRadius="sm"
  horizontalSpacing="sm"
  verticalSpacing="xs"
  highlightOnHover
  striped={false} // Prefer hover over stripes
  rowStyle={{ cursor: 'pointer' }}
/>
```

**Player Cell Component**:

```
┌────────────────────────────────┐
│ [Av] Player Name      QB • KC │
│      Wk 15 vs LAC (easier)    │ ← Optional matchup
└────────────────────────────────┘
```

### 5. Position Badges

**Color Mapping** (use Mantine colors):

```
QB  → violet
RB  → blue
WR  → green
TE  → orange
K   → gray
DEF → red
```

**Badge Style**:

```tsx
<Badge variant="light" size="sm" radius="sm">
  QB
</Badge>
```

### 6. Status Indicators

**Player Status**:

- Active: no badge (clean default)
- Questionable: yellow badge "Q"
- Doubtful: orange badge "D"
- Out: red badge "O"
- IR: red badge "IR"
- Bye: gray badge "BYE"

**League/Season Status**:

- Setup: gray
- Drafting: blue
- In Progress: green
- Playoffs: violet
- Complete: gray

---

## Page Layouts

### Team Roster Page

```
┌────────────────────────────────────────────────────────────┐
│ Breadcrumb: League Name > Teams                            │
│ Team Name                    [Edit] [Trade] Status: 4-2    │
│ Owner Name • 3rd Place • 892.5 PF                          │
├────────────────────────────────────────────────────────────┤
│ [PF: 892.5] [PA: 756.3] [Wins: 4] [Streak: W2]            │ Stat cards
├────────────────────────────────────────────────────────────┤
│ Starting Lineup                              Projected: 115│
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Slot │ Player          │ Opp    │ Proj  │ Score │ Act │ │
│ │ QB   │ [img] Mahomes   │ vs LAC │ 24.5  │ -     │ ⋮   │ │
│ │ RB1  │ [img] Henry     │ @NYJ   │ 18.2  │ -     │ ⋮   │ │
│ │ ...  │                 │        │       │       │     │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ Bench                                        Projected: 45 │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [img] J. Williams WR │ BYE    │ -     │ -     │ ⋮   │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ TODO: Recent Transactions                                  │
│ TODO: Schedule/Recent Results                              │
└────────────────────────────────────────────────────────────┘
```

### Player List Page

```
┌────────────────────────────────────────────────────────────┐
│ Players                                  [Season: 2024 ▼]  │
│ Browse NFL players                                         │
├────────────────────────────────────────────────────────────┤
│ [Search...          ] [Position ▼] [Team ▼] [Status ▼]    │
├────────────────────────────────────────────────────────────┤
│ │ Player           │ Pos │ Team │ Pts  │ Rank │ Owned │   │
│ │ [img] Mahomes    │ QB  │ KC   │ 312  │ QB1  │ 100%  │   │
│ │ [img] McCaffrey  │ RB  │ SF   │ 287  │ RB1  │ 100%  │   │
│ │ ...              │     │      │      │      │       │   │
├────────────────────────────────────────────────────────────┤
│ Showing 1-25 of 1,247                    [< 1 2 3 4 5 >]  │
├────────────────────────────────────────────────────────────┤
│ TODO: Add/Drop actions                                     │
│ TODO: Comparison mode                                      │
│ TODO: Custom column selection                              │
└────────────────────────────────────────────────────────────┘
```

---

## Theme Configuration

```tsx
// apps/web/src/lib/theme.ts
import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'violet',
  defaultRadius: 'sm',

  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',

  headings: {
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(24), lineHeight: '1.3' },
      h2: { fontSize: rem(20), lineHeight: '1.35' },
      h3: { fontSize: rem(16), lineHeight: '1.4' },
      h4: { fontSize: rem(14), lineHeight: '1.4' },
    },
  },

  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(20),
    xl: rem(24),
  },

  components: {
    Paper: {
      defaultProps: {
        p: 'sm',
        radius: 'sm',
      },
    },
    Badge: {
      defaultProps: {
        variant: 'light',
        radius: 'sm',
      },
    },
    Button: {
      defaultProps: {
        radius: 'sm',
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: rem(6),
        },
      },
    },
  },

  other: {
    // Custom tokens for consistency
    positionColors: {
      QB: 'violet',
      RB: 'blue',
      WR: 'green',
      TE: 'orange',
      K: 'gray',
      DEF: 'red',
    },
    statusColors: {
      active: 'green',
      questionable: 'yellow',
      doubtful: 'orange',
      out: 'red',
      ir: 'red',
      bye: 'gray',
    },
  },
});
```

---

## Historical Year Pattern

URLs include year (`/:leagueSlug/:year/...`) but we don't clutter the UI with year badges for the current season.

**Rules:**

- Year is always in the URL for deep linking
- Current year: No year badge, no special treatment
- Historical year: Show `HistoricalBanner` at top of page with link to current season
- Subtitles may include year only for historical views

**HistoricalBanner Component:**

```tsx
<HistoricalBanner
  year={season}
  currentYearPath={`/${leagueSlug}/${currentYear}/players`}
/>
```

- Returns `null` if year >= current year
- Gray alert with history icon
- Shows "You're viewing the 2023 season" + link to current

---

## Components Created

### Core UI Components (`components/ui/`)

| Component          | Status | Description                                           |
| ------------------ | ------ | ----------------------------------------------------- |
| `PositionBadge`    | Done   | Color-coded position badge (QB=violet, RB=blue, etc.) |
| `StatusBadge`      | Done   | Player injury status (Q, D, O, IR, BYE)               |
| `PlayerCell`       | Done   | Avatar + name + position/team for tables              |
| `StatCard`         | Done   | Stat display with optional trend and info tooltip     |
| `PageHeader`       | Done   | Breadcrumbs + title + badges + actions                |
| `HistoricalBanner` | Done   | Historical year alert banner                          |

### Future Components

| Component         | Description                    |
| ----------------- | ------------------------------ |
| `MatchupCard`     | Head-to-head matchup display   |
| `RosterSlot`      | Draggable roster position      |
| `EmptyState`      | Consistent empty state pattern |
| `LoadingSkeleton` | Skeleton loading states        |

---

## Dependencies Added

```bash
pnpm --filter web add @tabler/icons-react
```

Tabler icons for consistent iconography.

---

## Future Considerations

- **Dark mode**: Structure theme to support light/dark toggle later
- **Keyboard shortcuts**: Consider command palette (cmd+k pattern)
- **Animations**: Use Framer Motion sparingly for page transitions
- **Mobile**: Collapsible sidebar, bottom nav for key actions
