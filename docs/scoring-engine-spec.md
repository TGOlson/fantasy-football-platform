# Scoring Engine Specification

**Goal:** Build a flexible scoring engine that can calculate fantasy points from NFL player stats using configurable rules.

**Scope:** Design the schema to support all advanced features (position-specific PPR, bonuses, conditionals) from day one to avoid future migrations. Implement core features first, then add advanced features progressively.

---

## JSON Schema for Scoring Rules

### Full Structure (Supporting All Features)

```typescript
type Bonus = {
  threshold: number;        // Stat threshold (e.g., 100 for "100 yards")
  points: number;           // Bonus points awarded (e.g., 3)
  statType: 'yards' | 'touchdowns' | 'receptions' | 'attempts' | 'completions';
};

type ConditionalScoring = {
  points: number;           // Points to award
  condition: {
    stat: string;           // Stat to check (e.g., "attempts")
    operator: '>=' | '>' | '<=' | '<' | '=';
    value: number;          // Threshold value (e.g., 20)
  };
  appliesTo?: string;       // Optional: which stat this modifies (e.g., "completionPercentage")
};

type ScoringRules = {
  passing?: {
    yards?: number;         // Points per yard (e.g., 0.04 = 1pt per 25 yards)
    touchdowns?: number;    // Points per TD (e.g., 4)
    interceptions?: number; // Points per INT (e.g., -2)
    completions?: number;   // Points per completion (e.g., 0)
    bonuses?: Bonus[];      // Milestone bonuses (e.g., 300 yards = +3 pts)
    conditionalScoring?: ConditionalScoring[]; // e.g., completion % bonus if attempts >= 20
  };
  rushing?: {
    yards?: number;         // Points per yard (e.g., 0.1 = 1pt per 10 yards)
    touchdowns?: number;    // Points per TD (e.g., 6)
    attempts?: number;      // Points per attempt (rare)
    bonuses?: Bonus[];      // e.g., 100 yards = +3 pts, 150 yards = +5 pts
  };
  receiving?: {
    // Position-specific PPR support
    receptions?: {
      default?: number;     // Default PPR (e.g., 0.5 for half PPR)
      byPosition?: {        // Override for specific positions
        QB?: number;        // QBs rarely catch, but just in case
        RB?: number;        // e.g., 0.5 for RBs
        WR?: number;        // e.g., 1.0 for WRs
        TE?: number;        // e.g., 1.5 for TE Premium
      };
    } | number;             // Can also be simple number for uniform PPR
    yards?: number;         // Points per yard (e.g., 0.1)
    touchdowns?: number;    // Points per TD (e.g., 6)
    targets?: number;       // Points per target (rare)
    bonuses?: Bonus[];      // e.g., 100 yards = +3 pts
  };
  fumbles?: {
    lost?: number;          // Points per fumble lost (e.g., -2)
  };
  twoPointConversions?: number; // Points per 2PT conversion (e.g., 2)
};
```

### Example: Standard Scoring (Simple)

```json
{
  "passing": {
    "yards": 0.04,
    "touchdowns": 4,
    "interceptions": -2
  },
  "rushing": {
    "yards": 0.1,
    "touchdowns": 6
  },
  "receiving": {
    "receptions": 0,
    "yards": 0.1,
    "touchdowns": 6
  },
  "fumbles": {
    "lost": -2
  },
  "twoPointConversions": 2
}
```

### Example: TE Premium with Bonuses

```json
{
  "passing": {
    "yards": 0.04,
    "touchdowns": 4,
    "interceptions": -2,
    "bonuses": [
      { "threshold": 300, "points": 3, "statType": "yards" },
      { "threshold": 400, "points": 5, "statType": "yards" }
    ]
  },
  "rushing": {
    "yards": 0.1,
    "touchdowns": 6,
    "bonuses": [
      { "threshold": 100, "points": 3, "statType": "yards" },
      { "threshold": 200, "points": 5, "statType": "yards" }
    ]
  },
  "receiving": {
    "receptions": {
      "default": 0.5,
      "byPosition": {
        "TE": 1.5,
        "RB": 0.5,
        "WR": 1.0
      }
    },
    "yards": 0.1,
    "touchdowns": 6,
    "bonuses": [
      { "threshold": 100, "points": 3, "statType": "yards" }
    ]
  },
  "fumbles": {
    "lost": -2
  },
  "twoPointConversions": 2
}
```

### Example: With Conditional Scoring

```json
{
  "passing": {
    "yards": 0.04,
    "touchdowns": 4,
    "interceptions": -2,
    "conditionalScoring": [
      {
        "points": 5,
        "condition": {
          "stat": "attempts",
          "operator": ">=",
          "value": 20
        },
        "appliesTo": "completionPercentage"
      }
    ]
  },
  "rushing": {
    "yards": 0.1,
    "touchdowns": 6
  },
  "receiving": {
    "receptions": 1.0,
    "yards": 0.1,
    "touchdowns": 6
  },
  "fumbles": {
    "lost": -2
  }
}
```

---

## Scoring Calculation Logic

### Input: Player Weekly Stats + Position

From `player_weekly_stats` table + player position:
```typescript
type PlayerWeeklyStat = {
  passingYards: number | null;
  passingTds: number | null;
  passingInts: number | null;
  completions: number | null;
  attempts: number | null;
  rushingYards: number | null;
  rushingTds: number | null;
  rushingAttempts: number | null;
  receptions: number | null;
  receivingYards: number | null;
  receivingTds: number | null;
  targets: number | null;
  fumblesLost: number | null;
  twoPointConversions: number | null;
};

type PlayerPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
```

### Calculation Function (Full Implementation)

```typescript
function calculateScore(
  stats: PlayerWeeklyStat,
  position: PlayerPosition,
  rules: ScoringRules
): number {
  let totalPoints = 0;

  // PASSING
  if (rules.passing) {
    totalPoints += (stats.passingYards || 0) * (rules.passing.yards || 0);
    totalPoints += (stats.passingTds || 0) * (rules.passing.touchdowns || 0);
    totalPoints += (stats.passingInts || 0) * (rules.passing.interceptions || 0);
    totalPoints += (stats.completions || 0) * (rules.passing.completions || 0);

    // Passing bonuses (e.g., 300 yards = +3 pts)
    if (rules.passing.bonuses) {
      for (const bonus of rules.passing.bonuses) {
        const statValue = getStatValue(stats, 'passing', bonus.statType);
        if (statValue >= bonus.threshold) {
          totalPoints += bonus.points;
        }
      }
    }

    // Conditional scoring (e.g., completion % bonus if attempts >= 20)
    if (rules.passing.conditionalScoring) {
      for (const conditional of rules.passing.conditionalScoring) {
        if (evaluateCondition(stats, conditional.condition)) {
          totalPoints += conditional.points;
        }
      }
    }
  }

  // RUSHING
  if (rules.rushing) {
    totalPoints += (stats.rushingYards || 0) * (rules.rushing.yards || 0);
    totalPoints += (stats.rushingTds || 0) * (rules.rushing.touchdowns || 0);
    totalPoints += (stats.rushingAttempts || 0) * (rules.rushing.attempts || 0);

    // Rushing bonuses (e.g., 100 yards = +3 pts)
    if (rules.rushing.bonuses) {
      for (const bonus of rules.rushing.bonuses) {
        const statValue = getStatValue(stats, 'rushing', bonus.statType);
        if (statValue >= bonus.threshold) {
          totalPoints += bonus.points;
        }
      }
    }
  }

  // RECEIVING (Position-specific PPR)
  if (rules.receiving) {
    // Handle position-specific PPR
    let pprValue = 0;
    if (typeof rules.receiving.receptions === 'number') {
      pprValue = rules.receiving.receptions;
    } else if (rules.receiving.receptions) {
      pprValue = rules.receiving.receptions.byPosition?.[position]
                 ?? rules.receiving.receptions.default
                 ?? 0;
    }
    totalPoints += (stats.receptions || 0) * pprValue;

    totalPoints += (stats.receivingYards || 0) * (rules.receiving.yards || 0);
    totalPoints += (stats.receivingTds || 0) * (rules.receiving.touchdowns || 0);
    totalPoints += (stats.targets || 0) * (rules.receiving.targets || 0);

    // Receiving bonuses
    if (rules.receiving.bonuses) {
      for (const bonus of rules.receiving.bonuses) {
        const statValue = getStatValue(stats, 'receiving', bonus.statType);
        if (statValue >= bonus.threshold) {
          totalPoints += bonus.points;
        }
      }
    }
  }

  // FUMBLES
  if (rules.fumbles) {
    totalPoints += (stats.fumblesLost || 0) * (rules.fumbles.lost || 0);
  }

  // TWO-POINT CONVERSIONS
  totalPoints += (stats.twoPointConversions || 0) * (rules.twoPointConversions || 0);

  return Math.round(totalPoints * 100) / 100; // Round to 2 decimal places
}

// Helper: Get stat value for bonus calculation
function getStatValue(
  stats: PlayerWeeklyStat,
  category: 'passing' | 'rushing' | 'receiving',
  statType: string
): number {
  const map: Record<string, number> = {
    'passing.yards': stats.passingYards || 0,
    'passing.touchdowns': stats.passingTds || 0,
    'passing.completions': stats.completions || 0,
    'passing.attempts': stats.attempts || 0,
    'rushing.yards': stats.rushingYards || 0,
    'rushing.touchdowns': stats.rushingTds || 0,
    'rushing.attempts': stats.rushingAttempts || 0,
    'receiving.yards': stats.receivingYards || 0,
    'receiving.touchdowns': stats.receivingTds || 0,
    'receiving.receptions': stats.receptions || 0,
  };
  return map[`${category}.${statType}`] || 0;
}

// Helper: Evaluate conditional
function evaluateCondition(
  stats: PlayerWeeklyStat,
  condition: { stat: string; operator: string; value: number }
): boolean {
  const statValue = (stats as any)[condition.stat] || 0;

  switch (condition.operator) {
    case '>=': return statValue >= condition.value;
    case '>': return statValue > condition.value;
    case '<=': return statValue <= condition.value;
    case '<': return statValue < condition.value;
    case '=': return statValue === condition.value;
    default: return false;
  }
}
```

### Score Breakdown (for UI transparency)

Return detailed breakdown showing how points were earned, including bonuses:

```typescript
type ScoreBreakdown = {
  totalPoints: number;
  breakdown: Array<{
    category: string;      // "Passing Yards", "Rushing TDs", "100 Yard Bonus", etc.
    statValue: number | null;     // 287 yards, 2 TDs, etc. (null for bonuses)
    pointValue: number;    // 11.48 points, 12 points, etc.
    isBonus?: boolean;     // true if this is a bonus/conditional point
  }>;
};
```

Example (with bonuses):
```json
{
  "totalPoints": 29.48,
  "breakdown": [
    { "category": "Passing Yards", "statValue": 324, "pointValue": 12.96 },
    { "category": "Passing TDs", "statValue": 2, "pointValue": 8 },
    { "category": "300 Yard Bonus", "statValue": null, "pointValue": 3, "isBonus": true },
    { "category": "Passing INTs", "statValue": 1, "pointValue": -2 },
    { "category": "Rushing Yards", "statValue": 45, "pointValue": 4.5 },
    { "category": "Rushing TDs", "statValue": 0, "pointValue": 0 },
    { "category": "Fumbles Lost", "statValue": 1, "pointValue": -2 }
  ]
}
```

Example (TE Premium):
```json
{
  "totalPoints": 20.7,
  "breakdown": [
    { "category": "Receptions (TE Premium)", "statValue": 8, "pointValue": 12 },
    { "category": "Receiving Yards", "statValue": 87, "pointValue": 8.7 },
    { "category": "Receiving TDs", "statValue": 0, "pointValue": 0 }
  ]
}
```

---

## API Endpoints

### Get League Scoring Rules
```
GET /trpc/leagues.getScoringRules
Input: { leagueSeasonId: string }
Output: ScoringRules
```

### Update League Scoring Rules
```
POST /trpc/leagues.updateScoringRules
Input: { leagueSeasonId: string, rules: ScoringRules }
Output: ScoringRules
```

### Calculate Player Score
```
GET /trpc/scoring.calculatePlayerScore
Input: { playerId: string, weekNumber: number, season: number, leagueSeasonId: string }
Output: ScoreBreakdown
```

### Calculate Team Score for Week
```
GET /trpc/scoring.calculateTeamScore
Input: { teamSeasonId: string, weekNumber: number }
Output: {
  totalPoints: number;
  players: Array<{
    playerId: string;
    playerName: string;
    position: string;
    slotType: string; // QB, RB, FLEX, BENCH, etc.
    score: number;
  }>;
}
```

---

## MVP UI

### 1. Scoring Settings Page
**Route:** `/leagues/:leagueId/settings/scoring`

#### Phase 1: Basic Settings Form
Simple form with number inputs for basic scoring:

```
[Preset Templates ▼]  Standard ○ Half PPR ○ Full PPR ○ TE Premium ○ Custom

═══ Passing ═══
  Yards per point: [0.04] (1 point per 25 yards)
  Touchdown: [4] points
  Interception: [-2] points
  Completion: [0] points

═══ Rushing ═══
  Yards per point: [0.1] (1 point per 10 yards)
  Touchdown: [6] points

═══ Receiving ═══
  PPR Mode: ○ Simple  ● Position-Specific

  Position-Specific PPR:
    QB: [0] points    RB: [0.5] points
    WR: [1.0] points  TE: [1.5] points

  Yards per point: [0.1] (1 point per 10 yards)
  Touchdown: [6] points

═══ Other ═══
  Fumble Lost: [-2] points
  Two-Point Conversion: [2] points

[▼ Advanced: Bonuses & Conditionals]

[Cancel]  [Save Changes]
```

#### Phase 2: Advanced Settings (Collapsible)
When "Advanced: Bonuses & Conditionals" is expanded:

```
═══ Passing Bonuses ═══
  ☑ 300 yards → [3] bonus points
  ☑ 400 yards → [5] bonus points
  ☐ 5 TDs → [  ] bonus points
  [+ Add Custom Bonus]

═══ Rushing Bonuses ═══
  ☑ 100 yards → [3] bonus points
  ☑ 150 yards → [5] bonus points
  [+ Add Custom Bonus]

═══ Receiving Bonuses ═══
  ☑ 100 yards → [3] bonus points
  [+ Add Custom Bonus]

═══ Conditional Scoring ═══
  ☐ Completion % bonus (min 20 attempts) → [  ] points
  [+ Add Custom Conditional]
```

**Preset Templates:**
- Standard (no PPR, no bonuses)
- Half PPR (0.5 PPR uniform)
- Full PPR (1.0 PPR uniform)
- TE Premium (position-specific: TE=1.5, WR=1.0, RB=0.5)
- Custom (user-modified)

### 2. Score Preview Component
Show example scores for well-known performances (updates live as settings change):

```
Preview: How would these performances score?

Patrick Mahomes - Week 1, 2024
  291 pass yds     → 11.64 pts
  2 pass TDs       → 8.00 pts
  0 INTs           → 0.00 pts
  1 rush TD        → 6.00 pts
  ─────────────────────────────
  Total: 25.64 points

Christian McCaffrey - Week 1, 2024
  152 rush yds     → 15.20 pts
  🎁 100 yard bonus → 3.00 pts
  2 rush TDs       → 12.00 pts
  4 rec (RB 0.5)   → 2.00 pts
  39 rec yds       → 3.90 pts
  ─────────────────────────────
  Total: 36.10 points

Travis Kelce - Week 5, 2024 (TE Premium)
  9 rec (TE 1.5)   → 13.50 pts
  124 rec yds      → 12.40 pts
  🎁 100 yard bonus → 3.00 pts
  1 rec TD         → 6.00 pts
  ─────────────────────────────
  Total: 34.90 points
```

### 3. Player Card Score Display
On player detail pages, show score breakdown with bonuses highlighted:

```
Patrick Mahomes - Week 5, 2024: 31.32 points

Passing:     337 yards        13.48 pts
             🎁 300 yd bonus    3.00 pts
             2 TDs              8.00 pts
             1 INT             -2.00 pts
Rushing:     34 yards          3.40 pts
             1 TD               6.00 pts
Fumbles:     1 lost           -2.00 pts
─────────────────────────────────────────
Total:                        31.32 pts
```

---

## Testing Strategy

### Unit Tests
Test the core calculation function with known inputs/outputs:

```typescript
describe('calculateScore', () => {
  it('calculates standard QB performance correctly', () => {
    const stats = {
      passingYards: 300,
      passingTds: 2,
      passingInts: 1,
      rushingYards: 20,
      rushingTds: 0,
    };

    const rules = STANDARD_SCORING;
    const score = calculateScore(stats, 'QB', rules);

    expect(score).toBe(22); // 12 + 8 - 2 + 2 = 20
  });

  it('calculates position-specific PPR correctly', () => {
    const stats = {
      receptions: 8,
      receivingYards: 120,
      receivingTds: 1,
    };

    const rules = TE_PREMIUM_SCORING;

    // TE should get 1.5 PPR
    const teScore = calculateScore(stats, 'TE', rules);
    expect(teScore).toBe(30); // (8 * 1.5) + 12 + 6 = 30

    // WR should get 1.0 PPR
    const wrScore = calculateScore(stats, 'WR', rules);
    expect(wrScore).toBe(26); // (8 * 1.0) + 12 + 6 = 26
  });

  it('applies milestone bonuses correctly', () => {
    const stats = {
      rushingYards: 152,
      rushingTds: 2,
    };

    const rules = {
      rushing: {
        yards: 0.1,
        touchdowns: 6,
        bonuses: [
          { threshold: 100, points: 3, statType: 'yards' },
          { threshold: 150, points: 5, statType: 'yards' },
        ],
      },
    };

    const score = calculateScore(stats, 'RB', rules);
    expect(score).toBe(35.2); // 15.2 + 12 + 3 + 5 = 35.2
  });

  it('applies conditional scoring correctly', () => {
    const stats = {
      attempts: 25,
      completions: 20,
      passingYards: 250,
      passingTds: 2,
    };

    const rules = {
      passing: {
        yards: 0.04,
        touchdowns: 4,
        conditionalScoring: [
          {
            points: 5,
            condition: { stat: 'attempts', operator: '>=', value: 20 },
          },
        ],
      },
    };

    const score = calculateScore(stats, 'QB', rules);
    expect(score).toBe(23); // 10 + 8 + 5 = 23
  });

  it('handles null values gracefully', () => {
    const stats = {
      passingYards: 250,
      passingTds: null,
      passingInts: null,
    };

    const rules = STANDARD_SCORING;
    const score = calculateScore(stats, 'QB', rules);

    expect(score).toBe(10); // 250 * 0.04 = 10
  });
});
```

### Integration Tests
- Fetch player stats from DB, apply league rules, verify total
- Calculate team score for a week with multiple players at different positions
- Update league scoring rules, recalculate scores, verify changes
- Test that TE Premium leagues calculate TE scores differently than WR/RB
- Test bonus thresholds at boundaries (99 yards = no bonus, 100 yards = bonus)

---

## Implementation Order

### Phase 1: Foundation (Core Scoring)
1. **Define Types** - Update `ScoringRulesJson` type in `packages/database/src/schema.ts` with full structure
2. **Scoring Service** - Implement `apps/api/src/services/scoring-engine.ts`
   - Core calculation function
   - Helper functions for bonuses and conditionals
   - Score breakdown generation
3. **Write Tests** - Comprehensive test suite
   - Basic scoring (passing, rushing, receiving)
   - Position-specific PPR
   - Milestone bonuses
   - Conditional scoring
   - Edge cases (nulls, thresholds)

### Phase 2: API & Data
4. **API Endpoints** - Add scoring router to tRPC
   - `scoring.calculatePlayerScore` - Get breakdown for single player
   - `scoring.calculateTeamScore` - Get team total for a week
   - `leagues.getScoringRules` - Fetch league scoring config
   - `leagues.updateScoringRules` - Update league scoring config
5. **Preset Templates** - Define standard templates as constants
   - Standard, Half PPR, Full PPR, TE Premium

### Phase 3: UI (Basic Settings)
6. **Settings Page - Basic** - `/leagues/:leagueId/settings/scoring`
   - Number inputs for all base scoring values
   - PPR mode toggle (Simple vs Position-Specific)
   - Position-specific PPR inputs
   - Preset template selector
   - Save functionality

### Phase 4: UI (Advanced Features)
7. **Settings Page - Advanced** - Collapsible bonus/conditional section
   - Checkbox controls for common bonuses
   - Custom bonus builder
   - Conditional scoring builder
8. **Score Preview Component** - Live preview with example players
9. **Player Card Integration** - Score breakdown on player detail pages

### Phase 5: Polish
10. **Visual Enhancements** - Bonus indicators (🎁), formatting, tooltips
11. **Validation** - Ensure rules make sense (no negative bonuses, valid thresholds)
12. **Documentation** - Help text explaining each setting

---

## Notes

- **Backward Compatibility**: Simple PPR (single number) is supported for backward compatibility, but new leagues default to position-specific structure with uniform values
- **JSON Storage**: All rules stored in `league_settings.scoring_rules` JSONB column
- **Calculation Performance**: Calculation is O(n) where n = number of bonuses + conditionals (typically < 20)
- **Future Additions**: Schema supports adding new stat categories (kicking, defense) without migration
