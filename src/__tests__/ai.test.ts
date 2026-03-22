import { describe, it, expect } from 'vitest';
import { createAIState, chooseAIMove, updateAIState } from '../game/ai';
import { coordKey } from '../game/board';
import type { AttackResult } from '../game/types';
import { BOARD_SIZE } from '../game/types';

describe('createAIState', () => {
  it('starts in hunt mode with empty state', () => {
    const state = createAIState();
    expect(state.mode).toBe('hunt');
    expect(state.attackedCells.size).toBe(0);
    expect(state.targetQueue.length).toBe(0);
    expect(state.activeHits.length).toBe(0);
  });
});

describe('chooseAIMove', () => {
  it('returns a valid coordinate', () => {
    const state = createAIState();
    const move = chooseAIMove(state);
    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThan(BOARD_SIZE);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThan(BOARD_SIZE);
  });

  it('never returns an already-attacked cell', () => {
    const state = createAIState();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (r * BOARD_SIZE + c >= 95) break;
        state.attackedCells.add(coordKey({ row: r, col: c }));
      }
    }
    for (let i = 0; i < 5; i++) {
      const move = chooseAIMove(state);
      const key = coordKey(move);
      expect(state.attackedCells.has(key)).toBe(false);
      state.attackedCells.add(key);
    }
  });
});

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
    expect(state.targetQueue.length).toBe(4);
  });

  it('returns to hunt mode when ship is sunk and no active hits remain', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 0, col: 0 }, outcome: 'hit' });
    expect(state.mode).toBe('target');
    updateAIState(state, {
      coord: { row: 0, col: 1 },
      outcome: 'sunk',
      shipName: 'Destroyer',
    });
    expect(state.mode).toBe('hunt');
    expect(state.activeHits.length).toBe(0);
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
    });
    expect(state.mode).toBe('target');
    expect(state.activeHits.length).toBe(1);
  });

  it('records attacked cells for misses', () => {
    const state = createAIState();
    updateAIState(state, { coord: { row: 2, col: 2 }, outcome: 'miss' });
    expect(state.attackedCells.has(coordKey({ row: 2, col: 2 }))).toBe(true);
    expect(state.mode).toBe('hunt');
  });
});
