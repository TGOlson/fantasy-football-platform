import type { ScoringRules } from '@fantasy-platform/types/scoring';

// ============================================================================
// PRESET SCORING TEMPLATES
// ============================================================================

export const STANDARD_SCORING: ScoringRules = {
  passing: {
    yards: { type: 'base', value: 0.04 }, // 1 point per 25 yards
    touchdowns: { type: 'base', value: 4 },
    interceptions: { type: 'base', value: -2 },
    completions: { type: 'base', value: 0 },
    bonuses: [],
  },
  rushing: {
    yards: { type: 'base', value: 0.1 }, // 1 point per 10 yards
    touchdowns: { type: 'base', value: 6 },
    attempts: { type: 'base', value: 0 },
    bonuses: [],
  },
  receiving: {
    receptions: { type: 'base', value: 0 }, // No PPR
    yards: { type: 'base', value: 0.1 },
    touchdowns: { type: 'base', value: 6 },
    targets: { type: 'base', value: 0 },
    bonuses: [],
  },
  misc: {
    fumblesLost: { type: 'base', value: -2 },
    twoPointConversions: { type: 'base', value: 2 },
    bonuses: [],
  },
  bonuses: [],
};

export const HALF_PPR_SCORING: ScoringRules = {
  ...STANDARD_SCORING,
  receiving: {
    ...STANDARD_SCORING.receiving,
    receptions: { type: 'base', value: 0.5 }, // Half PPR
  },
};

export const FULL_PPR_SCORING: ScoringRules = {
  ...STANDARD_SCORING,
  receiving: {
    ...STANDARD_SCORING.receiving,
    receptions: { type: 'base', value: 1.0 }, // Full PPR
  },
};

export const TE_PREMIUM_SCORING: ScoringRules = {
  ...STANDARD_SCORING,
  receiving: {
    ...STANDARD_SCORING.receiving,
    receptions: {
      type: 'position-specific',
      default: 1.0,
      byPosition: {
        TE: 1.5,
      },
    },
  },
};

// With bonuses
export const STANDARD_WITH_BONUSES: ScoringRules = {
  ...STANDARD_SCORING,
  passing: {
    ...STANDARD_SCORING.passing,
    bonuses: [
      {
        name: '300 Yard Game',
        points: 3,
        when: [{ stat: 'passingYards', operator: '>=', value: 300 }],
      },
      {
        name: '400 Yard Game',
        points: 5,
        when: [{ stat: 'passingYards', operator: '>=', value: 400 }],
      },
    ],
  },
  rushing: {
    ...STANDARD_SCORING.rushing,
    bonuses: [
      {
        name: '100 Yard Game',
        points: 3,
        when: [{ stat: 'rushingYards', operator: '>=', value: 100 }],
      },
      {
        name: '150 Yard Game',
        points: 5,
        when: [{ stat: 'rushingYards', operator: '>=', value: 150 }],
      },
    ],
  },
  receiving: {
    ...STANDARD_SCORING.receiving,
    bonuses: [
      {
        name: '100 Yard Game',
        points: 3,
        when: [{ stat: 'receivingYards', operator: '>=', value: 100 }],
      },
    ],
  },
};

export const PRESET_TEMPLATES = {
  standard: STANDARD_SCORING,
  halfPpr: HALF_PPR_SCORING,
  fullPpr: FULL_PPR_SCORING,
  tePremium: TE_PREMIUM_SCORING,
  standardWithBonuses: STANDARD_WITH_BONUSES,
} as const;

export type PresetTemplate = keyof typeof PRESET_TEMPLATES;
