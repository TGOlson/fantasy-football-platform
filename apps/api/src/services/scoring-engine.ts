import type {
  ScoringRules,
  ScoringValue,
  Bonus,
  Condition,
  ScoreBreakdown,
  ScoreBreakdownItem,
  Position,
} from '@fantasy-platform/types';

// ============================================================================
// TYPES
// ============================================================================

export type PlayerWeeklyStat = {
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

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export function calculateScore(
  stats: PlayerWeeklyStat,
  position: Position,
  rules: ScoringRules
): ScoreBreakdown {
  const breakdown: ScoreBreakdownItem[] = [];
  let totalPoints = 0;

  // PASSING
  const passingPoints = calculateCategoryScore(
    stats,
    position,
    rules.passing,
    'passing',
    {
      yards: stats.passingYards,
      touchdowns: stats.passingTds,
      interceptions: stats.passingInts,
      completions: stats.completions,
    },
    breakdown
  );
  totalPoints += passingPoints;

  // RUSHING
  const rushingPoints = calculateCategoryScore(
    stats,
    position,
    rules.rushing,
    'rushing',
    {
      yards: stats.rushingYards,
      touchdowns: stats.rushingTds,
      attempts: stats.rushingAttempts,
    },
    breakdown
  );
  totalPoints += rushingPoints;

  // RECEIVING
  const receivingPoints = calculateCategoryScore(
    stats,
    position,
    rules.receiving,
    'receiving',
    {
      receptions: stats.receptions,
      yards: stats.receivingYards,
      touchdowns: stats.receivingTds,
      targets: stats.targets,
    },
    breakdown
  );
  totalPoints += receivingPoints;

  // FUMBLES
  const fumblesLost = stats.fumblesLost || 0;
  const fumblePoints =
    fumblesLost * getScoringValue(rules.fumbles.lost, position);

  if (fumblesLost !== 0) {
    breakdown.push({
      category: 'Fumbles Lost',
      statValue: fumblesLost,
      pointValue: roundToTwo(fumblePoints),
    });
  }

  totalPoints += fumblePoints;

  // TWO-POINT CONVERSIONS
  const twoPointers = stats.twoPointConversions || 0;
  const conversionPoints =
    twoPointers * getScoringValue(rules.twoPointConversions, position);

  if (twoPointers !== 0) {
    breakdown.push({
      category: '2-Point Conversions',
      statValue: twoPointers,
      pointValue: roundToTwo(conversionPoints),
    });

    totalPoints += conversionPoints;
  }

  return {
    totalPoints: roundToTwo(totalPoints),
    breakdown,
  };
}

// ============================================================================
// CATEGORY CALCULATION
// ============================================================================

function calculateCategoryScore(
  stats: PlayerWeeklyStat,
  position: Position,
  categoryRules: Record<string, ScoringValue | Bonus[] | undefined>,
  categoryName: string,
  statValues: Record<string, number | null>,
  breakdown: ScoreBreakdownItem[]
): number {
  let categoryTotal = 0;

  // Calculate base scoring for each stat in the category
  for (const [statKey, scoringValue] of Object.entries(categoryRules)) {
    if (statKey === 'bonuses') continue; // Handle bonuses separately

    const statValue = statValues[statKey] || 0;
    const points =
      statValue * getScoringValue(scoringValue as ScoringValue, position);

    if (statValue !== 0) {
      const label = formatStatLabel(
        categoryName,
        statKey,
        position,
        scoringValue as ScoringValue
      );
      breakdown.push({
        category: label,
        statValue,
        pointValue: roundToTwo(points),
      });
    }

    categoryTotal += points;
  }

  // Calculate bonuses
  const bonuses = categoryRules.bonuses as Bonus[] | undefined;
  if (bonuses) {
    for (const bonus of bonuses) {
      if (evaluateBonus(stats, bonus)) {
        const bonusName = bonus.name || formatBonusName(bonus);
        breakdown.push({
          category: bonusName,
          statValue: null,
          pointValue: roundToTwo(bonus.points),
          isBonus: true,
        });
        categoryTotal += bonus.points;
      }
    }
  }

  return categoryTotal;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getScoringValue(
  scoringValue: ScoringValue,
  position: Position
): number {
  if (scoringValue.type === 'base') {
    return scoringValue.value;
  }

  if (scoringValue.type === 'position-specific') {
    return scoringValue.byPosition?.[position] ?? scoringValue.default;
  }

  return 0;
}

function evaluateBonus(stats: PlayerWeeklyStat, bonus: Bonus): boolean {
  return bonus.when.every((condition: Condition) =>
    evaluateCondition(stats, condition)
  );
}

function evaluateCondition(
  stats: PlayerWeeklyStat,
  condition: Condition
): boolean {
  const statValue = (stats as any)[condition.stat] || 0;

  switch (condition.operator) {
    case '>=':
      return statValue >= condition.value;
    case '>':
      return statValue > condition.value;
    case '<=':
      return statValue <= condition.value;
    case '<':
      return statValue < condition.value;
    case '==':
      return statValue === condition.value;
    default:
      return false;
  }
}

function formatStatLabel(
  categoryName: string,
  statKey: string,
  position: Position,
  scoringValue: ScoringValue
): string {
  const baseLabels: Record<string, string> = {
    'passing.yards': 'Passing Yards',
    'passing.touchdowns': 'Passing TDs',
    'passing.interceptions': 'Interceptions',
    'passing.completions': 'Completions',
    'rushing.yards': 'Rushing Yards',
    'rushing.touchdowns': 'Rushing TDs',
    'rushing.attempts': 'Rushing Attempts',
    'receiving.receptions': 'Receptions',
    'receiving.yards': 'Receiving Yards',
    'receiving.touchdowns': 'Receiving TDs',
    'receiving.targets': 'Targets',
  };

  const label = baseLabels[`${categoryName}.${statKey}`] || statKey;

  // Add position-specific note for PPR
  if (
    categoryName === 'receiving' &&
    statKey === 'receptions' &&
    scoringValue.type === 'position-specific'
  ) {
    const positionValue =
      scoringValue.byPosition?.[position] ?? scoringValue.default;
    if (positionValue !== scoringValue.default) {
      return `${label} (${position} ${positionValue} PPR)`;
    }
  }

  return label;
}

function formatBonusName(bonus: Bonus): string {
  const statLabels: Record<string, string> = {
    passingYards: 'Pass Yards',
    passingTds: 'Pass TDs',
    rushingYards: 'Rush Yards',
    rushingTds: 'Rush TDs',
    receivingYards: 'Rec Yards',
    receivingTds: 'Rec TDs',
    receptions: 'Receptions',
  };

  const labels = bonus.when
    .map((c) => `${statLabels[c.stat] || c.stat} ${c.operator} ${c.value}`)
    .join(', ');
  return `${labels} Bonus`;
}

function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
