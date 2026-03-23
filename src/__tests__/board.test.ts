import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  canPlaceShip,
  placeShip,
  shipCoords,
  randomPlacement,
  coordKey,
  parseCoordKey,
  isInBounds,
} from '../game/board';
import { BOARD_SIZE, FLEET } from '../game/types';
import type { Coord } from '../game/types';

// ─────────────────────────────────────────────
// createEmptyBoard
// ─────────────────────────────────────────────
describe('createEmptyBoard', () => {
  it('creates a 10x10 grid of empty cells', () => {
    const board = createEmptyBoard();
    expect(board.grid.length).toBe(BOARD_SIZE);
    for (const row of board.grid) {
      expect(row.length).toBe(BOARD_SIZE);
      for (const cell of row) {
        expect(cell).toBe('empty');
      }
    }
    expect(board.ships).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// isInBounds
// ─────────────────────────────────────────────
describe('isInBounds', () => {
  it('returns true for valid coordinates', () => {
    expect(isInBounds({ row: 0, col: 0 })).toBe(true);
    expect(isInBounds({ row: 9, col: 9 })).toBe(true);
    expect(isInBounds({ row: 5, col: 3 })).toBe(true);
  });

  it('returns false for out-of-bounds coordinates', () => {
    expect(isInBounds({ row: -1, col: 0 })).toBe(false);
    expect(isInBounds({ row: 0, col: -1 })).toBe(false);
    expect(isInBounds({ row: 10, col: 0 })).toBe(false);
    expect(isInBounds({ row: 0, col: 10 })).toBe(false);
  });

  it('returns false for large out-of-bounds values', () => {
    expect(isInBounds({ row: 100, col: 0 })).toBe(false);
    expect(isInBounds({ row: 0, col: -100 })).toBe(false);
  });
});

// ─────────────────────────────────────────────
// coordKey / parseCoordKey
// ─────────────────────────────────────────────
describe('coordKey / parseCoordKey', () => {
  it('round-trips correctly', () => {
    const coords: Coord[] = [
      { row: 0, col: 0 },
      { row: 9, col: 9 },
      { row: 3, col: 7 },
    ];
    for (const c of coords) {
      expect(parseCoordKey(coordKey(c))).toEqual(c);
    }
  });

  it('produces unique keys for different coords', () => {
    const k1 = coordKey({ row: 1, col: 2 });
    const k2 = coordKey({ row: 2, col: 1 });
    expect(k1).not.toBe(k2);
  });
});

// ─────────────────────────────────────────────
// shipCoords
// ─────────────────────────────────────────────
describe('shipCoords', () => {
  it('generates horizontal coords', () => {
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 3);
    expect(coords).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]);
  });

  it('generates vertical coords', () => {
    const coords = shipCoords({ row: 2, col: 5 }, 'vertical', 4);
    expect(coords).toEqual([
      { row: 2, col: 5 },
      { row: 3, col: 5 },
      { row: 4, col: 5 },
      { row: 5, col: 5 },
    ]);
  });

  it('returns null if ship goes out of bounds horizontally', () => {
    expect(shipCoords({ row: 0, col: 8 }, 'horizontal', 5)).toBeNull();
  });

  it('returns null if ship goes out of bounds vertically', () => {
    expect(shipCoords({ row: 8, col: 0 }, 'vertical', 5)).toBeNull();
  });

  it('allows ship at maximum valid horizontal position', () => {
    // size-5 ship starting at col 5: occupies cols 5,6,7,8,9 → valid
    const coords = shipCoords({ row: 0, col: 5 }, 'horizontal', 5);
    expect(coords).not.toBeNull();
    expect(coords!.length).toBe(5);
    expect(coords![4].col).toBe(9);
  });

  it('rejects ship one cell past maximum valid horizontal position', () => {
    // size-5 ship starting at col 6: occupies cols 6,7,8,9,10 → invalid
    expect(shipCoords({ row: 0, col: 6 }, 'horizontal', 5)).toBeNull();
  });

  it('allows ship at maximum valid vertical position', () => {
    const coords = shipCoords({ row: 5, col: 0 }, 'vertical', 5);
    expect(coords).not.toBeNull();
    expect(coords![4].row).toBe(9);
  });

  it('rejects ship one cell past maximum valid vertical position', () => {
    expect(shipCoords({ row: 6, col: 0 }, 'vertical', 5)).toBeNull();
  });

  it('generates correct coords for size-1 ship', () => {
    const coords = shipCoords({ row: 4, col: 4 }, 'horizontal', 1);
    expect(coords).toEqual([{ row: 4, col: 4 }]);
  });

  it('returns null for ship starting out of bounds', () => {
    expect(shipCoords({ row: -1, col: 0 }, 'horizontal', 2)).toBeNull();
    expect(shipCoords({ row: 0, col: -1 }, 'vertical', 2)).toBeNull();
  });
});

// ─────────────────────────────────────────────
// canPlaceShip
// ─────────────────────────────────────────────
describe('canPlaceShip', () => {
  it('allows placement on empty cells', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 3)!;
    expect(canPlaceShip(board, coords)).toBe(true);
  });

  it('rejects placement overlapping an existing ship', () => {
    const board = createEmptyBoard();
    const coords1 = shipCoords({ row: 0, col: 0 }, 'horizontal', 3)!;
    placeShip(board, FLEET[2], coords1);
    const coords2 = shipCoords({ row: 0, col: 2 }, 'vertical', 4)!;
    expect(canPlaceShip(board, coords2)).toBe(false);
  });

  it('rejects placement completely overlapping an existing ship', () => {
    const board = createEmptyBoard();
    const coords1 = shipCoords({ row: 0, col: 0 }, 'horizontal', 3)!;
    placeShip(board, FLEET[2], coords1);
    // Try to place same ship in same position
    const coords2 = shipCoords({ row: 0, col: 0 }, 'horizontal', 3)!;
    expect(canPlaceShip(board, coords2)).toBe(false);
  });

  it('allows adjacent non-overlapping placement', () => {
    const board = createEmptyBoard();
    const coords1 = shipCoords({ row: 0, col: 0 }, 'horizontal', 3)!;
    placeShip(board, FLEET[2], coords1);
    // Place right next to it (row 1, same cols)
    const coords2 = shipCoords({ row: 1, col: 0 }, 'horizontal', 3)!;
    expect(canPlaceShip(board, coords2)).toBe(true);
  });

  it('rejects placement crossing an existing ship perpendicularly', () => {
    const board = createEmptyBoard();
    const h = shipCoords({ row: 3, col: 2 }, 'horizontal', 5)!;
    placeShip(board, FLEET[0], h);
    // Vertical ship crossing the horizontal one
    const v = shipCoords({ row: 1, col: 4 }, 'vertical', 5)!;
    expect(canPlaceShip(board, v)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// placeShip
// ─────────────────────────────────────────────
describe('placeShip', () => {
  it('places a ship and marks cells', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 1, col: 1 }, 'horizontal', 3)!;
    const ship = placeShip(board, FLEET[2], coords);
    expect(ship.name).toBe('Cruiser');
    expect(ship.size).toBe(3);
    expect(ship.sunk).toBe(false);
    expect(ship.hits.size).toBe(0);
    for (const c of coords) {
      expect(board.grid[c.row][c.col]).toBe('ship');
    }
    expect(board.ships.length).toBe(1);
  });

  it('stores correct coord references', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'vertical', 4)!;
    const ship = placeShip(board, FLEET[1], coords);
    expect(ship.coords).toEqual(coords);
  });
});

// ─────────────────────────────────────────────
// FLEET composition
// ─────────────────────────────────────────────
describe('FLEET composition', () => {
  it('has exactly 5 ships', () => {
    expect(FLEET.length).toBe(5);
  });

  it('has correct ship names', () => {
    const names = FLEET.map((f) => f.name);
    expect(names).toEqual(['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer']);
  });

  it('has correct ship sizes', () => {
    const sizes = FLEET.map((f) => f.size);
    expect(sizes).toEqual([5, 4, 3, 3, 2]);
  });

  it('has total of 17 cells', () => {
    const total = FLEET.reduce((sum, f) => sum + f.size, 0);
    expect(total).toBe(17);
  });
});

// ─────────────────────────────────────────────
// randomPlacement
// ─────────────────────────────────────────────
describe('randomPlacement', () => {
  it('places all 5 ships with correct total cells', () => {
    const board = randomPlacement();
    expect(board.ships.length).toBe(5);
    const totalShipCells = board.ships.reduce((sum, s) => sum + s.size, 0);
    expect(totalShipCells).toBe(5 + 4 + 3 + 3 + 2);

    let gridShipCells = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board.grid[r][c] === 'ship') gridShipCells++;
      }
    }
    expect(gridShipCells).toBe(17);
  });

  it('does not overlap ships', () => {
    const board = randomPlacement();
    const occupied = new Set<string>();
    for (const ship of board.ships) {
      for (const c of ship.coords) {
        const key = coordKey(c);
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
    }
  });

  it('places all ship cells within bounds', () => {
    for (let i = 0; i < 10; i++) {
      const board = randomPlacement();
      for (const ship of board.ships) {
        for (const c of ship.coords) {
          expect(c.row).toBeGreaterThanOrEqual(0);
          expect(c.row).toBeLessThan(BOARD_SIZE);
          expect(c.col).toBeGreaterThanOrEqual(0);
          expect(c.col).toBeLessThan(BOARD_SIZE);
        }
      }
    }
  });

  it('produces ships with correct sizes matching FLEET', () => {
    const board = randomPlacement();
    const expectedSizes = FLEET.map((f) => f.size).sort();
    const actualSizes = board.ships.map((s) => s.size).sort();
    expect(actualSizes).toEqual(expectedSizes);
  });

  it('produces ships with correct names matching FLEET', () => {
    const board = randomPlacement();
    const expectedNames = FLEET.map((f) => f.name).sort();
    const actualNames = board.ships.map((s) => s.name).sort();
    expect(actualNames).toEqual(expectedNames);
  });

  it('all ships have consistent orientation (horizontal or vertical)', () => {
    for (let i = 0; i < 10; i++) {
      const board = randomPlacement();
      for (const ship of board.ships) {
        if (ship.coords.length <= 1) continue;
        const isH = ship.coords.every((c) => c.row === ship.coords[0].row);
        const isV = ship.coords.every((c) => c.col === ship.coords[0].col);
        expect(isH || isV).toBe(true);
      }
    }
  });

  it('produces different boards on successive calls (probabilistic)', () => {
    const boards = Array.from({ length: 5 }, () => randomPlacement());
    const serialized = boards.map((b) =>
      b.ships.map((s) => s.coords.map((c) => coordKey(c)).join(';')).join('|'),
    );
    const unique = new Set(serialized);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });

  it('initializes all ships as not sunk with no hits', () => {
    const board = randomPlacement();
    for (const ship of board.ships) {
      expect(ship.sunk).toBe(false);
      expect(ship.hits.size).toBe(0);
    }
  });
});
