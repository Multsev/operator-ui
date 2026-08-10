export class PersistenceStore {
  constructor(private namespace = 'ou') {}
  get<T>(id: string, fallback: T, validate?: (value: unknown) => value is T): T {
    try { const value = JSON.parse(localStorage.getItem(`${this.namespace}:${id}`) || 'null'); return value !== null && (!validate || validate(value)) ? value as T : fallback; } catch { return fallback; }
  }
  set<T>(id: string, value: T) { try { localStorage.setItem(`${this.namespace}:${id}`, JSON.stringify(value)); return true; } catch { return false; } }
  remove(id: string) { try { localStorage.removeItem(`${this.namespace}:${id}`); } catch { /* Persistence failure must not affect UI. */ } }
}

export const frameworkPersistence = new PersistenceStore('ou');
