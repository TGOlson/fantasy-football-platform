// ============================================================================
// PLAYER STAT COLUMNS
// ============================================================================
// These define the stat columns that exist in playerWeeklyStats.
// Grouped by category for semantic clarity, but the DB schema is flat.

export type PassingStatColumn =
  | 'passingYards'
  | 'passingTds'
  | 'passingInts'
  | 'completions'
  | 'attempts';

export type RushingStatColumn =
  | 'rushingYards'
  | 'rushingTds'
  | 'rushingAttempts';

export type ReceivingStatColumn =
  | 'receptions'
  | 'receivingYards'
  | 'receivingTds'
  | 'targets';

export type MiscStatColumn = 'fumblesLost' | 'twoPointConversions';

export type PlayerStatColumn =
  | PassingStatColumn
  | RushingStatColumn
  | ReceivingStatColumn
  | MiscStatColumn;

// Type representing a player's weekly stats (flat structure matching DB)
export type PlayerWeeklyStat = {
  [K in PlayerStatColumn]: number | null;
};

// ============================================================================
// CONDITION SYSTEM (for bonuses)
// ============================================================================

export type Condition<TStatColumn extends PlayerStatColumn = PlayerStatColumn> =
  {
    stat: TStatColumn; // Type-safe stat column reference
    operator: '>=' | '>' | '<=' | '<' | '==';
    value: number;
  };

// Category-specific bonus (can only reference stats from that category)
export type CategoryBonus<
  TStatColumn extends PlayerStatColumn = PlayerStatColumn,
> = {
  name?: string; // Optional: "300 Yard Club" (for UI display)
  points: number; // Points to award
  when: Condition<TStatColumn>[];
};

// ============================================================================
// SCORING VALUE (Discriminated Union)
// ============================================================================

export type BaseScoringValue = {
  type: 'base';
  value: number; // e.g., 0.04 per yard
};

export type PositionScoringValue = {
  type: 'position-specific';
  default: number;
  byPosition?: {
    QB?: number;
    RB?: number;
    WR?: number;
    TE?: number;
    K?: number;
    DEF?: number;
  };
};

export type ScoringValue = BaseScoringValue | PositionScoringValue;

// ============================================================================
// FULL SCORING RULES
// ============================================================================

export type ScoringRules = {
  passing: {
    yards: ScoringValue;
    touchdowns: ScoringValue;
    interceptions: ScoringValue;
    completions: ScoringValue;
    bonuses: CategoryBonus<PassingStatColumn>[];
  };
  rushing: {
    yards: ScoringValue;
    touchdowns: ScoringValue;
    attempts: ScoringValue;
    bonuses: CategoryBonus<RushingStatColumn>[];
  };
  receiving: {
    receptions: ScoringValue;
    yards: ScoringValue;
    touchdowns: ScoringValue;
    targets: ScoringValue;
    bonuses: CategoryBonus<ReceivingStatColumn>[];
  };
  misc: {
    fumblesLost: ScoringValue;
    twoPointConversions: ScoringValue;
    bonuses: CategoryBonus<MiscStatColumn>[];
  };
  // Cross-category bonuses that can reference stats from multiple categories
  // e.g., "300 pass yards + 50 rush yards"
  bonuses: CategoryBonus<PlayerStatColumn>[];
};

// TODO: Add support for tiered scoring (e.g., team defense points allowed tiers)
// This would add a new ScoringValue type like:
// type TieredScoringValue = {
//   type: 'tiered';
//   tiers: Array<{ min: number; max: number; points: number }>;
// };
// Useful for defense scoring where points/yards allowed use brackets instead of linear scoring

// ============================================================================
// SCORE BREAKDOWN (for UI transparency)
// ============================================================================

export type ScoreBreakdownItem = {
  category: string; // "Passing Yards", "Rushing TDs", "100 Yard Bonus", etc.
  statValue: number | null; // 287 yards, 2 TDs, etc. (null for bonuses)
  pointValue: number; // 11.48 points, 12 points, etc.
  isBonus?: boolean; // true if this is a bonus point
};

export type ScoreBreakdown = {
  totalPoints: number;
  breakdown: ScoreBreakdownItem[];
};
