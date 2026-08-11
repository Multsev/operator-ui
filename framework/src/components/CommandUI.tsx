import {
  Check,
  Copy,
  ExternalLink,
  Filter,
  MessageSquareText,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type CommandContext, type CommandRegistry } from "../framework";
import { Menu, type MenuEntry } from "./shell";

const icons: Record<string, LucideIcon> = {
  add: Plus,
  remove: Minus,
  delete: Trash2,
  enable: Check,
  disable: X,
  comment: MessageSquareText,
  filter: Filter,
  refresh: RefreshCw,
  search: Search,
  copy: Copy,
  external: ExternalLink,
};

export function CommandButton<Context extends CommandContext>({
  registry,
  commandId,
  context,
  compact = true,
  children,
}: {
  registry: CommandRegistry<Context>;
  commandId: string;
  context: Context;
  compact?: boolean;
  children?: ReactNode;
}) {
  useSyncExternalStore(
    registry.subscribe,
    () => registry.get(commandId),
    () => registry.get(commandId),
  );
  const command = registry.get(commandId);
  if (!command || command.visible?.(context) === false) return null;
  const Icon = command.icon ? icons[command.icon] : undefined;
  // A compact command without an icon used to render as an empty square.
  // Fall back to the labelled compact control so the action is always legible.
  const iconOnly = compact && Boolean(Icon) && !children;
  return (
    <button
      className={iconOnly ? "ou-toolbar-button-16" : "ou-compact-button"}
      title={command.title}
      aria-label={command.title}
      aria-pressed={command.checked?.(context)}
      disabled={command.enabled?.(context) === false}
      onClick={() => void registry.execute(commandId, context)}
    >
      {Icon && <Icon />}
      {!iconOnly && (
        <span className="ou-command-label">
          {children ?? command.shortTitle ?? command.title}
        </span>
      )}
    </button>
  );
}

export type ToolbarCommandPriority = "essential" | "primary" | "secondary";

const priorityRank: Record<ToolbarCommandPriority, number> = {
  secondary: 0,
  primary: 1,
  essential: 2,
};

/** Pure overflow policy shared by the component and focused tests. */
export function selectToolbarOverflow(
  entries: readonly { id: string; width: number; priority: ToolbarCommandPriority }[],
  availableWidth: number,
  overflowButtonWidth = 27,
) {
  const naturalWidth = entries.reduce((sum, entry) => sum + entry.width, 0);
  if (naturalWidth <= availableWidth) return new Set<string>();
  const hidden = new Set<string>();
  let used = naturalWidth;
  const candidates = [...entries].sort(
    (left, right) =>
      priorityRank[left.priority] - priorityRank[right.priority] ||
      entries.indexOf(right) - entries.indexOf(left),
  );
  const target = Math.max(0, availableWidth - overflowButtonWidth);
  for (const entry of candidates) {
    // Preserve at least one essential command on the primary surface.
    const remainingEssential = entries.filter(
      (item) => item.priority === "essential" && !hidden.has(item.id),
    ).length;
    if (entry.priority === "essential" && remainingEssential <= 1) continue;
    hidden.add(entry.id);
    used -= entry.width;
    if (used <= target) break;
  }
  return hidden;
}

export function CommandToolbar<Context extends CommandContext>({
  registry,
  commandIds,
  context,
  label = "Commands",
  leading,
  trailing,
  labels = {},
  priorities = {},
  overflowLabel = "More actions",
}: {
  registry: CommandRegistry<Context>;
  commandIds: readonly (string | "separator")[];
  context: Context;
  label?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  labels?: Partial<Record<string, ReactNode>>;
  priorities?: Partial<Record<string, ToolbarCommandPriority>>;
  overflowLabel?: string;
}) {
  const registryVersion = useSyncExternalStore(
    registry.subscribe,
    registry.getVersion,
    registry.getVersion,
  );
  const root = useRef<HTMLDivElement>(null);
  const slots = useRef(new Map<string, HTMLElement>());
  const widths = useRef(new Map<string, number>());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const visibleIds = useMemo(
    () => commandIds.filter((id): id is string => {
      if (id === "separator") return false;
      const command = registry.get(id);
      return Boolean(command && command.visible?.(context) !== false);
    }),
    [commandIds, context, registry, registryVersion],
  );
  const signature = visibleIds.join("\u0000");
  const prioritySignature = visibleIds
    .map((id) => `${id}:${priorities[id] || "primary"}`)
    .join("\u0000");

  useLayoutEffect(() => {
    const measure = () => {
      const toolbar = root.current;
      if (!toolbar || toolbar.clientWidth <= 0) return;
      for (const id of visibleIds) {
        const slot = slots.current.get(id);
        if (slot?.offsetWidth) widths.current.set(id, slot.offsetWidth + 2);
      }
      const entries = visibleIds.map((id) => ({
        id,
        width: widths.current.get(id) || 72,
        priority: priorities[id] || "primary" as ToolbarCommandPriority,
      }));
      const leadingWidth = toolbar.querySelector<HTMLElement>(".ou-command-toolbar-leading")?.offsetWidth || 0;
      const trailing = toolbar.querySelector<HTMLElement>(".ou-command-toolbar-trailing");
      const trailingWidth = trailing ? Math.min(trailing.scrollWidth || trailing.offsetWidth, Math.max(0, toolbar.clientWidth - leadingWidth - 56)) : 0;
      const next = selectToolbarOverflow(entries, Math.max(0, toolbar.clientWidth - leadingWidth - trailingWidth - 12));
      setHiddenIds((current) =>
        current.size === next.size && [...current].every((id) => next.has(id))
          ? current
          : next,
      );
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (root.current) {
      observer?.observe(root.current);
      root.current.querySelectorAll<HTMLElement>(".ou-command-toolbar-leading, .ou-command-toolbar-trailing").forEach((item) => observer?.observe(item));
    }
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [prioritySignature, signature]);

  const overflowItems = visibleIds
    .filter((id) => hiddenIds.has(id))
    .flatMap<MenuEntry>((id) => {
      const command = registry.get(id);
      if (!command) return [];
      return [{
        label: command.title,
        shortcut: command.shortcut,
        disabled: command.enabled?.(context) === false,
        checked: command.checked?.(context),
        action: () => void registry.execute(id, context),
      }];
    });
  const displayedIds = new Set(visibleIds.filter((id) => !hiddenIds.has(id)));
  const separatorHasCommand = (index: number, direction: -1 | 1) => {
    for (let cursor = index + direction; cursor >= 0 && cursor < commandIds.length; cursor += direction) {
      const candidate = commandIds[cursor];
      if (candidate === "separator") return false;
      if (displayedIds.has(candidate)) return true;
    }
    return false;
  };
  return (
    <div ref={root} className="ou-local-toolbar ou-command-toolbar" role="toolbar" aria-label={label}>
      {leading && <span className="ou-command-toolbar-leading">{leading}</span>}
      {commandIds.map((id, index) =>
        id === "separator" && separatorHasCommand(index, -1) && separatorHasCommand(index, 1) ? (
          <span
            key={`separator-${index}`}
            className="ou-local-toolbar-separator"
            role="separator"
          />
        ) : id !== "separator" && visibleIds.includes(id) ? (
          <span
            key={id}
            ref={(node) => {
              if (node) slots.current.set(id, node);
              else slots.current.delete(id);
            }}
            className={`ou-command-slot ${hiddenIds.has(id) ? "is-overflow-hidden" : ""}`}
          >
            <CommandButton registry={registry} commandId={id} context={context}>
              {labels[id] ?? registry.get(id)?.shortTitle}
            </CommandButton>
          </span>
        ) : null,
      )}
      <span className="ou-local-toolbar-fill" />
      {hiddenIds.size > 0 && (
        <Menu
          className="ou-command-overflow"
          label={overflowLabel}
          triggerContent={<span aria-hidden="true">⋯</span>}
          items={overflowItems}
        />
      )}
      {trailing && <span className="ou-command-toolbar-trailing">{trailing}</span>}
    </div>
  );
}

export function CommandMenuItem<Context extends CommandContext>({
  registry,
  commandId,
  context,
  onExecuted,
}: {
  registry: CommandRegistry<Context>;
  commandId: string;
  context: Context;
  onExecuted?: () => void;
}) {
  const command = registry.get(commandId);
  if (!command || command.visible?.(context) === false) return null;
  return (
    <button
      role={command.checked ? "menuitemcheckbox" : "menuitem"}
      aria-checked={command.checked?.(context)}
      disabled={command.enabled?.(context) === false}
      onClick={async () => {
        await registry.execute(commandId, context);
        onExecuted?.();
      }}
    >
      <span className="ou-menu-check">{command.checked?.(context) ? "✓" : ""}</span>
      <span>{command.title}</span>
      {command.shortcut && <kbd>{command.shortcut}</kbd>}
    </button>
  );
}

export function CommandMenu<Context extends CommandContext>({
  label,
  registry,
  commandIds,
  context,
}: {
  label: string;
  registry: CommandRegistry<Context>;
  commandIds: readonly (string | "separator")[];
  context: Context;
}) {
  useSyncExternalStore(registry.subscribe, registry.getVersion, registry.getVersion);
  const items = commandIds.flatMap<MenuEntry>((id): MenuEntry[] => {
    if (id === "separator") return [{ type: "separator" as const }];
    const command = registry.get(id);
    if (!command || command.visible?.(context) === false) return [];
    return [{ type: "command",
      label: command.title,
      shortcut: command.shortcut,
      disabled: command.enabled?.(context) === false,
      checked: command.checked?.(context),
      action: () => void registry.execute(id, context),
    }];
  });
  return <Menu label={label} items={items} />;
}
