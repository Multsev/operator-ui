import { expect, test } from '@playwright/test';

async function closeAll(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Window' }).click();
  await page.getByRole('menuitem', { name: 'Close All' }).click();
}

async function openTools(page: import('@playwright/test').Page, tools: string[]) {
  const launcher = page.getByRole('complementary', { name: 'Tools' });
  for (const tool of tools) await launcher.getByRole('button', { name: new RegExp(`^${tool}`) }).click();
}

test('MDI visual regression matrix', async ({ page }) => {
  await page.goto('/?freeze=1'); const width = page.viewportSize()!.width;
  if (width === 1024) {
    await closeAll(page); await openTools(page, ['Interfaces', 'Routes']);
    await expect(page).toHaveScreenshot('mdi-interfaces-routes-light.png', { animations: 'disabled' });
    await closeAll(page); await openTools(page, ['Firewall', 'Log']);
    await expect(page).toHaveScreenshot('mdi-firewall-log-light.png', { animations: 'disabled' });
  } else if (width === 1366) {
    await expect(page.locator('.ou-mdi-window')).toHaveCount(4);
    await expect(page).toHaveScreenshot('mdi-four-windows-light.png', { animations: 'disabled' });
    await page.getByRole('button', { name: 'View' }).click(); await page.getByRole('menuitem', { name: 'Dark theme' }).click();
    await expect(page).toHaveScreenshot('mdi-four-windows-dark.png', { animations: 'disabled' });
  } else if (width === 1920) {
    await openTools(page, ['Terminal', 'Users']); await expect(page.locator('.ou-mdi-window')).toHaveCount(6);
    await expect(page).toHaveScreenshot('mdi-six-windows-light.png', { animations: 'disabled' });
  } else if (width === 800) {
    await expect(page.locator('.ou-mdi-window')).toHaveCount(4);
    await expect(page).toHaveScreenshot('mdi-overflow-800-light.png', { animations: 'disabled' });
  } else if (width === 2560) {
    await openTools(page, ['Terminal', 'Users', 'Files']);
    await expect(page).toHaveScreenshot('mdi-large-workspace-light.png', { animations: 'disabled' });
  }
});
