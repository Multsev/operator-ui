import { expect, test } from '@playwright/test';

test('launcher activates a tool window and property editing stays inside MDI', async ({ page }) => {
  await page.goto('/?freeze=1'); await page.getByRole('complementary', { name: 'Tools' }).getByRole('button', { name: /Interfaces/ }).click();
  const interfaces = page.getByRole('region', { name: 'Interfaces' }); const grid = interfaces.getByRole('grid', { name: 'Interfaces' });
  await expect(grid).toHaveAttribute('aria-rowcount', '10001');
  await interfaces.locator('.ou-grid-row').first().dblclick();
  const properties = page.getByRole('region', { name: /Properties/ }); await expect(properties).toBeVisible();
  for (const tab of ['General', 'Status', 'Traffic', 'Advanced']) { await properties.getByRole('tab', { name: tab }).click(); await expect(properties.getByRole('tabpanel', { name: tab })).toBeVisible(); }
  await properties.getByRole('tab', { name: 'Traffic' }).click(); await expect(properties.getByRole('tabpanel', { name: 'Traffic' })).toContainText('RX rate');
  await properties.getByRole('button', { name: 'Cancel' }).click(); await expect(properties).toBeHidden();
  await interfaces.getByLabel('Find in Interfaces').fill('uplink');
  await expect(grid).toHaveAttribute('aria-rowcount', '2');
});

test('Window menu lays out, activates and closes child windows', async ({ page }) => {
  await page.goto('/?freeze=1'); const menu = page.getByRole('button', { name: 'Window' });
  await menu.click(); await expect(page.getByRole('menuitem', { name: 'Route List', exact: false })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Cascade' }).click();
  const cascade = await page.locator('.ou-mdi-window').evaluateAll((items) => items.map((item) => ({ x: parseInt((item as HTMLElement).style.left), y: parseInt((item as HTMLElement).style.top) })));
  expect(new Set(cascade.map((item) => `${item.x}:${item.y}`)).size).toBe(4);
  await menu.click(); await page.getByRole('menuitem', { name: 'Tile Horizontally' }).click();
  const tiled = await page.locator('.ou-mdi-window').evaluateAll((items) => items.map((item) => parseInt((item as HTMLElement).style.top)));
  expect(new Set(tiled).size).toBe(4);
  await menu.click(); await page.getByRole('menuitem', { name: 'Close All' }).click(); await expect(page.locator('.ou-mdi-window')).toHaveCount(0);
  await page.getByRole('complementary', { name: 'Tools' }).getByRole('button', { name: 'Terminal', exact: true }).click(); await expect(page.getByRole('region', { name: 'Terminal' })).toBeVisible();
});

test('child window moves, resizes to its minimum and persists', async ({ page }) => {
  await page.goto('/?freeze=1'); await page.getByRole('complementary', { name: 'Tools' }).getByRole('button', { name: /Routes/ }).click();
  const win = page.getByRole('region', { name: 'Route List' }); const before = await win.boundingBox(); if (!before) throw new Error('missing window');
  const title = win.locator('.ou-window-titlebar'); const titleBox = await title.boundingBox(); if (!titleBox) throw new Error('missing title');
  await page.mouse.move(titleBox.x + 120, titleBox.y + 10); await page.mouse.down(); await page.mouse.move(titleBox.x + 165, titleBox.y + 42); await page.mouse.up();
  const moved = await win.boundingBox(); expect(moved!.x).toBeGreaterThan(before.x + 30);
  const handle = win.locator('.ou-window-resize-handle.is-se'); const handleBox = await handle.boundingBox(); if (!handleBox) throw new Error('missing resize handle');
  await expect(win.locator('.ou-window-resize-handle')).toHaveCount(8);
  await page.mouse.move(handleBox.x + 4, handleBox.y + 4); await page.mouse.down(); await page.mouse.move(handleBox.x - 1000, handleBox.y - 1000); await page.mouse.up();
  const resized = await win.boundingBox(); expect(resized!.width).toBeGreaterThanOrEqual(440); expect(resized!.height).toBeGreaterThanOrEqual(230);
  await page.waitForTimeout(300); await page.reload(); const restored = await page.getByRole('region', { name: 'Route List' }).boundingBox(); expect(Math.round(restored!.x)).toBe(Math.round(resized!.x));
});

test('minimize, maximize and restore preserve child-window geometry', async ({ page }) => {
  await page.goto('/?freeze=1'); const win = page.getByRole('region', { name: 'Route List' }); const original = await win.boundingBox();
  await win.getByRole('button', { name: 'Minimize Route List' }).click(); await expect(win).toHaveAttribute('data-window-mode', 'minimized');
  await page.getByRole('complementary', { name: 'Tools' }).getByRole('button', { name: /Routes/ }).click(); await expect(win).toHaveAttribute('data-window-mode', 'normal');
  await win.getByRole('button', { name: 'Maximize Route List' }).click(); await expect(win).toHaveAttribute('data-window-mode', 'maximized');
  const maximized = await win.boundingBox(); expect(maximized!.width).toBeGreaterThan(original!.width);
  await win.getByRole('button', { name: 'Restore Route List' }).click(); const restored = await win.boundingBox();
  expect(Math.round(restored!.width)).toBe(Math.round(original!.width)); expect(Math.round(restored!.height)).toBe(Math.round(original!.height));
  await win.focus(); await page.keyboard.press('Alt+ArrowRight'); const keyboardMoved = await win.boundingBox(); expect(keyboardMoved!.x).toBeGreaterThan(restored!.x);
  await page.keyboard.press('Alt+Shift+ArrowRight'); const keyboardResized = await win.boundingBox(); expect(keyboardResized!.width).toBeGreaterThan(keyboardMoved!.width);
});
