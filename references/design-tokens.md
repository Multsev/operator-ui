# Design tokens

Canonical tokens live in `../framework/src/tokens/tokens.css`.

- Geometry: spacing 2/4/6/8/12/16; control 20/22/24/26/28/32; icons 12/16/20/24; border 1; radius 0/1/2/4.
- Density: row 20, grid header 22, menubar 24, child title 24, local toolbar 28, compact control 22.
- Typography: Segoe UI/system fallback 12 px; small 11 px; title 13 px; Cascadia Mono/SFMono/Consolas for console data.
- Semantic roles: app/window background, toolbar/chrome, field/table surface, border/strong border, primary/secondary/disabled text, active/inactive selection, focus, success/warning/danger/info, workspace canvas, active/inactive title and table header.
- Stable aliases include `--ou-app-bg`, `--ou-toolbar-bg`, `--ou-field-bg`, `--ou-grid-header-bg`, `--ou-active-title-bg` and `--ou-inactive-title-bg`.

Light/dark themes map the same roles and geometry. Do not copy a host-theme color snapshot into component CSS.
