import type { Position } from './player';

// ============================================================================
// ROSTER TYPES
// ============================================================================

// TODO: think about if this is the best way to represent the number of roster positions for a team...
// It's nice in that the starter config is flexible, but feels like a redundant way to express eg. 2 RBs or 6 bench
// Alternative is: Record<Position, number>
//   - and needs to include all flex permutations, eg. QB/RB/WR/TE, RB/WR/TE, RB/WR, etc
//   - this may be better for efficient searches, but not sure if that's required (see: schema.ts/matchups)
export type RosterSlot =
  | { type: 'starter'; positions: Position[] }
  | { type: 'bench' }
  | { type: 'injured-reserve' };

export type RosterSlots = RosterSlot[];
