export type LayoutSafetyIssue = {
  rule:
    | "clipped-action"
    | "clipped-label"
    | "clipped-tab"
    | "missing-overflow"
    | "unmanaged-action-overflow"
    | "mixed-control-height"
    | "root-overflow"
    | "small-target"
    | "unreachable-window";
  element: HTMLElement;
  message: string;
};

const visible = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
};

const rectInside = (child: DOMRect, parent: DOMRect, tolerance: number) =>
  child.left >= parent.left - tolerance &&
  child.top >= parent.top - tolerance &&
  child.right <= parent.right + tolerance &&
  child.bottom <= parent.bottom + tolerance;

/**
 * Runtime-neutral DOM audit for component tests and Playwright checks.
 * It reports only actionable layout failures; structured scrollers remain valid.
 */
export function auditLayoutSafety(
  root: ParentNode = document,
  { tolerance = 1 }: { tolerance?: number } = {},
): LayoutSafetyIssue[] {
  const issues: LayoutSafetyIssue[] = [];
  const documentRoot = root instanceof Document ? root.documentElement : null;
  if (documentRoot && (documentRoot.scrollWidth > documentRoot.clientWidth + tolerance || documentRoot.scrollHeight > documentRoot.clientHeight + tolerance)) {
    issues.push({
      rule: "root-overflow",
      element: documentRoot,
      message: "Application content grows the document root; keep overflow inside its owning primitive.",
    });
  }
  root.querySelectorAll<HTMLElement>(".ou-command-toolbar").forEach((toolbar) => {
    const bounds = toolbar.getBoundingClientRect();
    toolbar
      .querySelectorAll<HTMLElement>("button:not([hidden]), input:not([hidden]), select:not([hidden])")
      .forEach((control) => {
        if (!visible(control) || control.closest(".is-overflow-hidden")) return;
        if (!rectInside(control.getBoundingClientRect(), bounds, tolerance)) {
          issues.push({
            rule: "clipped-action",
            element: control,
            message: "A visible command is outside its toolbar; move it to overflow.",
          });
        }
      });
  });

  root.querySelectorAll<HTMLElement>(".ou-local-toolbar:not(.ou-command-toolbar)").forEach((toolbar) => {
    if (toolbar.scrollWidth > toolbar.clientWidth + tolerance && toolbar.querySelectorAll("button").length > 1) {
      issues.push({
        rule: "unmanaged-action-overflow",
        element: toolbar,
        message: "A local action row overflows without CommandToolbar priority management.",
      });
    }
  });

  root.querySelectorAll<HTMLElement>("[role='toolbar']").forEach((toolbar) => {
    const heights = [...toolbar.querySelectorAll<HTMLElement>("button, input, select")]
      .filter((control) => visible(control) && !control.closest(".is-overflow-hidden"))
      .map((control) => control.getBoundingClientRect().height)
      .filter((height) => height > 0);
    if (heights.length > 1 && Math.max(...heights) - Math.min(...heights) > 2) {
      issues.push({
        rule: "mixed-control-height",
        element: toolbar,
        message: "Controls in one toolbar must use the same density tier.",
      });
    }
  });

  root.querySelectorAll<HTMLElement>(".ou-core-tabs-wrap").forEach((tabs) => {
    const bounds = tabs.getBoundingClientRect();
    tabs.querySelectorAll<HTMLElement>("[role='tab']").forEach((tab) => {
      if (!visible(tab) || tab.closest(".is-overflow-hidden")) return;
      if (!rectInside(tab.getBoundingClientRect(), bounds, tolerance)) {
        issues.push({
          rule: "clipped-tab",
          element: tab,
          message: "A visible tab is clipped; move it to the tab overflow menu.",
        });
      }
      if (tab.scrollWidth > tab.clientWidth + tolerance && !tab.title) {
        issues.push({
          rule: "clipped-label",
          element: tab,
          message: "A truncated tab requires its full label in title.",
        });
      }
    });
    if (tabs.querySelector(".is-overflow-hidden") && !tabs.querySelector(".ou-tab-overflow > button")) {
      issues.push({
        rule: "missing-overflow",
        element: tabs,
        message: "Hidden tabs require a reachable overflow menu.",
      });
    }
  });

  root.querySelectorAll<HTMLElement>(
    "button.ou-button, button.ou-compact-button, button.ou-toolbar-button-16, .ou-menubar button, .ou-floating-menu button, .ou-window-controls button, .ou-command-overflow > button, .ou-tab-overflow > button",
  ).forEach((button) => {
    if (!visible(button)) return;
    if (button.scrollWidth > button.clientWidth + tolerance && !button.title) {
      issues.push({
        rule: "clipped-label",
        element: button,
        message: "A truncated button label requires a full title.",
      });
    }
    const rect = button.getBoundingClientRect();
    if ((rect.width > 0 && rect.width < 24) || (rect.height > 0 && rect.height < 24)) {
      issues.push({
        rule: "small-target",
        element: button,
        message: "Interactive targets must be at least 24 by 24 CSS pixels.",
      });
    }
  });

  root.querySelectorAll<HTMLElement>(".ou-mdi-workspace").forEach((workspace) => {
    const bounds = workspace.getBoundingClientRect();
    workspace.querySelectorAll<HTMLElement>(".ou-window-titlebar").forEach((titlebar) => {
      const rect = titlebar.getBoundingClientRect();
      const reachable =
        rect.right >= bounds.left + 24 &&
        rect.left <= bounds.right - 24 &&
        rect.bottom >= bounds.top + 12 &&
        rect.top <= bounds.bottom - 12;
      if (!reachable) {
        issues.push({
          rule: "unreachable-window",
          element: titlebar,
          message: "An MDI title bar is not reachable inside the workspace.",
        });
      }
    });
  });
  return issues;
}

export function assertLayoutSafety(root: ParentNode = document) {
  const issues = auditLayoutSafety(root);
  if (!issues.length) return;
  throw new Error(
    issues.map((issue) => `${issue.rule}: ${issue.message}`).join("\n"),
  );
}
