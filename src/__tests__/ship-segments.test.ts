/**
 * Tests for the ship segment rendering helpers in Board.tsx.
 * These test the buildShipSegmentMap function that drives the
 * bow/mid/stern CSS classes for ship visuals.
 */
import { describe, it, expect } from 'vitest';
import { coordKey, placeShip, createEmptyBoard, shipCoords } from '../game/board';
import { FLEET } from '../game/types';
import type { Ship } from '../game/types';

// Re-implement buildShipSegmentMap here since it's not exported from Board.tsx.
// This tests the same logic that Board.tsx uses internally.
interface ShipSegment {
  position: 'bow' | 'mid' | 'stern' | 'solo';
  orientation: 'h' | 'v';
  shipName: string;
}

function buildShipSegmentMap(ships: Ship[]): Map<string, ShipSegment> {
  const map = new Map<string, ShipSegment>();
  for (const ship of ships) {
    const coords = ship.coords;
    if (coords.length === 0) continue;
    const orientation: 'h' | 'v' =
      coords.length > 1 && coords[0].row === coords[1].row ? 'h' : 'v';
    for (let i = 0; i < coords.length; i++) {
      let position: ShipSegment['position'];
      if (coords.length === 1) {
        position = 'solo';
      } else if (i === 0) {
        position = 'bow';
      } else if (i === coords.length - 1) {
        position = 'stern';
      } else {
        position = 'mid';
      }
      map.set(coordKey(coords[i]), { position, orientation, shipName: ship.name });
    }
  }
  return map;
}

describe('buildShipSegmentMap', () => {
  it('assigns bow/mid/stern for horizontal ship', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!;
    placeShip(board, FLEET[0], coords);

    const map = buildShipSegmentMap(board.ships);
    expect(map.get(coordKey({ row: 0, col: 0 }))).toEqual({
      position: 'bow', orientation: 'h', shipName: 'Carrier',
    });
    expect(map.get(coordKey({ row: 0, col: 1 }))).toEqual({
      position: 'mid', orientation: 'h', shipName: 'Carrier',
    });
    expect(map.get(coordKey({ row: 0, col: 2 }))).toEqual({
      position: 'mid', orientation: 'h', shipName: 'Carrier',
    });
    expect(map.get(coordKey({ row: 0, col: 3 }))).toEqual({
      position: 'mid', orientation: 'h', shipName: 'Carrier',
    });
    expect(map.get(coordKey({ row: 0, col: 4 }))).toEqual({
      position: 'stern', orientation: 'h', shipName: 'Carrier',
    });
  });

  it('assigns bow/mid/stern for vertical ship', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 2, col: 3 }, 'vertical', 4)!;
    placeShip(board, FLEET[1], coords);

    const map = buildShipSegmentMap(board.ships);
    expect(map.get(coordKey({ row: 2, col: 3 }))).toEqual({
      position: 'bow', orientation: 'v', shipName: 'Battleship',
    });
    expect(map.get(coordKey({ row: 3, col: 3 }))).toEqual({
      position: 'mid', orientation: 'v', shipName: 'Battleship',
    });
    expect(map.get(coordKey({ row: 4, col: 3 }))).toEqual({
      position: 'mid', orientation: 'v', shipName: 'Battleship',
    });
    expect(map.get(coordKey({ row: 5, col: 3 }))).toEqual({
      position: 'stern', orientation: 'v', shipName: 'Battleship',
    });
  });

  it('assigns bow/stern for size-2 ship (no mid)', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 2)!;
    placeShip(board, FLEET[4], coords);

    const map = buildShipSegmentMap(board.ships);
    expect(map.get(coordKey({ row: 0, col: 0 }))!.position).toBe('bow');
    expect(map.get(coordKey({ row: 0, col: 1 }))!.position).toBe('stern');
  });

  it('assigns bow/mid/stern for size-3 ship (one mid)', () => {
    const board = createEmptyBoard();
    const coords = shipCoords({ row: 0, col: 0 }, 'horizontal', 3)!;
    placeShip(board, FLEET[2], coords);

    const map = buildShipSegmentMap(board.ships);
    expect(map.get(coordKey({ row: 0, col: 0 }))!.position).toBe('bow');
    expect(map.get(coordKey({ row: 0, col: 1 }))!.position).toBe('mid');
    expect(map.get(coordKey({ row: 0, col: 2 }))!.position).toBe('stern');
  });

  it('handles multiple ships on the same board', () => {
    const board = createEmptyBoard();
    placeShip(board, FLEET[0], shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!);
    placeShip(board, FLEET[4], shipCoords({ row: 2, col: 0 }, 'vertical', 2)!);

    const map = buildShipSegmentMap(board.ships);
    // Carrier
    expect(map.get(coordKey({ row: 0, col: 0 }))!.shipName).toBe('Carrier');
    expect(map.get(coordKey({ row: 0, col: 4 }))!.shipName).toBe('Carrier');
    // Destroyer
    expect(map.get(coordKey({ row: 2, col: 0 }))!.shipName).toBe('Destroyer');
    expect(map.get(coordKey({ row: 3, col: 0 }))!.shipName).toBe('Destroyer');
    expect(map.get(coordKey({ row: 2, col: 0 }))!.orientation).toBe('v');
  });

  it('returns empty map for no ships', () => {
    const map = buildShipSegmentMap([]);
    expect(map.size).toBe(0);
  });

  it('returns empty map for ship with empty coords', () => {
    const ship: Ship = {
      name: 'Ghost',
      size: 0,
      coords: [],
      hits: new Set(),
      sunk: false,
    };
    const map = buildShipSegmentMap([ship]);
    expect(map.size).toBe(0);
  });

  it('every cell in a full fleet gets a segment entry', () => {
    const board = createEmptyBoard();
    placeShip(board, FLEET[0], shipCoords({ row: 0, col: 0 }, 'horizontal', 5)!);
    placeShip(board, FLEET[1], shipCoords({ row: 2, col: 0 }, 'horizontal', 4)!);
    placeShip(board, FLEET[2], shipCoords({ row: 4, col: 0 }, 'horizontal', 3)!);
    placeShip(board, FLEET[3], shipCoords({ row: 6, col: 0 }, 'horizontal', 3)!);
    placeShip(board, FLEET[4], shipCoords({ row: 8, col: 0 }, 'horizontal', 2)!);

    const map = buildShipSegmentMap(board.ships);
    expect(map.size).toBe(17); // 5+4+3+3+2
  });
});
