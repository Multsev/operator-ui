import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./controls";
import { Tabs as CoreTabs } from "./Tabs";

export function MenuBar({ children }: { children: ReactNode }) {
  return (
    <nav className="ou-menubar" aria-label="Application menu">
      {children}
    </nav>
  );
}
export function MenuItem({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="ou-menu-item" onClick={onClick}>
      {children}
    </button>
  );
}
export type MenuEntry =
  | {
      type?: "command";
      label: string;
      shortcut?: string;
      disabled?: boolean;
      checked?: boolean;
      action?: () => void;
    }
  | { type: "separator" }
  | { type: "submenu"; label: string; items: MenuEntry[]; disabled?: boolean };

function MenuEntries({ items, close }: { items: MenuEntry[]; close: () => void }) {
  return items.map((item, index) => {
    if (item.type === "separator") return <div key={`separator-${index}`} role="separator" />;
    if (item.type === "submenu") return <div className="ou-submenu" key={item.label}>
      <button role="menuitem" aria-haspopup="menu" disabled={item.disabled} onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          event.currentTarget.nextElementSibling?.querySelector<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)')?.focus();
        }
      }}><span className="ou-menu-check" /><span>{item.label}</span><span>▶</span></button>
      <div role="menu" onKeyDown={(event) => {
        const entries = [...event.currentTarget.querySelectorAll<HTMLButtonElement>(':scope > button:not(:disabled), :scope > .ou-submenu > button:not(:disabled)')];
        const position = entries.indexOf(document.activeElement as HTMLButtonElement);
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); event.stopPropagation(); entries[(position + (event.key === "ArrowDown" ? 1 : -1) + entries.length) % entries.length]?.focus(); }
        if (event.key === "ArrowLeft") { event.preventDefault(); event.stopPropagation(); (event.currentTarget.previousElementSibling as HTMLButtonElement | null)?.focus(); }
      }}><MenuEntries items={item.items} close={close} /></div>
    </div>;
    return <button key={item.label} role={item.checked === undefined ? "menuitem" : "menuitemcheckbox"} aria-checked={item.checked} disabled={item.disabled} onClick={() => { item.action?.(); close(); }}><span className="ou-menu-check">{item.checked ? "✓" : ""}</span><span>{item.label}</span>{item.shortcut && <kbd>{item.shortcut}</kbd>}</button>;
  });
}
export function Menu({
  label,
  items,
  className = "",
  triggerContent,
}: {
  label: string;
  items: MenuEntry[];
  className?: string;
  triggerContent?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 4, top: 4 });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const placePopup = useCallback(() => {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ou-ui-scale")) || 1;
    const width = 210 * scale;
    const measuredHeight = popup.current?.getBoundingClientRect().height;
    const estimatedHeight = Math.min(420, (items.length * 24 + 6) * scale);
    const height = measuredHeight || estimatedHeight;
    const left = Math.max(4, Math.min(rect.left, window.innerWidth - width - 4));
    const below = rect.bottom;
    const top = below + height <= window.innerHeight - 4
      ? below
      : Math.max(4, rect.top - height);
    setPosition((current) =>
      current.left === left && current.top === top ? current : { left, top },
    );
  }, [items.length]);
  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus());
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !popup.current?.contains(target)) closeMenu();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMenu(true);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeMenu, open]);
  useLayoutEffect(() => {
    if (!open) return;
    placePopup();
    const reposition = () => placePopup();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, placePopup]);
  return (
    <div ref={root} className={`ou-app-menu ${className}`}>
      <button
        ref={trigger}
        className={`ou-menu-item ${open ? "is-open" : ""}`}
        aria-label={triggerContent ? label : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (open) closeMenu();
          else { placePopup(); setOpen(true); }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            placePopup();
            setOpen(true);
            requestAnimationFrame(() =>
              popup.current
                ?.querySelector<HTMLButtonElement>('[role^="menuitem"]')
                ?.focus(),
            );
          }
        }}
      >
        {triggerContent ?? label}
      </button>
      {open && createPortal(
        <div
          ref={popup}
          className="ou-floating-menu"
          role="menu"
          style={{ left: position.left, top: position.top }}
          onKeyDown={(event) => {
            const entries = [
              ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                ':scope > button:not(:disabled), :scope > .ou-submenu > button:not(:disabled)',
              ),
            ];
            const index = entries.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            if (event.key === "Escape") {
              closeMenu(true);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              entries[(index + 1) % entries.length]?.focus();
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              entries[(index - 1 + entries.length) % entries.length]?.focus();
            }
            if (event.key === "Home") {
              event.preventDefault();
              entries[0]?.focus();
            }
            if (event.key === "End") {
              event.preventDefault();
              entries.at(-1)?.focus();
            }
          }}
        >
          <MenuEntries items={items} close={() => closeMenu(true)} />
        </div>,
        document.body,
      )}
    </div>
  );
}
export function Toolbar({
  children,
  label = "Actions",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="ou-toolbar" role="toolbar" aria-label={label}>
      {children}
    </div>
  );
}
export function ToolbarSeparator() {
  return <span className="ou-toolbar-separator" role="separator" />;
}
export function StatusBar({ children }: { children: ReactNode }) {
  return <footer className="ou-statusbar">{children}</footer>;
}
export function GroupBox({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="ou-group">
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <CoreTabs
      items={tabs.map((tab) => ({ id: tab, label: tab }))}
      active={active}
      onChange={onChange}
    />
  );
}

export function Dialog({
  open,
  title,
  children,
  onClose,
  onApply,
  danger,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onApply?: () => void;
  danger?: boolean;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    requestAnimationFrame(() =>
      dialogRef.current
        ?.querySelector<HTMLElement>(
          "input:not(:disabled), select:not(:disabled), button:not(:disabled)",
        )
        ?.focus(),
    );
    return () => previousFocus.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="ou-dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="ou-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
          if (e.key === "Tab") {
            const focusable = [
              ...e.currentTarget.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
              ),
            ];
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <header>
          <span id={titleId}>{title}</span>
          <button
            className="ou-window-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="ou-dialog-body">{children}</div>
        <footer>
          <Button
            onClick={onApply || onClose}
            variant={danger ? "danger" : "primary"}
          >
            {danger ? "Remove" : onApply ? "OK" : "Close"}
          </Button>
          {onApply && <Button onClick={onClose}>Cancel</Button>}
          {onApply && !danger && <Button onClick={onApply}>Apply</Button>}
        </footer>
      </section>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="ou-empty">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="ou-loading" role="status">
      <span />
      {label}
    </div>
  );
}
