// ============================================================================
// CONDITION SYSTEM (for bonuses)
// ============================================================================

export type Condition = {
  stat: string; // "passingYards", "passingTds", "receptions", etc.
  operator: '>=' | '>' | '<=' | '<' | '==';
  value: number;
};

export type ConditionGroup = {
  operator: 'AND';
  conditions: Condition[];
};

export type Bonus = {
  name?: string; // Optional: "300 Yard Club" (for UI display)
  points: number; // Points to award
  when: Condition | ConditionGroup;
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
  passing?: {
    yards?: ScoringValue;
    touchdowns?: ScoringValue;
    interceptions?: ScoringValue;
    completions?: ScoringValue;
    bonuses?: Bonus[];
  };
  rushing?: {
    yards?: ScoringValue;
    touchdowns?: ScoringValue;
    attempts?: ScoringValue;
    bonuses?: Bonus[];
  };
  receiving?: {
    receptions?: ScoringValue;
    yards?: ScoringValue;
    touchdowns?: ScoringValue;
    targets?: ScoringValue;
    bonuses?: Bonus[];
  };
  fumbles?: {
    lost?: ScoringValue;
  };
  twoPointConversions?: ScoringValue;
};

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
