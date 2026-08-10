import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
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
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const restored = useRef(false);
  const ordered = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return [
      ...order.map((id) => byId.get(id)).filter(Boolean),
      ...items.filter((item) => !order.includes(item.id)),
    ] as TabItem[];
  }, [items, order]);
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
  return (
    <div className="ou-core-tabs-wrap">
      <div
        className="ou-compact-tabs ou-core-tabs"
        role="tablist"
        aria-label={ariaLabel}
      >
        {ordered.map((tab, index) => (
          <div
            className="ou-core-tab"
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
      {ordered.length > 6 && (
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
              {ordered.map((tab) => (
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
