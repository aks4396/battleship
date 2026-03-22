import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  canPlaceShip,
  placeShip,
  shipCoords,
  randomPlacement,
  coordKey,
  isInBounds,
} from '../game/board';
import { BOARD_SIZE, FLEET } from '../game/types';

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
});

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
});

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
});

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
});

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

  it('produces different boards on successive calls (probabilistic)', () => {
    const boards = Array.from({ length: 5 }, () => randomPlacement());
    const serialized = boards.map((b) =>
      b.ships.map((s) => s.coords.map((c) => coordKey(c)).join(';')).join('|'),
    );
    const unique = new Set(serialized);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });
});
