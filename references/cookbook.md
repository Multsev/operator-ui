# Framework cookbook

## Add a table tool

1. Add a `ToolType` and definition in `../framework/src/mdi/types.ts`.
2. Add launcher metadata; `openTool` handles singleton activation.
3. Render `ObjectTableWindow` from `ToolContents` with typed rows and columns.
4. Supply only real callbacks. Unsupported commands must be disabled or omitted.
5. Choose flags/text state renderers; do not use status pills.

## Choose a composition

- Table: ObjectList (`CommandToolbar` + `DataView` + local status).
- Tabbed table: shared `Tabs` + `DataView`.
- Tree/detail or master/detail: `SplitView` + `DataView` + `Inspector`.
- Property editor: modeless property `ToolWindow` with controlled draft, validation, OK/Cancel/Apply.
- Confirmation/error: modal `Dialog` wrappers.
- Log/terminal: dense local toolbar, scrollable content and segmented local status.

Verify minimum size, keyboard access, context menu, inactive selection, wide-column horizontal alignment, 100–200% scale, light/dark themes and workspace persistence.

## Add a new application domain

1. Keep adapters, rows and labels in application code; implement a small `DataSource` only if origin independence is useful.
2. Define commands once and bind the current `SelectionModel` snapshot as context.
3. Select an official pattern from `patterns.md`.
4. Use `AsyncTask` for cancellable work and stale-result protection.
5. Assign stable persistence IDs to DataView, Tabs and Splitter.
6. Request a new core primitive only after two unrelated domains cannot be expressed cleanly by composition.
