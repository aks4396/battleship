/** Core types for the Battleship game. */

export const BOARD_SIZE = 10;

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

/** A coordinate on the board. */
export interface Coord {
  row: number;
  col: number;
}

/** Orientation of a ship on the board. */
export type Orientation = 'horizontal' | 'vertical';

/** Definition of a ship type in the fleet. */
export interface ShipDef {
  name: string;
  size: number;
}

/** A placed ship on the board. */
export interface Ship {
  name: string;
  size: number;
  coords: Coord[];
  hits: Set<string>; // stringified coords like "2,5"
  sunk: boolean;
}

/** The game board — a 2D grid of cell states plus placed ships. */
export interface Board {
  grid: CellState[][];
  ships: Ship[];
}

export type GamePhase = 'setup' | 'playing' | 'gameover';

export type Winner = 'player' | 'ai' | null;

/** Result of an attack on a cell. */
export interface AttackResult {
  coord: Coord;
  outcome: 'hit' | 'miss' | 'sunk';
  shipName?: string; // set when outcome is 'sunk'
  shipCoords?: Coord[]; // set when outcome is 'sunk' — all coords of the sunk ship
}

/** Standard Battleship fleet. */
export const FLEET: ShipDef[] = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];
