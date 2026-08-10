import { useRef, useSyncExternalStore } from 'react';

export type AsyncTaskState<T> =
  | { status: 'idle'; generation: number }
  | { status: 'pending'; generation: number; progress?: number }
  | { status: 'success'; generation: number; value: T }
  | { status: 'error'; generation: number; error: unknown }
  | { status: 'cancelled'; generation: number };

export class AsyncTask<T, Args extends unknown[] = []> {
  private state: AsyncTaskState<T> = { status: 'idle', generation: 0 };
  private listeners = new Set<() => void>();
  private controller: AbortController | null = null;
  constructor(private operation: (signal: AbortSignal, ...args: Args) => Promise<T>) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  async run(...args: Args) {
    this.controller?.abort(); const controller = new AbortController(); this.controller = controller; const generation = this.state.generation + 1; this.set({ status: 'pending', generation });
    try { const value = await this.operation(controller.signal, ...args); if (controller.signal.aborted || generation !== this.state.generation) return undefined; this.set({ status: 'success', generation, value }); return value; }
    catch (error) { if (controller.signal.aborted) { if (generation === this.state.generation) this.set({ status: 'cancelled', generation }); return undefined; } if (generation === this.state.generation) this.set({ status: 'error', generation, error }); return undefined; }
  }
  reportProgress(progress: number) { if (this.state.status === 'pending') this.set({ ...this.state, progress: Math.max(0, Math.min(1, progress)) }); }
  cancel() { if (!this.controller) return; const generation = this.state.generation; this.controller.abort(); this.set({ status: 'cancelled', generation }); }
  private set(state: AsyncTaskState<T>) { this.state = state; this.listeners.forEach((listener) => listener()); }
}

export function useAsyncTask<T, Args extends unknown[]>(operation: (signal: AbortSignal, ...args: Args) => Promise<T>) {
  const operationRef = useRef(operation); operationRef.current = operation;
  const taskRef = useRef<AsyncTask<T, Args> | null>(null); if (!taskRef.current) taskRef.current = new AsyncTask((signal, ...args) => operationRef.current(signal, ...args));
  const task = taskRef.current; const state = useSyncExternalStore(task.subscribe, task.getSnapshot, task.getSnapshot); return { task, state };
}
