import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CalendarGrid } from "../src/components/CalendarGrid";
import { CommandMenu, CommandMenuItem, CommandToolbar, selectToolbarOverflow } from "../src/components/CommandUI";
import { DataView, type DataViewColumn } from "../src/components/DataView";
import { Tabs } from "../src/components/Tabs";
import { SplitView } from "../src/components/SplitView";
import { Menu } from "../src/components/shell";
import {
  AsyncTask,
  CommandRegistry,
  InMemoryDataSource,
  PersistenceStore,
  SelectionModel,
  selectionIntent,
} from "../src/framework";

describe("SelectionModel", () => {
  it("supports single, toggle, range, select all and clear", () => {
    const model = new SelectionModel<string>();
    const keys = ["a", "b", "c", "d"];
    model.select("b", keys);
    expect([...model.getSnapshot().selected]).toEqual(["b"]);
    model.select("d", keys, { range: true });
    expect([...model.getSnapshot().selected]).toEqual(["b", "c", "d"]);
    model.select("c", keys, { toggle: true });
    expect(model.isSelected("c")).toBe(false);
    model.selectAll(keys);
    expect(model.selectedCount).toBe(4);
    model.clear();
    expect(model.selectedCount).toBe(0);
  });
  it("maps Ctrl/Cmd to toggle and Shift to range", () => {
    expect(selectionIntent({ ctrlKey: true })).toEqual({
      range: false,
      toggle: true,
    });
    expect(selectionIntent({ metaKey: true, shiftKey: true })).toEqual({
      range: true,
      toggle: true,
    });
  });
});

describe("CommandRegistry", () => {
  it("shares enablement and execution between toolbar, menu and shortcut", async () => {
    const execute = vi.fn();
    const registry = new CommandRegistry<{ allowed: boolean }>();
    registry.register({
      id: "delete",
      title: "Delete",
      icon: "delete",
      shortcut: "Ctrl+Delete",
      enabled: ({ allowed }) => allowed,
      execute,
    });
    const { rerender } = render(
      <>
        <CommandToolbar
          registry={registry}
          commandIds={["delete"]}
          context={{ allowed: false }}
        />
        <CommandMenuItem
          registry={registry}
          commandId="delete"
          context={{ allowed: false }}
        />
      </>,
    );
    expect(
      screen
        .getAllByRole("button")
        .every((button) => button.hasAttribute("disabled")),
    ).toBe(true);
    rerender(
      <>
        <CommandToolbar
          registry={registry}
          commandIds={["delete"]}
          context={{ allowed: true }}
        />
        <CommandMenuItem
          registry={registry}
          commandId="delete"
          context={{ allowed: true }}
        />
      </>,
    );
    await userEvent.click(screen.getAllByRole("button")[0]);
    const event = new KeyboardEvent("keydown", {
      key: "Delete",
      ctrlKey: true,
      cancelable: true,
    });
    expect(await registry.dispatchShortcut(event, { allowed: true })).toBe(
      true,
    );
    expect(execute).toHaveBeenCalledTimes(2);
  });
  it("adapts the same command into a menu bar entry", async () => {
    const execute = vi.fn(); const registry = new CommandRegistry<{ allowed: boolean }>();
    registry.register({ id: "refresh", title: "Refresh objects", shortcut: "F5", execute });
    render(<CommandMenu label="Object" registry={registry} commandIds={["refresh"]} context={{ allowed: true }} />);
    await userEvent.click(screen.getByRole("button", { name: "Object" }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Refresh objects/ }));
    expect(execute).toHaveBeenCalledOnce();
  });
  it("renders a distinct external-link command icon", () => {
    const registry = new CommandRegistry();
    registry.register({ id: "open", title: "Open externally", icon: "external", execute: vi.fn() });
    const { container } = render(<CommandToolbar registry={registry} commandIds={["open"]} context={{}} />);
    expect(container.querySelector(".lucide-external-link")).toBeInTheDocument();
  });
  it("isolates a labelled command icon from its single-line label", () => {
    const registry = new CommandRegistry();
    registry.register({ id: "refresh", title: "Refresh objects", icon: "refresh", execute: vi.fn() });
    const { container } = render(<CommandToolbar registry={registry} commandIds={["refresh"]} labels={{ refresh: "Обновить рабочую область" }} context={{}} />);
    const button = screen.getByRole("button", { name: "Refresh objects" });
    expect(button).toHaveClass("ou-compact-button");
    expect(button.querySelector(":scope > svg")).toBeInTheDocument();
    expect(button.querySelector(":scope > .ou-command-label")).toHaveTextContent("Обновить рабочую область");
    expect(container.querySelectorAll(".ou-command-label")).toHaveLength(1);
  });
  it("never renders an empty compact command when an icon is unavailable", () => {
    const registry = new CommandRegistry();
    registry.register({ id: "diagnose", title: "Run diagnostics", execute: vi.fn() });
    render(<CommandToolbar registry={registry} commandIds={["diagnose"]} context={{}} />);
    const button = screen.getByRole("button", { name: "Run diagnostics" });
    expect(button).toHaveTextContent("Run diagnostics");
    expect(button).toHaveClass("ou-compact-button");
  });
  it("moves lower-priority commands into measured overflow", () => {
    expect(selectToolbarOverflow([
      { id: "compose", width: 70, priority: "essential" },
      { id: "filter", width: 70, priority: "primary" },
      { id: "export", width: 70, priority: "secondary" },
    ], 130)).toEqual(new Set(["export", "filter"]));
  });
  it("renders measured overflow commands through the shared menu", async () => {
    const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return (this as HTMLElement).classList.contains("ou-command-toolbar") ? 130 : 0; } });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return (this as HTMLElement).classList.contains("ou-command-slot") ? 70 : 0; } });
    try {
      const registry = new CommandRegistry();
      registry.register({ id: "compose", title: "Compose", execute: vi.fn() });
      registry.register({ id: "filter", title: "Filter", execute: vi.fn() });
      registry.register({ id: "export", title: "Export", execute: vi.fn() });
      render(<CommandToolbar registry={registry} commandIds={["compose", "filter", "export"]} priorities={{ compose: "essential", export: "secondary" }} context={{}} />);
      const more = await screen.findByRole("button", { name: "More actions" });
      await userEvent.click(more);
      expect(screen.getByRole("menuitem", { name: "Export" })).toBeVisible();
      expect(screen.getByRole("menuitem", { name: "Filter" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Compose" })).toBeVisible();
    } finally {
      if (clientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", clientWidth); else delete (HTMLElement.prototype as any).clientWidth;
      if (offsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth); else delete (HTMLElement.prototype as any).offsetWidth;
    }
  });
  it("does not remeasure forever when callers pass inline priority maps", async () => {
    const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return (this as HTMLElement).classList.contains("ou-command-toolbar") ? 130 : 0; } });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return (this as HTMLElement).classList.contains("ou-command-slot") ? 70 : 0; } });
    try {
      const registry = new CommandRegistry();
      registry.register({ id: "compose", title: "Compose", execute: vi.fn() });
      registry.register({ id: "filter", title: "Filter", execute: vi.fn() });
      registry.register({ id: "export", title: "Export", execute: vi.fn() });
      function InlinePriorities() {
        return <CommandToolbar registry={registry} commandIds={["compose", "filter", "export"]} priorities={{ compose: "essential", export: "secondary" }} context={{}} />;
      }
      render(<InlinePriorities />);
      expect(await screen.findByRole("button", { name: "More actions" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Compose" })).toBeVisible();
    } finally {
      if (clientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", clientWidth); else delete (HTMLElement.prototype as any).clientWidth;
      if (offsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth); else delete (HTMLElement.prototype as any).offsetWidth;
    }
  });
});

describe("AsyncTask and DataSource", () => {
  it("publishes success, error, cancellation and ignores stale results", async () => {
    const resolvers: Array<(value: string) => void> = [];
    const task = new AsyncTask<string, [string]>(
      async (_signal, id) =>
        new Promise((resolve) => resolvers.push(() => resolve(id))),
    );
    const first = task.run("old");
    const second = task.run("current");
    resolvers[0]("old");
    await first;
    expect(task.getSnapshot().status).toBe("pending");
    resolvers[1]("current");
    await second;
    expect(task.getSnapshot()).toMatchObject({
      status: "success",
      value: "current",
    });
    const failing = new AsyncTask(async () => {
      throw new Error("failed");
    });
    await failing.run();
    expect(failing.getSnapshot().status).toBe("error");
    const cancelled = new AsyncTask(
      async () => new Promise<string>(() => undefined),
    );
    void cancelled.run();
    cancelled.cancel();
    expect(cancelled.getSnapshot().status).toBe("cancelled");
  });
  it("keeps a read-only in-memory source independent from the view", async () => {
    const source = new InMemoryDataSource([
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ], (row) => row.name);
    expect((await source.load({ text: "bet" })).items).toEqual([
      { id: "2", name: "Beta" },
    ]);
  });
});

type NodeRow = {
  id: string;
  name: string;
  value: number;
  children?: NodeRow[];
};
const nodeColumns: DataViewColumn<NodeRow>[] = [
  { key: "name", label: "Name", width: 140 },
  { key: "value", label: "Value", width: 70 },
];
describe("unified DataView", () => {
  it("can default-expand every nested tree level", () => {
    const rows: NodeRow[] = [{ id: "root", name: "Root", value: 1, children: [{ id: "child", name: "Child", value: 2, children: [{ id: "grandchild", name: "Grandchild", value: 3 }] }] }];
    render(<DataView rows={rows} columns={nodeColumns} mode="tree-table" getChildren={(row) => row.children} defaultExpansion="all" height={120} storageKey="expand-all" />);
    expect(screen.getByText("Grandchild")).toBeVisible();
  });
  it("can default-collapse every tree level", () => {
    const rows: NodeRow[] = [{ id: "root", name: "Root", value: 1, children: [{ id: "child", name: "Child", value: 2 }] }];
    render(<DataView rows={rows} columns={nodeColumns} mode="tree-table" getChildren={(row) => row.children} defaultExpansion="none" height={120} storageKey="collapse-all" />);
    expect(screen.queryByText("Child")).not.toBeInTheDocument();
  });
  it("can route expandable-row double click to the application open command", async () => {
    const open = vi.fn();
    const rows: NodeRow[] = [{ id: "root", name: "Root", value: 1, children: [{ id: "child", name: "Child", value: 2 }] }];
    render(<DataView rows={rows} columns={nodeColumns} mode="tree-table" getChildren={(row) => row.children} doubleClickBehavior="open" onOpen={open} height={120} storageKey="open-expandable" />);
    await userEvent.dblClick(screen.getByText("Root"));
    expect(open).toHaveBeenCalledWith(rows[0]);
  });
  it("uses compact capped indentation and chevrons for deep trees", () => {
    let branch: NodeRow = { id: "level-7", name: "Level 7", value: 7 };
    for (let level = 6; level >= 0; level--) branch = { id: `level-${level}`, name: `Level ${level}`, value: level, children: [branch] };
    render(<DataView rows={[branch]} columns={nodeColumns} mode="tree-table" getChildren={(row) => row.children} defaultExpansion="all" height={220} storageKey="compact-tree" />);
    const deepestCell = screen.getByText("Level 7").closest<HTMLElement>('[role="gridcell"]');
    expect(deepestCell).toHaveStyle({ paddingLeft: "43px" });
    const toggle = screen.getByRole("button", { name: "Collapse Level 0" });
    expect(toggle).toHaveClass("is-expanded");
    expect(toggle.querySelector("svg")).toBeInTheDocument();
    expect(toggle).not.toHaveTextContent(/[+−]/);
  });
  it("does not select an ancestor when its disclosure button is pressed", () => {
    const selection = new SelectionModel<string>();
    const rows: NodeRow[] = [{ id: "root", name: "Filter", value: 1, children: [{ id: "child", name: "Issue", value: 2 }] }];
    selection.select("child", ["root", "child"]);
    render(<DataView rows={rows} columns={nodeColumns} mode="tree-table" getChildren={(row) => row.children} selectionModel={selection} height={120} storageKey="disclosure-selection" />);
    fireEvent.mouseDown(screen.getByRole("button", { name: "Collapse Filter" }));
    fireEvent.click(screen.getByRole("button", { name: "Collapse Filter" }));
    expect(selection.isSelected("child")).toBe(true);
    expect(selection.isSelected("root")).toBe(false);
  });
  it("preserves a multi-selection when its row opens a context menu", () => {
    const selection = new SelectionModel<string>();
    const contextMenu = vi.fn();
    const rows: NodeRow[] = [
      { id: "first", name: "First", value: 1 },
      { id: "second", name: "Second", value: 2 },
      { id: "third", name: "Third", value: 3 },
    ];
    selection.select("first", rows.map((row) => row.id));
    selection.select("second", rows.map((row) => row.id), { toggle: true });
    render(<DataView rows={rows} columns={nodeColumns} selectionModel={selection} onContextMenu={contextMenu} height={120} storageKey="context-multi-selection" />);
    const second = screen.getByText("Second").closest<HTMLElement>('[role="row"]')!;
    fireEvent.mouseDown(second, { button: 2 });
    fireEvent.contextMenu(second, { button: 2, clientX: 20, clientY: 30 });
    expect(selection.getSnapshot().selected).toEqual(new Set(["first", "second"]));
    expect(contextMenu).toHaveBeenCalledWith(expect.anything(), rows[1]);
  });
  it("provides selected rows to a row drag and accepts a compatible row drop", () => {
    const selection = new SelectionModel<string>();
    const dragStart = vi.fn();
    const drop = vi.fn();
    const rows: NodeRow[] = [
      { id: "first", name: "First", value: 1 },
      { id: "second", name: "Second", value: 2 },
      { id: "target", name: "Target", value: 3 },
    ];
    selection.select("first", rows.map((row) => row.id));
    selection.select("second", rows.map((row) => row.id), { toggle: true });
    render(<DataView rows={rows} columns={nodeColumns} selectionModel={selection} rowDraggable onRowDragStart={dragStart} canDropOnRow={(event) => event.dataTransfer.types.includes("application/x-test-row")} onRowDrop={drop} height={120} storageKey="row-drag-drop" />);
    const second = screen.getByText("Second").closest<HTMLElement>('[role="row"]')!;
    const target = screen.getByText("Target").closest<HTMLElement>('[role="row"]')!;
    const dataTransfer = { types: ["application/x-test-row"], dropEffect: "none", setData: vi.fn(), getData: vi.fn() };
    fireEvent.dragStart(second, { dataTransfer });
    expect(dragStart).toHaveBeenCalledWith(expect.anything(), rows[1], [rows[0], rows[1]]);
    fireEvent.dragOver(target, { dataTransfer });
    expect(target).toHaveClass("is-drop-target");
    fireEvent.drop(target, { dataTransfer });
    expect(drop).toHaveBeenCalledWith(expect.anything(), rows[2]);
    expect(target).not.toHaveClass("is-drop-target");
  });
  it("keeps a collapsed descendant selected and available to its inspector", () => {
    const selection = new SelectionModel<string>();
    const changed = vi.fn();
    const rows: NodeRow[] = [{ id: "root", name: "Filter", value: 1, children: [{ id: "child", name: "Issue", value: 2 }] }];
    selection.select("child", ["root", "child"]);
    render(<DataView rows={rows} columns={nodeColumns} mode="tree-table" getChildren={(row) => row.children} selectionModel={selection} onSelectionChange={changed} height={120} storageKey="hidden-selection" />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse Filter" }));
    expect(screen.queryByText("Issue")).not.toBeInTheDocument();
    expect(selection.isSelected("child")).toBe(true);
    expect(selection.getSnapshot().active).toBe("child");
    expect(changed.mock.calls.at(-1)?.[0]).toEqual([rows[0].children?.[0]]);
  });
  it.each(["table", "list", "tree", "tree-table"] as const)(
    "renders %s mode from one primitive",
    (mode) => {
    const rows: NodeRow[] = [
        {
          id: "p",
          name: "Parent",
          value: 1,
          children: [{ id: "c", name: "Child", value: 2 }],
        },
      ];
      render(
        <DataView
          rows={rows}
          columns={nodeColumns}
          mode={mode}
          getChildren={(row) => row.children}
          height={160}
          storageKey={`mode-${mode}`}
        />,
      );
      expect(screen.getByRole("grid")).toHaveAttribute("data-mode", mode);
      expect(screen.getByText("Parent")).toBeInTheDocument();
      if (mode.startsWith("tree"))
        expect(screen.getByText("Child")).toBeInTheDocument();
    },
  );
  it("sorts and virtualizes without rendering the full dataset", async () => {
    const rows = Array.from({ length: 10_000 }, (_, value) => ({
      id: String(value),
      name: `Row ${value}`,
      value,
    }));
    render(
      <DataView
        rows={rows}
        columns={nodeColumns}
        height={200}
        storageKey="framework-large"
      />,
    );
    expect(screen.getAllByRole("row").length).toBeLessThan(30);
    await userEvent.click(
      screen
        .getByRole("columnheader", { name: /Name/ })
        .querySelector("button")!,
    );
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });
  it("filters rows and accepts a persistable column-visibility model", () => {
    render(<DataView rows={[{ id: "a", name: "Alpha", value: 1 }, { id: "b", name: "Beta", value: 2 }]} columns={nodeColumns} filterText="beta" hiddenColumnKeys={["value"]} height={120} storageKey="filter-columns" />);
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Value" })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("ou:filter-columns:hidden-columns") || "[]")).toEqual(["value"]);
  });
  it("filters collapsed trees recursively while preserving the matching path", () => {
    const rows: NodeRow[] = [{ id: "root", name: "Projects", value: 1, children: [{ id: "child", name: "WorkBox migration", value: 2 }, { id: "other", name: "Mail", value: 3 }] }];
    render(<DataView rows={rows} columns={nodeColumns} mode="tree-table" getChildren={(row) => row.children} defaultExpansion="none" filterText="workbox" height={120} storageKey="tree-filter" />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("WorkBox migration")).toBeInTheDocument();
    expect(screen.queryByText("Mail")).not.toBeInTheDocument();
    expect(screen.getByText("Projects").closest('[role="row"]')).toHaveAttribute("aria-level", "1");
    expect(screen.getByText("WorkBox migration").closest('[role="row"]')).toHaveAttribute("aria-level", "2");
  });
});

describe("CalendarGrid and persisted tabs", () => {
  it("moves across a month boundary with the keyboard", () => {
    const select = vi.fn();
    const month = vi.fn();
    render(
      <CalendarGrid
        month={new Date(2026, 7, 1)}
        selected={new Date(2026, 7, 31)}
        onSelect={select}
        onMonthChange={month}
      />,
    );
    fireEvent.keyDown(screen.getByRole("gridcell", { selected: true }), {
      key: "ArrowRight",
    });
    expect(select.mock.calls[0][0].getMonth()).toBe(8);
    expect(month).toHaveBeenCalled();
  });
  it("restores a selected tab safely", async () => {
    localStorage.setItem("ou:test-tabs:active-tab", JSON.stringify("two"));
    const change = vi.fn();
    render(
      <Tabs
        items={[
          { id: "one", label: "One" },
          { id: "two", label: "Two" },
        ]}
        active="one"
        onChange={change}
        storageKey="test-tabs"
      />,
    );
    await waitFor(() => expect(change).toHaveBeenCalledWith("two"));
  });
  it("moves tabs into overflow according to measured width", async () => {
    const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return (this as HTMLElement).classList.contains("ou-core-tabs-wrap") ? 180 : 0; } });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return (this as HTMLElement).classList.contains("ou-core-tab") ? 80 : 0; } });
    try {
      render(<Tabs items={[{ id: "one", label: "One" }, { id: "two", label: "Two" }, { id: "three", label: "Three" }, { id: "four", label: "Four" }]} active="one" onChange={() => undefined} />);
      const more = await screen.findByRole("button", { name: "More tabs" });
      await userEvent.click(more);
      expect(screen.getAllByRole("menuitem")).toHaveLength(3);
      expect(screen.getByRole("tab", { name: "One" })).toBeVisible();
    } finally {
      if (clientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", clientWidth); else delete (HTMLElement.prototype as any).clientWidth;
      if (offsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth); else delete (HTMLElement.prototype as any).offsetWidth;
    }
  });
  it("falls back when persistence is invalid", () => {
    localStorage.setItem("safe:value", "not-json");
    expect(new PersistenceStore("safe").get("value", 7)).toBe(7);
  });
  it("persists keyboard splitter position", async () => {
    render(<div style={{ width: 500, height: 300 }}><SplitView first="A" second="B" storageKey="test-split" /></div>);
    const separator = screen.getByRole("separator", { name: "Resize panes" });
    separator.focus(); await userEvent.keyboard("{ArrowRight}");
    expect(JSON.parse(localStorage.getItem("ou:test-split:split") || "0")).toBe(38);
  });
  it("preserves useful pixel minima for both split panes", () => {
    const { container } = render(<div style={{ width: 300, height: 200 }}><SplitView first="A" second="B" firstMinSize={210} secondMinSize={180} /></div>);
    const layout = container.querySelector<HTMLElement>(".ou-split-layout");
    expect(layout?.style.minWidth).toBe("397px");
    expect(layout?.style.gridTemplateColumns).toContain("minmax(210px");
    expect(layout?.style.gridTemplateColumns).toContain("minmax(180px");
  });
});

describe("nested desktop menus", () => {
  it("portals a popup outside clipped MDI content and restores trigger focus", async () => {
    const action = vi.fn();
    const { container } = render(<div style={{ overflow: "hidden", height: 24 }}><Menu label="Clipped actions" items={[{ label: "Run action", action }]} /></div>);
    const trigger = screen.getByRole("button", { name: "Clipped actions" });
    await userEvent.click(trigger);
    const menu = screen.getByRole("menu");
    expect(menu).toHaveClass("ou-floating-menu");
    expect(container.contains(menu)).toBe(false);
    expect(menu.parentElement).toBe(document.body);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("menuitem", { name: "Run action" }));
    expect(action).toHaveBeenCalledOnce();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it("opens a submenu with ArrowRight and returns with ArrowLeft", async () => {
    render(<Menu label="Folders" items={[{ type: "submenu", label: "Account", items: [{ label: "Inbox" }, { label: "Archive" }] }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Folders" }));
    const account = screen.getByRole("menuitem", { name: /Account/ }); account.focus();
    await userEvent.keyboard("{ArrowRight}"); expect(screen.getByRole("menuitem", { name: "Inbox" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}"); expect(account).toHaveFocus();
  });
});
