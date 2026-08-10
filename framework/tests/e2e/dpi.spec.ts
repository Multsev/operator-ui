import { expect, test } from '@playwright/test';

test('scaled rendering keeps controls inside the desktop workspace', async ({ page }) => {
  const factor = test.info().project.name.replace('dpi-', ''); await page.goto(`/?freeze=1&scale=${Number(factor) / 100}`);
  await expect(page.getByTestId('mdi-workspace')).toBeVisible();
  const result = await page.evaluate(() => { const workspace = document.querySelector<HTMLElement>('.ou-mdi-workspace')!; const root = document.querySelector<HTMLElement>('#root')!; return { scale: getComputedStyle(document.documentElement).getPropertyValue('--ou-ui-scale').trim(), rootRight: root.getBoundingClientRect().right, viewport: innerWidth, scrollable: workspace.scrollWidth >= workspace.clientWidth && workspace.scrollHeight >= workspace.clientHeight }; });
  expect(result.scale).toBe(String(Number(factor) / 100)); expect(result.rootRight).toBeLessThanOrEqual(result.viewport + 1); expect(result.scrollable).toBe(true);
  await expect(page).toHaveScreenshot('scaled-workspace.png', { animations: 'disabled' });
  const route = page.getByRole('region', { name: 'Route List' }); const before = await route.boundingBox(); const title = await route.locator('.ou-window-titlebar').boundingBox(); if (!before || !title) throw new Error('missing scaled child window');
  await page.mouse.move(title.x + 100, title.y + 10); await page.mouse.down(); await page.mouse.move(title.x + 140, title.y + 10); await page.mouse.up(); const moved = await route.boundingBox(); expect(Math.abs((moved!.x - before.x) - 40)).toBeLessThan(3);
  await page.getByRole('button', { name: 'View' }).click(); await page.getByText('Composition validation', { exact: true }).hover(); await page.getByRole('menuitem', { name: 'Calendar workspace', exact: true }).click();
  const calendar = page.getByRole('grid', { name: /August 2026/i }); await expect(calendar).toBeVisible(); const calendarBox = await calendar.boundingBox(); expect(calendarBox!.width).toBeGreaterThan(300 * Number(factor) / 100);
  await expect(page).toHaveScreenshot('scaled-calendar-workspace.png', { animations: 'disabled' });
});
