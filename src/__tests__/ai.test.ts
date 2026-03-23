import { describe, it, expect } from 'vitest';
import { createAIState, chooseAIMove, updateAIState } from '../game/ai';
import { coordKey, isInBounds } from '../game/board';
import type { AttackResult } from '../game/types';
import { BOARD_SIZE } from '../game/types';

// ─────────────────────────────────────────────
// createAIState
// ─────────────────────────────────────────────
describe('createAIState', () => {
  it('starts in hunt mode with empty state', () => {
    const state = createAIState();
    expect(state.mode).toBe('hunt');
    expect(state.attackedCells.size).toBe(0);
    expect(state.targetQueue.length).toBe(0);
    expect(state.activeHits.length).toBe(0);
  });

  it('returns a fresh independent state each call', () => {
    const s1 = createAIState();
    const s2 = createAIState();
    s1.attackedCells.add('0,0');
    expect(s2.attackedCells.size).toBe(0);
  });
});

// ─────────────────────────────────────────────
// chooseAIMove
// ─────────────────────────────────────────────
describe('chooseAIMove', () => {
  it('returns a valid in-bounds coordinate', () => {
    const state = createAIState();
    const move = chooseAIMove(state);
    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThan(BOARD_SIZE);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThan(BOARD_SIZE);
    expect(isInBounds(move)).toBe(true);
  });

  it('never returns an already-attacked cell', () => {
    const state = createAIState();
    // Fill 95 of 100 cells
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (r * BOARD_SIZE + c >= 95) break;
        state.attackedCells.add(coordKey({ row: r, col: c }));
      }
    }
    // Remaining 5 moves should all be unique and un-attacked
    for (let i = 0; i < 5; i++) {
      const move = chooseAIMove(state);
      const key = coordKey(move);
      expect(state.attackedCells.has(key)).toBe(false);
      state.attackedCells.add(key);
    }
  });

  it('throws when no moves are available', () => {
    const state = createAIState();
    // Fill all 100 cells
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        state.attackedCells.add(coordKey({ row: r, col: c }));
      }
    }
    expect(() => chooseAIMove(state)).toThrow('AI has no available moves');
  });

  it('uses target queue when in target mode', () => {
    const state = createAIState();
    state.mode = 'target';
    state.targetQueue.push(coordKey({ row: 5, col: 5 }));
    const move = chooseAIMove(state);
    expect(move).toEqual({ row: 5, col: 5 });
  });

  it('skips already-attacked cells in target queue', () => {
    const state = createAIState();
    state.mode = 'target';
    state.attackedCells.add(coordKey({ row: 5, col: 5 }));
    state.targetQueue.push(
      coordKey({ row: 5, col: 5 }),
      coordKey({ row: 6, col: 5 }),
    );
    const move = chooseAIMove(state);
    expect(move).toEqual({ row: 6, col: 5 });
  });

  it('falls back to hunt mode when target queue exhausted', () => {
    const state = createAIState();
    state.mode = 'target';
    state.attackedCells.add(coordKey({ row: 5, col: 5 }));
    state.targetQueue.push(coordKey({ row: 5, col: 5 })); // already attacked
    const move = chooseAIMove(state);
    // Should have picked a random cell, and mode should be hunt
    expect(state.mode).toBe('hunt');
    expect(isInBounds(move)).toBe(true);
  });
});

// ─────────────────────────────────────────────
// updateAIState
// ─────────────────────────────────────────────
describe('updateAIState', () => {
  it('switches to target mode on hit', () => {
    const state = createAIState();
    const result: AttackResult = {
      coord: { row: 3, col: 3 },
      outcome: 'hit',
    };
    updateAIState(state, result);
    expect(state.mode).toBe('target');
    expect(state.activeHits.length).toBe(1);
    expect(state.targetQueue.length).toBeGreaterThan(0);
  });

  it('adds adjacent cells to target queue on hit', () => {
    const state = createAIState();
    const result: AttackResult = {
      coord: { row: 5, col: 5 },
      outcome: 'hit',
    };
    updateAIState(state, result);
    // Interior cell has 4 neighbors
    expect(state.targetQueue.length).toBe(4);
  });

  it('adds fewer neighbors for corner hits', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 0, col: 0 }, outcome: 'hit' });
    // Corner has only 2 in-bounds neighbors
    expect(state.targetQueue.length).toBe(2);
  });

  it('adds fewer neighbors for edge hits', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 0, col: 5 }, outcome: 'hit' });
    // Top edge has 3 in-bounds neighbors
    expect(state.targetQueue.length).toBe(3);
  });

  it('does not add already-attacked cells to target queue', () => {
    const state = createAIState();
    state.attackedCells.add(coordKey({ row: 4, col: 5 }));
    updateAIState(state, { coord: { row: 5, col: 5 }, outcome: 'hit' });
    // Should have 3 neighbors (4 minus 1 already attacked)
    expect(state.targetQueue.length).toBe(3);
    expect(state.targetQueue).not.toContain(coordKey({ row: 4, col: 5 }));
  });

  it('does not add duplicate cells to target queue', () => {
    const state = createAIState();
    // Two adjacent hits will share a neighbor
    updateAIState(state, { coord: { row: 5, col: 5 }, outcome: 'hit' });
    updateAIState(state, { coord: { row: 5, col: 6 }, outcome: 'hit' });
    // Check no duplicates
    const unique = new Set(state.targetQueue);
    expect(unique.size).toBe(state.targetQueue.length);
  });

  it('returns to hunt mode when ship is sunk and no active hits remain', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 0, col: 0 }, outcome: 'hit' });
    expect(state.mode).toBe('target');
    updateAIState(state, {
      coord: { row: 0, col: 1 },
      outcome: 'sunk',
      shipName: 'Destroyer',
      shipCoords: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    });
    expect(state.mode).toBe('hunt');
    expect(state.activeHits.length).toBe(0);
    expect(state.targetQueue.length).toBe(0);
  });

  it('stays in target mode when ship is sunk but other active hits remain', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 0, col: 0 }, outcome: 'hit' });
    updateAIState(state, { coord: { row: 5, col: 5 }, outcome: 'hit' });
    expect(state.activeHits.length).toBe(2);
    updateAIState(state, {
      coord: { row: 0, col: 1 },
      outcome: 'sunk',
      shipName: 'Destroyer',
      shipCoords: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    });
    expect(state.mode).toBe('target');
    expect(state.activeHits.length).toBe(1);
  });

  it('rebuilds target queue from remaining active hits after sunk', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 0, col: 0 }, outcome: 'hit' });
    updateAIState(state, { coord: { row: 5, col: 5 }, outcome: 'hit' });
    // Sink first ship
    updateAIState(state, {
      coord: { row: 0, col: 1 },
      outcome: 'sunk',
      shipName: 'Destroyer',
      shipCoords: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
    });
    // Target queue should be rebuilt from (5,5) neighbors only
    expect(state.targetQueue.length).toBeGreaterThan(0);
    for (const key of state.targetQueue) {
      expect(state.attackedCells.has(key)).toBe(false);
    }
  });

  it('does not remove adjacent ship hits when sinking a neighboring ship', () => {
    const state = createAIState();
    // Ship A (Destroyer): (5,5), (5,6)
    // Ship B (Cruiser): (5,7), (5,8), (5,9) — adjacent to Ship A
    updateAIState(state, { coord: { row: 5, col: 5 }, outcome: 'hit' });
    updateAIState(state, { coord: { row: 5, col: 7 }, outcome: 'hit' });
    expect(state.activeHits.length).toBe(2);
    // Sink Ship A
    updateAIState(state, {
      coord: { row: 5, col: 6 },
      outcome: 'sunk',
      shipName: 'Destroyer',
      shipCoords: [{ row: 5, col: 5 }, { row: 5, col: 6 }],
    });
    // Ship B's hit at (5,7) should still be in activeHits
    expect(state.mode).toBe('target');
    expect(state.activeHits.length).toBe(1);
    expect(state.activeHits[0]).toBe(coordKey({ row: 5, col: 7 }));
  });

  it('records attacked cells for misses', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 2, col: 2 }, outcome: 'miss' });
    expect(state.attackedCells.has(coordKey({ row: 2, col: 2 }))).toBe(true);
    expect(state.mode).toBe('hunt');
  });

  it('records attacked cells for all outcome types', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 0, col: 0 }, outcome: 'miss' });
    updateAIState(state, { coord: { row: 1, col: 1 }, outcome: 'hit' });
    updateAIState(state, {
      coord: { row: 2, col: 2 },
      outcome: 'sunk',
      shipName: 'Destroyer',
      shipCoords: [{ row: 2, col: 2 }],
    });
    expect(state.attackedCells.has(coordKey({ row: 0, col: 0 }))).toBe(true);
    expect(state.attackedCells.has(coordKey({ row: 1, col: 1 }))).toBe(true);
    expect(state.attackedCells.has(coordKey({ row: 2, col: 2 }))).toBe(true);
  });

  it('miss during target mode stays in target mode if target queue has entries', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 5, col: 5 }, outcome: 'hit' });
    expect(state.mode).toBe('target');
    expect(state.targetQueue.length).toBe(4);
    updateAIState(state, { coord: { row: 4, col: 5 }, outcome: 'miss' });
    // Should still be in target mode
    expect(state.mode).toBe('target');
  });
});
