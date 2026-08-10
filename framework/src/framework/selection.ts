export type SelectionKey = string;
export type SelectionSnapshot<Key extends SelectionKey = SelectionKey> = Readonly<{
  selected: ReadonlySet<Key>;
  anchor: Key | null;
  active: Key | null;
}>;

export type SelectionIntent = { toggle?: boolean; range?: boolean };

const emptySnapshot = <Key extends SelectionKey>(): SelectionSnapshot<Key> => ({ selected: new Set<Key>(), anchor: null, active: null });

export class SelectionModel<Key extends SelectionKey = SelectionKey> {
  private snapshot: SelectionSnapshot<Key> = emptySnapshot<Key>();
  private listeners = new Set<() => void>();

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  get selectedCount() { return this.snapshot.selected.size; }
  isSelected(key: Key) { return this.snapshot.selected.has(key); }

  select(key: Key, orderedKeys: readonly Key[], intent: SelectionIntent = {}) {
    if (intent.range && this.snapshot.anchor) {
      const from = orderedKeys.indexOf(this.snapshot.anchor); const to = orderedKeys.indexOf(key);
      if (from >= 0 && to >= 0) return this.update(new Set(orderedKeys.slice(Math.min(from, to), Math.max(from, to) + 1)), this.snapshot.anchor, key);
    }
    if (intent.toggle) { const next = new Set(this.snapshot.selected); next.has(key) ? next.delete(key) : next.add(key); return this.update(next, key, key); }
    this.update(new Set([key]), key, key);
  }

  selectAll(keys: readonly Key[]) { this.update(new Set(keys), keys[0] ?? null, keys.at(-1) ?? null); }
  clear() { this.update(new Set(), null, null); }
  setActive(key: Key | null) { this.update(new Set(this.snapshot.selected), this.snapshot.anchor, key); }
  reconcile(keys: readonly Key[]) {
    const available = new Set(keys); const selected = new Set([...this.snapshot.selected].filter((key) => available.has(key)));
    const anchor = this.snapshot.anchor && available.has(this.snapshot.anchor) ? this.snapshot.anchor : null;
    const active = this.snapshot.active && available.has(this.snapshot.active) ? this.snapshot.active : keys[0] ?? null;
    if (selected.size !== this.snapshot.selected.size || anchor !== this.snapshot.anchor || active !== this.snapshot.active) this.update(selected, anchor, active);
  }

  private update(selected: Set<Key>, anchor: Key | null, active: Key | null) {
    this.snapshot = { selected, anchor, active }; this.listeners.forEach((listener) => listener());
  }
}

export function selectionIntent(event: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }): SelectionIntent {
  return { range: Boolean(event.shiftKey), toggle: Boolean(event.ctrlKey || event.metaKey) };
}
