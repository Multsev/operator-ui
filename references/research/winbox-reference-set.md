# WinBox reference set for Operator UI v1 Stable

Checked 2026-08-10. This is the visual evidence set for the final stabilization pass. It is intentionally centered on official WinBox 3/classic material because Operator UI's accepted baseline is a compact MDI engineering desktop. WinBox 4 is documented separately below and is not mixed into the visual target.

The screenshots remain MikroTik property and are stored only as attributed research references. Operator UI may learn from their general desktop patterns, but must not copy MikroTik logos, branding, proprietary icons, router identity data, or screenshot annotations.

## Primary sources and selection rules

- [Official WinBox documentation](https://help.mikrotik.com/docs/spaces/ROS/pages/328129/WinBox): primary source for the WinBox 3 shell, loader, MDI work area, child-window toolbars, route tables, filtering, column menus, detail/category views, interface monitoring, copy flow, and keyboard behavior. The page explicitly identifies the interface as MDI and describes work-area overflow and per-child toolbars.
- [Official PtP GUI example](https://help.mikrotik.com/docs/spaces/ROS/pages/39682067/PtP%2BGUI%2Bexample): secondary source for a WinBox 3 Bridge property window and tabs.
- [Official WinBox downloads](https://mikrotik.com/download/winbox/) and the official [WinBox 4.3 release thread](https://forum.mikrotik.com/t/winbox-4-3-released/271759): generation check only. As of the research date, WinBox 4.3 is the current generation; it is not the visual baseline used by this set.

Selection criteria:

1. The source is an official MikroTik documentation or announcement surface.
2. The image shows WinBox itself, not WebFig, a generic RouterOS diagram, or third-party recreation.
3. The image adds a distinct shell, window, table, form, menu, selection, tab, or monitoring state.
4. The core set stays within WinBox 3/classic. Host-OS title colors vary, but geometry and component relationships remain compatible.

Confidence means confidence in the generation/category attribution, not an assertion that every pixel is a timeless WinBox design token.

## Core WinBox 3/classic set

| # | Local reference | Official source | Generation/version | Category | Useful observations | Confidence |
|---:|---|---|---|---|---|---|
| 1 | [`official-winbox3.png`](references/official-winbox3.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox3.png?version=1&modificationDate=1570716987658&api=v2) | WinBox 3; screenshot title reports WinBox v3.6rc6 | Main shell, window chrome, active session | Narrow launcher at left, gray spatial work area, single global session strip, compact menu/toolbar stack, status information at the shell edge. The annotations are documentation markup, not UI assets. | High |
| 2 | [`official-winbox3_work_area.png`](references/official-winbox3_work_area.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox3_work_area.png?version=1&modificationDate=1570717132536&api=v2) | WinBox 3; same session as #1 | Multiple simultaneous windows, active/inactive state, Interfaces, Routes | Child windows overlap inside a gray MDI canvas. Active and inactive title bars are unmistakable; each window owns its tabs, command strip, grid, and status row. Workspace scrollbars appear when a child extends beyond the visible area. | High |
| 3 | [`official-Winbox-window-search.png`](references/official-Winbox-window-search.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-search.png?version=1&modificationDate=1570717394117&api=v2) | WinBox 3/classic; older Windows host theme | Routes, quick find, tabs, local toolbar | The table window is self-contained: domain tabs first, icon commands below, quick search and scope combo on the right, dense header/grid, row flags at the left, and an item-count footer. | High |
| 4 | [`official-Winbox-window-sort.png`](references/official-Winbox-window-sort.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-sort.png?version=1&modificationDate=1570717448154&api=v2) | WinBox 3/classic; older Windows host theme | Routes, filter builder | Filtering expands locally beneath the toolbar instead of becoming a global page. Controls use compact field/operator/value rows and small add/remove actions; results stay visible below. | High |
| 5 | [`official-winbox3-column-context-menu.png`](references/official-winbox3-column-context-menu.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-field.png?version=1&modificationDate=1570717546327&api=v2) | WinBox 3/classic; older Windows host theme | Context menu, columns, checked menu items, submenu | Right-click actions are dense and textual. Column visibility is a checked submenu; selected and disabled states rely on standard menu affordances, not card-like controls. | High |
| 6 | [`official-Winbox-window-detail.png`](references/official-Winbox-window-detail.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-detail.png?version=1&modificationDate=1570717649886&api=v2) | WinBox 3/classic; older Windows host theme | Detail table, context menu, selected row | A single grid can switch from rows to parameter/value detail without changing window architecture. Inactive selection remains visible, and context actions stay close to the object list. | High |
| 7 | [`official-winbox3-category-view.png`](references/official-winbox3-category-view.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-category.png?version=1&modificationDate=1570717682995&api=v2) | WinBox 3/classic; older Windows host theme | Grouped/category table | Category headers are thin inline separators inside the grid, not large accordions. Dense rows, flags, columns, and footer remain stable while grouping changes. | High |
| 8 | [`official-winbox3-interface-traffic-monitor.png`](references/official-winbox3-interface-traffic-monitor.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-trafmon.png?version=1&modificationDate=1570717937143&api=v2) | WinBox 3/classic; older Windows host theme | Interfaces, property dialog, tabs, live metrics | General/Ethernet/Status/Traffic tabs share one compact property frame. Read-only metrics use aligned label/value cells; live traffic charts are subordinate to numeric values and preserve the command rail on the right. | High |
| 9 | [`official-winbox3-interface-copy-list.png`](references/official-winbox3-interface-copy-list.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-copy-1.PNG?version=1&modificationDate=1570718173146&api=v2) | WinBox 3.20rc4 shown in title; Windows 10 host chrome | Interfaces, list window, flags, tabs | A large Interface List remains visually light despite many tabs and columns. Flags are terse text in the leading column; throughput is ordinary table data, not pill badges. | High |
| 10 | [`official-winbox3-interface-property-tabs.png`](references/official-winbox3-interface-property-tabs.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox-copy-2.PNG?version=1&modificationDate=1570718191830&api=v2) | WinBox 3.20rc4 shown in title; Windows 10 host chrome | Property dialog, tabs, overlapping child windows | A property editor opens above its source list without replacing it. Tabs are shallow, fields are tightly aligned, and the narrow right-side command rail keeps OK/Cancel/Apply and object commands predictable. | High |
| 11 | [`official-winbox3-interface-copy-dialog.png`](references/official-winbox3-interface-copy-dialog.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox-copy-3.PNG?version=1&modificationDate=1570718209792&api=v2) | WinBox 3.20rc4 shown in title; Windows 10 host chrome | Property copy state, editable form | Copy reuses the same property primitive and changes object state/title rather than launching a new full-screen flow. Editable and read-only fields share geometry. Red callouts belong to the manual. | High |
| 12 | [`official-winbox3-interface-static-result.png`](references/official-winbox3-interface-static-result.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox-copy-4.PNG?version=1&modificationDate=1570718230700&api=v2) | WinBox 3.20rc4 shown in title; Windows 10 host chrome | Interfaces, post-action state | The action result is communicated through the row/flag state inside the same list window. No toast stack, hero confirmation, or page transition is required. Red callouts belong to the manual. | High |
| 13 | [`official-winbox3-bridge-property.png`](references/official-winbox3-bridge-property.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/39682067/winbox_bridge_screen.png?version=2&modificationDate=1601537638490&api=v2) | WinBox 3-era capture; RouterOS 7.0beta context, Windows 10 host chrome | Bridge, property dialog, tabs | Bridge uses the same shell, list, local toolbar, property tabs, aligned form, and right command rail as Interfaces. This is strong evidence that component geometry is shared across domains. | High |
| 14 | [`official-winbox3-loader-simple.png`](references/official-winbox3-loader-simple.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox_loader_simple_.png?version=1&modificationDate=1570715133744&api=v2) | WinBox 3.20rc4 shown in title | Connection loader, compact form/table | Connection fields, checkboxes, action buttons, tabs, and managed-router table fit in one utility window. Section separation comes from rules and alignment rather than cards. | High |
| 15 | [`official-winbox3-loader-neighbours.png`](references/official-winbox3-loader-neighbours.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox3_loader_neighbours.png?version=1&modificationDate=1570715282332&api=v2) | WinBox 3/classic loader | Neighbors, discovery table, active tab | A small discovery window still has a full data-grid grammar: selected tab, refresh command, quick find, scope combo, compact row selection, sortable headers, and vertical scrolling. | High |
| 16 | [`official-winbox3-loader-advanced.png`](references/official-winbox3-loader-advanced.png) | [attachment](https://help.mikrotik.com/docs/download/attachments/328129/winbox_loader_advanced.png?version=1&modificationDate=1570715647131&api=v2) | WinBox 3.20rc4 shown in title | Advanced connection form, tabs, table | Advanced mode adds fields in-place while keeping the same compact width, baselines, action alignment, table region, and footer behavior. This is a useful stress case for reusable form primitives. | High |

## Coverage map

| Requested visual category | Direct evidence in the core set | How to use it |
|---|---|---|
| Main shell; multiple windows; window chrome; active/inactive states | #1–2 | Primary composition target. Preserve exposed gray canvas, strong window ownership, and semantic active/inactive title treatment. |
| Interfaces; live traffic; property dialog; tabs | #2, #8–12 | Primary list/property target. Preserve compact flags, numeric columns, shallow tabs, and right-side dialog commands. |
| Routes; quick search; filter; context menu | #3–7 | Primary data-tool target. Reuse the child-window toolbar/table/footer structure across network domains. |
| Bridge | #13 | Confirms cross-domain reuse of the same list and property primitives. |
| Launcher/search/connection utility | #14–16 | Useful for compact forms, tabs, tables, checked controls, and progressive disclosure. Do not import MikroTik connection branding into Operator UI. |
| IP Addresses, Firewall, DHCP, Users, Files, Log, Terminal | No category-specific still in this consistent official WinBox 3 set | Do not invent a new visual grammar for these domains. Apply the verified list-window, toolbar, flags, tabs, property-form, terminal, and footer primitives from #2–13. Content and columns may differ; density and ownership should not. Confidence in this transfer is medium because the official WinBox documentation states that GUI functions mirror console/menu structures and that most child windows share the same toolbar. |

The absent domain-specific stills are a source-coverage limitation, not permission to fill gaps with third-party images or visually incompatible WinBox 4 screens. The set nevertheless covers every reusable primitive required to render those domains consistently.

## Generation differences

### Variants inside WinBox 3/classic

References #3–8 use an older Windows system theme: dark navy active titles, gray classic controls, bevels, and smaller system text. References #9–16 use later flat Windows host chrome and show WinBox 3.20rc4 or a comparable WinBox 3-era build. These are compatible generations because the structural grammar is stable:

- persistent launcher plus gray MDI work area;
- overlapping child windows with per-window title, tabs, toolbar, grid/form, and footer;
- compact system controls and 1 px separators;
- terse flags and table-native state;
- modeless list/property relationships.

Literal title blue, bevel depth, font rasterization, and outer OS frame are host-theme artifacts. Operator UI should normalize them through semantic tokens rather than copying either Windows theme pixel for pixel.

### WinBox 4/current generation: comparison only

The official WinBox 4.0.1 notes describe a cross-platform rewrite with redesigned login, tables, forms, buttons, layout, dark mode, font and spacing controls, UI zoom, workspaces, tree tables, richer validation, and expanded window switching. The current official announcement stream identifies WinBox 4.3 as released in July 2026 and includes further main-menu and opened-window-selector changes.

This is a materially different, Qt-era generation: spacing is more configurable, controls are more custom drawn, navigation/window overview behavior is newer, and light/dark appearance is first-class. Its feature ideas may inform future framework capability, but its screenshots must not be used to tune the Operator UI v1 Stable visual baseline. In this pass:

- use WinBox 3/classic for density, MDI composition, child ownership, tables, tabs, and property geometry;
- use WinBox 4 release notes only to check that modern interaction features such as zoom, keyboard navigation, table freezing, multi-sort, and real-time validation are not accidentally blocked by the framework;
- do not average colors, spacing, or control shapes across the two generations.

## Stable visual invariants for Operator UI

These are observations from the complete set, not proprietary asset instructions:

1. **Window ownership is explicit.** A domain window owns its toolbar, filter/search, content, selection, and status.
2. **Density comes from alignment.** Labels, fields, rows, and commands share tight baselines; content is separated with borders, not oversized containers.
3. **State lives in the work surface.** Flags, selection, disabled text, numeric metrics, and status copy replace badge/pill decoration.
4. **Tabs are shallow and local.** They switch a window's domain or property section without changing the application shell.
5. **Menus are compact command surfaces.** Checked, disabled, submenu, and separator states remain visible and conventional.
6. **The canvas communicates spatial window management.** Exposed neutral gray around windows is intentional; it is not an empty dashboard region to fill.
7. **Theme-dependent pixels are not invariants.** Active blue, system font rendering, outer frame, and bevel style vary; semantic contrast and geometry are the durable reference.
