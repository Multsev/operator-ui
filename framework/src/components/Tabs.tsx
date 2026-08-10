import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { frameworkPersistence } from "../framework";

export type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
  closable?: boolean;
};
export function Tabs({
  items,
  active,
  onChange,
  onClose,
  reorderable = false,
  storageKey,
  ariaLabel = "Tabs",
  onTabContextMenu,
}: {
  items: readonly TabItem[];
  active: string;
  onChange: (id: string) => void;
  onClose?: (id: string) => void;
  reorderable?: boolean;
  storageKey?: string;
  ariaLabel?: string;
  onTabContextMenu?: (event: MouseEvent, id: string) => void;
}) {
  const initialOrder = storageKey
    ? frameworkPersistence.get<string[]>(`${storageKey}:tabs`, [])
    : [];
  const [order, setOrder] = useState(initialOrder);
  const [overflow, setOverflow] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const wrapRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const widths = useRef(new Map<string, number>());
  const measuredWidth = useRef(-1);
  const restored = useRef(false);
  const ordered = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return [
      ...order.map((id) => byId.get(id)).filter(Boolean),
      ...items.filter((item) => !order.includes(item.id)),
    ] as TabItem[];
  }, [items, order]);
  const orderSignature = ordered.map((tab) => tab.id).join("\u0000");
  const activate = (id: string) => {
    if (storageKey) frameworkPersistence.set(`${storageKey}:active-tab`, id);
    onChange(id);
  };
  useEffect(() => {
    if (restored.current || !storageKey) return;
    restored.current = true;
    const persisted = frameworkPersistence.get<string>(
      `${storageKey}:active-tab`,
      "",
    );
    if (
      persisted &&
      persisted !== active &&
      items.some((item) => item.id === persisted && !item.disabled)
    )
      onChange(persisted);
  }, [active, items, onChange, storageKey]);
  const activateRelative = (index: number, direction: number) => {
    for (let step = 1; step <= ordered.length; step++) {
      const next = (index + direction * step + ordered.length) % ordered.length;
      if (!ordered[next].disabled) {
        activate(ordered[next].id);
        refs.current[next]?.focus();
        return;
      }
    }
  };
  useLayoutEffect(() => {
    const measure = (force = false) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      if (wrap.clientWidth <= 0) return;
      if (!force && measuredWidth.current === wrap.clientWidth) return;
      measuredWidth.current = wrap.clientWidth;
      ordered.forEach((tab, index) => {
        const width = refs.current[index]?.closest<HTMLElement>(".ou-core-tab")?.offsetWidth;
        if (width) widths.current.set(tab.id, width);
      });
      const natural = ordered.reduce((total, tab) => total + (widths.current.get(tab.id) || 80), 0);
      if (natural <= wrap.clientWidth) {
        setHiddenIds((current) => current.size ? new Set() : current);
        return;
      }
      const available = Math.max(0, wrap.clientWidth - 25);
      const keep = new Set<string>();
      let used = 0;
      const activeWidth = ordered.find((tab) => tab.id === active) ? (widths.current.get(active) || 80) : 0;
      if (activeWidth <= available) { keep.add(active); used = activeWidth; }
      for (const tab of ordered) {
        if (keep.has(tab.id)) continue;
        const width = widths.current.get(tab.id) || 80;
        if (used + width <= available) { keep.add(tab.id); used += width; }
      }
      const next = new Set(ordered.filter((tab) => !keep.has(tab.id)).map((tab) => tab.id));
      setHiddenIds((current) => current.size === next.size && [...current].every((id) => next.has(id)) ? current : next);
    };
    measuredWidth.current = -1;
    measure(true);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure());
    if (wrapRef.current) observer?.observe(wrapRef.current);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => { observer?.disconnect(); window.removeEventListener("resize", onResize); };
  }, [active, orderSignature]);
  return (
    <div className="ou-core-tabs-wrap" ref={wrapRef}>
      <div
        className="ou-compact-tabs ou-core-tabs"
        role="tablist"
        aria-label={ariaLabel}
      >
        {ordered.map((tab, index) => (
          <div
            className={`ou-core-tab ${hiddenIds.has(tab.id) ? "is-overflow-hidden" : ""}`}
            key={tab.id}
            draggable={reorderable}
            onDragStart={(event) =>
              event.dataTransfer.setData("text/plain", tab.id)
            }
            onDragOver={(event) => reorderable && event.preventDefault()}
            onDrop={(event) => {
              if (!reorderable) return;
              event.preventDefault();
              const source = event.dataTransfer.getData("text/plain");
              const next = ordered.map((item) => item.id);
              next.splice(next.indexOf(source), 1);
              next.splice(next.indexOf(tab.id), 0, source);
              setOrder(next);
              if (storageKey)
                frameworkPersistence.set(`${storageKey}:tabs`, next);
            }}
          >
            <button
              ref={(node) => {
                refs.current[index] = node;
              }}
              role="tab"
              aria-selected={active === tab.id}
              disabled={tab.disabled}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => activate(tab.id)}
              onContextMenu={(event) => onTabContextMenu?.(event, tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  activateRelative(index, 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  activateRelative(index, -1);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  activateRelative(-1, 1);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  activateRelative(0, -1);
                }
              }}
            >
              {tab.label}
            </button>
            {tab.closable && (
              <button
                className="ou-tab-close"
                aria-label={`Close ${tab.label}`}
                onClick={() => onClose?.(tab.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {hiddenIds.size > 0 && (
        <div className="ou-tab-overflow">
          <button
            aria-label="More tabs"
            aria-expanded={overflow}
            onClick={() => setOverflow((value) => !value)}
          >
            ⋯
          </button>
          {overflow && (
            <div role="menu">
              {ordered.filter((tab) => hiddenIds.has(tab.id)).map((tab) => (
                <button
                  key={tab.id}
                  role="menuitem"
                  disabled={tab.disabled}
                  onClick={() => {
                    activate(tab.id);
                    setOverflow(false);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
