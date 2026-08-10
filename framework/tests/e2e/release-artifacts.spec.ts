import { expect, test, type Page } from '@playwright/test';

const output = (name: string) => `artifacts/final-screenshots/${name}.png`;
async function shot(page: Page, name: string) { await page.screenshot({ path: output(name), animations: 'disabled' }); }

test('generate Operator UI v1 Stable release evidence', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?freeze=1'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await expect(page.locator('.ou-mdi-window')).toHaveCount(4);
  await shot(page, '01-main-workspace-light');
  await page.getByRole('button', { name: 'View' }).click(); await page.getByRole('menuitem', { name: 'Dark theme' }).click(); await shot(page, '02-main-workspace-dark');
  await page.getByRole('button', { name: 'View' }).click(); await page.getByRole('menuitem', { name: 'Light theme' }).click();

  await page.getByRole('button', { name: 'Window' }).click(); await page.getByRole('menuitem', { name: 'Close All' }).click();
  const launcher = page.getByRole('complementary', { name: 'Tools' });
  await launcher.getByRole('button', { name: /Interfaces/ }).click(); await launcher.getByRole('button', { name: /Routes/ }).click(); await shot(page, '03-two-overlapping-windows');
  await launcher.getByRole('button', { name: /Firewall/ }).click(); await launcher.getByRole('button', { name: /^Log/ }).click(); await shot(page, '04-four-partial-overlap');

  const routes = page.getByRole('region', { name: 'Route List' });
  await routes.getByRole('button', { name: 'Maximize Route List' }).click(); await shot(page, '05-maximized-child-window');
  await routes.getByRole('button', { name: 'Restore Route List' }).click(); await routes.getByRole('button', { name: 'Minimize Route List' }).click(); await shot(page, '06-minimized-child-window');
  await launcher.getByRole('button', { name: /Routes/ }).click();
  const handle = routes.locator('.ou-window-resize-handle.is-se'); const handleBox = await handle.boundingBox(); if (!handleBox) throw new Error('Missing resize handle');
  await page.mouse.move(handleBox.x + 3, handleBox.y + 3); await page.mouse.down(); await page.mouse.move(handleBox.x - 900, handleBox.y - 700); await page.mouse.up(); await shot(page, '07-minimum-size-child-window');
  const titleBox = await routes.locator('.ou-window-titlebar').boundingBox(); if (!titleBox) throw new Error('Missing title bar');
  await page.mouse.move(titleBox.x + 100, titleBox.y + 10); await page.mouse.down(); await page.mouse.move(1280, 780); await page.mouse.up(); await shot(page, '08-edge-placement-and-workspace-overflow');

  await page.setViewportSize({ width: 1024, height: 768 }); await shot(page, '09-compact-viewport-overflow');
  await page.setViewportSize({ width: 1440, height: 900 });
  const interfaces = page.getByRole('region', { name: 'Interfaces' }); await interfaces.locator('.ou-grid-row').first().dblclick();
  const properties = page.getByRole('region', { name: /Properties/ }); await expect(properties).toBeVisible(); await shot(page, '10-modeless-properties-general');
  await properties.getByRole('textbox', { name: 'Name' }).fill(''); await shot(page, '11-properties-inline-validation');
  await properties.getByRole('button', { name: 'Cancel' }).click();
  await interfaces.locator('.ou-grid-row').first().click({ button: 'right' }); await expect(page.getByRole('menu')).toBeVisible(); await shot(page, '12-datagrid-context-menu'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Window' }).click(); await shot(page, '13-window-menu-and-z-order'); await page.getByRole('button', { name: 'Window' }).click();

  await page.getByRole('button', { name: 'Window' }).click(); await page.getByRole('menuitem', { name: 'Cascade' }).click(); await shot(page, '16-cascade-layout');
  await page.getByRole('button', { name: 'Window' }).click(); await page.getByRole('menuitem', { name: 'Tile Vertically' }).click(); await shot(page, '17-tile-layout');
  await launcher.getByRole('button', { name: 'Terminal', exact: true }).click(); const terminal = page.getByRole('region', { name: 'Terminal' }); await terminal.getByRole('button', { name: 'Maximize Terminal' }).click(); await shot(page, '18-terminal-window'); await terminal.getByRole('button', { name: 'Restore Terminal' }).click();
  await page.setViewportSize({ width: 800, height: 600 }); await shot(page, '19-viewport-800x600'); await page.setViewportSize({ width: 1920, height: 1080 }); await shot(page, '20-viewport-1920x1080'); await page.setViewportSize({ width: 2560, height: 1440 }); await shot(page, '21-viewport-2560x1440'); await page.setViewportSize({ width: 1440, height: 900 });
  await launcher.getByRole('button', { name: /Firewall/ }).click(); const firewall = page.getByRole('region', { name: 'Firewall' }); await firewall.getByRole('button', { name: 'Maximize Firewall' }).click(); await shot(page, '22-firewall-window'); await firewall.getByRole('button', { name: 'Restore Firewall' }).click(); await launcher.getByRole('button', { name: /^Log/ }).click(); const log = page.getByRole('region', { name: 'Log' }); await log.getByRole('button', { name: 'Maximize Log' }).click(); await shot(page, '23-log-window'); await log.getByRole('button', { name: 'Restore Log' }).click();

  await page.getByRole('button', { name: 'View' }).click(); await page.getByRole('menuitem', { name: 'UI Gallery — Developer' }).click();
  const gallery = page.getByRole('region', { name: 'UI Gallery — Developer' }); await gallery.getByRole('button', { name: 'Maximize UI Gallery — Developer' }).click(); await shot(page, '14-framework-gallery');
  await gallery.locator('.ou-gallery').evaluate((element) => { element.scrollTop = element.scrollHeight; }); await expect(gallery.getByRole('grid', { name: '25 column stress grid' })).toBeVisible(); await shot(page, '15-wide-grid-25-columns');
});
