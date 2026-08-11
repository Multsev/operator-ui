import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
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
  const [overflowPosition, setOverflowPosition] = useState({ left: 4, top: 4 });
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const wrapRef = useRef<HTMLDivElement>(null);
  const overflowTrigger = useRef<HTMLButtonElement>(null);
  const overflowMenu = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
    if (!overflow) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!overflowTrigger.current?.contains(target) && !overflowMenu.current?.contains(target)) setOverflow(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOverflow(false);
      requestAnimationFrame(() => overflowTrigger.current?.focus());
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", escape); };
  }, [overflow]);
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
  const openOverflow = (focusFirst = false) => {
    const rect = overflowTrigger.current?.getBoundingClientRect();
    if (rect) {
      const scale = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--ou-ui-scale"),
      ) || 1;
      const menuWidth = 210 * scale;
      const menuHeight = Math.min(420 * scale, hiddenIds.size * 25 * scale + 8);
      const left = Math.max(4, Math.min(rect.left, window.innerWidth - menuWidth - 4));
      const below = rect.bottom + menuHeight <= window.innerHeight - 4;
      const top = below
        ? rect.bottom
        : Math.max(4, rect.top - menuHeight);
      setOverflowPosition({ left, top });
    }
    setOverflow(true);
    if (focusFirst) {
      requestAnimationFrame(() =>
        overflowMenu.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus(),
      );
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
              title={tab.label}
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
      {hiddenIds.size > 0 && <div className="ou-tab-overflow">
        <button ref={overflowTrigger} aria-label="More tabs" aria-haspopup="menu" aria-expanded={overflow} onClick={() => overflow ? setOverflow(false) : openOverflow()} onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          openOverflow(true);
        }}>⋯</button>
        {overflow && createPortal(<div ref={overflowMenu} className="ou-floating-menu ou-tab-overflow-menu" role="menu" style={overflowPosition} onKeyDown={(event) => {
          const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
          const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
          let next = current;
          if (event.key === "ArrowDown") next = (current + 1 + buttons.length) % buttons.length;
          else if (event.key === "ArrowUp") next = (current - 1 + buttons.length) % buttons.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = buttons.length - 1;
          else return;
          event.preventDefault();
          buttons[next]?.focus();
        }}>
          {ordered.filter((tab) => hiddenIds.has(tab.id)).map((tab) => <button key={tab.id} role="menuitem" title={tab.label} disabled={tab.disabled} onClick={() => { activate(tab.id); setOverflow(false); }}><span className="ou-menu-check" /><span>{tab.label}</span></button>)}
        </div>, document.body)}
      </div>}
    </div>
  );
}
