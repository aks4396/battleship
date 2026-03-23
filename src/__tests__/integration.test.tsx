/**
 * Integration tests for the Battleship app.
 * Tests React component state transitions, UI updates, and user interactions.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

afterEach(() => {
  cleanup();
});

// Helper: get all cells on a specific board by label
function getBoardCells(boardLabel: string) {
  const headings = screen.getAllByText(boardLabel);
  const heading = headings[0];
  const container = heading.closest('.board-container')! as HTMLElement;
  return within(container).getAllByRole('cell');
}

// Helper: get a button by its accessible name
function btn(name: string) {
  return screen.getByRole('button', { name });
}

describe('App integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // ─────────────────────────────────────────────
  // Setup phase
  // ─────────────────────────────────────────────
  describe('setup phase', () => {
    it('renders the game title', () => {
      render(<App />);
      const title = document.querySelector('.title');
      expect(title).toBeInTheDocument();
      expect(title!.textContent).toBe('Battleship');
    });

    it('shows placement controls during setup', () => {
      render(<App />);
      expect(screen.getByText('Place Your Ships')).toBeInTheDocument();
    });

    it('Start Game is disabled when no ships are placed', () => {
      render(<App />);
      const startBtn = btn('Start Game');
      expect(startBtn).toBeDisabled();
    });

    it('shows setup buttons initially', () => {
      render(<App />);
      expect(btn('Randomize My Board')).toBeInTheDocument();
      expect(btn('Start Game')).toBeInTheDocument();
      expect(btn('Restart Game')).toBeInTheDocument();
    });

    it('shows setup status text', () => {
      render(<App />);
      expect(screen.getByText(/Place your Carrier/i)).toBeInTheDocument();
    });

    it('renders two boards with correct labels', () => {
      render(<App />);
      expect(screen.getByText('Your Fleet')).toBeInTheDocument();
      expect(screen.getByText('Enemy Waters')).toBeInTheDocument();
    });

    it('renders both fleet panels', () => {
      render(<App />);
      expect(screen.getByText('Your Ships')).toBeInTheDocument();
      expect(screen.getByText('Enemy Ships')).toBeInTheDocument();
    });

    it('shows all 5 ship names in fleet panels', () => {
      render(<App />);
      const shipNames = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];
      for (const name of shipNames) {
        const matches = screen.getAllByText(new RegExp(name));
        expect(matches.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('player board has 100 cells', () => {
      render(<App />);
      const cells = getBoardCells('Your Fleet');
      expect(cells.length).toBe(100);
    });

    it('enemy board has 100 cells', () => {
      render(<App />);
      const cells = getBoardCells('Enemy Waters');
      expect(cells.length).toBe(100);
    });

    it('enemy board cells have no ship-visible styling in setup', () => {
      render(<App />);
      const cells = getBoardCells('Enemy Waters');
      for (const cell of cells) {
        expect(cell.className).not.toContain('cell-ship');
      }
    });
  });

  // ─────────────────────────────────────────────
  // Randomize and start flow
  // ─────────────────────────────────────────────
  describe('randomize and start', () => {
    it('randomize button does not crash', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      // After randomize, still in setup
      expect(btn('Start Game')).toBeInTheDocument();
    });

    it('start game hides setup buttons', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      expect(screen.queryByRole('button', { name: 'Randomize My Board' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start Game' })).not.toBeInTheDocument();
      expect(btn('Restart Game')).toBeInTheDocument();
    });

    it('start game shows playing status text', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      expect(
        screen.getByText(/click on the enemy board to fire/i),
      ).toBeInTheDocument();
    });

    it('enemy board cells become clickable after starting', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      const cells = getBoardCells('Enemy Waters');
      const clickableCells = cells.filter((c) =>
        c.className.includes('cell-clickable'),
      );
      expect(clickableCells.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────
  // Gameplay: attacks and status updates
  // ─────────────────────────────────────────────
  describe('gameplay', () => {
    it('clicking enemy cell during gameplay updates status text', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      const cells = getBoardCells('Enemy Waters');
      const clickable = cells.find((c) => c.className.includes('cell-clickable'));
      expect(clickable).toBeDefined();
      await user.click(clickable!);

      const statusBar = document.querySelector('.status-bar')!;
      expect(statusBar.textContent).toMatch(/fired at/i);
    });

    it('clicking enemy cell changes its state', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      const cells = getBoardCells('Enemy Waters');
      const clickable = cells.find((c) => c.className.includes('cell-clickable'));
      const classBefore = clickable!.className;
      await user.click(clickable!);

      expect(clickable!.className).not.toBe(classBefore);
    });

    it('AI takes a turn after player attacks', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      const playerCellsBefore = getBoardCells('Your Fleet').filter(
        (c) => c.className.includes('cell-hit') || c.className.includes('cell-miss'),
      ).length;

      const enemyCells = getBoardCells('Enemy Waters');
      const clickable = enemyCells.find((c) => c.className.includes('cell-clickable'));
      await user.click(clickable!);

      const playerCellsAfter = getBoardCells('Your Fleet').filter(
        (c) => c.className.includes('cell-hit') || c.className.includes('cell-miss'),
      ).length;
      expect(playerCellsAfter).toBe(playerCellsBefore + 1);
    });

    it('repeated click on same cell does not trigger extra AI turn', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      const enemyCells = getBoardCells('Enemy Waters');
      const clickable = enemyCells.find((c) => c.className.includes('cell-clickable'));
      await user.click(clickable!);

      const playerAttacksAfterFirst = getBoardCells('Your Fleet').filter(
        (c) => c.className.includes('cell-hit') || c.className.includes('cell-miss'),
      ).length;

      await user.click(clickable!);

      const playerAttacksAfterSecond = getBoardCells('Your Fleet').filter(
        (c) => c.className.includes('cell-hit') || c.className.includes('cell-miss'),
      ).length;
      expect(playerAttacksAfterSecond).toBe(playerAttacksAfterFirst);
    });
  });

  // ─────────────────────────────────────────────
  // Restart
  // ─────────────────────────────────────────────
  describe('restart', () => {
    it('restart during setup stays in setup', async () => {
      render(<App />);
      await user.click(btn('Restart Game'));
      expect(btn('Randomize My Board')).toBeInTheDocument();
      expect(btn('Start Game')).toBeInTheDocument();
    });

    it('restart during gameplay returns to setup phase', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));
      expect(screen.queryByRole('button', { name: 'Randomize My Board' })).not.toBeInTheDocument();

      await user.click(btn('Restart Game'));
      expect(btn('Randomize My Board')).toBeInTheDocument();
      expect(btn('Start Game')).toBeInTheDocument();
    });

    it('restart clears all attack markers', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      const enemyCells = getBoardCells('Enemy Waters');
      const clickable = enemyCells.find((c) => c.className.includes('cell-clickable'));
      await user.click(clickable!);

      await user.click(btn('Restart Game'));

      const enemyCellsAfter = getBoardCells('Enemy Waters');
      const attacked = enemyCellsAfter.filter(
        (c) => c.className.includes('cell-hit') || c.className.includes('cell-miss') || c.className.includes('cell-sunk'),
      );
      expect(attacked.length).toBe(0);
    });

    it('restart resets all fleet status to alive', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      const enemyCells = getBoardCells('Enemy Waters');
      const clickables = enemyCells.filter((c) => c.className.includes('cell-clickable'));
      for (let i = 0; i < Math.min(3, clickables.length); i++) {
        await user.click(clickables[i]);
      }

      await user.click(btn('Restart Game'));

      const sunkItems = document.querySelectorAll('.ship-sunk');
      expect(sunkItems.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // Setup phase guards
  // ─────────────────────────────────────────────
  describe('setup phase guards', () => {
    it('enemy board cells are NOT clickable during setup', () => {
      render(<App />);
      const cells = getBoardCells('Enemy Waters');
      const clickable = cells.filter((c) => c.className.includes('cell-clickable'));
      expect(clickable.length).toBe(0);
    });

    it('clicking enemy board during setup does nothing', async () => {
      render(<App />);
      const cells = getBoardCells('Enemy Waters');
      await user.click(cells[0]);

      expect(btn('Randomize My Board')).toBeInTheDocument();
      const attacked = getBoardCells('Enemy Waters').filter(
        (c) => c.className.includes('cell-hit') || c.className.includes('cell-miss'),
      );
      expect(attacked.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // Manual ship placement
  // ─────────────────────────────────────────────
  describe('manual ship placement', () => {
    it('player board starts empty (no ships)', () => {
      render(<App />);
      const cells = getBoardCells('Your Fleet');
      const shipCells = cells.filter((c) => c.className.includes('cell-ship'));
      expect(shipCells.length).toBe(0);
    });

    it('clicking player board cell during setup places a ship segment', async () => {
      render(<App />);
      // Carrier (size 5) is auto-selected. Click cell at (0,0) = Row 1, Col A
      const cells = getBoardCells('Your Fleet');
      // Cell at row 0, col 0 is the first cell (index 0 in the cells array)
      await user.click(cells[0]);

      const shipCells = getBoardCells('Your Fleet').filter((c) =>
        c.className.includes('cell-ship'),
      );
      // Should have placed 5 cells (Carrier)
      expect(shipCells.length).toBe(5);
    });

    it('Randomize My Board populates all ships and enables Start Game', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));

      const cells = getBoardCells('Your Fleet');
      const shipCells = cells.filter((c) => c.className.includes('cell-ship'));
      expect(shipCells.length).toBe(17); // 5+4+3+3+2

      const startBtn = btn('Start Game');
      expect(startBtn).not.toBeDisabled();
    });

    it('Reset Placement clears the board', async () => {
      render(<App />);
      // Place at least one ship first
      const cells = getBoardCells('Your Fleet');
      await user.click(cells[0]); // Place Carrier

      // Now reset
      await user.click(btn('Reset Placement'));

      const shipCells = getBoardCells('Your Fleet').filter((c) =>
        c.className.includes('cell-ship'),
      );
      expect(shipCells.length).toBe(0);

      const startBtn = btn('Start Game');
      expect(startBtn).toBeDisabled();
    });

    it('Rotate button toggles orientation display', async () => {
      render(<App />);
      const rotateBtn = screen.getByRole('button', { name: /Rotate/i });
      expect(rotateBtn.textContent).toContain('H'); // starts horizontal

      await user.click(rotateBtn);
      expect(rotateBtn.textContent).toContain('V'); // now vertical

      await user.click(rotateBtn);
      expect(rotateBtn.textContent).toContain('H'); // back to horizontal
    });

    it('placement controls disappear after starting game', async () => {
      render(<App />);
      expect(screen.getByText('Place Your Ships')).toBeInTheDocument();

      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      expect(screen.queryByText('Place Your Ships')).not.toBeInTheDocument();
    });

    it('status text updates to show next ship after placing one', async () => {
      render(<App />);
      expect(screen.getByText(/Place your Carrier/i)).toBeInTheDocument();

      // Place Carrier at (0,0)
      const cells = getBoardCells('Your Fleet');
      await user.click(cells[0]);

      // Should now prompt for Battleship
      expect(screen.getByText(/Place your Battleship/i)).toBeInTheDocument();
    });

    it('shows "All ships placed" message when setup is complete', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));

      const statusBar = document.querySelector('.status-bar')!;
      expect(statusBar.textContent).toMatch(/All ships placed/i);
    });

    it('restart after gameplay returns to empty board setup', async () => {
      render(<App />);
      await user.click(btn('Randomize My Board'));
      await user.click(btn('Start Game'));

      await user.click(btn('Restart Game'));

      // Board should be empty again
      const cells = getBoardCells('Your Fleet');
      const shipCells = cells.filter((c) => c.className.includes('cell-ship'));
      expect(shipCells.length).toBe(0);

      // Start Game should be disabled
      const startBtn = btn('Start Game');
      expect(startBtn).toBeDisabled();

      // Placement controls should be visible
      expect(screen.getByText('Place Your Ships')).toBeInTheDocument();
    });

    it('manual placement then start game works for gameplay', async () => {
      render(<App />);
      const cells = getBoardCells('Your Fleet');

      // Place all 5 ships manually (horizontal, non-overlapping rows)
      // Carrier (5) at row 0
      await user.click(cells[0]); // row 0, col 0
      // Battleship (4) at row 1
      await user.click(cells[10]); // row 1, col 0
      // Cruiser (3) at row 2
      await user.click(cells[20]); // row 2, col 0
      // Submarine (3) at row 3
      await user.click(cells[30]); // row 3, col 0
      // Destroyer (2) at row 4
      await user.click(cells[40]); // row 4, col 0

      // All ships placed — Start Game should be enabled
      const startBtn = btn('Start Game');
      expect(startBtn).not.toBeDisabled();

      await user.click(startBtn);

      // Should be in playing phase
      expect(
        screen.getByText(/click on the enemy board to fire/i),
      ).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────
  // Decorative layer safety
  // ─────────────────────────────────────────────
  describe('decorative layer safety', () => {
    it('underwater ambience layer is rendered', () => {
      render(<App />);
      const ambience = document.querySelector('.underwater-ambience');
      expect(ambience).toBeInTheDocument();
    });

    it('underwater ambience has aria-hidden', () => {
      render(<App />);
      const ambience = document.querySelector('.underwater-ambience');
      expect(ambience).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
