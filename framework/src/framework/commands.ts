export type CommandContext = Record<string, unknown>;
export type Command<Context extends CommandContext = CommandContext> = {
  id: string;
  title: string;
  shortTitle?: string;
  icon?: string;
  shortcut?: string;
  enabled?: (context: Context) => boolean;
  visible?: (context: Context) => boolean;
  checked?: (context: Context) => boolean;
  execute: (context: Context) => void | Promise<void>;
};

function normalizeShortcut(value: string) { return value.toLowerCase().replace('cmd', 'meta').replace('control', 'ctrl').split('+').map((part) => part.trim()).sort().join('+'); }
function shortcutFromEvent(event: KeyboardEvent) { const parts = [event.ctrlKey && 'ctrl', event.metaKey && 'meta', event.altKey && 'alt', event.shiftKey && 'shift', event.key.toLowerCase()].filter(Boolean) as string[]; return parts.sort().join('+'); }

export class CommandRegistry<Context extends CommandContext = CommandContext> {
  private commands = new Map<string, Command<Context>>();
  private listeners = new Set<() => void>();
  private version = 0;
  getVersion = () => this.version;

  register(command: Command<Context>) { this.commands.set(command.id, command); this.emit(); return () => this.unregister(command.id); }
  unregister(id: string) { const changed = this.commands.delete(id); if (changed) this.emit(); }
  get(id: string) { return this.commands.get(id); }
  list(context: Context) { return [...this.commands.values()].filter((command) => command.visible?.(context) !== false); }
  canExecute(id: string, context: Context) { const command = this.get(id); return Boolean(command && command.visible?.(context) !== false && command.enabled?.(context) !== false); }
  async execute(id: string, context: Context) { const command = this.get(id); if (!command || !this.canExecute(id, context)) return false; await command.execute(context); return true; }
  async dispatchShortcut(event: KeyboardEvent, context: Context) {
    const pressed = shortcutFromEvent(event); const command = this.list(context).find((candidate) => candidate.shortcut && normalizeShortcut(candidate.shortcut) === pressed);
    if (!command || command.enabled?.(context) === false) return false; event.preventDefault(); await command.execute(context); return true;
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  private emit() { this.version += 1; this.listeners.forEach((listener) => listener()); }
}
