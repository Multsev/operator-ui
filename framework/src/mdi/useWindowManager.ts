import { useEffect, useReducer, useRef } from 'react';
import { cascadeLayout, emptyWindowState, loadWindowState, prepareWindow, saveWindowState, tileLayout, windowReducer } from './windowManager';
import type { Rect, ToolType, WorkspaceMetrics } from './types';

const fallbackMetrics: WorkspaceMetrics = { width: 1024, height: 700, scrollLeft: 0, scrollTop: 0 };

export function useWindowManager() {
  const [state, dispatch] = useReducer(windowReducer, undefined, () => {
    const saved = loadWindowState(); if (saved.order.length) return saved;
    const initialRects: Record<string, Rect> = {
      routes: { x: 18, y: 18, width: 560, height: 280 }, interfaces: { x: 170, y: 260, width: 650, height: 350 }, firewall: { x: 570, y: 18, width: 630, height: 300 }, logs: { x: 650, y: 330, width: 560, height: 270 },
    };
    let seeded = emptyWindowState; const tools: ToolType[] = ['routes', 'interfaces', 'firewall', 'logs'];
    for (const tool of tools) { const prepared = prepareWindow(tool, Object.values(seeded.windows), fallbackMetrics); const rect = initialRects[tool]; seeded = windowReducer(seeded, { type: 'open', window: { ...prepared, rect, restoreRect: rect } }); }
    return seeded;
  }); const metrics = useRef<WorkspaceMetrics>(fallbackMetrics);
  useEffect(() => { const timer = window.setTimeout(() => saveWindowState(state), 220); return () => window.clearTimeout(timer); }, [state]);
  const api = {
    setMetrics: (value: WorkspaceMetrics) => { metrics.current = value; },
    openTool: (tool: ToolType, params?: Record<string, string>) => { const singleton = state.windows[tool]; if (singleton) { dispatch({ type: singleton.mode === 'minimized' ? 'restore' : 'activate', id: singleton.id }); return; } dispatch({ type: 'open', window: prepareWindow(tool, Object.values(state.windows), metrics.current, params) }); },
    closeWindow: (id: string) => dispatch({ type: 'close', id }), closeAll: () => dispatch({ type: 'close-all' }),
    activateWindow: (id: string) => dispatch({ type: 'activate', id }), setRect: (id: string, rect: Rect) => dispatch({ type: 'set-rect', id, rect }),
    minimizeWindow: (id: string) => dispatch({ type: 'minimize', id }), restoreWindow: (id: string) => dispatch({ type: 'restore', id }),
    maximizeWindow: (id: string) => dispatch({ type: 'maximize', id, rect: { x: metrics.current.scrollLeft, y: metrics.current.scrollTop, width: Math.max(state.windows[id].minSize.width, metrics.current.width), height: Math.max(state.windows[id].minSize.height, metrics.current.height) } }),
    cascade: () => dispatch({ type: 'layout', ...cascadeLayout(state, metrics.current) }), tileHorizontally: () => dispatch({ type: 'layout', ...tileLayout(state, metrics.current, 'horizontal') }), tileVertically: () => dispatch({ type: 'layout', ...tileLayout(state, metrics.current, 'vertical') }),
  };
  return { state, ...api };
}
