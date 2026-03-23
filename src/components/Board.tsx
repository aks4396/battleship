import type { Board as BoardType, CellState, Ship } from '../game/types';
import { BOARD_SIZE } from '../game/types';
import { coordKey } from '../game/board';
import './Board.css';

interface BoardProps {
  board: BoardType;
  label: string;
  /** If true, ship cells are hidden (shown as empty). Used for AI board. */
  hideShips?: boolean;
  /** Called when a cell is clicked. Only provided when the board is interactive. */
  onCellClick?: (row: number, col: number) => void;
  /** Whether clicks are enabled. */
  interactive?: boolean;
}

/** Ship segment info for a single cell */
interface ShipSegment {
  position: 'bow' | 'mid' | 'stern' | 'solo';
  orientation: 'h' | 'v';
  shipName: string;
}

/** Build a lookup from "row,col" -> ship segment info */
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

const CELL_DISPLAY: Record<CellState, { className: string; label: string }> = {
  empty: { className: 'cell-empty', label: '' },
  ship: { className: 'cell-ship', label: '' },
  hit: { className: 'cell-hit', label: '' },
  miss: { className: 'cell-miss', label: '' },
  sunk: { className: 'cell-sunk', label: '' },
};

const COL_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) =>
  String.fromCharCode(65 + i),
);

export function BoardView({
  board,
  label,
  hideShips = false,
  onCellClick,
  interactive = false,
}: BoardProps) {
  const segmentMap = buildShipSegmentMap(board.ships);

  return (
    <div className="board-container">
      <h2 className="board-label">{label}</h2>
      <table className="board-table">
        <thead>
          <tr>
            <th className="corner-cell"></th>
            {COL_LABELS.map((l) => (
              <th key={l} className="header-cell">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: BOARD_SIZE }, (_, row) => (
            <tr key={row}>
              <th className="header-cell">{row + 1}</th>
              {Array.from({ length: BOARD_SIZE }, (_, col) => {
                let state = board.grid[row][col];
                const key = coordKey({ row, col });
                const segment = segmentMap.get(key);

                // Hide ship cells on the AI board (but show hit/sunk)
                if (hideShips && state === 'ship') {
                  state = 'empty';
                }

                const display = CELL_DISPLAY[state];
                const clickable =
                  interactive && (state === 'empty' || state === 'ship');

                // Build CSS classes for ship segment styling
                const shipClasses: string[] = [];
                // On the AI board, only show ship shapes for sunk cells (not hits,
                // to avoid leaking ship orientation/position to the player).
                const showShipShape =
                  segment &&
                  ((!hideShips && state === 'ship') || (!hideShips && state === 'hit') || state === 'sunk');

                if (showShipShape) {
                  shipClasses.push(`seg-${segment.position}-${segment.orientation}`);
                  if (state === 'sunk') {
                    shipClasses.push('seg-wreck');
                  }
                }

                // Cell inner content based on state
                let innerContent: React.ReactNode = null;
                if (state === 'hit') {
                  innerContent = <span className="cell-icon cell-icon-hit" />;
                } else if (state === 'miss') {
                  innerContent = <span className="cell-icon cell-icon-miss" />;
                } else if (state === 'sunk') {
                  innerContent = <span className="cell-icon cell-icon-sunk" />;
                }

                return (
                  <td
                    key={col}
                    className={`cell ${display.className} ${clickable ? 'cell-clickable' : ''} ${shipClasses.join(' ')}`}
                    onClick={() => {
                      if (clickable && onCellClick) {
                        onCellClick(row, col);
                      }
                    }}
                    aria-label={`Row ${row + 1}, Column ${COL_LABELS[col]}, ${state}`}
                  >
                    {innerContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
