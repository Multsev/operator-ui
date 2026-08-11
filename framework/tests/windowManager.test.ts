import { beforeEach, describe, expect, it } from 'vitest';
import { cascadeLayout, collisionSafePlacement, emptyWindowState, loadWindowState, normalizeWindowRect, prepareWindow, saveWindowState, tileLayout, windowReducer } from '../src/mdi/windowManager';
import type { ToolDefinitionRegistry, ToolWindowState, WorkspaceMetrics } from '../src/mdi/types';

const metrics: WorkspaceMetrics = { width: 1200, height: 700, scrollLeft: 0, scrollTop: 0 };

function tool(id: 'interfaces' | 'routes' | 'firewall' | 'logs', x: number, y: number): ToolWindowState {
  const prepared = prepareWindow(id, [], metrics); const rect = { ...prepared.rect, x, y };
  return { ...prepared, rect, restoreRect: rect };
}

describe('WindowManager', () => {
  beforeEach(() => localStorage.clear());

  it('opens, activates, minimizes, restores and closes windows with deterministic z-order', () => {
    const interfaces = tool('interfaces', 10, 10); const routes = tool('routes', 40, 40);
    let state = windowReducer(emptyWindowState, { type: 'open', window: interfaces }); state = windowReducer(state, { type: 'open', window: routes });
    expect(state.order).toEqual(['interfaces', 'routes']); expect(state.activeId).toBe('routes');
    state = windowReducer(state, { type: 'activate', id: 'interfaces' }); expect(state.order).toEqual(['routes', 'interfaces']);
    state = windowReducer(state, { type: 'minimize', id: 'interfaces' }); expect(state.activeId).toBe('routes');
    state = windowReducer(state, { type: 'restore', id: 'interfaces' }); expect(state.windows.interfaces.mode).toBe('normal');
    state = windowReducer(state, { type: 'close', id: 'interfaces' }); expect(state.order).toEqual(['routes']);
  });

  it('places new windows away from existing origins', () => {
    const existing = [tool('interfaces', 18, 18), tool('routes', 44, 42)];
    const placed = collisionSafePlacement(existing, { width: 500, height: 300 }, metrics);
    expect(placed.x).toBeGreaterThanOrEqual(18); expect(`${placed.x}:${placed.y}`).not.toBe('18:18');
  });

  it('cascades and tiles while respecting minimum dimensions', () => {
    const windows = Object.fromEntries([tool('interfaces', 0, 0), tool('routes', 0, 0), tool('firewall', 0, 0), tool('logs', 0, 0)].map((item) => [item.id, item]));
    const state = { windows, order: Object.keys(windows), activeId: 'logs' };
    const cascade = cascadeLayout(state, metrics); expect(new Set(cascade.order.map((id) => `${cascade.windows[id].rect.x}:${cascade.windows[id].rect.y}`)).size).toBe(4);
    for (const direction of ['horizontal', 'vertical'] as const) { const tiled = tileLayout(state, metrics, direction); for (const id of tiled.order) { expect(tiled.windows[id].rect.width).toBeGreaterThanOrEqual(tiled.windows[id].minSize.width); expect(tiled.windows[id].rect.height).toBeGreaterThanOrEqual(tiled.windows[id].minSize.height); } }
  });

  it('persists and repairs window state', () => {
    const item = tool('routes', -50, -20); const state = windowReducer(emptyWindowState, { type: 'open', window: item }); saveWindowState(state);
    const loaded = loadWindowState(); expect(loaded.windows.routes.rect.x).toBe(0); expect(loaded.windows.routes.rect.y).toBe(0); expect(loaded.activeId).toBe('routes');
  });

  it('repairs stale geometry for a smaller workspace and keeps the title reachable', () => {
    const repaired = normalizeWindowRect(
      { x: 1900, y: 1100, width: 1600, height: 900 },
      { width: 420, height: 240 },
      { width: 800, height: 600, scrollLeft: 0, scrollTop: 0 },
      true,
    );
    expect(repaired).toEqual({ x: 728, y: 576, width: 800, height: 600 });
    const item = tool('routes', 1900, 1100);
    const state = windowReducer(emptyWindowState, { type: 'open', window: { ...item, rect: { x: 1900, y: 1100, width: 1600, height: 900 }, restoreRect: { x: 1900, y: 1100, width: 1600, height: 900 } } });
    saveWindowState(state, 'small-workspace');
    const loaded = loadWindowState(undefined, 'small-workspace', { width: 800, height: 600, scrollLeft: 0, scrollTop: 0 });
    expect(loaded.windows.routes.rect).toEqual(repaired);
  });

  it('supports application-defined tools and isolated persistence', () => {
    const definitions: ToolDefinitionRegistry = {
      jira: { title: 'Jira', singleton: true, defaultSize: { width: 800, height: 520 }, minSize: { width: 560, height: 360 } },
      issue: { title: 'Issue', singleton: false, defaultSize: { width: 620, height: 440 }, minSize: { width: 420, height: 300 }, titleForParams: (params) => params?.key || 'Issue' },
    };
    const jira = prepareWindow('jira', [], metrics, undefined, definitions);
    const issue = prepareWindow('issue', [jira], metrics, { objectId: 'WB-42', key: 'WB-42' }, definitions);
    expect(jira.id).toBe('jira');
    expect(issue.id).toBe('issue:WB-42');
    expect(issue.title).toBe('WB-42');
    const state = windowReducer(windowReducer(emptyWindowState, { type: 'open', window: jira }), { type: 'open', window: issue });
    saveWindowState(state, 'workbox:mdi');
    expect(loadWindowState(definitions, 'workbox:mdi').order).toEqual(['jira', 'issue:WB-42']);
    expect(loadWindowState(definitions, 'another-app:mdi').order).toEqual([]);
  });
});
