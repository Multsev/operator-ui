import { expect, test } from '@playwright/test';

const sizes = [[800, 600], [1024, 768], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440], [3440, 1440]] as const;

test('desktop viewport matrix keeps the shell bounded and MDI canvas scrollable', async ({ page }) => {
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height }); await page.goto('/');
    const result = await page.evaluate(() => {
      const workspace = document.querySelector<HTMLElement>('.ou-mdi-workspace')!;
      const status = document.querySelector('.ou-global-status')!.getBoundingClientRect();
      const body = document.querySelector('.ou-desktop-body')!.getBoundingClientRect();
      return { pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, order: body.bottom <= status.top + 1, windowCount: document.querySelectorAll('.ou-mdi-window').length, workspaceOverflow: workspace.scrollWidth > workspace.clientWidth || workspace.scrollHeight > workspace.clientHeight };
    });
    expect(result.pageOverflow, `${width}x${height}`).toBe(false); expect(result.order).toBe(true); expect(result.windowCount).toBe(4); if (width === 800) expect(result.workspaceOverflow).toBe(true);
    if (width === 800) { const horizontal = page.getByRole('scrollbar', { name: 'Workspace horizontal scroll' }); await expect(horizontal).toBeVisible(); await horizontal.focus(); await page.keyboard.press('ArrowRight'); await expect(horizontal).not.toHaveAttribute('aria-valuenow', '0'); const thumb = horizontal.locator('span'); const thumbBox = await thumb.boundingBox(); if (!thumbBox) throw new Error('missing scrollbar thumb'); const beforeDrag = Number(await horizontal.getAttribute('aria-valuenow')); await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2); await page.mouse.down(); await page.mouse.move(thumbBox.x + thumbBox.width / 2 + 80, thumbBox.y + thumbBox.height / 2); await page.mouse.up(); await expect.poll(async () => Number(await horizontal.getAttribute('aria-valuenow'))).toBeGreaterThan(beforeDrag); const vertical = page.getByRole('scrollbar', { name: 'Workspace vertical scroll' }); await vertical.focus(); await page.keyboard.press('End'); await expect(vertical).not.toHaveAttribute('aria-valuenow', '0'); const scrolled = await page.getByTestId('mdi-workspace').evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })); expect(scrolled.left + scrolled.top).toBeGreaterThan(0); }
  }
});
