/**
 * AI logic — hunt-and-target strategy.
 * Pure functions operating on explicit state.
 */

import type { AttackResult, Coord } from './types';
import { BOARD_SIZE } from './types';
import { coordKey, isInBounds, parseCoordKey } from './board';

/**
 * AI state for the hunt-and-target strategy.
 * This is kept separate from the board so the AI doesn't "cheat".
 */
export interface AIState {
  /** Cells the AI has already attacked. */
  attackedCells: Set<string>;
  /** Mode: 'hunt' picks random unseen cells, 'target' follows up on hits. */
  mode: 'hunt' | 'target';
  /** Queue of high-priority target cells (adjacent to hits). */
  targetQueue: string[];
  /** Cells that were hit but not yet confirmed sunk — used to add neighbors. */
  activeHits: string[];
}

/** Create initial AI state. */
export function createAIState(): AIState {
  return {
    attackedCells: new Set(),
    mode: 'hunt',
    targetQueue: [],
    activeHits: [],
  };
}

/** Get the four orthogonal neighbors of a coord. */
function getNeighbors(coord: Coord): Coord[] {
  return [
    { row: coord.row - 1, col: coord.col },
    { row: coord.row + 1, col: coord.col },
    { row: coord.row, col: coord.col - 1 },
    { row: coord.row, col: coord.col + 1 },
  ].filter(isInBounds);
}

/**
 * Choose the next cell for the AI to attack.
 * Returns the chosen coordinate.
 */
export function chooseAIMove(state: AIState): Coord {
  // Target mode: try cells from the target queue
  while (state.targetQueue.length > 0) {
    const key = state.targetQueue.shift()!;
    if (!state.attackedCells.has(key)) {
      const coord = parseCoordKey(key);
      return coord;
    }
  }

  // Fall back to hunt mode
  state.mode = 'hunt';

  // Collect all un-attacked cells
  const available: Coord[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const key = coordKey({ row, col });
      if (!state.attackedCells.has(key)) {
        available.push({ row, col });
      }
    }
  }

  if (available.length === 0) {
    // Should not happen in a well-formed game
    throw new Error('AI has no available moves');
  }

  // Pick a random available cell
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

/**
 * Update AI state after an attack result.
 */
export function updateAIState(state: AIState, result: AttackResult): void {
  const key = coordKey(result.coord);
  state.attackedCells.add(key);

  if (result.outcome === 'hit') {
    state.mode = 'target';
    state.activeHits.push(key);
    // Add neighbors to the target queue
    const neighbors = getNeighbors(result.coord);
    for (const n of neighbors) {
      const nk = coordKey(n);
      if (!state.attackedCells.has(nk) && !state.targetQueue.includes(nk)) {
        state.targetQueue.push(nk);
      }
    }
  } else if (result.outcome === 'sunk') {
    // When a ship is sunk, remove the sunk coord from activeHits.
    // Also remove any activeHits that are adjacent to it (they likely
    // belong to the same ship). We use a flood-fill approach: starting
    // from the sunk coord, remove any connected activeHits neighbors.
    const toRemove = new Set<string>([key]);
    const queue = [key];
    while (queue.length > 0) {
      const current = queue.pop()!;
      const currentCoord = parseCoordKey(current);
      const neighbors = getNeighbors(currentCoord);
      for (const n of neighbors) {
        const nk = coordKey(n);
        if (!toRemove.has(nk) && state.activeHits.includes(nk)) {
          toRemove.add(nk);
          queue.push(nk);
        }
      }
    }
    state.activeHits = state.activeHits.filter((h) => !toRemove.has(h));

    // If there are still active hits, stay in target mode
    if (state.activeHits.length > 0) {
      state.mode = 'target';
      // Rebuild target queue from remaining active hits
      state.targetQueue = [];
      for (const hitKey of state.activeHits) {
        const hitCoord = parseCoordKey(hitKey);
        const neighbors = getNeighbors(hitCoord);
        for (const n of neighbors) {
          const nk = coordKey(n);
          if (
            !state.attackedCells.has(nk) &&
            !state.targetQueue.includes(nk)
          ) {
            state.targetQueue.push(nk);
          }
        }
      }
    } else {
      state.mode = 'hunt';
      state.targetQueue = [];
    }
  }
  // For 'miss', we just record the attacked cell (already done above).
  // If we're in target mode, we stay in target mode as long as targetQueue
  // has entries. chooseAIMove handles falling back to hunt mode.
}
