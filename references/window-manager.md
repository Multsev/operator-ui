# Window Manager contract

`../framework/src/mdi/` is the single owner of MDI window state. Its public lifecycle is: register a `ToolType`, open or activate it, move/resize it, minimize/maximize/restore it, arrange it, and close it. State is persisted under `ou:v2:mdi-workspace`; the schema number is independent from the Operator UI package version.

Applications pass `definitions`, `initialTools`, and a stable `storageKey` to `useWindowManager`. Omitting options preserves the executable network-demo registry and initial layout. A custom registry with no `initialTools` starts empty. This is the supported application extension point; applications must not fork the reducer or create another window manager.

## Invariants

- Every ordinary tool is a `ToolWindow` inside `MDIWorkspace`.
- Window identity, rect, mode, z-order and activation never live in domain components.
- Singleton tools use the tool id; modeless inspectors use a stable object id.
- Persisted and resized windows are reconciled to the current workspace; at least their title bars remain reachable.
- A child may exceed the viewport only when its declared minimum is larger than the viewport, and workspace scrollbars keep it reachable.
- Local commands stay inside the owning child window. Global menus contain application and window-management commands only.
- Property windows record `ownerId`; closing them reactivates the opener.
- Pointer geometry is normalized by `--ou-ui-scale`.

Do not introduce page routing as tool navigation, equal dashboard tiling as the default composition, a second persistence format, docking, or uncontrolled OS windows.
