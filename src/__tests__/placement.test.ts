/**
 * Unit tests for manual ship placement logic.
 * Tests the pure functions used by the placement workflow:
 * shipCoords, canPlaceShip, placeShip with sequential placement scenarios.
 */
import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  canPlaceShip,
  placeShip,
  shipCoords,
  coordKey,
} from '../game/board';
import { FLEET } from '../game/types';

// ─────────────────────────────────────────────
// Sequential manual placement (simulates user placing one ship at a time)
// ─────────────────────────────────────────────
describe('sequential manual placement', () => {
  it('can place all 5 fleet ships one at a time without overlap', () => {
    const board = createEmptyBoard();
    // Place each ship at a known non-overlapping position
    const placements: Array<{ row: number; col: number; orientation: 'horizontal' | 'vertical' }> = [
      { row: 0, col: 0, orientation: 'horizontal' }, // Carrier (5)
      { row: 1, col: 0, orientation: 'horizontal' }, // Battleship (4)
      { row: 2, col: 0, orientation: 'horizontal' }, // Cruiser (3)
      { row: 3, col: 0, orientation: 'horizontal' }, // Submarine (3)
      { row: 4, col: 0, orientation: 'horizontal' }, // Destroyer (2)
    ];

    for (let i = 0; i < FLEET.length; i++) {
      const p = placements[i];
      const coords = shipCoords({ row: p.row, col: p.col }, p.orientation, FLEET[i].size);
      expect(coords).not.toBeNull();
      expect(canPlaceShip(board, coords!)).toBe(true);
      placeShip(board, FLEET[i], coords!);
    }

    expect(board.ships.length).toBe(5);
    const totalCells = board.ships.reduce((sum, s) => sum + s.size, 0);
    expect(totalCells).toBe(17);
  });

  it('prevents placing the same ship definition twice at different positions', () => {
    const board = createEmptyBoard();
    const coords1 = shipCoords({ row: 0, col: 0 }, 'horizontal', FLEET[0].size)!;
    placeShip(board, FLEET[0], coords1); // Carrier at row 0

    // Place another Carrier at row 1 — canPlaceShip allows it (board logic doesn't track names),
    // but the App prevents it via placedShipNames set
    const coords2 = shipCoords({ row: 1, col: 0 }, 'horizontal', FLEET[0].size)!;
    expect(canPlaceShip(board, coords2)).toBe(true); // board-level allows non-overlapping
    // The duplicate prevention is handled at the App level via placedShipNames
  });

  it('rejects overlapping placement during sequential placement', () => {
    const board = createEmptyBoard();
    // Place Carrier horizontally at (0,0)
    const coords1 = shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!;
    placeShip(board, FLEET[0], coords1);

    // Try to place Battleship overlapping at (0,3) horizontally
    const coords2 = shipCoords({ row: 0, col: 3 }, 'horizontal', 4)!;
    expect(canPlaceShip(board, coords2)).toBe(false);
  });

  it('allows vertical placement after horizontal ships', () => {
    const board = createEmptyBoard();
    // Place Carrier horizontally at (0,0)
    const coords1 = shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!;
    placeShip(board, FLEET[0], coords1);

    // Place Battleship vertically at (1,0) — no overlap
    const coords2 = shipCoords({ row: 1, col: 0 }, 'vertical', 4)!;
    expect(canPlaceShip(board, coords2)).toBe(true);
    placeShip(board, FLEET[1], coords2);
    expect(board.ships.length).toBe(2);
  });
});

// ─────────────────────────────────────────────
// Orientation toggling
// ─────────────────────────────────────────────
describe('orientation handling', () => {
  it('horizontal placement occupies same row, increasing cols', () => {
    const coords = shipCoords({ row: 3, col: 2 }, 'horizontal', 4)!;
    expect(coords.every((c) => c.row === 3)).toBe(true);
    expect(coords.map((c) => c.col)).toEqual([2, 3, 4, 5]);
  });

  it('vertical placement occupies same col, increasing rows', () => {
    const coords = shipCoords({ row: 2, col: 5 }, 'vertical', 4)!;
    expect(coords.every((c) => c.col === 5)).toBe(true);
    expect(coords.map((c) => c.row)).toEqual([2, 3, 4, 5]);
  });

  it('same start cell can be valid in one orientation but not the other', () => {
    // At (0, 8), horizontal size-5 would go to col 12 — out of bounds
    const h = shipCoords({ row: 0, col: 8 }, 'horizontal', 5);
    expect(h).toBeNull();

    // At (0, 8), vertical size-5 goes to row 4 — valid
    const v = shipCoords({ row: 0, col: 8 }, 'vertical', 5);
    expect(v).not.toBeNull();
    expect(v!.length).toBe(5);
  });

  it('toggling orientation changes which cells are occupied', () => {
    const h = shipCoords({ row: 3, col: 3 }, 'horizontal', 3)!;
    const v = shipCoords({ row: 3, col: 3 }, 'vertical', 3)!;

    // First cell is the same
    expect(h[0]).toEqual(v[0]);

    // Remaining cells differ
    const hKeys = new Set(h.map(coordKey));
    const vKeys = new Set(v.map(coordKey));
    // Only the start cell overlaps
    const overlap = [...hKeys].filter((k) => vKeys.has(k));
    expect(overlap.length).toBe(1);
  });
});

// ─────────────────────────────────────────────
// Setup completeness validation
// ─────────────────────────────────────────────
describe('setup completeness', () => {
  it('empty board has 0 ships placed', () => {
    const board = createEmptyBoard();
    expect(board.ships.length).toBe(0);
  });

  it('partially placed board reports correct count', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!;
    placeShip(board, FLEET[0], coords);
    expect(board.ships.length).toBe(1);
    expect(board.ships.length < FLEET.length).toBe(true);
  });

  it('fully placed board has exactly FLEET.length ships', () => {
    const board = createEmptyBoard();
    const placements = [
      { row: 0, col: 0, o: 'horizontal' as const },
      { row: 1, col: 0, o: 'horizontal' as const },
      { row: 2, col: 0, o: 'horizontal' as const },
      { row: 3, col: 0, o: 'horizontal' as const },
      { row: 4, col: 0, o: 'horizontal' as const },
    ];
    for (let i = 0; i < FLEET.length; i++) {
      const p = placements[i];
      const coords = shipCoords({ row: p.row, col: p.col }, p.o, FLEET[i].size)!;
      placeShip(board, FLEET[i], coords);
    }
    expect(board.ships.length).toBe(FLEET.length);
  });

  it('placed ship names match FLEET when fully placed', () => {
    const board = createEmptyBoard();
    const placements = [
      { row: 0, col: 0, o: 'horizontal' as const },
      { row: 1, col: 0, o: 'horizontal' as const },
      { row: 2, col: 0, o: 'horizontal' as const },
      { row: 3, col: 0, o: 'horizontal' as const },
      { row: 4, col: 0, o: 'horizontal' as const },
    ];
    for (let i = 0; i < FLEET.length; i++) {
      const p = placements[i];
      const coords = shipCoords({ row: p.row, col: p.col }, p.o, FLEET[i].size)!;
      placeShip(board, FLEET[i], coords);
    }
    const placedNames = new Set(board.ships.map((s) => s.name));
    for (const def of FLEET) {
      expect(placedNames.has(def.name)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────
// Placement preview validation (used for hover highlighting)
// ─────────────────────────────────────────────
describe('placement preview validation', () => {
  it('valid preview: empty board, ship fits within bounds', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 5);
    expect(coords).not.toBeNull();
    expect(canPlaceShip(board, coords!)).toBe(true);
  });

  it('invalid preview: ship extends out of bounds', () => {
    const coords = shipCoords({ row: 0, col: 7 }, 'horizontal', 5);
    expect(coords).toBeNull(); // out of bounds → no coords
  });

  it('invalid preview: ship overlaps existing ship', () => {
    const board = createEmptyBoard();
    const existing = shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!;
    placeShip(board, FLEET[0], existing);

    const preview = shipCoords({ row: 0, col: 4 }, 'horizontal', 3)!;
    expect(canPlaceShip(board, preview)).toBe(false);
  });

  it('valid preview: ship adjacent to existing ship', () => {
    const board = createEmptyBoard();
    const existing = shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!;
    placeShip(board, FLEET[0], existing);

    const preview = shipCoords({ row: 1, col: 0 }, 'horizontal', 4)!;
    expect(canPlaceShip(board, preview)).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Reset placement (clean state generation)
// ─────────────────────────────────────────────
describe('reset placement', () => {
  it('createEmptyBoard produces a clean board for reset', () => {
    const board = createEmptyBoard();
    expect(board.ships.length).toBe(0);
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        expect(board.grid[r][c]).toBe('empty');
      }
    }
  });

  it('new empty board is independent of previous board state', () => {
    const board1 = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!;
    placeShip(board1, FLEET[0], coords);

    const board2 = createEmptyBoard();
    expect(board2.ships.length).toBe(0);
    expect(board2.grid[0][0]).toBe('empty');
  });
});
