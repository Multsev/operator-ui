import { expect, test } from '@playwright/test';

test('critical controls have roles, labels and visible focus', async ({ page }) => {
  await page.goto('/?freeze=1');
  await expect(page.getByRole('navigation', { name: 'Application menu' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Tools' })).toBeVisible();
  await expect(page.getByRole('scrollbar', { name: 'Workspace horizontal scroll' })).toBeVisible();
  await page.getByRole('complementary', { name: 'Tools' }).getByRole('button', { name: /Interfaces/ }).click();
  const window = page.getByRole('region', { name: 'Interfaces' });
  await expect(window.getByRole('toolbar', { name: 'Interfaces commands' })).toBeVisible();
  await expect(window.getByRole('grid', { name: 'Interfaces' })).toHaveAttribute('aria-rowcount', '10001');
  const add = window.getByRole('button', { name: 'Add', exact: true }); await add.focus();
  const outline = await add.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe('none');
});

test('layout has no horizontal page overflow', async ({ page }) => {
  await page.goto('/');
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBe(sizes.client);
});

test('compact property tabs use desktop keyboard navigation', async ({ page }) => {
  await page.goto('/?freeze=1'); await page.getByRole('complementary', { name: 'Tools' }).getByRole('button', { name: /Interfaces/ }).click();
  await page.getByRole('region', { name: 'Interfaces' }).locator('.ou-grid-row').first().dblclick();
  const properties = page.getByRole('region', { name: /Properties/ });
  const general = properties.getByRole('tab', { name: 'General' }); await general.focus(); await page.keyboard.press('ArrowRight');
  await expect(properties.getByRole('tab', { name: 'Status' })).toBeFocused();
  await expect(properties.getByRole('tabpanel', { name: 'Status' })).toBeVisible();
});
