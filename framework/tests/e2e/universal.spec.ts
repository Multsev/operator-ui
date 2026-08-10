import { expect, test, type Page } from "@playwright/test";

async function closeAll(page: Page) {
  await page.getByRole("button", { name: "Window" }).click();
  await page.getByRole("menuitem", { name: "Close All" }).click();
}

async function openValidation(page: Page, name: string) {
  await page.getByRole("button", { name: "View" }).click();
  await page.getByText("Composition validation", { exact: true }).hover();
  await page.getByRole("menuitem", { name, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/?freeze=1");
  await closeAll(page);
});

test("Jira-like TreeDetail shares DataView, SelectionModel, Inspector and Tabs", async ({
  page,
}) => {
  await openValidation(page, "Jira-like TreeDetail");
  await expect(
    page.getByRole("grid", { name: "Hierarchical issues" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "Details" })).toBeVisible();
  await page.getByRole("row").filter({ hasText: "OPS-51" }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "OPS-52" })
    .click({ modifiers: ["Shift"] });
  await expect(page.getByText(/selected · generic TreeDetail/)).toContainText(
    "2 selected",
  );
  await expect(page).toHaveScreenshot("universal-tree-detail.png", {
    animations: "disabled",
  });
  await page.getByRole("tab", { name: "Activity" }).click();
  await expect(page).toHaveScreenshot("universal-tabbed-inspector.png", {
    animations: "disabled",
  });
});

test("Mail-like MasterDetail ignores stale async body loads", async ({
  page,
}) => {
  await openValidation(page, "Mail-like MasterDetail");
  await page
    .getByRole("gridcell", { name: "Gateway maintenance window", exact: true })
    .click();
  await page
    .getByRole("gridcell", { name: "Release candidate ready", exact: true })
    .click();
  await expect(page.getByLabel("Message body")).toContainText(
    "Release candidate ready",
  );
  await expect(page.getByLabel("Message body")).not.toContainText(
    "Gateway maintenance window",
  );
  await expect(page).toHaveScreenshot("universal-master-detail.png", {
    animations: "disabled",
  });
});

test("CalendarWorkspace composes CalendarGrid, DataView and Inspector", async ({
  page,
}) => {
  await openValidation(page, "Calendar workspace");
  await expect(page.getByRole("grid", { name: /August 2026/i })).toBeVisible();
  await page.getByRole("gridcell", { name: "14" }).click();
  await expect(
    page.getByRole("gridcell", { name: "Change window", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("universal-calendar-workspace.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0,
  });
});

test("ObjectList commands have shared deterministic enablement", async ({
  page,
}) => {
  await openValidation(page, "File-like ObjectList");
  const remove = page.getByRole("button", { name: "Delete" });
  await expect(remove).toBeDisabled();
  await page.getByText("release-notes.txt", { exact: true }).click();
  await expect(remove).toBeEnabled();
  await remove.click();
  await expect(
    page.getByText("release-notes.txt", { exact: true }),
  ).toHaveCount(0);
  await expect(page).toHaveScreenshot("universal-object-list.png", {
    animations: "disabled",
  });
});

test("existing property and plain text tools cover Settings and Editor patterns", async ({
  page,
}) => {
  const launcher = page.getByRole("complementary", { name: "Tools" });
  await launcher.getByRole("button", { name: /^Interfaces/ }).click();
  await page.getByText("ether1-uplink", { exact: true }).dblclick();
  await expect(page.getByRole("tab", { name: "General" })).toBeVisible();
  await expect(page).toHaveScreenshot("universal-settings.png", {
    animations: "disabled",
  });
  await closeAll(page);
  await openValidation(page, "Plain-text Editor");
  await expect(
    page.getByRole("textbox", { name: "Plain text editor" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("universal-editor.png", {
    animations: "disabled",
  });
});
