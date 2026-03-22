/**
 * Board creation and ship placement logic.
 * Pure functions — no side effects or React dependencies.
 */

import type {
  Board,
  CellState,
  Coord,
  Orientation,
  Ship,
  ShipDef,
} from './types';
import { BOARD_SIZE, FLEET } from './types';

/** Create an empty board. */
export function createEmptyBoard(): Board {
  const grid: CellState[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 'empty' as CellState),
  );
  return { grid, ships: [] };
}

/** Check whether a coordinate is within the board. */
export function isInBounds(coord: Coord): boolean {
  return (
    coord.row >= 0 &&
    coord.row < BOARD_SIZE &&
    coord.col >= 0 &&
    coord.col < BOARD_SIZE
  );
}

/** Convert a Coord to a string key for Sets/Maps. */
export function coordKey(coord: Coord): string {
  return `${coord.row},${coord.col}`;
}

/** Parse a coord key back into a Coord. */
export function parseCoordKey(key: string): Coord {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

/**
 * Compute the list of coords a ship would occupy given a start position,
 * orientation, and size. Returns null if any coord is out of bounds.
 */
export function shipCoords(
  start: Coord,
  orientation: Orientation,
  size: number,
): Coord[] | null {
  const coords: Coord[] = [];
  for (let i = 0; i < size; i++) {
    const coord: Coord =
      orientation === 'horizontal'
        ? { row: start.row, col: start.col + i }
        : { row: start.row + i, col: start.col };
    if (!isInBounds(coord)) return null;
    coords.push(coord);
  }
  return coords;
}

/**
 * Check whether placing a ship at the given coords would overlap
 * with any existing ship on the board.
 */
export function canPlaceShip(board: Board, coords: Coord[]): boolean {
  for (const c of coords) {
    if (board.grid[c.row][c.col] !== 'empty') return false;
  }
  return true;
}

/** Place a ship on the board (mutates the board). */
export function placeShip(board: Board, def: ShipDef, coords: Coord[]): Ship {
  const ship: Ship = {
    name: def.name,
    size: def.size,
    coords,
    hits: new Set<string>(),
    sunk: false,
  };
  for (const c of coords) {
    board.grid[c.row][c.col] = 'ship';
  }
  board.ships.push(ship);
  return ship;
}

/**
 * Randomly place all ships from the fleet onto a fresh board.
 * Retries placement from scratch if it gets stuck (very unlikely for a 10x10 board).
 */
export function randomPlacement(): Board {
  for (let attempt = 0; attempt < 100; attempt++) {
    const board = createEmptyBoard();
    let success = true;

    for (const def of FLEET) {
      let placed = false;
      // Try up to 200 random positions per ship
      for (let t = 0; t < 200; t++) {
        const orientation: Orientation =
          Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const start: Coord = {
          row: Math.floor(Math.random() * BOARD_SIZE),
          col: Math.floor(Math.random() * BOARD_SIZE),
        };
        const coords = shipCoords(start, orientation, def.size);
        if (coords && canPlaceShip(board, coords)) {
          placeShip(board, def, coords);
          placed = true;
          break;
        }
      }
      if (!placed) {
        success = false;
        break;
      }
    }

    if (success) return board;
  }

  // Should never reach here, but just in case
  throw new Error('Failed to place ships after many attempts');
}
