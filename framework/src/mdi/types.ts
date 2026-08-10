export type ToolType = string;

export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };
export type WindowMode = "normal" | "minimized" | "maximized";

export type ToolWindowState = {
  id: string;
  tool: ToolType;
  title: string;
  params?: Record<string, string>;
  rect: Rect;
  restoreRect: Rect;
  minSize: Size;
  mode: WindowMode;
};

export type WindowManagerState = {
  windows: Record<string, ToolWindowState>;
  order: string[];
  activeId: string | null;
};

export type WorkspaceMetrics = {
  width: number;
  height: number;
  scrollLeft: number;
  scrollTop: number;
};

export type ToolDefinition = {
  title: string;
  singleton: boolean;
  defaultSize: Size;
  minSize: Size;
  titleForParams?: (params?: Record<string, string>) => string;
};

export type ToolDefinitionRegistry = Record<ToolType, ToolDefinition>;

export type InitialTool = {
  tool: ToolType;
  params?: Record<string, string>;
  rect?: Rect;
};

export const toolDefinitions: ToolDefinitionRegistry = {
  interfaces: {
    title: "Interfaces",
    singleton: true,
    defaultSize: { width: 660, height: 390 },
    minSize: { width: 420, height: 240 },
  },
  routes: {
    title: "Route List",
    singleton: true,
    defaultSize: { width: 680, height: 350 },
    minSize: { width: 440, height: 230 },
  },
  firewall: {
    title: "Firewall",
    singleton: true,
    defaultSize: { width: 700, height: 360 },
    minSize: { width: 460, height: 240 },
  },
  logs: {
    title: "Log",
    singleton: true,
    defaultSize: { width: 660, height: 300 },
    minSize: { width: 420, height: 210 },
  },
  terminal: {
    title: "Terminal",
    singleton: true,
    defaultSize: { width: 600, height: 330 },
    minSize: { width: 380, height: 220 },
  },
  users: {
    title: "Users",
    singleton: true,
    defaultSize: { width: 520, height: 300 },
    minSize: { width: 360, height: 220 },
  },
  files: {
    title: "Files",
    singleton: true,
    defaultSize: { width: 590, height: 330 },
    minSize: { width: 390, height: 220 },
  },
  properties: {
    title: "Properties",
    singleton: false,
    defaultSize: { width: 470, height: 305 },
    minSize: { width: 400, height: 275 },
    titleForParams: (params) => params?.name ? `${params.name} — Properties` : "Properties",
  },
  gallery: {
    title: "UI Gallery — Developer",
    singleton: true,
    defaultSize: { width: 820, height: 600 },
    minSize: { width: 620, height: 430 },
  },
  validation: {
    title: "Composition validation",
    singleton: false,
    defaultSize: { width: 790, height: 500 },
    minSize: { width: 560, height: 360 },
    titleForParams: (params) => params?.title || "Composition validation",
  },
};
