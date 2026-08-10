// Canonical public inventory. Domain validation fixtures under src/app are intentionally excluded.
export { OPERATOR_UI_VERSION } from "./version";

export { Button, IconButton, TextField, SearchField, Select, Checkbox, RadioButton, FormRow, ProgressBar, InlineStatus } from "./components/controls";
export { CompactButton, CompactTextField, CompactComboBox, CompactCheckbox, CompactRadio, ToolbarButton16, TinyIconButton, QuickFind, FlagsColumn, StateIcon, StateText, PropertyRow } from "./components/compact-controls";
export { DataView } from "./components/DataView";
export type { DataViewColumn, DataViewMode, DataViewProps } from "./components/DataView";
export { DataGrid } from "./components/DataGrid";
export type { GridColumn, DataGridProps } from "./components/DataGrid";
export { TreeView } from "./components/TreeView";
export type { TreeNode } from "./components/TreeView";
export { Tabs } from "./components/Tabs";
export type { TabItem } from "./components/Tabs";
export { SplitView } from "./components/SplitView";
export { Panel, Inspector } from "./components/Panel";
export { CalendarGrid } from "./components/CalendarGrid";
export { PlainTextEditor, PlainTextViewer } from "./components/PlainTextEditor";
export { CommandButton, CommandToolbar, CommandMenuItem, CommandMenu } from "./components/CommandUI";
export { MenuBar, MenuItem, Menu, Toolbar, ToolbarSeparator, StatusBar, GroupBox, Dialog, EmptyState, LoadingState } from "./components/shell";
export type { MenuEntry } from "./components/shell";
export { PropertyDialog, ModalConfirmation, ErrorDialog, PropertyGrid, ConnectionState, Tooltip, ContextMenu, ContextMenuItem, ContextMenuSeparator, MainWindow, ToolWindow as LegacyToolWindow } from "./components/workspace";

export * from "./framework";

export { MDIWorkspace } from "./mdi/MDIWorkspace";
export { ToolWindow } from "./mdi/ToolWindow";
export { useWindowManager } from "./mdi/useWindowManager";
export type { WindowManagerOptions } from "./mdi/useWindowManager";
export { windowReducer, collisionSafePlacement, prepareWindow, cascadeLayout, tileLayout, loadWindowState, saveWindowState, emptyWindowState } from "./mdi/windowManager";
export { toolDefinitions } from "./mdi/types";
export type { ToolType, ToolDefinition, ToolDefinitionRegistry, InitialTool, Rect, Size, WindowMode, ToolWindowState, WindowManagerState, WorkspaceMetrics } from "./mdi/types";
