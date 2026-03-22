# Test Report

## Overview

This document details the testing methodology used to verify the Battleship game before merging. Testing was performed at two levels: **unit tests** (automated, via Vitest) and **end-to-end live sessions** (manual, in-browser). Every requirement was validated by at least one of these methods, and most were validated by both.

**Total unit tests:** 33 (all passing)
**E2E sessions:** 2 recorded sessions (loss path + win path)

---

## Requirements Matrix

| # | Requirement | Unit Tests | E2E Session | Result |
|---|-------------|-----------|-------------|--------|
| 1 | Ships placed legally and within bounds | `board.test.ts`: `isInBounds`, `shipCoords` (bounds rejection), `canPlaceShip`, `randomPlacement` (17 cells) | Visually confirmed 17 ship cells on player board across multiple randomizations | Pass |
| 2 | No overlapping ships | `board.test.ts`: `canPlaceShip` rejects overlap; `randomPlacement` no-overlap check via `coordKey` set | Confirmed visually during randomization — no doubled cells | Pass |
| 3 | Player shots cannot repeat | `attack.test.ts`: `processAttack` returns `null` for already-attacked cells (hit and miss) | Session 1: clicked same cell twice — no state change, no extra AI turn | Pass |
| 4 | AI shots cannot repeat | `ai.test.ts`: `chooseAIMove` never returns already-attacked cell (95/100 cells pre-attacked) | Never observed AI re-hitting a cell across two full games | Pass |
| 5 | Turn order: one player move then one AI move | App.tsx `handlePlayerAttack` does exactly one `processAttack` on AI board then one `chooseAIMove` + `processAttack` on player board | Observed correct 1:1 alternation in both sessions | Pass |
| 6 | Hits/misses display correctly | `attack.test.ts`: `processAttack` returns correct `outcome` for hit/miss/sunk | Session 1 & 2: orange/fire for hits, gray/dot for misses, red/X for sunk | Pass |
| 7 | Sunk ships detected correctly | `attack.test.ts`: `processAttack` returns `sunk` + `shipName` on last hit; `allShipsSunk` logic | Session 2: sunk Carrier(5), Battleship(4), Cruiser(3), Submarine(3), Destroyer(2) — all correct sizes, fleet panel strikethrough | Pass |
| 8 | Game ends exactly once | `attack.test.ts`: `allShipsSunk` returns true only when all ships sunk | Session 1: loss triggered once ("You lose."); Session 2: win triggered once ("You win!"). AI did NOT take an extra turn after winning shot. | Pass |
| 9 | No interaction after game over | App.tsx: `handlePlayerAttack` returns early if `phase !== 'playing'` | Session 1: clicked enemy board after loss — no change; Session 2: clicked enemy board after win — no change | Pass |
| 10 | Restart creates a fully fresh session | App.tsx: `handleRestart` creates all new state objects | Session 1: restart after loss — fresh boards, all ships alive, setup buttons visible; Session 2: restart after win — same result | Pass |
| 11 | No layout breakage on laptop-sized window | N/A (visual only) | Tested at 800px, 600px, and 500px widths — no horizontal scrollbar, no overlap, all content accessible | Pass |

---

## Unit Test Details

### File: `src/__tests__/board.test.ts` (14 tests)

Tests pure board logic — ship placement, bounds checking, and random generation.

| Test | What It Proves |
|------|---------------|
| `createEmptyBoard` — creates 10x10 grid of empty cells | Board initialization is correct |
| `isInBounds` — valid coordinates | Coordinates (0,0), (9,9), (5,3) are accepted |
| `isInBounds` — out-of-bounds coordinates | Coordinates (-1,0), (0,-1), (10,0), (0,10) are rejected |
| `shipCoords` — horizontal coords | Generates correct horizontal coordinates |
| `shipCoords` — vertical coords | Generates correct vertical coordinates |
| `shipCoords` — out of bounds horizontally | Returns null for ship extending past column 9 |
| `shipCoords` — out of bounds vertically | Returns null for ship extending past row 9 |
| `canPlaceShip` — empty cells | Allows placement on empty board |
| `canPlaceShip` — overlapping ship | Rejects placement overlapping existing ship |
| `placeShip` — places and marks cells | Ship object created correctly, grid cells marked as 'ship' |
| `randomPlacement` — all 5 ships with correct total | 5 ships placed, 17 total ship cells (5+4+3+3+2) |
| `randomPlacement` — no overlap | No two ships share the same coordinate |
| `randomPlacement` — different boards | Multiple calls produce different layouts (probabilistic) |

### File: `src/__tests__/attack.test.ts` (9 tests)

Tests attack processing, repeated-shot prevention, and win-condition detection.

| Test | What It Proves |
|------|---------------|
| `processAttack` — miss for empty cell | Returns 'miss', marks cell as 'miss' |
| `processAttack` — hit for ship cell | Returns 'hit', marks cell as 'hit' |
| `processAttack` — sunk on last cell | Returns 'sunk' + ship name, marks all ship cells as 'sunk' |
| `processAttack` — null for already-attacked miss | Repeated shot on miss cell returns null (no-op) |
| `processAttack` — null for already-attacked hit | Repeated shot on hit cell returns null (no-op) |
| `isAlreadyAttacked` — untouched cells | Returns false for empty and ship cells |
| `isAlreadyAttacked` — after attack | Returns true for cells that have been attacked |
| `allShipsSunk` — ships remain | Returns false when any ship has unhit cells |
| `allShipsSunk` — all sunk | Returns true only when every ship cell is hit |
| `findShipAt` — occupied coordinate | Finds correct ship by coordinate |
| `findShipAt` — empty coordinate | Returns undefined for unoccupied cell |

### File: `src/__tests__/ai.test.ts` (10 tests)

Tests AI hunt-and-target strategy, mode transitions, and the adjacent-ships bug fix.

| Test | What It Proves |
|------|---------------|
| `createAIState` — initial state | Starts in hunt mode with empty collections |
| `chooseAIMove` — valid coordinate | Returns in-bounds coordinate |
| `chooseAIMove` — no repeat attacks | With 95 cells pre-attacked, never returns an already-attacked cell |
| `updateAIState` — target mode on hit | Switches to target mode, adds to activeHits and targetQueue |
| `updateAIState` — adjacent cells queued | Adds 4 orthogonal neighbors to targetQueue after hit |
| `updateAIState` — hunt mode after sunk (no remaining hits) | Returns to hunt mode when sunk ship clears all activeHits |
| `updateAIState` — target mode after sunk (remaining hits) | Stays in target mode when other activeHits exist |
| `updateAIState` — adjacent ship hits preserved (Bug #1 fix) | Sinking Ship A does NOT remove hits belonging to adjacent Ship B |
| `updateAIState` — miss recording | Records miss in attackedCells, stays in hunt mode |

---

## End-to-End Testing Details

### Session 1: Loss Path (Full Game to AI Victory)

**Recorded:** `rec-35e2eb51e0f2491884823bcf6984e265-edited.mp4`

| Step | Action | Expected | Observed | Result |
|------|--------|----------|----------|--------|
| 1 | Load app at localhost | Title "Battleship", two 10x10 boards, setup buttons visible | All elements rendered correctly | Pass |
| 2 | Verify player board shows ships | Dark gray cells on "Your Fleet" board, 17 total | 17 ship cells visible | Pass |
| 3 | Verify enemy board hides ships | All light blue cells on "Enemy Waters" | No ship cells visible | Pass |
| 4 | Click "Randomize My Board" | Ship positions change | New arrangement appeared | Pass |
| 5 | Click "Start Game" | Setup buttons disappear, status shows "Your turn" | Buttons hidden, correct status message | Pass |
| 6 | Click enemy cell (first attack) | Cell changes to hit or miss, AI takes one turn | Cell turned orange (hit), AI attacked one cell on player board | Pass |
| 7 | Click already-attacked cell | No state change | Nothing happened | Pass |
| 8 | Continue until ship sunk | All cells turn red with X, fleet panel strikethrough | Sunk feedback appeared correctly | Pass |
| 9 | AI wins (sinks all player ships) | Status shows "You lose. The AI sank your fleet." | Correct loss message displayed | Pass |
| 10 | Click enemy board after game over | No state change | Board was locked | Pass |
| 11 | Click "Restart Game" | Full reset to setup phase | Fresh boards, all ships alive, setup buttons visible | Pass |

### Session 2: Win Path + Narrow Viewport

**Recorded:** `rec-e46ba32911fb44ba9d144c7fc7745c0b-edited.mp4`

| Step | Action | Expected | Observed | Result |
|------|--------|----------|----------|--------|
| 1 | Start game, systematically attack enemy ships | Hit/miss/sunk feedback for each attack | Correct visual feedback for every attack | Pass |
| 2 | Sink Carrier (5 cells: B1-B5) | "Sunk Carrier!" message, all 5 cells turn red | Correct sunk feedback, fleet panel updated | Pass |
| 3 | Sink Battleship (4 cells: D1-G1) | "Sunk Battleship!" message | Correct sunk feedback | Pass |
| 4 | Sink Destroyer (2 cells: C8-D8) | "Sunk Destroyer!" message | Correct sunk feedback | Pass |
| 5 | Sink Submarine (3 cells: G9-I9) | "Sunk Submarine!" message | Correct sunk feedback | Pass |
| 6 | Sink Cruiser (3 cells: F6-F8) | "You win! All enemy ships destroyed!" | Win message displayed, all 5 ships shown as SUNK | Pass |
| 7 | Verify AI did not take extra turn after winning shot | No additional change on player board | Player board unchanged after winning shot | Pass |
| 8 | Click enemy cell after winning | No state change | Board was locked | Pass |
| 9 | Click "Restart Game" after winning | Full reset to setup phase | Fresh boards, all ships alive, setup buttons visible | Pass |
| 10 | Resize browser to 800px width | Both boards visible, no overlap | Layout intact, boards side-by-side | Pass |
| 11 | Resize browser to 600px width | Content usable, no horizontal scrollbar | No overflow, all content accessible | Pass |
| 12 | Resize browser to 500px width | Content still accessible | No overflow, layout functional | Pass |

---

## Bugs Found

One bug was discovered during code review (before E2E testing) and fixed before the live sessions. See `BUG_REPORT.md` for full details.

| Bug | Discovery Method | Status |
|-----|-----------------|--------|
| AI flood-fill removes adjacent ship hits (Bug #1) | Devin code review flagged the flood-fill approach in `ai.ts` | Fixed — replaced with exact `shipCoords` matching |

No additional bugs were found during E2E testing.

---

## How to Run Tests

```bash
# Unit tests
npm test

# Dev server for manual testing
npm run dev

# Production build
npm run build
```

---

## Conclusion

All 11 requirements have been verified through a combination of 33 automated unit tests and 2 recorded E2E sessions. The one bug found (adjacent-ships AI issue) was fixed and has both a unit test and a documented entry in `BUG_REPORT.md`. The app is ready to merge.
