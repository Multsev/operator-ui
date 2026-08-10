# WinBox and engineering desktop UI research

Checked 2026-08-10. This document separates source facts, approximate screenshot measurements, and Operator UI decisions. The library reproduces general desktop patterns, not MikroTik branding, logos, icons, or product artwork.

## Primary evidence

### WinBox 3 / classic

The [official WinBox documentation](https://help.mikrotik.com/docs/spaces/ROS/pages/328129/WinBox) shows the [main window](https://help.mikrotik.com/docs/download/attachments/328129/winbox3.png?version=1&modificationDate=1570716987658&api=v2), [MDI work area](https://help.mikrotik.com/docs/download/attachments/328129/winbox3_work_area.png?version=1&modificationDate=1570717132536&api=v2), [table toolbar/search](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-search.png?version=1&modificationDate=1570717394117&api=v2), [sort](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-sort.png?version=1&modificationDate=1570717448154&api=v2), [column menu](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-field.png?version=1&modificationDate=1570717546327&api=v2), [detail mode](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-detail.png?version=1&modificationDate=1570717649886&api=v2), and [category mode](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-category.png?version=1&modificationDate=1570717682995&api=v2).

Observed facts: top toolbar, persistent left navigation, MDI work area, per-window toolbars, quick search, domain filters, customizable/resizable columns, remembered layout, detail/category table modes, and direct mapping between GUI commands and the RouterOS console structure. The official 3.41 PE binary imports `USER32`, `GDI32`, `COMCTL32`, `COMDLG32`, and `SHELL32`: it is a native Win32/GDI application using Windows common controls/dialog infrastructure plus product-specific workspace, telemetry, flags, forms, and persistence.

Approximate screenshot measurements: 15–16 px legacy table rows, 18 px header, 22 px tabs/navigation, 27–28 px toolbar, 16 px icons, mostly 1 px borders with occasional classic 2 px bevels. These are visual measurements at unknown DPI, not official tokens.

### WinBox 4

The current [download/changelog page](https://mikrotik.com/download/winbox/), [public beta announcement](https://forum.mikrotik.com/t/winbox-4-is-here/178358), and [4.0.1 release notes](https://forum.mikrotik.com/t/winbox-v4-0-1-released/268595) document a cross-platform rewrite, dark mode, redesigned tables/forms/buttons, font and spacing control, UI zoom, workspaces, search shortcuts, real-time validation, tree tables, multi-column sort, fit-to-content, and multiple table windows. Official manual screenshots show [property form tab 1](https://manual.mikrotik.com/assets/images/pppoe_client_01-31c2e19e11072295c97709ed06a1cc5c.png), [tab 2](https://manual.mikrotik.com/assets/images/pppoe_client_02-24f47b0b1997143beac4857a24f8b505.png), and the [first-boot prompt](https://manual.mikrotik.com/assets/images/winbox-first-boot-prompt_01-88abb11399e50fbd26236c2f0d9850d1.png).

Inspection of the official 4.3 Windows archive identifies `WinBoxQml`, `qrc:/qt/qml/WinBoxQml/`, Qt Scene Graph/RHI symbols, and a static Qt 6.8.8 release string. The current application uses Qt 6/QML/custom-drawn UI rather than Win32 controls. Approximate screenshot measurements are 24 px navigation rows, 31 px tab/tool strips, 22–23 px fields, 25 px dialog buttons, 1 px separators, and 2–4 px corners.

## Comparative references

- [Microsoft Management Console namespaces](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/mmc/namespaces) and [snap-ins](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/mmc/snap-ins): scope tree + result pane + vertical splitter.
- Microsoft [list view](https://learn.microsoft.com/en-us/windows/win32/uxguide/ctrl-list-views), [tree view](https://learn.microsoft.com/en-us/windows/win32/uxguide/ctrl-tree-views), [property sheets](https://learn.microsoft.com/en-us/windows/win32/controls/property-sheets), and [property windows](https://learn.microsoft.com/en-us/windows/win32/uxguide/win-property-win): resizable lists, persistent widths, visible inactive selection, tabs for arbitrary property access, and OK/Cancel/Apply delayed commit.
- [Win32 system colors](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getsyscolor): classic Windows used semantic color roles, supporting semantic tokens instead of hard-coded nostalgia colors.
- [Process Explorer](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer): synchronized process master list/tree and optional lower handles/DLL detail pane.
- [Autoruns](https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns): category tabs, reversible inline checkbox actions, Properties and Jump commands, noise filters.
- [Total Commander screenshots](https://www.ghisler.com/screenshots/en/01.html): explicit dual panes, active side, path headers, tabs, command line and visible function-key actions.
- [WinSCP screenshots](https://winscp.net/eng/docs/screenshots) and [file panel](https://winscp.net/eng/docs/ui_file_panel): commander/explorer modes, sessions, background queue, configurable columns and incremental search.
- [Wireshark main window](https://www.wireshark.org/docs/wsug_html_chunked/ChUseMainWindowSection.html) and [packet list](https://www.wireshark.org/docs/wsug_html_chunked/ChUsePacketListPaneSection.html): menu → toolbar → filter → synchronized list/tree/bytes panes → segmented status.
- [Notepad++ UI manual](https://npp-user-manual.org/docs/user-interface/): compact toolbar, tabs, dockable panels, MRU switcher and status fields that shed lower-priority data in narrow windows.

## Resulting decisions

1. Persistent tree + resizable work area is the primary shell; navigation never becomes a hamburger.
2. Tables own growth, scroll, sorting, resizing, selection, filtering and persistence. 10k-row data must be virtualized.
3. Commands have parallel menu, toolbar, context-menu and shortcut paths with one conceptual command identity.
4. Modal property sheets use tabs and OK/Cancel/Apply; inspectors are modeless and immediate only when explicit.
5. Density uses structure and 2/4/6/8/12/16 spacing—not unreadably small type. Standard row 24, header 25–28, toolbar 28–32, control 24–28, icon 16.
6. Light/dark themes share geometry. Semantic state tokens replace brand colors and historical system-color literals.
7. Resize behavior favors splitters, pane overflow, hidden low-priority status fields and toolbar overflow—not mobile stacking.
8. Color never carries state alone; icons/text/labels remain available.

Operator UI starts at the modern end of these measurements: 12 px body, 24 px table rows, 25 px headers, 26 px controls, 30 px toolbar, 1 px separators, and 0–4 px radii.
