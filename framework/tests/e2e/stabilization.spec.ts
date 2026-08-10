import { expect, test } from '@playwright/test';

test('modeless properties validate, apply, cancel and restore the owner', async ({ page }) => {
  await page.goto('/?freeze=1'); const interfaces = page.getByRole('region', { name: 'Interfaces' });
  await interfaces.locator('.ou-grid-row').first().dblclick(); const properties = page.getByRole('region', { name: /Properties/ });
  await expect(properties.getByRole('textbox', { name: 'Name' })).toBeFocused();
  await properties.getByRole('textbox', { name: 'Name' }).fill(''); await expect(properties.getByRole('alert')).toContainText('required');
  await expect(properties.getByRole('button', { name: 'OK' })).toBeDisabled(); await expect(properties.getByRole('button', { name: 'Apply' })).toBeDisabled();
  await properties.getByRole('textbox', { name: 'Name' }).fill('uplink-renamed'); await properties.getByLabel('MTU').fill('1600'); await properties.getByLabel('Comment').fill('persisted comment'); await properties.getByRole('checkbox', { name: 'Enabled' }).uncheck(); await properties.getByRole('tab', { name: 'Advanced' }).click(); await properties.getByLabel('ARP').selectOption('disabled'); await properties.getByRole('checkbox', { name: 'Enabled' }).check(); await expect(properties.getByRole('button', { name: 'Apply' })).toBeEnabled();
  await properties.getByRole('button', { name: 'Apply' }).click(); await expect(properties).toBeVisible(); await expect(properties.getByRole('button', { name: 'Apply' })).toBeDisabled();
  await page.keyboard.press('Escape'); await expect(properties).toBeHidden(); await expect(interfaces).toHaveClass(/is-active/); await interfaces.locator('.ou-grid-row').first().dblclick(); const reopened = page.getByRole('region', { name: /Properties/ }); await expect(reopened.getByRole('textbox', { name: 'Name' })).toHaveValue('uplink-renamed'); await expect(reopened.getByLabel('MTU')).toHaveValue('1600'); await expect(reopened.getByLabel('Comment')).toHaveValue('persisted comment'); await expect(reopened.getByRole('checkbox', { name: 'Enabled' })).not.toBeChecked(); await reopened.getByRole('tab', { name: 'Advanced' }).click(); await expect(reopened.getByLabel('ARP')).toHaveValue('disabled'); await expect(reopened.getByRole('checkbox', { name: 'Enabled' })).toBeChecked();
});

test('DataGrid context menu selects target, clamps and restores keyboard focus', async ({ page }) => {
  await page.goto('/?freeze=1'); await page.getByRole('complementary', { name: 'Tools' }).getByRole('button', { name: /Interfaces/ }).click(); const interfaces = page.getByRole('region', { name: 'Interfaces' }); const row = interfaces.locator('.ou-grid-row').nth(2);
  await row.click({ button: 'right', position: { x: 100, y: 10 } }); const menu = page.getByRole('menu'); await expect(menu).toBeVisible(); await expect(row).toHaveAttribute('aria-selected', 'true');
  expect(await menu.evaluate((element) => element.parentElement === document.body)).toBe(true);
  await expect(menu.getByRole('menuitem', { name: 'Export selection…' }).locator('span').nth(1)).toHaveCSS('white-space', 'nowrap');
  const copyItem = menu.getByRole('menuitem', { name: /Copy selected/ }); const copyTitle = await copyItem.locator('span').nth(1).boundingBox(); const copyShortcut = await copyItem.locator('kbd').boundingBox(); expect(copyShortcut!.x - (copyTitle!.x + copyTitle!.width)).toBeGreaterThanOrEqual(6);
  const box = await menu.boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.y).toBeGreaterThanOrEqual(0);
  await expect(menu.getByRole('menuitem', { name: 'Export selection…' })).toBeDisabled(); await page.keyboard.press('End'); await page.keyboard.press('Escape'); await expect(menu).toBeHidden();
  await row.click({ button: 'right', position: { x: 100, y: 10 } }); await page.getByRole('menuitem', { name: 'Disable' }).click(); await expect(menu).toBeHidden();
});

test('25-column grid keeps header aligned while horizontally scrolling', async ({ page }) => {
  await page.goto('/?freeze=1'); await page.getByRole('button', { name: 'View' }).click(); await page.getByRole('menuitem', { name: 'UI Gallery — Developer' }).click();
  const gallery = page.getByRole('region', { name: 'UI Gallery — Developer' }); await gallery.getByRole('button', { name: 'Maximize UI Gallery — Developer' }).click();
  await gallery.locator('.ou-gallery').evaluate((element) => { element.scrollTop = element.scrollHeight; }); const grid = gallery.getByRole('grid', { name: '25 column stress grid' });
  for (const count of ['6', '12', '20', '25']) { await gallery.getByRole('tab', { name: count, exact: true }).click(); await expect(gallery.getByRole('grid', { name: `${count} column stress grid` })).toHaveAttribute('aria-colcount', count); }
  const viewport = grid.locator('.ou-grid-viewport'); await viewport.evaluate((element) => { element.scrollLeft = element.scrollWidth; element.dispatchEvent(new Event('scroll')); });
  const lastHeader = grid.getByRole('columnheader', { name: /Column 25/ }); const lastCell = grid.getByRole('row').nth(1).getByRole('gridcell').nth(24);
  const headerBox = await lastHeader.boundingBox(); const cellBox = await lastCell.boundingBox(); expect(Math.abs(headerBox!.x - cellBox!.x)).toBeLessThan(2);
});
