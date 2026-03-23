import { describe, it, expect } from 'vitest';
import {
  processAttack,
  isAlreadyAttacked,
  allShipsSunk,
  findShipAt,
} from '../game/attack';
import { createEmptyBoard, placeShip, shipCoords, coordKey } from '../game/board';
import { FLEET } from '../game/types';

function boardWithOneShip() {
  const board = createEmptyBoard();
  const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 2)!;
  placeShip(board, FLEET[4], coords); // Destroyer (size 2)
  return board;
}

function boardWithFullFleet() {
  const board = createEmptyBoard();
  // Carrier (5) at row 0
  placeShip(board, FLEET[0], shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!);
  // Battleship (4) at row 2
  placeShip(board, FLEET[1], shipCoords({ row: 2, col: 0 }, 'horizontal', 4)!);
  // Cruiser (3) at row 4
  placeShip(board, FLEET[2], shipCoords({ row: 4, col: 0 }, 'horizontal', 3)!);
  // Submarine (3) at row 6
  placeShip(board, FLEET[3], shipCoords({ row: 6, col: 0 }, 'horizontal', 3)!);
  // Destroyer (2) at row 8
  placeShip(board, FLEET[4], shipCoords({ row: 8, col: 0 }, 'horizontal', 2)!);
  return board;
}

function boardWithAdjacentShips() {
  const board = createEmptyBoard();
  // Destroyer (2) at (3,3)-(3,4)
  placeShip(board, FLEET[4], shipCoords({ row: 3, col: 3 }, 'horizontal', 2)!);
  // Cruiser (3) at (3,5)-(3,7) — immediately adjacent
  placeShip(board, FLEET[2], shipCoords({ row: 3, col: 5 }, 'horizontal', 3)!);
  return board;
}

// ─────────────────────────────────────────────
// processAttack
// ─────────────────────────────────────────────
describe('processAttack', () => {
  it('returns miss for empty cell', () => {
    const board = boardWithOneShip();
    const result = processAttack(board, { row: 5, col: 5 });
    expect(result).not.toBeNull();
    expect(result!.outcome).toBe('miss');
    expect(board.grid[5][5]).toBe('miss');
  });

  it('returns hit for ship cell', () => {
    const board = boardWithOneShip();
    const result = processAttack(board, { row: 0, col: 0 });
    expect(result).not.toBeNull();
    expect(result!.outcome).toBe('hit');
    expect(board.grid[0][0]).toBe('hit');
  });

  it('returns sunk when last cell of ship is hit', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    const result = processAttack(board, { row: 0, col: 1 });
    expect(result).not.toBeNull();
    expect(result!.outcome).toBe('sunk');
    expect(result!.shipName).toBe('Destroyer');
    expect(board.grid[0][0]).toBe('sunk');
    expect(board.grid[0][1]).toBe('sunk');
  });

  it('returns null for already attacked cell (miss)', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 5, col: 5 });
    const result = processAttack(board, { row: 5, col: 5 });
    expect(result).toBeNull();
  });

  it('returns null for already attacked cell (hit)', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    const result = processAttack(board, { row: 0, col: 0 });
    expect(result).toBeNull();
  });

  it('returns null for already attacked cell (sunk)', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    processAttack(board, { row: 0, col: 1 });
    // Both cells are now 'sunk', attacking either should return null
    expect(processAttack(board, { row: 0, col: 0 })).toBeNull();
    expect(processAttack(board, { row: 0, col: 1 })).toBeNull();
  });

  it('returns correct shipCoords when sinking a ship', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    const result = processAttack(board, { row: 0, col: 1 });
    expect(result!.shipCoords).toBeDefined();
    expect(result!.shipCoords!.length).toBe(2);
    const keys = result!.shipCoords!.map((c) => coordKey(c));
    expect(keys).toContain(coordKey({ row: 0, col: 0 }));
    expect(keys).toContain(coordKey({ row: 0, col: 1 }));
  });

  it('does not include shipCoords on a hit (non-sunk) result', () => {
    const board = boardWithOneShip();
    const result = processAttack(board, { row: 0, col: 0 });
    expect(result!.outcome).toBe('hit');
    expect(result!.shipCoords).toBeUndefined();
    expect(result!.shipName).toBeUndefined();
  });

  it('marks all cells as sunk when sinking larger ships', () => {
    const board = createEmptyBoard();
    placeShip(board, FLEET[0], shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!);
    // Hit first 4 cells
    for (let c = 0; c < 4; c++) {
      const r = processAttack(board, { row: 0, col: c });
      expect(r!.outcome).toBe('hit');
    }
    // Sink on 5th
    const sunk = processAttack(board, { row: 0, col: 4 });
    expect(sunk!.outcome).toBe('sunk');
    expect(sunk!.shipName).toBe('Carrier');
    // All 5 cells should be 'sunk'
    for (let c = 0; c < 5; c++) {
      expect(board.grid[0][c]).toBe('sunk');
    }
  });

  it('sinking one ship does not affect adjacent ship cells', () => {
    const board = boardWithAdjacentShips();
    // Sink Destroyer at (3,3)-(3,4)
    processAttack(board, { row: 3, col: 3 });
    processAttack(board, { row: 3, col: 4 });
    // Destroyer should be sunk
    expect(board.grid[3][3]).toBe('sunk');
    expect(board.grid[3][4]).toBe('sunk');
    // Adjacent Cruiser at (3,5)-(3,7) should still be 'ship'
    expect(board.grid[3][5]).toBe('ship');
    expect(board.grid[3][6]).toBe('ship');
    expect(board.grid[3][7]).toBe('ship');
  });

  it('can sink adjacent ships independently', () => {
    const board = boardWithAdjacentShips();
    // Sink Destroyer
    processAttack(board, { row: 3, col: 3 });
    processAttack(board, { row: 3, col: 4 });
    // Hit Cruiser
    processAttack(board, { row: 3, col: 5 });
    expect(board.grid[3][5]).toBe('hit');
    processAttack(board, { row: 3, col: 6 });
    const sunk = processAttack(board, { row: 3, col: 7 });
    expect(sunk!.outcome).toBe('sunk');
    expect(sunk!.shipName).toBe('Cruiser');
    // All 5 cells should be sunk
    for (let c = 3; c <= 7; c++) {
      expect(board.grid[3][c]).toBe('sunk');
    }
  });
});

// ─────────────────────────────────────────────
// isAlreadyAttacked
// ─────────────────────────────────────────────
describe('isAlreadyAttacked', () => {
  it('returns false for untouched cells', () => {
    const board = boardWithOneShip();
    expect(isAlreadyAttacked(board, { row: 5, col: 5 })).toBe(false);
    expect(isAlreadyAttacked(board, { row: 0, col: 0 })).toBe(false);
  });

  it('returns true after attack', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 5, col: 5 });
    expect(isAlreadyAttacked(board, { row: 5, col: 5 })).toBe(true);
    processAttack(board, { row: 0, col: 0 });
    expect(isAlreadyAttacked(board, { row: 0, col: 0 })).toBe(true);
  });

  it('returns true for sunk cells', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    processAttack(board, { row: 0, col: 1 });
    expect(isAlreadyAttacked(board, { row: 0, col: 0 })).toBe(true);
    expect(isAlreadyAttacked(board, { row: 0, col: 1 })).toBe(true);
  });
});

// ─────────────────────────────────────────────
// allShipsSunk
// ─────────────────────────────────────────────
describe('allShipsSunk', () => {
  it('returns false when ships remain', () => {
    const board = boardWithOneShip();
    expect(allShipsSunk(board)).toBe(false);
    processAttack(board, { row: 0, col: 0 });
    expect(allShipsSunk(board)).toBe(false);
  });

  it('returns true when all ships are sunk (single ship)', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    processAttack(board, { row: 0, col: 1 });
    expect(allShipsSunk(board)).toBe(true);
  });

  it('returns true when all ships are sunk (full fleet)', () => {
    const board = boardWithFullFleet();
    // Sink all ships by attacking all ship cells
    for (const ship of board.ships) {
      for (const c of ship.coords) {
        processAttack(board, c);
      }
    }
    expect(allShipsSunk(board)).toBe(true);
  });

  it('returns false with full fleet when only some ships sunk', () => {
    const board = boardWithFullFleet();
    // Sink only the Destroyer (row 8, cols 0-1)
    processAttack(board, { row: 8, col: 0 });
    processAttack(board, { row: 8, col: 1 });
    expect(board.ships[4].sunk).toBe(true);
    expect(allShipsSunk(board)).toBe(false);
  });

  it('returns false for board with no ships', () => {
    const board = createEmptyBoard();
    expect(allShipsSunk(board)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// findShipAt
// ─────────────────────────────────────────────
describe('findShipAt', () => {
  it('finds ship at occupied coordinate', () => {
    const board = boardWithOneShip();
    const ship = findShipAt(board, { row: 0, col: 0 });
    expect(ship).toBeDefined();
    expect(ship!.name).toBe('Destroyer');
  });

  it('returns undefined for empty coordinate', () => {
    const board = boardWithOneShip();
    expect(findShipAt(board, { row: 5, col: 5 })).toBeUndefined();
  });

  it('finds correct ship when multiple ships on board', () => {
    const board = boardWithAdjacentShips();
    const destroyer = findShipAt(board, { row: 3, col: 3 });
    expect(destroyer!.name).toBe('Destroyer');
    const cruiser = findShipAt(board, { row: 3, col: 5 });
    expect(cruiser!.name).toBe('Cruiser');
  });

  it('finds ship after it has been hit', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    const ship = findShipAt(board, { row: 0, col: 0 });
    expect(ship).toBeDefined();
    expect(ship!.name).toBe('Destroyer');
  });
});
