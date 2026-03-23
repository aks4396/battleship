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
