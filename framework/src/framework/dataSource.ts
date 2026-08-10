export type DataQuery = { text?: string; offset?: number; limit?: number; sort?: { key: string; direction: 'asc' | 'desc' } };
export type DataResult<T> = { items: readonly T[]; total: number };

export interface DataSource<T> {
  load(query?: DataQuery, signal?: AbortSignal): Promise<DataResult<T>>;
  refresh?(signal?: AbortSignal): Promise<DataResult<T>>;
  subscribe?(listener: () => void): () => void;
  dispose?(): void;
}

export class InMemoryDataSource<T> implements DataSource<T> {
  constructor(private items: readonly T[], private searchableText: (item: T) => string = (item) => String(item)) {}
  setItems(items: readonly T[]) { this.items = items; }
  async load(query: DataQuery = {}) {
    const text = query.text?.trim().toLowerCase(); let items = text ? this.items.filter((item) => this.searchableText(item).toLowerCase().includes(text)) : [...this.items];
    if (query.sort) { const { key, direction } = query.sort; items = [...items].sort((a, b) => String((a as Record<string, unknown>)[key]).localeCompare(String((b as Record<string, unknown>)[key]), undefined, { numeric: true }) * (direction === 'asc' ? 1 : -1)); }
    const total = items.length; const offset = query.offset ?? 0; const limit = query.limit ?? total;
    return { items: items.slice(offset, offset + limit), total };
  }
  refresh() { return this.load(); }
}
