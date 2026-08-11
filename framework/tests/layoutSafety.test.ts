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
});
