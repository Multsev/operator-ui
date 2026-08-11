import { expect, test } from "@playwright/test";

test("priority toolbar keeps every command reachable without clipping", async ({ page }) => {
  await page.goto("/?freeze=1");
  await page.getByRole("button", { name: "View" }).click();
  await page.getByRole("menuitem", { name: "UI Gallery — Developer" }).click();
  const gallery = page.getByRole("region", { name: "UI Gallery — Developer" });
  await gallery.getByRole("button", { name: "Maximize UI Gallery — Developer" }).click();
  const toolbar = gallery.getByRole("toolbar", { name: "Layout safety commands" });
  const overflow = toolbar.getByRole("button", { name: "More actions" });
  await expect(overflow).toBeVisible();
  await expect(toolbar).toHaveScreenshot("layout-safe-toolbar.png", { animations: "disabled" });
  await overflow.click();
  await expect(page.getByRole("menuitem", { name: "Разобрать с помощью ИИ" })).toBeVisible();
  await expect(page.getByRole("menu")).toHaveScreenshot("layout-safe-toolbar-menu.png", { animations: "disabled" });
  await page.keyboard.press("Escape");
  const inspect = () => toolbar.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const controls = [...element.querySelectorAll<HTMLElement>("button, input, select")]
      .filter((control) => getComputedStyle(control).display !== "none" && !control.closest(".is-overflow-hidden"))
    return {
      clipped: controls.some((control) => {
        const rect = control.getBoundingClientRect();
        return rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
      }),
      small: controls.some((control) => {
        const rect = control.getBoundingClientRect();
        return rect.width < 24 || rect.height < 24;
      }),
    };
  });
  expect(await inspect()).toEqual({ clipped: false, small: false });
  await page.evaluate(() => document.documentElement.style.setProperty("--ou-font-size", "20px"));
  await expect(toolbar).toBeVisible();
  expect(await inspect()).toEqual({ clipped: false, small: false });
});
