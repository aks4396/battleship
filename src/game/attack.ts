/**
 * Attack logic — processing shots on a board.
 * Pure functions — no side effects or React dependencies.
 */

import type { AttackResult, Board, Coord, Ship } from './types';
import { coordKey } from './board';

/**
 * Find the ship (if any) that occupies a given coordinate.
 */
export function findShipAt(board: Board, coord: Coord): Ship | undefined {
  const key = coordKey(coord);
  return board.ships.find((ship) =>
    ship.coords.some((c) => coordKey(c) === key),
  );
}

/**
 * Check if a cell has already been attacked (hit or miss).
 */
export function isAlreadyAttacked(board: Board, coord: Coord): boolean {
  const cell = board.grid[coord.row][coord.col];
  return cell === 'hit' || cell === 'miss' || cell === 'sunk';
}

/**
 * Process an attack on the given board at the given coordinate.
 * Mutates the board in place and returns the result.
 * Returns null if the cell was already attacked.
 */
export function processAttack(
  board: Board,
  coord: Coord,
): AttackResult | null {
  if (isAlreadyAttacked(board, coord)) return null;

  const ship = findShipAt(board, coord);

  if (!ship) {
    board.grid[coord.row][coord.col] = 'miss';
    return { coord, outcome: 'miss' };
  }

  // It's a hit
  const key = coordKey(coord);
  ship.hits.add(key);
  board.grid[coord.row][coord.col] = 'hit';

  // Check if the ship is now sunk
  if (ship.hits.size === ship.size) {
    ship.sunk = true;
    // Mark all ship cells as 'sunk'
    for (const c of ship.coords) {
      board.grid[c.row][c.col] = 'sunk';
    }
    return { coord, outcome: 'sunk', shipName: ship.name, shipCoords: ship.coords };
  }

  return { coord, outcome: 'hit' };
}

/**
 * Check if all ships on the board have been sunk.
 */
export function allShipsSunk(board: Board): boolean {
  return board.ships.length > 0 && board.ships.every((ship) => ship.sunk);
}
