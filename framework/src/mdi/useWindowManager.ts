import { useEffect, useReducer, useRef } from 'react';
import { cascadeLayout, emptyWindowState, loadWindowState, prepareWindow, saveWindowState, tileLayout, windowReducer } from './windowManager';
import { toolDefinitions } from './types';
import type { InitialTool, Rect, ToolDefinitionRegistry, ToolType, WorkspaceMetrics } from './types';

const fallbackMetrics: WorkspaceMetrics = { width: 1024, height: 700, scrollLeft: 0, scrollTop: 0 };

export type WindowManagerOptions = {
  definitions?: ToolDefinitionRegistry;
  initialTools?: InitialTool[];
  storageKey?: string;
  fallbackMetrics?: WorkspaceMetrics;
};

const demoRects: Record<string, Rect> = {
  routes: { x: 18, y: 18, width: 560, height: 280 }, interfaces: { x: 170, y: 260, width: 650, height: 350 }, firewall: { x: 570, y: 18, width: 630, height: 300 }, logs: { x: 650, y: 330, width: 560, height: 270 },
};

export function useWindowManager(options: WindowManagerOptions = {}) {
  const definitions = options.definitions ?? toolDefinitions;
  const storageKey = options.storageKey ?? 'v2:mdi-workspace';
  const initialMetrics = options.fallbackMetrics ?? fallbackMetrics;
  const initialTools: InitialTool[] = options.initialTools ?? (options.definitions ? [] : ['routes', 'interfaces', 'firewall', 'logs'].map((tool) => ({ tool, rect: demoRects[tool] })));
  const [state, dispatch] = useReducer(windowReducer, undefined, () => {
    const saved = loadWindowState(definitions, storageKey, initialMetrics); if (saved.order.length) return saved;
    let seeded = emptyWindowState;
    for (const item of initialTools) { const prepared = prepareWindow(item.tool, Object.values(seeded.windows), initialMetrics, item.params, definitions); const rect = item.rect || prepared.rect; seeded = windowReducer(seeded, { type: 'open', window: { ...prepared, rect, restoreRect: rect } }); }
    return seeded;
  }); const metrics = useRef<WorkspaceMetrics>(initialMetrics);
  useEffect(() => { const timer = window.setTimeout(() => saveWindowState(state, storageKey), 220); return () => window.clearTimeout(timer); }, [state, storageKey]);
  const api = {
    setMetrics: (value: WorkspaceMetrics) => {
      const resized = metrics.current.width !== value.width || metrics.current.height !== value.height;
      metrics.current = value;
      if (resized) dispatch({ type: 'reconcile', metrics: value });
    },
    openTool: (tool: ToolType, params?: Record<string, string>) => { const singleton = state.windows[tool]; if (singleton) { dispatch({ type: singleton.mode === 'minimized' ? 'restore' : 'activate', id: singleton.id }); return; } dispatch({ type: 'open', window: prepareWindow(tool, Object.values(state.windows), metrics.current, params, definitions) }); },
    closeWindow: (id: string) => dispatch({ type: 'close', id }), closeAll: () => dispatch({ type: 'close-all' }),
    activateWindow: (id: string) => dispatch({ type: 'activate', id }), setRect: (id: string, rect: Rect) => dispatch({ type: 'set-rect', id, rect }),
    minimizeWindow: (id: string) => dispatch({ type: 'minimize', id }), restoreWindow: (id: string) => dispatch({ type: 'restore', id }),
    maximizeWindow: (id: string) => dispatch({ type: 'maximize', id, rect: { x: metrics.current.scrollLeft, y: metrics.current.scrollTop, width: Math.max(state.windows[id].minSize.width, metrics.current.width), height: Math.max(state.windows[id].minSize.height, metrics.current.height) } }),
    cascade: () => dispatch({ type: 'layout', ...cascadeLayout(state, metrics.current) }), tileHorizontally: () => dispatch({ type: 'layout', ...tileLayout(state, metrics.current, 'horizontal') }), tileVertically: () => dispatch({ type: 'layout', ...tileLayout(state, metrics.current, 'vertical') }),
  };
  return { state, ...api };
}
