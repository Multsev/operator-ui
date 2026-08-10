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
import { useSyncExternalStore, type ReactNode } from "react";
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
  return (
    <button
      className={compact ? "ou-toolbar-button-16" : "ou-compact-button"}
      title={command.title}
      aria-label={command.title}
      aria-pressed={command.checked?.(context)}
      disabled={command.enabled?.(context) === false}
      onClick={() => void registry.execute(commandId, context)}
    >
      {Icon && <Icon />}
      {children || (!compact && (command.shortTitle || command.title))}
    </button>
  );
}

export function CommandToolbar<Context extends CommandContext>({
  registry,
  commandIds,
  context,
  label = "Commands",
  trailing,
}: {
  registry: CommandRegistry<Context>;
  commandIds: readonly (string | "separator")[];
  context: Context;
  label?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="ou-local-toolbar" role="toolbar" aria-label={label}>
      {commandIds.map((id, index) =>
        id === "separator" ? (
          <span
            key={`separator-${index}`}
            className="ou-local-toolbar-separator"
            role="separator"
          />
        ) : (
          <CommandButton
            key={id}
            registry={registry}
            commandId={id}
            context={context}
          />
        ),
      )}
      <span className="ou-local-toolbar-fill" />
      {trailing}
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
