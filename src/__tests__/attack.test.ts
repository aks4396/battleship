import { describe, it, expect } from 'vitest';
import {
  processAttack,
  isAlreadyAttacked,
  allShipsSunk,
  findShipAt,
} from '../game/attack';
import { createEmptyBoard, placeShip, shipCoords } from '../game/board';
import { FLEET } from '../game/types';

function boardWithOneShip() {
  const board = createEmptyBoard();
  const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 2)!;
  placeShip(board, FLEET[4], coords);
  return board;
}

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
});

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
});

describe('allShipsSunk', () => {
  it('returns false when ships remain', () => {
    const board = boardWithOneShip();
    expect(allShipsSunk(board)).toBe(false);
    processAttack(board, { row: 0, col: 0 });
    expect(allShipsSunk(board)).toBe(false);
  });

  it('returns true when all ships are sunk', () => {
    const board = boardWithOneShip();
    processAttack(board, { row: 0, col: 0 });
    processAttack(board, { row: 0, col: 1 });
    expect(allShipsSunk(board)).toBe(true);
  });
});

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
});
