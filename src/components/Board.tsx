import type { Board as BoardType, CellState } from '../game/types';
import { BOARD_SIZE } from '../game/types';
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

const CELL_DISPLAY: Record<CellState, { className: string; label: string }> = {
  empty: { className: 'cell-empty', label: '' },
  ship: { className: 'cell-ship', label: '' },
  hit: { className: 'cell-hit', label: '🔥' },
  miss: { className: 'cell-miss', label: '•' },
  sunk: { className: 'cell-sunk', label: '✕' },
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
                // Hide ship cells on the AI board
                if (hideShips && state === 'ship') {
                  state = 'empty';
                }
                const display = CELL_DISPLAY[state];
                const clickable =
                  interactive && (state === 'empty' || state === 'ship');
                return (
                  <td
                    key={col}
                    className={`cell ${display.className} ${clickable ? 'cell-clickable' : ''}`}
                    onClick={() => {
                      if (clickable && onCellClick) {
                        onCellClick(row, col);
                      }
                    }}
                    aria-label={`Row ${row + 1}, Column ${COL_LABELS[col]}, ${state}`}
                  >
                    {display.label}
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
