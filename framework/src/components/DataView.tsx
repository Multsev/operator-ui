import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  frameworkPersistence,
  SelectionModel,
  selectionIntent,
} from "../framework";

export type DataViewMode = "table" | "list" | "tree" | "tree-table";
export type DataViewColumn<Row> = {
  key: keyof Row & string;
  label: string;
  width: number;
  minWidth?: number;
  align?: "left" | "right";
  hidden?: boolean;
  render?: (row: Row) => ReactNode;
};
type SortState<Row> = {
  key: keyof Row & string;
  direction: "asc" | "desc";
} | null;
type VisibleRow<Row> = { row: Row; level: number; expandable: boolean };

export type DataViewProps<Row extends { id: string }> = {
  rows: readonly Row[];
  columns: readonly DataViewColumn<Row>[];
  mode?: DataViewMode;
  height?: number;
  ariaLabel?: string;
  storageKey?: string;
  filterText?: string;
  hiddenColumnKeys?: readonly (keyof Row & string)[];
  selectionModel?: SelectionModel<string>;
  getChildren?: (row: Row) => readonly Row[] | undefined;
  defaultExpansion?: "roots" | "all" | "none";
  onOpen?: (row: Row) => void;
  onContextMenu?: (event: MouseEvent, row: Row) => void;
  onSelectionChange?: (rows: Row[]) => void;
};

export function DataView<Row extends { id: string }>({
  rows,
  columns,
  mode = "table",
  height = 360,
  ariaLabel = "Data view",
  storageKey = "default-data-view",
  filterText = "",
  hiddenColumnKeys,
  selectionModel,
  getChildren,
  defaultExpansion = "roots",
  onOpen,
  onContextMenu,
  onSelectionChange,
}: DataViewProps<Row>) {
  const ownedSelection = useRef(new SelectionModel<string>());
  const selection = selectionModel ?? ownedSelection.current;
  const selectionState = useSyncExternalStore(
    selection.subscribe,
    selection.getSnapshot,
    selection.getSnapshot,
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const keys = new Set<string>();
    if (defaultExpansion === "none") return keys;
    const visit = (items: readonly Row[], recursive: boolean) => items.forEach((row) => {
      const children = getChildren?.(row) || [];
      if (!children.length || keys.has(row.id)) return;
      keys.add(row.id);
      if (recursive) visit(children, true);
    });
    visit(rows, defaultExpansion === "all");
    return keys;
  });
  const [sort, setSort] = useState<SortState<Row>>(() =>
    frameworkPersistence.get(`${storageKey}:sort`, null),
  );
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    frameworkPersistence.get(`${storageKey}:widths`, {}),
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    frameworkPersistence.get(`${storageKey}:order`, []),
  );
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const viewport = useRef<HTMLDivElement>(null);
  const rowHeight = 20;
  const persistedHidden = useMemo(
    () => frameworkPersistence.get<string[]>(`${storageKey}:hidden-columns`, []),
    [storageKey],
  );
  const effectiveHidden = hiddenColumnKeys ?? persistedHidden;

  const orderedColumns = useMemo(() => {
    const visible = columns.filter(
      (column) => !column.hidden && !effectiveHidden.includes(column.key),
    );
    const byKey = new Map(visible.map((column) => [column.key, column]));
    return [
      ...columnOrder
        .map((key) => byKey.get(key as keyof Row & string))
        .filter(Boolean),
      ...visible.filter((column) => !columnOrder.includes(column.key)),
    ] as DataViewColumn<Row>[];
  }, [columnOrder, columns, effectiveHidden]);

  const visibleRows = useMemo(() => {
    const hierarchical = mode === "tree" || mode === "tree-table";
    const sortRows = (items: readonly Row[]) =>
      !sort || hierarchical
        ? [...items]
        : [...items].sort(
            (a, b) =>
              String(a[sort.key]).localeCompare(
                String(b[sort.key]),
                undefined,
                { numeric: true },
              ) * (sort.direction === "asc" ? 1 : -1),
          );
    const filteredRows = filterText.trim()
      ? rows.filter((row) =>
          Object.values(row).some((value) =>
            String(value).toLowerCase().includes(filterText.trim().toLowerCase()),
          ),
        )
      : rows;
    if (!hierarchical)
      return sortRows(filteredRows).map((row) => ({
        row,
        level: 0,
        expandable: false,
      }));
    const output: VisibleRow<Row>[] = [];
    const visit = (items: readonly Row[], level: number) =>
      items.forEach((row) => {
        const children = getChildren?.(row) || [];
        output.push({ row, level, expandable: children.length > 0 });
        if (children.length && expanded.has(row.id)) visit(children, level + 1);
      });
    visit(rows, 0);
    return output;
  }, [expanded, filterText, getChildren, mode, rows, sort]);

  const keys = useMemo(
    () => visibleRows.map(({ row }) => row.id),
    [visibleRows],
  );
  useEffect(() => selection.reconcile(keys), [keys, selection]);
  useEffect(() => {
    onSelectionChange?.(
      visibleRows
        .filter(({ row }) => selectionState.selected.has(row.id))
        .map(({ row }) => row),
    );
  }, [onSelectionChange, selectionState.selected, visibleRows]);
  useEffect(() => {
    frameworkPersistence.set(`${storageKey}:sort`, sort);
  }, [sort, storageKey]);
  useEffect(() => {
    frameworkPersistence.set(`${storageKey}:widths`, widths);
  }, [storageKey, widths]);
  useEffect(() => {
    frameworkPersistence.set(`${storageKey}:order`, columnOrder);
  }, [columnOrder, storageKey]);
  useEffect(() => {
    if (hiddenColumnKeys)
      frameworkPersistence.set(`${storageKey}:hidden-columns`, hiddenColumnKeys);
  }, [hiddenColumnKeys, storageKey]);

  const activeIndex = Math.max(
    0,
    visibleRows.findIndex(({ row }) => row.id === selectionState.active),
  );
  const start = Math.max(0, Math.floor(scroll.top / rowHeight) - 5);
  const count = Math.ceil(height / rowHeight) + 10;
  const rendered = visibleRows.slice(start, start + count);
  const template = orderedColumns
    .map((column) => `${widths[column.key] || column.width}px`)
    .join(" ");
  const select = (event: MouseEvent | KeyboardEvent, row: Row) =>
    selection.select(row.id, keys, selectionIntent(event));

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!visibleRows.length) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      selection.selectAll(keys);
      return;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "c" &&
      selection.selectedCount
    ) {
      const selected = visibleRows.filter(({ row }) =>
        selection.isSelected(row.id),
      );
      const text = selected
        .map(({ row }) =>
          orderedColumns.map((column) => String(row[column.key])).join("\t"),
        )
        .join("\n");
      void navigator.clipboard?.writeText(text);
      event.preventDefault();
      return;
    }
    const current = visibleRows[activeIndex];
    let next = activeIndex;
    if (event.key === "ArrowDown") next++;
    else if (event.key === "ArrowUp") next--;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = visibleRows.length - 1;
    else if (event.key === "PageDown") next += Math.floor(height / rowHeight);
    else if (event.key === "PageUp") next -= Math.floor(height / rowHeight);
    else if (event.key === "Enter") {
      onOpen?.(current.row);
      return;
    } else if (
      (mode === "tree" || mode === "tree-table") &&
      event.key === "ArrowRight" &&
      current.expandable
    ) {
      event.preventDefault();
      setExpanded((value) => new Set(value).add(current.row.id));
      return;
    } else if (
      (mode === "tree" || mode === "tree-table") &&
      event.key === "ArrowLeft" &&
      current.expandable
    ) {
      event.preventDefault();
      setExpanded((value) => {
        const nextValue = new Set(value);
        nextValue.delete(current.row.id);
        return nextValue;
      });
      return;
    } else return;
    event.preventDefault();
    next = Math.max(0, Math.min(visibleRows.length - 1, next));
    selection.select(visibleRows[next].row.id, keys, { range: event.shiftKey });
    const target = viewport.current;
    const top = Math.max(0, next * rowHeight - height / 2);
    if (target?.scrollTo) target.scrollTo({ top });
    else if (target) target.scrollTop = top;
  }

  function beginResize(event: React.PointerEvent, column: DataViewColumn<Row>) {
    event.preventDefault();
    const startX = event.clientX;
    const initial = widths[column.key] || column.width;
    const move = (next: PointerEvent) => {
      const scale =
        Number(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--ou-ui-scale",
          ),
        ) || 1;
      setWidths((value) => ({
        ...value,
        [column.key]: Math.max(
          column.minWidth || 60,
          initial + (next.clientX - startX) / scale,
        ),
      }));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }

  return (
    <div
      className="ou-grid-frame ou-data-view"
      data-mode={mode}
      style={{ height }}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={visibleRows.length + 1}
      aria-colcount={orderedColumns.length}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-activedescendant={
        visibleRows[activeIndex]
          ? `${storageKey}-row-${visibleRows[activeIndex].row.id}`
          : undefined
      }
    >
      <div
        className="ou-grid-header"
        role="row"
        style={{
          gridTemplateColumns: template,
          transform: `translateX(${-scroll.left}px)`,
        }}
      >
        {orderedColumns.map((column) => (
          <div
            key={column.key}
            role="columnheader"
            aria-sort={
              sort?.key === column.key
                ? sort.direction === "asc"
                  ? "ascending"
                  : "descending"
                : "none"
            }
            className={column.align === "right" ? "is-right" : ""}
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData("text/plain", column.key)
            }
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const source = event.dataTransfer.getData("text/plain");
              if (!source || source === column.key) return;
              const order: string[] = orderedColumns.map((item) => item.key);
              order.splice(order.indexOf(source), 1);
              order.splice(order.indexOf(column.key), 0, source);
              setColumnOrder(order);
            }}
          >
            <button
              onClick={() =>
                setSort((current) => ({
                  key: column.key,
                  direction:
                    current?.key === column.key && current.direction === "asc"
                      ? "desc"
                      : "asc",
                }))
              }
            >
              {column.label}
              <span className="ou-sort">
                {sort?.key === column.key
                  ? sort.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </span>
            </button>
            <span
              className="ou-column-resizer"
              onPointerDown={(event) => beginResize(event, column)}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
      <div
        ref={viewport}
        className="ou-grid-viewport"
        style={{ height: height - 23 }}
        role="rowgroup"
        onScroll={(event) =>
          setScroll({
            top: event.currentTarget.scrollTop,
            left: event.currentTarget.scrollLeft,
          })
        }
      >
        <div
          style={{
            height: visibleRows.length * rowHeight,
            minWidth: `calc(${template.replaceAll(" ", " + ")})`,
            position: "relative",
          }}
        >
          <div style={{ transform: `translateY(${start * rowHeight}px)` }}>
            {rendered.map(({ row, level, expandable }, localIndex) => {
              const index = start + localIndex;
              return (
                <div
                  id={`${storageKey}-row-${row.id}`}
                  key={row.id}
                  role="row"
                  aria-rowindex={index + 2}
                  aria-level={mode.startsWith("tree") ? level + 1 : undefined}
                  aria-expanded={expandable ? expanded.has(row.id) : undefined}
                  aria-selected={selection.isSelected(row.id)}
                  className={`ou-grid-row ${selection.isSelected(row.id) ? "is-selected" : ""} ${index === activeIndex ? "is-active" : ""}`}
                  style={{ gridTemplateColumns: template }}
                  onMouseDown={(event) => select(event, row)}
                  onDoubleClick={() =>
                    expandable
                      ? setExpanded((value) => {
                          const next = new Set(value);
                          next.has(row.id)
                            ? next.delete(row.id)
                            : next.add(row.id);
                          return next;
                        })
                      : onOpen?.(row)
                  }
                  onContextMenu={(event) => {
                    event.preventDefault();
                    if (!selection.isSelected(row.id)) select(event, row);
                    onContextMenu?.(event, row);
                  }}
                >
                  {orderedColumns.map((column, columnIndex) => (
                    <div
                      key={column.key}
                      role="gridcell"
                      className={`${column.align === "right" ? "is-right" : ""} ${columnIndex === 0 && mode.startsWith("tree") ? "ou-tree-cell" : ""}`}
                      style={
                        columnIndex === 0 && mode.startsWith("tree")
                          ? { paddingLeft: 5 + level * 14 }
                          : undefined
                      }
                    >
                      {columnIndex === 0 && mode.startsWith("tree") && (
                        <button
                          className="ou-tree-toggle"
                          tabIndex={-1}
                          aria-label={`${expanded.has(row.id) ? "Collapse" : "Expand"} ${String(row[column.key])}`}
                          disabled={!expandable}
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpanded((value) => {
                              const next = new Set(value);
                              next.has(row.id)
                                ? next.delete(row.id)
                                : next.add(row.id);
                              return next;
                            });
                          }}
                        >
                          {expandable ? (expanded.has(row.id) ? "−" : "+") : ""}
                        </button>
                      )}
                      {column.render
                        ? column.render(row)
                        : String(row[column.key])}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
