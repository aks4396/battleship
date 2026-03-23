# Bug Report

## Bug Reporting Methodology

All bugs should be documented using the following structure:

| Field | Description |
|---|---|
| **Bug Title** | Short, descriptive title |
| **Severity** | Critical / High / Medium / Low |
| **Area** | Game logic, AI, UI, Visual, Layout, State management |
| **Environment** | Browser, OS, Node version, viewport size |
| **Reproduction Steps** | Numbered steps to reproduce |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happens |
| **Root Cause** | Technical explanation of why the bug occurs |
| **Fix Implemented** | Description of the code changes made |
| **Regression Coverage Added** | Tests added to prevent recurrence |
| **Validation Steps** | How to verify the fix works |

---

## Bug #1: AI forgets hits on adjacent ships when sinking a neighboring ship

| Field | Detail |
|---|---|
| **Severity** | High |
| **Area** | AI strategy / state management |
| **Environment** | All browsers, all viewports |
| **Status** | Fixed |

### Reproduction Steps

1. Start a game where Ship A (Destroyer, size 2) is at (5,5)-(5,6) and Ship B (Cruiser, size 3) is at (5,7)-(5,9) -- immediately adjacent
2. AI hits (5,5) -- enters target mode, adds (5,5) to activeHits
3. AI hits (5,7) -- adds (5,7) to activeHits (now tracking hits on both ships)
4. AI hits (5,6) -- sinks the Destroyer

### Expected Result

AI removes only the Destroyer's hits [(5,5), (5,6)] from activeHits, keeps (5,7) as an active hit, and continues targeting Ship B.

### Actual Result

AI's flood-fill algorithm traverses from (5,6) to neighbor (5,5) (correct), then to (5,7) (incorrect -- belongs to Ship B). All hits are removed, AI switches to hunt mode, forgetting about Ship B entirely.

### Root Cause

The `updateAIState` function used a flood-fill algorithm starting from the sunk coordinate to find all connected `activeHits` entries belonging to the sunk ship. Since ships can be placed side-by-side (placement only checks for overlap, not adjacency), the flood fill could cross ship boundaries and incorrectly remove hits from neighboring ships.

### Fix Implemented

Added a `shipCoords` field to the `AttackResult` type, populated by `processAttack` when a ship is sunk. The `updateAIState` function now uses these exact coordinates to remove only the sunk ship's entries from `activeHits`, instead of relying on flood-fill traversal.

**Files changed:**
- `src/game/types.ts` -- added optional `shipCoords?: Coord[]` to `AttackResult`
- `src/game/attack.ts` -- populate `shipCoords` in the sunk result
- `src/game/ai.ts` -- replaced flood-fill with exact coord matching

### Regression Coverage Added

- `ai.test.ts`: "does not remove adjacent ship hits when sinking a neighboring ship" -- verifies that sinking Ship A preserves Ship B's hit in activeHits
- `attack.test.ts`: "sinking one ship does not affect adjacent ship cells" -- verifies grid state independence
- `attack.test.ts`: "can sink adjacent ships independently" -- verifies both ships can be sunk correctly

### Validation Steps

1. Run `npm test` -- all AI and attack tests pass
2. Play a game where two ships are adjacent -- verify AI continues targeting the second ship after sinking the first

---

## Bug #2: Ship segment CSS classes leaked ship info on AI board hits

| Field | Detail |
|---|---|
| **Severity** | Medium |
| **Area** | UI / information leakage |
| **Environment** | All browsers, all viewports |
| **Status** | Fixed (PR #3) |

### Reproduction Steps

1. Start a game and attack the enemy board
2. Land a hit on an enemy ship cell
3. Inspect the hit cell's CSS classes in DevTools

### Expected Result

Hit cells on the enemy board should not reveal any information about the ship's orientation, position, or segment type (bow/mid/stern). Only sunk ships should display ship shape styling.

### Actual Result

Hit cells on the AI board received ship segment CSS classes (e.g., `seg-bow-h`, `seg-mid-v`), which leaked the ship's orientation and the player's position within the ship. A player inspecting DevTools could deduce the ship's layout before sinking it.

### Root Cause

The `buildShipSegmentMap` function in `Board.tsx` applied segment classes to all ship cells regardless of board ownership. The `showShipShape` condition did not account for the `hideShips` prop when the cell state was `hit`.

### Fix Implemented

Updated the `showShipShape` condition in `Board.tsx` to only apply ship segment CSS classes on the AI board (`hideShips=true`) when the cell state is `sunk`, not `hit`. Player board (`hideShips=false`) continues to show ship shapes for both `ship` and `hit` states.

**Files changed:**
- `src/components/Board.tsx` -- refined `showShipShape` conditional to exclude hit cells on hidden boards

### Regression Coverage Added

- `ship-segments.test.ts`: 27 tests covering ship segment metadata generation, orientation detection, and correct segment position assignment
- `integration.test.tsx`: decorative layer safety tests verifying no gameplay interference

### Validation Steps

1. Run `npm test` -- all tests pass
2. Play a game, hit an enemy ship cell, inspect its CSS classes in DevTools -- should not contain `seg-*` classes
3. Sink an enemy ship -- sunk cells should then display ship shape classes

---

## Bug #3: Vercel build failure -- TypeScript strict mode error in StatusBar.tsx

| Field | Detail |
|---|---|
| **Severity** | High |
| **Area** | Build / TypeScript |
| **Environment** | Vercel CI (Node 18+, TypeScript strict mode) |
| **Status** | Fixed (PR #6) |

### Reproduction Steps

1. Add `selectedShipIndex` as an optional prop to `StatusBar` component (`selectedShipIndex?: number | null`)
2. Use `selectedShipIndex !== null` to narrow the type before accessing `FLEET[selectedShipIndex]`
3. Run `npm run build` with TypeScript strict mode enabled

### Expected Result

Build compiles successfully -- `selectedShipIndex !== null` should narrow the type to `number`.

### Actual Result

TypeScript error: `'selectedShipIndex' is possibly 'undefined'`. The strict null check with `!== null` only narrows away `null`, not `undefined`. Since the prop is optional, its type is `number | null | undefined`, and `!== null` leaves the type as `number | undefined`.

### Root Cause

In TypeScript strict mode, optional props have type `T | undefined` in addition to any explicit union types. Using `!== null` (strict equality) only narrows away `null`, not `undefined`. The prop's full type was `number | null | undefined`, so after `!== null` the type remained `number | undefined`, which is not safe to use as an array index.

### Fix Implemented

Changed `selectedShipIndex !== null` to `selectedShipIndex != null` (loose equality). Loose inequality with `null` narrows away both `null` and `undefined` in TypeScript, correctly narrowing to `number`.

**Files changed:**
- `src/components/StatusBar.tsx` -- line 44: `!== null` changed to `!= null`

### Regression Coverage Added

- `integration.test.tsx`: 12 placement integration tests that exercise the StatusBar during setup phase with various `selectedShipIndex` values
- `placement.test.ts`: 28 unit tests covering placement logic including null/undefined ship index handling

### Validation Steps

1. Run `npm run build` -- should compile without errors
2. Run `npm run typecheck` -- no TypeScript errors
3. Verify Vercel deployment succeeds

---

## Bug #4: E2E tests failed after board initialization changed from pre-randomized to empty

| Field | Detail |
|---|---|
| **Severity** | Medium |
| **Area** | Testing / E2E |
| **Environment** | Playwright E2E test runner |
| **Status** | Fixed (PR #6) |

### Reproduction Steps

1. Change player board initialization from `randomPlacement()` to `createEmptyBoard()`
2. Run existing E2E tests that click "Start Game" directly without placing ships first

### Expected Result

E2E tests should account for the new setup flow and place ships before starting the game.

### Actual Result

All 12 existing E2E tests failed because they clicked "Start Game" immediately, but the button is now disabled until all 5 ships are placed. Tests timed out waiting for game state transitions that never occurred.

### Root Cause

The manual ship placement feature changed the initial board state from pre-populated (via `randomPlacement()`) to empty (via `createEmptyBoard()`). The "Start Game" button is disabled until `allShipsPlaced` is true (`placedShipNames.size === FLEET.length`). Existing tests did not call "Randomize My Board" before "Start Game".

### Fix Implemented

Updated all 12 existing E2E tests to click "Randomize My Board" before "Start Game" to populate the board. Added 2 new E2E tests specific to the placement flow: placement controls visibility and Start Game disabled state.

**Files changed:**
- `e2e/battleship.spec.ts` -- added `Randomize My Board` click before `Start Game` in all tests; added 2 new placement tests

### Regression Coverage Added

- `e2e/battleship.spec.ts`: "placement controls visible during setup" -- verifies Rotate and Reset buttons are present
- `e2e/battleship.spec.ts`: "Start Game disabled until ships placed" -- verifies disabled state, then enabled after Randomize

### Validation Steps

1. Run `npx playwright test` -- all 14 E2E tests pass
2. Verify no test calls "Start Game" without first placing ships

---

## Bug #5: Duplicate text match in integration test for "All ships placed"

| Field | Detail |
|---|---|
| **Severity** | Low |
| **Area** | Testing / Integration |
| **Environment** | Vitest + React Testing Library (jsdom) |
| **Status** | Fixed (PR #6) |

### Reproduction Steps

1. Place all 5 ships in an integration test
2. Use `screen.getByText(/All ships placed/i)` to verify the status message

### Expected Result

Query returns a single matching element (the StatusBar message).

### Actual Result

Query throws "Found multiple elements" error because both the `StatusBar` component and the `PlacementControls` component render text containing "All ships placed".

### Root Cause

The `StatusBar` renders "All ships placed! Press Start Game to begin." and `PlacementControls` renders "All ships placed! Press Start Game." Both match the `/All ships placed/i` regex, causing `getByText` to fail with a multiple-match error.

### Fix Implemented

Changed the test to use `document.querySelector('.status-bar')!.textContent` to target the specific StatusBar element instead of using a broad text query.

**Files changed:**
- `src/__tests__/integration.test.tsx` -- updated "All ships placed" assertion to target `.status-bar` specifically

### Regression Coverage Added

- The fix itself prevents the test from failing due to ambiguous text matching. The test continues to verify the correct status message is displayed.

### Validation Steps

1. Run `npm test` -- integration tests pass without "multiple elements" errors
2. Verify the test correctly asserts StatusBar content after all ships are placed

---

## Bug Template

Use this template for any new bugs found during QA:

### Bug #N: [Title]

| Field | Detail |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Area** | [area] |
| **Environment** | [browser, OS, viewport] |
| **Status** | Open / Fixed / Won't Fix |

#### Reproduction Steps

1. [step]
2. [step]
3. [step]

#### Expected Result

[what should happen]

#### Actual Result

[what actually happens]

#### Root Cause

[technical explanation]

#### Fix Implemented

[code changes made]

#### Regression Coverage Added

[tests added]

#### Validation Steps

[how to verify the fix]
