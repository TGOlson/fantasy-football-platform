import type { Position } from './player';

// ============================================================================
// ROSTER TYPES
// ============================================================================

export type RosterSlot =
  | { type: 'starter'; positions: Position[] }
  | { type: 'bench' }
  | { type: 'injured-reserve' };

export type RosterSlots = RosterSlot[];
