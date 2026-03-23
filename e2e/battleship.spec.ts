import { test, expect, type Page } from '@playwright/test';

// Helper: click a button by exact name
function btn(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true });
}

test.describe('Battleship E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Page load
  test('page loads successfully with title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Battleship');
  });

  test('shows two boards on load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Your Fleet' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enemy Waters' })).toBeVisible();
  });

  test('shows setup buttons on load', async ({ page }) => {
    await expect(btn(page, 'Randomize My Board')).toBeVisible();
    await expect(btn(page, 'Start Game')).toBeVisible();
    await expect(btn(page, 'Restart Game')).toBeVisible();
  });

  test('shows fleet panels on load', async ({ page }) => {
    await expect(page.getByText('Your Ships')).toBeVisible();
    await expect(page.getByText('Enemy Ships')).toBeVisible();
  });

  // Start and play a game
  test('user can start and play a game', async ({ page }) => {
    await btn(page, 'Randomize My Board').click();
    await btn(page, 'Start Game').click();

    // Setup buttons should be hidden
    await expect(btn(page, 'Randomize My Board')).not.toBeVisible();
    await expect(btn(page, 'Start Game')).not.toBeVisible();

    // Status text should show playing prompt
    await expect(page.getByText(/click on the enemy board to fire/i)).toBeVisible();

    // Click a clickable cell on the enemy board
    const clickableCell = page.locator('.board-container:nth-child(2) td.cell-clickable').first();
    await clickableCell.click();

    // Status should show attack result
    await expect(page.locator('.status-bar')).toContainText(/fired at/i);
  });

  // Repeated click on same target is blocked
  test('repeated click on same target is blocked', async ({ page }) => {
    await btn(page, 'Randomize My Board').click();
    await btn(page, 'Start Game').click();

    // Click a specific cell by coordinates (row 0, col 0)
    const allCells = page.locator('.board-container:nth-child(2) td');
    const targetCell = allCells.first();
    await targetCell.click();

    // Count player board attacks after first click
    const playerAttacksAfterFirst = await page.locator('.board-container:first-child td.cell-hit, .board-container:first-child td.cell-miss').count();

    // Click the exact same cell again (now it has cell-hit or cell-miss class)
    await targetCell.click();

    // No additional AI turn should have happened
    const playerAttacksAfterSecond = await page.locator('.board-container:first-child td.cell-hit, .board-container:first-child td.cell-miss').count();
    expect(playerAttacksAfterSecond).toBe(playerAttacksAfterFirst);
  });

  // AI takes exactly one turn after a valid player move
  test('AI takes exactly one turn after valid player move', async ({ page }) => {
    await btn(page, 'Randomize My Board').click();
    await btn(page, 'Start Game').click();

    // Count player board attacks before
    const before = await page.locator('.board-container:first-child td.cell-hit, .board-container:first-child td.cell-miss').count();
    expect(before).toBe(0);

    // Click a clickable cell on enemy board
    const clickableCell = page.locator('.board-container:nth-child(2) td.cell-clickable').first();
    await clickableCell.click();

    // After one valid move, AI should have attacked exactly once
    const after = await page.locator('.board-container:first-child td.cell-hit, .board-container:first-child td.cell-miss').count();
    expect(after).toBe(1);
  });

  // Restart mid-game works
  test('restart mid-game works', async ({ page }) => {
    await btn(page, 'Randomize My Board').click();
    await btn(page, 'Start Game').click();

    // Make a move
    const clickableCell = page.locator('.board-container:nth-child(2) td.cell-clickable').first();
    await clickableCell.click();

    // Click restart
    await btn(page, 'Restart Game').click();

    // Should be back in setup
    await expect(btn(page, 'Randomize My Board')).toBeVisible();
    await expect(btn(page, 'Start Game')).toBeVisible();

    // No attack markers on enemy board
    const attacked = await page.locator('.board-container:nth-child(2) td.cell-hit, .board-container:nth-child(2) td.cell-miss, .board-container:nth-child(2) td.cell-sunk').count();
    expect(attacked).toBe(0);
  });

  // Refresh still loads app
  test('refresh still loads app', async ({ page }) => {
    await btn(page, 'Randomize My Board').click();
    await btn(page, 'Start Game').click();
    await expect(page.getByText(/click on the enemy board to fire/i)).toBeVisible();

    // Reload
    await page.reload();

    // App should load again in setup state
    await expect(page.locator('h1')).toHaveText('Battleship');
    await expect(btn(page, 'Start Game')).toBeVisible();
  });

  // Background/theme layers do not block board interaction
  test('decorative layers do not block board interaction', async ({ page }) => {
    // Verify ambience layer exists
    const ambience = page.locator('.underwater-ambience');
    await expect(ambience).toBeVisible();

    // Verify it has pointer-events: none (doesn't block clicks)
    const pointerEvents = await ambience.evaluate((el) =>
      window.getComputedStyle(el).pointerEvents,
    );
    expect(pointerEvents).toBe('none');

    // Start game and verify cells are clickable
    await btn(page, 'Randomize My Board').click();
    await btn(page, 'Start Game').click();
    const clickableCell = page.locator('.board-container:nth-child(2) td.cell-clickable').first();
    await clickableCell.click();

    // Attack should have registered
    await expect(page.locator('.status-bar')).toContainText(/fired at/i);
  });

  // Enemy board not clickable during setup
  test('enemy board not clickable during setup', async ({ page }) => {
    // No clickable cells on enemy board in setup phase
    const clickableCells = await page.locator('.board-container:nth-child(2) td.cell-clickable').count();
    expect(clickableCells).toBe(0);
  });

  // Randomize button works
  test('randomize button populates all ships', async ({ page }) => {
    // Board starts empty
    const beforeCount = await page.locator('.board-container:first-child td.cell-ship').count();
    expect(beforeCount).toBe(0);

    await btn(page, 'Randomize My Board').click();

    const afterCount = await page.locator('.board-container:first-child td.cell-ship').count();
    expect(afterCount).toBe(17); // 5+4+3+3+2 = 17 ship cells
  });

  // Placement controls visible during setup
  test('placement controls visible during setup', async ({ page }) => {
    await expect(page.getByText('Place Your Ships')).toBeVisible();
    await expect(page.getByRole('button', { name: /Rotate/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Placement' })).toBeVisible();
  });

  // Start Game disabled until ships placed
  test('Start Game disabled until ships placed', async ({ page }) => {
    const startBtn = btn(page, 'Start Game');
    await expect(startBtn).toBeDisabled();

    await btn(page, 'Randomize My Board').click();
    await expect(startBtn).not.toBeDisabled();
  });
});
