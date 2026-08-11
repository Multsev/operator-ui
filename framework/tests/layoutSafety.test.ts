import { describe, expect, it } from "vitest";
import { auditLayoutSafety } from "../src/testing/layoutSafety";

const box = (left: number, top: number, width: number, height: number) => ({
  x: left,
  y: top,
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  toJSON: () => ({}),
} as DOMRect);

describe("Layout Safety Contract", () => {
  it("reports clipped actions, undersized targets and unreachable MDI title bars", () => {
    document.body.innerHTML = `
      <div class="ou-command-toolbar"><button class="ou-compact-button" title="Run">Run</button></div>
      <div class="ou-mdi-workspace"><div class="ou-window-titlebar">Tool</div></div>
    `;
    const toolbar = document.querySelector<HTMLElement>(".ou-command-toolbar")!;
    const button = toolbar.querySelector<HTMLButtonElement>("button")!;
    const workspace = document.querySelector<HTMLElement>(".ou-mdi-workspace")!;
    const titlebar = workspace.querySelector<HTMLElement>(".ou-window-titlebar")!;
    toolbar.getBoundingClientRect = () => box(0, 0, 100, 28);
    button.getBoundingClientRect = () => box(90, 2, 20, 20);
    workspace.getBoundingClientRect = () => box(0, 40, 400, 300);
    titlebar.getBoundingClientRect = () => box(700, 700, 200, 24);
    expect(auditLayoutSafety(document).map((issue) => issue.rule)).toEqual([
      "clipped-action",
      "small-target",
      "unreachable-window",
    ]);
  });

  it("reports unmanaged command rows, clipped tabs and mixed toolbar density", () => {
    document.body.innerHTML = `
      <div class="ou-local-toolbar" role="toolbar"><button>A</button><button>B</button></div>
      <div class="ou-core-tabs-wrap"><div role="tab">Long tab</div><div class="ou-core-tab is-overflow-hidden"><button role="tab">Hidden</button></div></div>
    `;
    const toolbar = document.querySelector<HTMLElement>(".ou-local-toolbar")!;
    const controls = toolbar.querySelectorAll<HTMLElement>("button");
    const tabs = document.querySelector<HTMLElement>(".ou-core-tabs-wrap")!;
    const visibleTab = tabs.querySelector<HTMLElement>(":scope > [role='tab']")!;
    Object.defineProperty(toolbar, "clientWidth", { configurable: true, value: 100 });
    Object.defineProperty(toolbar, "scrollWidth", { configurable: true, value: 180 });
    toolbar.getBoundingClientRect = () => box(0, 0, 100, 28);
    controls[0].getBoundingClientRect = () => box(0, 0, 40, 24);
    controls[1].getBoundingClientRect = () => box(42, 0, 40, 28);
    tabs.getBoundingClientRect = () => box(0, 40, 100, 25);
    visibleTab.getBoundingClientRect = () => box(70, 40, 60, 24);
    expect(auditLayoutSafety(document).map((issue) => issue.rule)).toEqual(expect.arrayContaining([
      "unmanaged-action-overflow",
      "mixed-control-height",
      "clipped-tab",
      "missing-overflow",
    ]));
  });

  it("reports an icon or label escaping an otherwise valid command button", () => {
    document.body.innerHTML = `<button class="ou-compact-button" title="Обновить"><svg></svg><span class="ou-command-label">Обновить</span></button>`;
    const button = document.querySelector<HTMLButtonElement>("button")!;
    const icon = button.querySelector<SVGElement>("svg")!;
    const label = button.querySelector<HTMLElement>(".ou-command-label")!;
    button.getBoundingClientRect = () => box(0, 0, 100, 24);
    icon.getBoundingClientRect = () => box(4, -2, 24, 24);
    label.getBoundingClientRect = () => box(32, 16, 64, 14);
    Object.defineProperty(button, "clientHeight", { configurable: true, value: 24 });
    Object.defineProperty(button, "scrollHeight", { configurable: true, value: 30 });

    expect(auditLayoutSafety(document).map((issue) => issue.rule)).toEqual([
      "clipped-action-content",
      "clipped-action-content",
      "clipped-action-content",
    ]);
  });
});
