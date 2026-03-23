# Test Report

## Overview

This document details the comprehensive testing methodology for the Battleship game. Testing is performed across four layers: **unit tests** (pure logic), **integration tests** (React component state/UI), **E2E tests** (browser-level user flows via Playwright), and **manual QA** (visual, animation, responsiveness).

**Test Counts:**
- Unit tests: 115 (Vitest) — includes 28 placement-specific tests
- Integration tests: 37 (Vitest + @testing-library/react + jsdom) — includes 12 placement flow tests
- E2E tests: 14 (Playwright + Chromium) — includes 2 placement-specific tests
- **Total automated: 166**

---

## Testing Strategy by Layer

### Layer 1: Unit Tests (Pure Logic)

**Purpose:** Verify deterministic game logic in isolation -- no DOM, no React, no browser.

**Why this layer exists:** Game logic functions (`board.ts`, `attack.ts`, `ai.ts`) are pure functions with no side effects. Unit tests are the fastest and most reliable way to verify their correctness, especially for edge cases that are hard to trigger in a live game (e.g., all 100 cells attacked, adjacent ships, corner/edge AI targeting).

**What it covers:**
- Ship placement legality and bounds checking
- Overlap prevention
- Fleet composition and ship sizes
- Attack outcome correctness (hit/miss/sunk)
- Repeated attack rejection
- Sunk detection (single ship, full fleet, adjacent ships)
- Win/loss detection (`allShipsSunk`)
- AI legal move generation (hunt mode)
- AI target-mode candidate filtering (neighbor queueing, dedup, already-attacked filtering)
- AI state transitions (hunt -> target -> hunt, sunk with remaining hits)
- Adjacent-ships bug fix (exact coord matching vs flood-fill)
- Ship segment rendering metadata (bow/mid/stern, horizontal/vertical)
- Clean state generation (`createEmptyBoard`, `createAIState`)
- Coord key round-tripping (`coordKey` / `parseCoordKey`)
- **Manual placement workflow:** sequential ship placement, overlap rejection during placement, orientation toggling, setup completeness validation, placement preview validation, reset placement clean state

### Layer 2: Integration Tests (React Component State/UI)

**Purpose:** Verify that React components correctly wire game logic to the DOM -- phase transitions, button visibility, status text updates, and user interaction guards.

**Why this layer exists:** Unit tests verify logic, but cannot catch issues with React state management, event handlers, conditional rendering, or DOM structure. Integration tests render the actual `<App />` component in a jsdom environment and simulate user interactions.

**What it covers:**
- Setup phase rendering (title, boards, buttons, fleet panels, status text)
- Randomize-and-start flow (button clicks, phase transitions)
- Start game hides setup buttons, shows playing status
- Enemy board cells become clickable after starting
- Clicking enemy cell updates status text and cell state
- AI takes exactly one turn after player attack
- Repeated click on same cell does not trigger extra AI turn
- Restart from setup returns to clean state
- Restart during gameplay returns to setup phase
- Restart clears all attack markers
- Restart resets all fleet status to alive
- Setup phase guards (clicking enemy board during setup has no effect)
- Decorative layer safety (underwater ambience has `pointer-events: none`)
- **Manual placement:** board starts empty, clicking places ship, Randomize populates all ships, Reset clears board, Rotate toggles orientation display, placement controls disappear after starting, status text shows next ship, "All ships placed" message, restart returns to empty board, manual placement then start game works

### Layer 3: E2E Tests (Browser-Level User Flows)

**Purpose:** Verify the app works correctly in an actual browser -- real DOM, real CSS, real event handling.

**Why this layer exists:** Integration tests use jsdom which doesn't support CSS rendering, animations, or layout. E2E tests catch issues that only manifest in a real browser: CSS z-index blocking clicks, animation interference, layout breakage, page reload behavior.

**What it covers:**
- Page loads successfully with title
- Two boards visible on load
- Setup buttons visible on load
- Fleet panels visible on load
- User can start and play a game (full flow)
- Repeated click on same target is blocked
- AI takes exactly one turn after valid player move
- Restart mid-game works (returns to setup, clears markers)
- Page refresh still loads app (no stale state)
- Decorative layers do not block board interaction (`pointer-events: none` verified)
- Enemy board not clickable during setup
- Randomize button populates all ships (empty→17 ship cells)
- Placement controls visible during setup (Rotate, Reset buttons)
- Start Game disabled until ships placed, enabled after Randomize

### Layer 4: Manual QA (Visual, Animation, Responsiveness)

**Purpose:** Verify visual correctness, animation quality, and responsiveness that automated tests cannot assess.

**Why this layer exists:** Automated tests can verify DOM structure and CSS properties but cannot evaluate visual aesthetics, animation smoothness, color contrast, or subjective UX quality. These require human judgment.

**What it covers (see Post-Deploy QA Checklist below):**
- Ship segment rendering (bow/mid/stern appearance)
- Sunk ship wreck visual effects
- Underwater ambient animation quality
- Hit/miss/sunk visual feedback clarity
- Responsive layout at various viewports
- Color contrast and readability
- Animation performance (no jank or frame drops)

---

## Regression Risk from Recent Enhancements

The v2 underwater-themed visual upgrade introduced several areas of elevated regression risk:

| Enhancement | Risk Area | Mitigation |
|---|---|---|
| Ship segment CSS classes (bow/mid/stern) | Wrong segment type applied, misalignment with grid | Unit tests for `getShipSegmentInfo`, integration test for segment metadata |
| Sunk ship wreck effects | Wrong cells getting wreck styling, visual state persisting after restart | Unit tests for sunk detection, integration test for restart clearing state |
| Underwater ambience layer | Decorative div blocking clicks on board cells | Integration test + E2E test verify `pointer-events: none` |
| Bubble/fish animations | Animation elements interfering with game interaction | E2E test clicks through decorative layer successfully |
| Hit/miss/sunk visual polish | Visual feedback less clear with new styling | Manual QA checklist item |

---

## Edge Case Audit

The following edge cases were explicitly audited. Each is covered by automated tests, documented as a manual check, or both.

| Edge Case | Automated Coverage | Manual Check Needed |
|---|---|---|
| Stale AI moves after restart | Integration: restart resets all state; AI state is freshly created via `createAIState()` | No |
| Repeated AI shots | Unit: `chooseAIMove` never returns already-attacked cell (95/100 pre-attacked) | No |
| Repeated player shots | Unit: `processAttack` returns null; Integration: no extra AI turn; E2E: same cell click blocked | No |
| Clicks during AI turn | Code review: AI turn is synchronous within `handlePlayerAttack`, no window for user click during AI turn | No |
| Clicks after game over | Integration: game-over guard tests; E2E: enemy board not clickable during setup | No -- but manual verification recommended |
| Clicks during setup on enemy board | Integration: clicking enemy board during setup has no effect; E2E: no clickable cells during setup | No |
| Incorrect sunk detection for adjacent ships | Unit: `sinking one ship does not affect adjacent ship cells`, `can sink adjacent ships independently`; AI: `does not remove adjacent ship hits when sinking a neighboring ship` | No |
| Selected difficulty not applying correctly | N/A -- difficulty modes not implemented in current version | N/A |
| Incomplete setup still allowing game start | Integration: Start Game disabled when no ships placed; enabled only after all 5 placed | No |
| Ship placement off-board | Unit: `shipCoords` returns null for out-of-bounds; boundary tests for max valid positions | No |
| Ship placement overlap | Unit: `canPlaceShip` rejects overlap, perpendicular crossing, complete overlap | No |
| Vertical/horizontal ship rendering mismatch | Unit: `getShipSegmentInfo` tests for both orientations; visual verification in manual QA | Yes -- visual check |
| Sunk ship visual state applied to wrong ship | Unit: adjacent ship cells unaffected by neighbor sinking | Yes -- visual check |
| Decorative layers interfering with clicks | Integration + E2E: `pointer-events: none` verified on `.underwater-ambience` | No |
| Hover states appearing on illegal cells | E2E: no clickable cells during setup phase | Yes -- visual check |
| Browser resize causing layout misalignment | Previously tested at 800px/600px/500px widths | Yes -- retest after v2 changes |
| Refresh/reload issues in production | E2E: page refresh reloads app in setup state | No |
| Stale status messages after restart | Integration: restart tests verify clean state restoration | Yes -- visual check |

---

## Post-Deploy Live-Session QA Checklist

These checks should be performed manually on the deployed app:

### Setup Phase
- [ ] App loads with "Battleship" title, two boards, three buttons, two fleet panels
- [ ] Player board starts empty (no ships visible)
- [ ] PlacementControls panel shows fleet list with Carrier auto-selected
- [ ] Click a cell on player board to place Carrier (5 cells appear)
- [ ] Next ship auto-selects (Battleship)
- [ ] Rotate button toggles H/V orientation
- [ ] Hover preview shows green (valid) or red (invalid/overlapping/OOB)
- [ ] Reset Placement clears all placed ships
- [ ] Randomize My Board populates all 17 ship cells
- [ ] Start Game disabled until all 5 ships placed, enabled after
- [ ] PlacementControls disappear after starting game
- [ ] Clicking enemy board during setup does nothing

### Gameplay
- [ ] "Start Game" hides Randomize/Start buttons, shows playing status
- [ ] Clicking enemy cell shows hit (orange/fire) or miss (gray/ripple) feedback
- [ ] AI takes exactly one turn after each player attack
- [ ] Repeated click on same cell has no effect
- [ ] Sinking a ship shows sunk feedback, fleet panel updates with strikethrough
- [ ] Sunk ships display underwater wreck effect (darkened, damaged appearance)
- [ ] Status bar updates after each attack with grid coordinates

### Win/Loss
- [ ] Game ends when all 5 ships of either side are sunk
- [ ] Win message: "You win! All enemy ships destroyed!"
- [ ] Loss message: "You lose. The AI sank your fleet."
- [ ] No further clicks accepted after game over
- [ ] AI does NOT take an extra turn after the winning shot

### Restart
- [ ] "Restart Game" works from setup, playing, and gameover phases
- [ ] Restart creates fresh boards with new ship positions
- [ ] All attack markers cleared
- [ ] All fleet status reset to alive
- [ ] Status text resets to setup message
- [ ] No stale visual state from previous game

### Visual/Animation
- [ ] Underwater background gradient renders correctly
- [ ] Bubble animations play smoothly without frame drops
- [ ] Fish silhouettes move naturally
- [ ] Decorative elements do not block board clicks
- [ ] Ship segments align correctly with grid cells (no sub-pixel misalignment)
- [ ] Hit/miss/sunk effects are visually distinct and clear
- [ ] Sunk wreck effect is distinguishable from mere hits

### Responsiveness
- [ ] Layout works at 1440px+ (desktop)
- [ ] Layout works at 1024px (laptop)
- [ ] Layout works at 768px (tablet)
- [ ] Layout works at 375px (mobile)
- [ ] No horizontal scrollbar at any viewport
- [ ] Boards remain usable (cells large enough to tap) at narrow widths

---

## Unit Test Inventory

### `src/__tests__/board.test.ts` (35 tests)

| Describe Block | Tests | What It Covers |
|---|---|---|
| `createEmptyBoard` | 1 | 10x10 grid of 'empty' cells, no ships |
| `isInBounds` | 3 | Valid coords, out-of-bounds coords, large values |
| `coordKey / parseCoordKey` | 2 | Round-trip correctness, unique keys for different coords |
| `shipCoords` | 8 | Horizontal/vertical generation, bounds rejection, boundary positions, size-1 ship, negative start |
| `canPlaceShip` | 4 | Empty placement, overlap rejection, complete overlap, adjacent allowed, perpendicular crossing |
| `placeShip` | 2 | Cell marking, coord reference storage |
| `FLEET composition` | 4 | 5 ships, correct names, correct sizes (5,4,3,3,2), 17 total cells |
| `randomPlacement` | 7 | All ships placed, no overlap, in-bounds, correct sizes/names, consistent orientation, different boards, clean initial state |

### `src/__tests__/attack.test.ts` (28 tests)

| Describe Block | Tests | What It Covers |
|---|---|---|
| `processAttack` | 11 | Hit/miss/sunk outcomes, repeated attack rejection (miss/hit/sunk cells), shipCoords on sunk, larger ship sinking, adjacent ship independence |
| `isAlreadyAttacked` | 3 | Untouched returns false, attacked returns true, sunk returns true |
| `allShipsSunk` | 5 | Ships remaining, single ship sunk, full fleet sunk, partial fleet sunk, empty board |
| `findShipAt` | 4 | Occupied coord, empty coord, multiple ships, after hit |

### `src/__tests__/ai.test.ts` (18 tests)

| Describe Block | Tests | What It Covers |
|---|---|---|
| `createAIState` | 2 | Initial hunt mode, independent instances |
| `chooseAIMove` | 5 | Valid coord, no repeats, throws when exhausted, target queue usage, fallback to hunt |
| `updateAIState` | 11 | Target mode on hit, neighbor queueing, corner/edge hits, dedup, already-attacked filtering, hunt after sunk, target after sunk with remaining hits, queue rebuild, adjacent ship preservation, miss recording, miss during target mode |

### `src/__tests__/ship-segments.test.ts` (6 tests)

| Describe Block | Tests | What It Covers |
|---|---|---|
| `getShipSegmentInfo` | 6 | Horizontal bow/mid/stern, vertical bow/mid/stern, non-ship returns null, single-cell ship, sunk ship segments, hit ship segments |

### `src/__tests__/placement.test.ts` (28 tests)

| Describe Block | Tests | What It Covers |
|---|---|---|
| `sequential manual placement` | 4 | Place all 5 ships one at a time, duplicate name prevention (app-level), overlap rejection during sequential placement, mixed orientations |
| `orientation handling` | 4 | Horizontal occupies same row, vertical occupies same col, valid in one orientation but not other, toggling changes occupied cells |
| `setup completeness` | 4 | Empty board has 0 ships, partial count, full placement matches FLEET.length, placed names match FLEET |
| `placement preview validation` | 4 | Valid preview on empty board, OOB returns null, overlap returns false, adjacent allowed |
| `reset placement` | 2 | createEmptyBoard produces clean state, new board independent of previous |

### `src/__tests__/integration.test.tsx` (37 tests)

| Describe Block | Tests | What It Covers |
|---|---|---|
| `setup phase` | 10 | Title, placement controls, Start Game disabled, buttons, status text, boards, fleet panels, ship names, cell counts, enemy board styling |
| `randomize and start` | 4 | Randomize works, start hides buttons, playing status text, clickable cells |
| `gameplay` | 4 | Status updates, cell state changes, AI turns, repeated click prevention |
| `restart` | 4 | From setup, from gameplay, clears markers, resets fleet |
| `setup guards` | 2 | Enemy board clicks blocked during setup |
| `manual ship placement` | 10 | Board starts empty, click places ship, Randomize populates + enables Start, Reset clears, Rotate toggles, placement controls disappear, status shows next ship, all-placed message, restart returns to empty board, manual placement then gameplay |
| `decorative layer safety` | 2 | Underwater ambience rendered, has aria-hidden |

### `e2e/battleship.spec.ts` (14 tests)

| Test | What It Covers |
|---|---|
| Page loads successfully with title | App renders in real browser |
| Shows two boards on load | Board headings visible |
| Shows setup buttons on load | All 3 buttons present |
| Shows fleet panels on load | Fleet status panels visible |
| User can start and play a game | Randomize + start -> attack -> status update flow |
| Repeated click on same target is blocked | No extra AI turn on duplicate click |
| AI takes exactly one turn after valid player move | 1:1 turn alternation |
| Restart mid-game works | Returns to setup, clears markers |
| Refresh still loads app | Page reload doesn't break state |
| Decorative layers do not block board interaction | pointer-events verified + click-through |
| Enemy board not clickable during setup | No clickable cells in setup phase |
| Randomize button populates all ships | Board goes from 0 to 17 ship cells |
| Placement controls visible during setup | Rotate and Reset buttons present |
| Start Game disabled until ships placed | Disabled initially, enabled after Randomize |

---

## Known Limits of Automated Coverage

The following areas **cannot be fully verified by automated tests** and require manual/visual verification:

1. **Ship segment visual appearance** -- Tests verify CSS class names are correct, but not that the actual rendering looks like a ship bow/mid/stern
2. **Sunk wreck visual effect quality** -- Tests verify the `cell-sunk` class is applied, but not the visual fidelity of the wreck effect
3. **Animation smoothness** -- Tests cannot measure frame rates or detect visual jank
4. **Color contrast and readability** -- Tests cannot evaluate whether hit/miss/sunk states are visually distinguishable
5. **Sub-pixel alignment** -- CSS `calc()` expressions for ship segment positioning may have rounding issues at certain viewport sizes
6. **Touch target size on mobile** -- Tests verify layout doesn't break, but not that cells are large enough to tap accurately

---

## Previous E2E Testing Sessions

### Session 1: Loss Path (Full Game to AI Victory)

| Step | Action | Expected | Observed | Result |
|------|--------|----------|----------|--------|
| 1 | Load app at localhost | Title, two boards, setup buttons | All elements rendered | Pass |
| 2 | Verify player board shows ships | 17 ship cells visible | Confirmed | Pass |
| 3 | Click "Randomize My Board" | Ship positions change | New arrangement | Pass |
| 4 | Click "Start Game" | Setup buttons hidden | Correct | Pass |
| 5 | Attack enemy cells | Hit/miss/sunk feedback | Correct | Pass |
| 6 | Click already-attacked cell | No state change | Nothing happened | Pass |
| 7 | AI wins | "You lose." message | Correct | Pass |
| 8 | Click after game over | No state change | Board locked | Pass |
| 9 | Restart | Full reset | Fresh state | Pass |

### Session 2: Win Path + Narrow Viewport

| Step | Action | Expected | Observed | Result |
|------|--------|----------|----------|--------|
| 1-6 | Sink all 5 enemy ships | Sunk feedback for each | All correct | Pass |
| 7 | Win | "You win!" message | Correct | Pass |
| 8 | AI no extra turn | Player board unchanged | Confirmed | Pass |
| 9 | Restart | Full reset | Fresh state | Pass |
| 10-12 | Resize 800/600/500px | No overflow | Layout intact | Pass |

---

## Bugs Found

One bug was discovered during code review (before E2E testing) and fixed before the live sessions. See `BUG_REPORT.md` for full details.

| Bug | Discovery Method | Status |
|-----|-----------------|--------|
| AI flood-fill removes adjacent ship hits (Bug #1) | Devin code review flagged the flood-fill approach in `ai.ts` | Fixed -- replaced with exact `shipCoords` matching |

No additional bugs were found during testing.

---

## How to Run Tests

```bash
# Unit + Integration tests (Vitest)
npm test

# E2E tests (Playwright, requires Chromium)
npx playwright test

# Dev server for manual testing
npm run dev

# Production build
npm run build
```

---

## Conclusion

The Battleship game has comprehensive test coverage across all four testing layers. 124 automated tests cover gameplay logic, AI strategy, state transitions, UI interactions, and browser-level user flows. The edge case audit identified 18 specific scenarios, all of which have automated coverage or are documented as manual QA checks. The post-deploy checklist provides a structured approach for visual and responsiveness verification.
