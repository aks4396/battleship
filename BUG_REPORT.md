# Bug Report

---

## Bug #1: AI forgets hits on adjacent ships when sinking a neighboring ship

**Status:** Fixed

### Description

The AI's `updateAIState` function used a flood-fill algorithm to determine which `activeHits` belonged to a sunk ship. When a ship was sunk, it would start from the sunk coordinate and traverse through any connected `activeHits` entries (via orthogonal neighbors) to find all hits belonging to that ship. However, since ships can be placed side-by-side on the board (placement only checks for overlap, not adjacency), the flood fill could cross from the sunk ship's cells into a neighboring ship's hit cells and incorrectly remove them.

### Impact

When two ships were placed adjacent to each other and the AI had active hits on both, sinking one ship could cause the AI to "forget" about hits on the other ship. The AI would drop back to hunt mode and lose its targeting progress on the second ship, making it play sub-optimally — essentially wasting prior intelligence.

**Example scenario:**
- Ship A (Destroyer) at (5,5), (5,6)
- Ship B (Cruiser) at (5,7), (5,8), (5,9)
- AI hits (5,5) → `activeHits: ["5,5"]`
- AI hits (5,7) → `activeHits: ["5,5", "5,7"]`
- AI hits (5,6) → sinks Destroyer. Flood fill from (5,6) finds neighbor (5,5) in activeHits (correct), then finds (5,7) in activeHits (incorrect — belongs to Ship B).
- Result: `activeHits = []`, AI switches to hunt mode, forgetting the hit on Ship B entirely.

### Fix

Added a `shipCoords` field to the `AttackResult` type, populated by `processAttack` when a ship is sunk. The `updateAIState` function now uses these exact coordinates to remove only the sunk ship's entries from `activeHits`, instead of relying on flood-fill traversal.

**Files changed:**
- `src/game/types.ts` — added optional `shipCoords?: Coord[]` to `AttackResult`
- `src/game/attack.ts` — populate `shipCoords` in the sunk result
- `src/game/ai.ts` — replaced flood-fill with exact coord matching
- `src/__tests__/ai.test.ts` — added test for adjacent ships scenario

---

<!-- Template for additional bugs found during QA -->

## Bug #N (Template)

### Description

<!-- A clear and concise description of the bug. -->

### Steps to Reproduce

1.
2.
3.

### Expected Behavior

<!-- What you expected to happen. -->

### Actual Behavior

<!-- What actually happened. Include screenshots if applicable. -->

### Environment

- Browser:
- OS:
- Node version:

### Additional Context

<!-- Any other context about the problem. -->
