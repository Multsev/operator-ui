# DataView

Canonical implementation: `../framework/src/components/DataView.tsx`.

DataView is the primary structured-collection primitive. `DataGrid` and `TreeView` are compatibility adapters, not separate engines.

## Modes

- `table`: flat data with visible column headers.
- `list`: compact flat collection without a separate header strip.
- `tree`: hierarchical rows using the first column as the label.
- `tree-table`: hierarchy plus multiple aligned columns.

## Shared capabilities

DataView provides stable-row selection, Ctrl/Cmd toggle, Shift range, keyboard navigation, sorting, live filtering, persisted widths/order/visibility, column resize/reorder, horizontal and vertical scrolling, synchronized headers, copying, double-click/open hooks, context-menu hooks and row virtualization.

Tree compositions may set `defaultExpansion="roots" | "all" | "none"`. The default remains `roots` for compatibility; applications implement explicit expand/collapse-all commands by remounting with a stable generation key and the requested default. Nested objects must retain occurrence-stable IDs.

Expandable rows toggle on double click by default. Tree/detail applications whose primary object action is open may set `doubleClickBehavior="open"`; the disclosure button and keyboard arrows continue to own expansion.

Provide stable string `id` values. Supply typed columns and a stable `storageKey`. Use an external SelectionModel when commands, inspectors or multiple views need to share selection.

For tree modes, provide `getChildren`. Keep hierarchy in application data; do not create a domain tree component.

## Usage boundaries

- Keep external read-only sources read-only unless editing is explicitly required.
- Do not enable inline editing by default.
- Keep expensive loading/filtering outside render through DataSource and AsyncTask.
- Preserve row keys across sorting, filtering and updates.
- Use virtualization for large collections; never render 10,000 DOM rows.
- Use text/icons/flags with color; do not encode state by color alone.

See `../examples/object-list/`, `../examples/tree-detail/`, `../examples/jira-like/` and `../examples/file-manager-like/`.
