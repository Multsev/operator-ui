import { useEffect, useMemo, useRef, useState } from "react";
import { CommandMenuItem, CommandToolbar } from "../../../components/CommandUI";
import { DataGrid, type GridColumn } from "../../../components/DataGrid";
import { QuickFind } from "../../../components/compact-controls";
import {
  ContextMenu,
  ContextMenuSeparator,
} from "../../../components/workspace";
import { CommandRegistry, frameworkPersistence, type CommandContext } from "../../../framework";

type Props<Row> = {
  rows: Row[];
  columns: GridColumn<Row>[];
  height: number;
  storageKey: string;
  onOpen?: (row: Row) => void;
  commands?: "full" | "read";
  domainFilter?: React.ReactNode;
  onAdd?: () => void;
  onEnable?: (rows: Row[]) => void;
  onDisable?: (rows: Row[]) => void;
  onRemove?: (rows: Row[]) => void;
  onRefresh?: () => void;
};

type TableCommandContext<Row> = CommandContext & {
  selected: Row[];
  contextRow: Row | null;
};

export function ObjectTableWindow<Row extends { id: string }>({
  rows,
  columns,
  height,
  storageKey,
  onOpen,
  commands = "full",
  domainFilter,
  onAdd,
  onEnable,
  onDisable,
  onRemove,
  onRefresh,
}: Props<Row>) {
  const [query, setQuery] = useState(() => frameworkPersistence.get<string>(`filter:${storageKey}`, ""));
  const [selected, setSelected] = useState<Row[]>([]);
  const [context, setContext] = useState<{
    x: number;
    y: number;
    row: Row;
  } | null>(null);
  const findRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(query.toLowerCase()),
        ),
      ),
    [query, rows],
  );
  useEffect(() => { frameworkPersistence.set(`filter:${storageKey}`, query); }, [query, storageKey]);
  const registry = useMemo(() => {
    const next = new CommandRegistry<TableCommandContext<Row>>();
    next.register({
      id: "add",
      title: "Add",
      icon: "add",
      enabled: () => Boolean(onAdd),
      execute: () => onAdd?.(),
    });
    next.register({
      id: "remove",
      title: "Remove…",
      shortTitle: "Remove",
      icon: "remove",
      shortcut: "Delete",
      enabled: ({ selected: items, contextRow }) =>
        Boolean(onRemove && (contextRow || items.length)),
      execute: ({ selected: items, contextRow }) =>
        onRemove?.(contextRow ? [contextRow] : items),
    });
    next.register({
      id: "enable",
      title: "Enable",
      icon: "enable",
      enabled: ({ selected: items, contextRow }) =>
        Boolean(onEnable && (contextRow || items.length)),
      execute: ({ selected: items, contextRow }) =>
        onEnable?.(contextRow ? [contextRow] : items),
    });
    next.register({
      id: "disable",
      title: "Disable",
      icon: "disable",
      enabled: ({ selected: items, contextRow }) =>
        Boolean(onDisable && (contextRow || items.length)),
      execute: ({ selected: items, contextRow }) =>
        onDisable?.(contextRow ? [contextRow] : items),
    });
    next.register({
      id: "open",
      title: "Properties",
      shortcut: "Alt+Enter",
      enabled: ({ contextRow, selected: items }) =>
        Boolean(onOpen && (contextRow || items[0])),
      execute: ({ contextRow, selected: items }) => {
        const row = contextRow || items[0];
        if (row) onOpen?.(row);
      },
    });
    next.register({
      id: "copy",
      title: "Copy selected rows",
      icon: "copy",
      shortcut: "Ctrl+C",
      enabled: ({ selected: items, contextRow }) =>
        Boolean(items.length || contextRow),
      execute: ({ selected: items, contextRow }) => {
        const copyRows = items.length ? items : contextRow ? [contextRow] : [];
        const text = copyRows
          .map((row) =>
            columns.map((column) => String(row[column.key])).join("\t"),
          )
          .join("\n");
        if (text) void navigator.clipboard?.writeText(text);
      },
    });
    next.register({
      id: "export",
      title: "Export selection…",
      enabled: () => false,
      execute: () => undefined,
    });
    next.register({
      id: "filter",
      title: "Focus filter",
      icon: "filter",
      shortcut: "Ctrl+F",
      execute: () => (query ? setQuery("") : findRef.current?.focus()),
    });
    next.register({
      id: "refresh",
      title: "Refresh",
      icon: "refresh",
      shortcut: "F5",
      enabled: () => Boolean(onRefresh),
      execute: () => onRefresh?.(),
    });
    return next;
  }, [columns, onAdd, onDisable, onEnable, onOpen, onRefresh, onRemove, query]);
  const commandContext = useMemo<TableCommandContext<Row>>(
    () => ({ selected, contextRow: context?.row || null }),
    [context, selected],
  );
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (rootRef.current?.contains(document.activeElement))
        void registry.dispatchShortcut(event, commandContext);
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [commandContext, registry]);
  const toolbarIds =
    commands === "full"
      ? ([
          "add",
          "remove",
          "separator",
          "enable",
          "disable",
          "separator",
          "filter",
          "refresh",
        ] as const)
      : (["filter", "refresh"] as const);
  return (
    <div ref={rootRef} className="ou-object-window">
      <CommandToolbar
        registry={registry}
        commandIds={toolbarIds}
        context={commandContext}
        label={`${storageKey} commands`}
        trailing={
          <>
            {domainFilter}
            <QuickFind
              ref={findRef}
              aria-label={`Find in ${storageKey}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </>
        }
      />
      <DataGrid
        rows={filtered}
        columns={columns}
        height={Math.max(120, height - 72)}
        storageKey={`v2-${storageKey}`}
        ariaLabel={storageKey}
        onSelectionChange={setSelected}
        onOpen={onOpen}
        onContextMenu={(event, row) =>
          setContext({ x: event.clientX, y: event.clientY, row })
        }
      />
      <div className="ou-local-status">
        <span>{filtered.length.toLocaleString()} items</span>
        {selected.length > 0 && <span>{selected.length} selected</span>}
        <span className="ou-local-status-fill" />
        {query && <span>Filter active</span>}
      </div>
      <ContextMenu
        open={Boolean(context)}
        x={context?.x || 0}
        y={context?.y || 0}
        onClose={() => setContext(null)}
      >
        <CommandMenuItem
          registry={registry}
          commandId="open"
          context={commandContext}
          onExecuted={() => setContext(null)}
        />
        <ContextMenuSeparator />
        {commands === "full" && (
          <>
            <CommandMenuItem
              registry={registry}
              commandId="enable"
              context={commandContext}
              onExecuted={() => setContext(null)}
            />
            <CommandMenuItem
              registry={registry}
              commandId="disable"
              context={commandContext}
              onExecuted={() => setContext(null)}
            />
            <CommandMenuItem
              registry={registry}
              commandId="remove"
              context={commandContext}
              onExecuted={() => setContext(null)}
            />
            <ContextMenuSeparator />
          </>
        )}
        <CommandMenuItem
          registry={registry}
          commandId="copy"
          context={commandContext}
          onExecuted={() => setContext(null)}
        />
        <CommandMenuItem
          registry={registry}
          commandId="export"
          context={commandContext}
          onExecuted={() => setContext(null)}
        />
      </ContextMenu>
    </div>
  );
}
