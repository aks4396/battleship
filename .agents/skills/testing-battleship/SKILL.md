# Testing the Battleship Game

## Setup

```bash
cd /home/ubuntu/repos/battleship
npm install
npm run dev -- --host
```

The dev server runs on `http://localhost:5173/` (or next available port like 5174 if 5173 is in use).

## No Secrets Needed

This is a frontend-only app with no backend or authentication.

## Game Phases

1. **Setup phase**: Shows "Place your fleet, then press Start Game." Three buttons visible: "Randomize My Board", "Start Game", "Restart Game".
2. **Playing phase**: Only "Restart Game" button visible. Status shows "Your turn — click on the enemy board to fire." Click cells on "Enemy Waters" board to attack.
3. **Game over phase**: Status shows win ("You win! All enemy ships destroyed!") or loss ("You lose. The AI sank your fleet."). Board is locked — no more clicks allowed.

## Visual Indicators

- **Empty cell**: Light blue (`#e8f4fd`)
- **Ship cell**: Dark gray (`#607d8b`) — only visible on player's board
- **Hit**: Orange (`#ff7043`) with fire emoji
- **Miss**: Light gray (`#cfd8dc`) with dot
- **Sunk**: Red (`#d32f2f`) with X mark
- **Clickable cells**: Cursor changes to pointer on hover

## Key Test Scenarios

1. **Setup phase buttons**: Verify "Randomize My Board" changes ship positions, "Start Game" transitions to playing phase (hides setup buttons)
2. **Attack mechanics**: Click enemy board cells — should show hit/miss/sunk feedback. AI should respond with its own attack on player board. Status bar should show both results.
3. **Repeated shot prevention**: Clicking an already-attacked cell should do nothing (no state change, no AI turn)
4. **Ship sinking**: When all cells of a ship are hit, they turn red with X. Fleet panel shows ship with strikethrough and "SUNK" label.
5. **Game over lock**: After game ends, clicking enemy board should do nothing
6. **Restart**: "Restart Game" should reset to setup phase with fresh boards, all ships alive
7. **Enemy ship hiding**: "Enemy Waters" board should never show ship positions (all un-attacked cells appear as light blue)

## Board Layout

- Two boards side by side: "Your Fleet" (left) and "Enemy Waters" (right)
- 10x10 grid with column headers A-J and row headers 1-10
- Fleet status panels below boards: "Your Ships" and "Enemy Ships"
- Standard fleet: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)

## Running Tests

```bash
npm test        # 33 unit tests covering board, attack, and AI logic
npm run lint    # ESLint
npx tsc -b      # TypeScript type checking
npm run build   # Production build (Vercel-ready)
```

## Known Edge Cases

- Adjacent ships: When two ships are placed side-by-side, sinking one should not affect the AI's tracking of hits on the adjacent ship. This was a bug that was fixed by using exact `shipCoords` instead of flood-fill.
- Rapid clicking: The React state closure in `handlePlayerAttack` closes over board state. Rapid clicking could theoretically cause stale closures, though this is unlikely to cause visible issues in practice.
