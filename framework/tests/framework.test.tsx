import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CalendarGrid } from "../src/components/CalendarGrid";
import { CommandMenu, CommandMenuItem, CommandToolbar } from "../src/components/CommandUI";
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
});

describe("nested desktop menus", () => {
  it("opens a submenu with ArrowRight and returns with ArrowLeft", async () => {
    render(<Menu label="Folders" items={[{ type: "submenu", label: "Account", items: [{ label: "Inbox" }, { label: "Archive" }] }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Folders" }));
    const account = screen.getByRole("menuitem", { name: /Account/ }); account.focus();
    await userEvent.keyboard("{ArrowRight}"); expect(screen.getByRole("menuitem", { name: "Inbox" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}"); expect(account).toHaveFocus();
  });
});
