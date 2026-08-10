import {
  toolDefinitions,
  type Rect,
  type ToolType,
  type ToolWindowState,
  type WindowManagerState,
  type WorkspaceMetrics,
} from "./types";
import { frameworkPersistence } from "../framework";

export type WindowAction =
  | { type: "open"; window: ToolWindowState }
  | { type: "close"; id: string }
  | { type: "close-all" }
  | { type: "activate"; id: string }
  | { type: "set-rect"; id: string; rect: Rect }
  | { type: "minimize"; id: string }
  | { type: "maximize"; id: string; rect: Rect }
  | { type: "restore"; id: string }
  | {
      type: "layout";
      windows: Record<string, ToolWindowState>;
      order: string[];
    };

export const emptyWindowState: WindowManagerState = {
  windows: {},
  order: [],
  activeId: null,
};

function topAvailable(
  order: string[],
  windows: Record<string, ToolWindowState>,
) {
  return (
    [...order].reverse().find((id) => windows[id]?.mode !== "minimized") || null
  );
}

export function windowReducer(
  state: WindowManagerState,
  action: WindowAction,
): WindowManagerState {
  if (action.type === "open")
    return {
      windows: { ...state.windows, [action.window.id]: action.window },
      order: [
        ...state.order.filter((id) => id !== action.window.id),
        action.window.id,
      ],
      activeId: action.window.id,
    };
  if (action.type === "close") {
    const windows = { ...state.windows };
    delete windows[action.id];
    const order = state.order.filter((id) => id !== action.id);
    return {
      windows,
      order,
      activeId:
        state.activeId === action.id
          ? topAvailable(order, windows)
          : state.activeId,
    };
  }
  if (action.type === "close-all") return emptyWindowState;
  if (action.type === "layout")
    return {
      windows: action.windows,
      order: action.order,
      activeId: action.order.at(-1) || null,
    };
  if (!state.windows[action.id]) return state;
  if (action.type === "activate")
    return {
      ...state,
      order: [...state.order.filter((id) => id !== action.id), action.id],
      activeId: action.id,
    };
  if (action.type === "set-rect")
    return {
      ...state,
      windows: {
        ...state.windows,
        [action.id]: {
          ...state.windows[action.id],
          rect: action.rect,
          restoreRect: action.rect,
          mode: "normal",
        },
      },
    };
  if (action.type === "minimize") {
    const windows = {
      ...state.windows,
      [action.id]: { ...state.windows[action.id], mode: "minimized" as const },
    };
    return {
      ...state,
      windows,
      activeId: topAvailable(
        state.order.filter((id) => id !== action.id),
        windows,
      ),
    };
  }
  if (action.type === "maximize") {
    const current = state.windows[action.id];
    return {
      ...state,
      windows: {
        ...state.windows,
        [action.id]: {
          ...current,
          restoreRect:
            current.mode === "normal" ? current.rect : current.restoreRect,
          rect: action.rect,
          mode: "maximized",
        },
      },
    };
  }
  if (action.type === "restore") {
    const current = state.windows[action.id];
    return {
      ...state,
      windows: {
        ...state.windows,
        [action.id]: { ...current, rect: current.restoreRect, mode: "normal" },
      },
      activeId: action.id,
      order: [...state.order.filter((id) => id !== action.id), action.id],
    };
  }
  return state;
}

export function collisionSafePlacement(
  existing: ToolWindowState[],
  size: { width: number; height: number },
  metrics: WorkspaceMetrics,
): Rect {
  const usableWidth = Math.max(0, metrics.width - size.width - 36);
  const usableHeight = Math.max(0, metrics.height - size.height - 36);
  const grid = Array.from({ length: 20 }, (_, index) => {
    const column = index % 5;
    const row = Math.floor(index / 5);
    return {
      x: metrics.scrollLeft + 18 + Math.round((usableWidth * column) / 4),
      y: metrics.scrollTop + 18 + Math.round((usableHeight * row) / 3),
      width: size.width,
      height: size.height,
    };
  });
  const candidates = [
    ...grid,
    ...Array.from({ length: 12 }, (_, index) => ({
      x: metrics.scrollLeft + 18 + index * 26,
      y: metrics.scrollTop + 18 + index * 24,
      width: size.width,
      height: size.height,
    })),
  ];
  const overlap = (a: Rect, b: Rect) =>
    Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return candidates.sort(
    (a, b) =>
      existing.reduce((sum, item) => sum + overlap(a, item.rect), 0) -
      existing.reduce((sum, item) => sum + overlap(b, item.rect), 0),
  )[0];
}

export function prepareWindow(
  tool: ToolType,
  existing: ToolWindowState[],
  metrics: WorkspaceMetrics,
  params?: Record<string, string>,
): ToolWindowState {
  const definition = toolDefinitions[tool];
  const id = definition.singleton
    ? tool
    : `${tool}:${params?.objectId || params?.kind || Date.now()}`;
  const rect = collisionSafePlacement(
    existing,
    definition.defaultSize,
    metrics,
  );
  const title =
    tool === "properties" && params?.name
      ? `${params.name} — Properties`
      : tool === "validation" && params?.title
        ? params.title
        : definition.title;
  return {
    id,
    tool,
    params,
    title,
    rect,
    restoreRect: rect,
    minSize: definition.minSize,
    mode: "normal",
  };
}

export function cascadeLayout(
  state: WindowManagerState,
  metrics: WorkspaceMetrics,
) {
  const ids = state.order.filter(
    (id) => state.windows[id].mode !== "minimized",
  );
  const width = Math.max(520, Math.min(720, metrics.width - 110));
  const height = Math.max(300, Math.min(480, metrics.height - 90));
  const windows = { ...state.windows };
  ids.forEach((id, index) => {
    const rect = {
      x: metrics.scrollLeft + 18 + index * 27,
      y: metrics.scrollTop + 18 + index * 25,
      width,
      height,
    };
    windows[id] = { ...windows[id], rect, restoreRect: rect, mode: "normal" };
  });
  return { windows, order: state.order };
}

export function tileLayout(
  state: WindowManagerState,
  metrics: WorkspaceMetrics,
  direction: "horizontal" | "vertical",
) {
  const ids = state.order.filter(
    (id) => state.windows[id].mode !== "minimized",
  );
  if (!ids.length) return { windows: state.windows, order: state.order };
  const windows = { ...state.windows };
  const gap = 3;
  ids.forEach((id, index) => {
    const min = windows[id].minSize;
    const rect =
      direction === "vertical"
        ? {
            x:
              metrics.scrollLeft +
              index *
                Math.max(
                  min.width,
                  Math.floor(
                    (metrics.width - gap * (ids.length - 1)) / ids.length,
                  ),
                ),
            y: metrics.scrollTop,
            width: Math.max(
              min.width,
              Math.floor((metrics.width - gap * (ids.length - 1)) / ids.length),
            ),
            height: Math.max(min.height, metrics.height),
          }
        : {
            x: metrics.scrollLeft,
            y:
              metrics.scrollTop +
              index *
                Math.max(
                  min.height,
                  Math.floor(
                    (metrics.height - gap * (ids.length - 1)) / ids.length,
                  ),
                ),
            width: Math.max(min.width, metrics.width),
            height: Math.max(
              min.height,
              Math.floor(
                (metrics.height - gap * (ids.length - 1)) / ids.length,
              ),
            ),
          };
    windows[id] = { ...windows[id], rect, restoreRect: rect, mode: "normal" };
  });
  return { windows, order: state.order };
}

export function loadWindowState(): WindowManagerState {
  try {
    const parsed = frameworkPersistence.get<{
      version?: number;
      state?: WindowManagerState;
    } | null>("v2:mdi-workspace", null);
    if (parsed?.version !== 2 || !parsed.state) return emptyWindowState;
    const windows = Object.fromEntries(
      Object.entries(parsed.state.windows)
        .filter(([, item]) => Boolean(toolDefinitions[item.tool]))
        .map(([id, item]) => [
          id,
          {
            ...item,
            minSize: toolDefinitions[item.tool].minSize,
            rect: {
              ...item.rect,
              x: Math.max(0, item.rect.x),
              y: Math.max(0, item.rect.y),
              width: Math.max(
                toolDefinitions[item.tool].minSize.width,
                item.rect.width,
              ),
              height: Math.max(
                toolDefinitions[item.tool].minSize.height,
                item.rect.height,
              ),
            },
          },
        ]),
    );
    const order = parsed.state.order.filter((id) => windows[id]);
    return {
      windows,
      order,
      activeId: windows[parsed.state.activeId || ""]
        ? parsed.state.activeId
        : order.at(-1) || null,
    };
  } catch {
    return emptyWindowState;
  }
}
export function saveWindowState(state: WindowManagerState) {
  frameworkPersistence.set("v2:mdi-workspace", { version: 2, state });
}
