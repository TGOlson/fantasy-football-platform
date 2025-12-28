import { describe, it, expect } from 'vitest';
import { calculateScore } from './scoring-engine';
import type {
  PlayerWeeklyStat,
  ScoringRules,
  ScoreBreakdownItem,
} from '@fantasy-platform/types/scoring';
import {
  STANDARD_SCORING,
  HALF_PPR_SCORING,
  FULL_PPR_SCORING,
  TE_PREMIUM_SCORING,
  STANDARD_WITH_BONUSES,
} from './scoring-presets';

describe('calculateScore', () => {
  // =========================================================================
  // BASIC SCORING
  // =========================================================================

  describe('Basic Scoring (Standard)', () => {
    it('calculates QB performance correctly', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 300,
        passingTds: 2,
        passingInts: 1,
        completions: null,
        attempts: null,
        rushingYards: 20,
        rushingTds: 0,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', STANDARD_SCORING);

      // 300 * 0.04 = 12, 2 * 4 = 8, 1 * -2 = -2, 20 * 0.1 = 2
      expect(result.totalPoints).toBe(20);
      expect(result.breakdown).toHaveLength(4);
      expect(
        result.breakdown.find(
          (b: ScoreBreakdownItem) => b.category === 'Passing Yards'
        )?.pointValue
      ).toBe(12);
      expect(
        result.breakdown.find(
          (b: ScoreBreakdownItem) => b.category === 'Passing TDs'
        )?.pointValue
      ).toBe(8);
      expect(
        result.breakdown.find(
          (b: ScoreBreakdownItem) => b.category === 'Interceptions'
        )?.pointValue
      ).toBe(-2);
      expect(
        result.breakdown.find(
          (b: ScoreBreakdownItem) => b.category === 'Rushing Yards'
        )?.pointValue
      ).toBe(2);
    });

    it('calculates RB performance correctly', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: null,
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: 95,
        rushingTds: 1,
        rushingAttempts: null,
        receptions: 3,
        receivingYards: 25,
        receivingTds: 0,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'RB', STANDARD_SCORING);

      // 95 * 0.1 = 9.5, 1 * 6 = 6, 3 * 0 = 0, 25 * 0.1 = 2.5
      expect(result.totalPoints).toBe(18);
      expect(result.breakdown).toHaveLength(4);
    });

    it('calculates WR performance correctly', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: null,
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: 8,
        receivingYards: 120,
        receivingTds: 1,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'WR', STANDARD_SCORING);

      // 8 * 0 = 0, 120 * 0.1 = 12, 1 * 6 = 6
      expect(result.totalPoints).toBe(18);
    });

    it('handles null values gracefully', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 250,
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', STANDARD_SCORING);

      // 250 * 0.04 = 10
      expect(result.totalPoints).toBe(10);
      expect(result.breakdown).toHaveLength(1);
    });

    it('includes fumbles and 2-point conversions', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 200,
        passingTds: 2,
        passingInts: 0,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: 1,
        twoPointConversions: 1,
      };

      const result = calculateScore(stats, 'QB', STANDARD_SCORING);

      // 200 * 0.04 = 8, 2 * 4 = 8, 1 * -2 = -2, 1 * 2 = 2
      expect(result.totalPoints).toBe(16);
      expect(
        result.breakdown.find(
          (b: ScoreBreakdownItem) => b.category === 'Fumbles Lost'
        )?.pointValue
      ).toBe(-2);
      expect(
        result.breakdown.find(
          (b: ScoreBreakdownItem) => b.category === '2-Point Conversions'
        )?.pointValue
      ).toBe(2);
    });
  });

  // =========================================================================
  // PPR SCORING
  // =========================================================================

  describe('PPR Scoring', () => {
    it('calculates half PPR correctly', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: null,
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: 8,
        receivingYards: 120,
        receivingTds: 1,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'WR', HALF_PPR_SCORING);

      // 8 * 0.5 = 4, 120 * 0.1 = 12, 1 * 6 = 6
      expect(result.totalPoints).toBe(22);
    });

    it('calculates full PPR correctly', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: null,
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: 8,
        receivingYards: 120,
        receivingTds: 1,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'WR', FULL_PPR_SCORING);

      // 8 * 1.0 = 8, 120 * 0.1 = 12, 1 * 6 = 6
      expect(result.totalPoints).toBe(26);
    });
  });

  // =========================================================================
  // POSITION-SPECIFIC PPR
  // =========================================================================

  describe('Position-Specific PPR (TE Premium)', () => {
    it('calculates TE receptions with TE Premium correctly', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: null,
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: 8,
        receivingYards: 120,
        receivingTds: 1,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const teResult = calculateScore(stats, 'TE', TE_PREMIUM_SCORING);
      // 8 * 1.5 = 12, 120 * 0.1 = 12, 1 * 6 = 6
      expect(teResult.totalPoints).toBe(30);

      const wrResult = calculateScore(stats, 'WR', TE_PREMIUM_SCORING);
      // 8 * 1.0 = 8, 120 * 0.1 = 12, 1 * 6 = 6
      expect(wrResult.totalPoints).toBe(26);

      const rbResult = calculateScore(stats, 'RB', TE_PREMIUM_SCORING);
      // 8 * 1 = 8, 120 * 0.1 = 12, 1 * 6 = 6
      expect(rbResult.totalPoints).toBe(26);
    });

    it('includes position label in breakdown for position-specific PPR', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: null,
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: 8,
        receivingYards: 0,
        receivingTds: 0,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'TE', TE_PREMIUM_SCORING);
      const receptionBreakdown = result.breakdown.find(
        (b: ScoreBreakdownItem) => b.category.includes('Receptions')
      );

      expect(receptionBreakdown?.category).toContain('TE');
      expect(receptionBreakdown?.category).toContain('1.5');
    });
  });

  // =========================================================================
  // BONUSES
  // =========================================================================

  describe('Milestone Bonuses', () => {
    it('applies passing yard bonus at threshold', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 300,
        passingTds: 2,
        passingInts: 0,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', STANDARD_WITH_BONUSES);

      // 300 * 0.04 = 12, 2 * 4 = 8, bonus = 3
      expect(result.totalPoints).toBe(23);
      const bonus = result.breakdown.find((b: ScoreBreakdownItem) => b.isBonus);
      expect(bonus?.pointValue).toBe(3);
      expect(bonus?.statValue).toBeNull();
    });

    it('applies multiple bonuses for same category', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 425,
        passingTds: 3,
        passingInts: 0,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', STANDARD_WITH_BONUSES);

      // 425 * 0.04 = 17, 3 * 4 = 12, 300 bonus = 3, 400 bonus = 5
      expect(result.totalPoints).toBe(37);
      const bonuses = result.breakdown.filter(
        (b: ScoreBreakdownItem) => b.isBonus
      );
      expect(bonuses).toHaveLength(2);
      expect(
        bonuses.map((b: ScoreBreakdownItem) => b.pointValue).sort()
      ).toEqual([3, 5]);
    });

    it('does not apply bonus below threshold', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 299,
        passingTds: 2,
        passingInts: 0,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', STANDARD_WITH_BONUSES);

      // 299 * 0.04 = 11.96, 2 * 4 = 8, no bonus
      expect(result.totalPoints).toBe(19.96);
      const bonuses = result.breakdown.filter(
        (b: ScoreBreakdownItem) => b.isBonus
      );
      expect(bonuses).toHaveLength(0);
    });
  });

  // =========================================================================
  // CUMULATIVE BONUSES (AND LOGIC)
  // =========================================================================

  describe('Cumulative Bonuses (AND logic)', () => {
    it('applies bonus when all conditions are met', () => {
      const rules: ScoringRules = {
        ...STANDARD_SCORING,
        passing: {
          yards: { type: 'base', value: 0.04 },
          touchdowns: { type: 'base', value: 4 },
          interceptions: { type: 'base', value: -2 },
          completions: { type: 'base', value: 0 },
          bonuses: [
            {
              name: 'Big Game Bonus',
              points: 5,
              when: [
                { stat: 'passingYards', operator: '>=', value: 300 },
                { stat: 'passingTds', operator: '>=', value: 3 },
              ],
            },
          ],
        },
      };

      const stats: PlayerWeeklyStat = {
        passingYards: 350,
        passingTds: 3,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', rules);

      // 350 * 0.04 = 14, 3 * 4 = 12, bonus = 5
      expect(result.totalPoints).toBe(31);
      const bonus = result.breakdown.find(
        (b: ScoreBreakdownItem) => b.category === 'Big Game Bonus'
      );
      expect(bonus?.pointValue).toBe(5);
    });

    it('does not apply bonus when any condition fails', () => {
      const rules: ScoringRules = {
        ...STANDARD_SCORING,
        passing: {
          yards: { type: 'base', value: 0.04 },
          touchdowns: { type: 'base', value: 4 },
          interceptions: { type: 'base', value: -2 },
          completions: { type: 'base', value: 0 },
          bonuses: [
            {
              name: 'Big Game Bonus',
              points: 5,
              when: [
                { stat: 'passingYards', operator: '>=', value: 300 },
                { stat: 'passingTds', operator: '>=', value: 3 },
              ],
            },
          ],
        },
      };

      const stats: PlayerWeeklyStat = {
        passingYards: 350,
        passingTds: 2, // Not enough TDs
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', rules);

      // 350 * 0.04 = 14, 2 * 4 = 8, no bonus
      expect(result.totalPoints).toBe(22);
      const bonuses = result.breakdown.filter(
        (b: ScoreBreakdownItem) => b.isBonus
      );
      expect(bonuses).toHaveLength(0);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge Cases', () => {
    it('handles all zero stats', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 0,
        passingTds: 0,
        passingInts: 0,
        completions: 0,
        attempts: 0,
        rushingYards: 0,
        rushingTds: 0,
        rushingAttempts: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTds: 0,
        targets: 0,
        fumblesLost: 0,
        twoPointConversions: 0,
      };

      const result = calculateScore(stats, 'QB', STANDARD_SCORING);

      expect(result.totalPoints).toBe(0);
      expect(result.breakdown).toHaveLength(0); // No zero-value entries
    });

    it('rounds to two decimal places', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 333, // 333 * 0.04 = 13.32
        passingTds: null,
        passingInts: null,
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: null,
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', STANDARD_SCORING);

      expect(result.totalPoints).toBe(13.32);
    });

    it('handles negative total scores', () => {
      const stats: PlayerWeeklyStat = {
        passingYards: 50, // 50 * 0.04 = 2
        passingTds: 0,
        passingInts: 5, // 5 * -2 = -10
        completions: null,
        attempts: null,
        rushingYards: null,
        rushingTds: null,
        rushingAttempts: null,
        receptions: null,
        receivingYards: null,
        receivingTds: null,
        targets: null,
        fumblesLost: 2, // 2 * -2 = -4
        twoPointConversions: null,
      };

      const result = calculateScore(stats, 'QB', STANDARD_SCORING);

      // 2 - 10 - 4 = -12
      expect(result.totalPoints).toBe(-12);
    });
  });

  // =========================================================================
  // SCHEMA ALIGNMENT
  // =========================================================================

  // TODO: fix/add this back
  // describe('Schema Alignment', () => {
  //   it(' columns match PlayerStatColumn type', () => {
  //     // This test ensures that the PlayerStatColumn type in @fantasy-platform/types
  //     // stays aligned with the actual database schema columns in .
  //     // If this test fails, it means we've added/removed a column in the DB schema
  //     // but haven't updated the PlayerStatColumn type (or vice versa).

  //     const schemaColumns = Object.keys(playerWeeklyStats);

  //     // Filter to just stat columns (exclude metadata columns)
  //     const statColumns = schemaColumns.filter(
  //       (col) =>
  //         ![
  //           'id',
  //           'playerId',
  //           'season',
  //           'weekNumber',
  //           'createdAt',
  //           'updatedAt',
  //           'enableRLS', // Drizzle internal field
  //         ].includes(col)
  //     );

  //     // Define expected columns from PlayerStatColumn type
  //     // This should match the union of all stat column types
  //     const expectedColumns = [
  //       // PassingStatColumn
  //       'passingYards',
  //       'passingTds',
  //       'passingInts',
  //       'completions',
  //       'attempts',
  //       // RushingStatColumn
  //       'rushingYards',
  //       'rushingTds',
  //       'rushingAttempts',
  //       // ReceivingStatColumn
  //       'receptions',
  //       'receivingYards',
  //       'receivingTds',
  //       'targets',
  //       // MiscStatColumn
  //       'fumblesLost',
  //       'twoPointConversions',
  //     ];

  //     expect(statColumns.sort()).toEqual(expectedColumns.sort());
  //   });
  // });
});
