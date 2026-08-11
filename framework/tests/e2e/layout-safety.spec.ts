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
    const geometry = controls.map((control) => ({
      name: control.getAttribute("aria-label") || control.textContent || control.tagName,
      height: control.getBoundingClientRect().height,
      cssHeight: getComputedStyle(control).height,
      fontSize: getComputedStyle(control).fontSize,
    })).filter((item) => item.height > 0);
    const heights = geometry.map((item) => item.height);
    const labelledCommands = [...element.querySelectorAll<HTMLElement>("button.ou-compact-button")]
      .filter((button) => button.querySelector(":scope > svg") && button.querySelector(":scope > .ou-command-label"))
      .map((button) => {
        const buttonBounds = button.getBoundingClientRect();
        const iconBounds = button.querySelector(":scope > svg")!.getBoundingClientRect();
        const labelBounds = button.querySelector<HTMLElement>(":scope > .ou-command-label")!.getBoundingClientRect();
        return {
          display: getComputedStyle(button).display,
          scrollHeight: button.scrollHeight,
          clientHeight: button.clientHeight,
          iconWidth: iconBounds.width,
          iconInside: iconBounds.top >= buttonBounds.top - 1 && iconBounds.bottom <= buttonBounds.bottom + 1,
          labelInside: labelBounds.top >= buttonBounds.top - 1 && labelBounds.bottom <= buttonBounds.bottom + 1,
        };
      });
    return {
      clipped: controls.some((control) => {
        const rect = control.getBoundingClientRect();
        return rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
      }),
      small: controls.some((control) => {
        const rect = control.getBoundingClientRect();
        return rect.width < 24 || rect.height < 24;
      }),
      heights,
      geometry,
      labelledCommands,
    };
  });
  const assertSafe = async () => {
    const result = await inspect();
    expect(result.clipped).toBe(false);
    expect(result.small).toBe(false);
    expect(Math.max(...result.heights) - Math.min(...result.heights), JSON.stringify(result.geometry)).toBeLessThanOrEqual(2);
    expect(result.labelledCommands.length).toBeGreaterThan(0);
    for (const command of result.labelledCommands) {
      expect(["flex", "inline-flex"]).toContain(command.display);
      expect(command.scrollHeight).toBeLessThanOrEqual(command.clientHeight + 1);
      expect(command.iconWidth).toBeLessThanOrEqual(16);
      expect(command.iconInside).toBe(true);
      expect(command.labelInside).toBe(true);
    }
  };
  await assertSafe();
  await page.evaluate(() => document.documentElement.style.setProperty("--ou-font-size", "20px"));
  await expect(toolbar).toBeVisible();
  await assertSafe();
  await expect(toolbar).toHaveScreenshot("layout-safe-toolbar-font-20.png", { animations: "disabled" });
});

test("narrow tab sets preserve whole labels through a reachable overflow menu", async ({ page }) => {
  await page.goto("/?freeze=1");
  await page.getByRole("button", { name: "View" }).click();
  await page.getByRole("menuitem", { name: "UI Gallery — Developer" }).click();
  const gallery = page.getByRole("region", { name: "UI Gallery — Developer" });
  await gallery.getByRole("button", { name: "Maximize UI Gallery — Developer" }).click();
  const tabs = gallery.getByRole("tablist", { name: "Layout safety tabs" });
  const overflow = tabs.locator("..").getByRole("button", { name: "More tabs" });
  await expect(overflow).toBeVisible();
  const visibleTabs = tabs.getByRole("tab");
  for (const tab of await visibleTabs.all()) {
    const geometry = await tab.evaluate((element) => ({
      visible: getComputedStyle(element).display !== "none" && !element.closest(".is-overflow-hidden"),
      text: element.textContent,
      title: (element as HTMLElement).title,
      truncated: element.scrollWidth > element.clientWidth + 1,
    }));
    if (!geometry.visible) continue;
    expect(geometry.truncated ? geometry.title : geometry.text).toBeTruthy();
  }
  await overflow.focus();
  await page.keyboard.press("ArrowDown");
  const menu = page.getByRole("menu");
  await expect(menu.getByRole("menuitem", { name: "Комментарии и история" })).toBeVisible();
  await expect(menu.getByRole("menuitem").first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(menu.getByRole("menuitem").last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(overflow).toBeFocused();
});
