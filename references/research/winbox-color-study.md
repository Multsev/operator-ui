# WinBox classic color study for Operator UI v2

Checked 2026-08-10. This study uses official historical WinBox 3/classic screenshots as evidence for a semantic desktop palette. It does not claim these are WinBox 4 colors and does not copy MikroTik branding, logos or its icon set.

## Sources

- [Official WinBox documentation](https://help.mikrotik.com/docs/spaces/ROS/pages/328129/WinBox?src=contextnavpagetreemode), including its explicit description of the MDI work area, child-window toolbars, overflow scrollbars and saved column layouts.
- [Main window screenshot](https://help.mikrotik.com/docs/download/attachments/328129/winbox3.png): `references/official-winbox3.png`.
- [MDI work area screenshot](https://help.mikrotik.com/docs/download/attachments/328129/winbox3_work_area.png): `references/official-winbox3_work_area.png`.
- [Quick-find child window](https://help.mikrotik.com/docs/download/attachments/328129/Winbox-window-search.png): `references/official-Winbox-window-search.png`.
- Additional official detail and sort screenshots are stored beside these references.

## Sampling method

Samples were taken from the original PNG files without resizing or color conversion. Coordinates are zero-based from the upper-left. ImageMagick 7 command: `magick IMAGE -format "%[hex:p{x,y}]" info:`. Dominant colors were cross-checked with the image histogram. Single pixels can include antialiasing or host-OS theme behavior, so final tokens normalize semantic roles instead of cloning every literal.

| Token/role | Screenshot and coordinate | Sample RGB | Sample HEX | Operator UI v2 normalized token |
|---|---|---:|---:|---:|
| Workspace canvas | `official-winbox3_work_area.png` (700,550) | 160,160,160 | `#A0A0A0` | `--ou-workspace-canvas: #A0A0A0` |
| Main chrome/navigation | `official-winbox3.png` (50,300) | 240,240,240 | `#F0F0F0` | `--ou-window-chrome: #F0F0F0` |
| Main toolbar | `official-winbox3.png` (400,65) | 240,240,240 | `#F0F0F0` | `--ou-window-chrome: #F0F0F0` |
| Inactive child title | `official-winbox3_work_area.png` (300,100) | 192,192,192 | `#C0C0C0` | `--ou-window-title-inactive: #C0C0C0` |
| Active child title | `official-winbox3_work_area.png` (300,196) | 77,79,204 | `#4D4FCC` | independent `--ou-window-title-active: #315F91` |
| Older active title | `official-Winbox-window-search.png` (10,5) | 10,36,106 | `#0A246A` | confirms theme-dependent role; same normalized token |
| Table header | `official-winbox3_work_area.png` (300,225) | 216,216,216 | `#D8D8D8` | `--ou-table-header: #D8D8D8` |
| Table borders | `official-Winbox-window-search.png` (250,91) | 212,208,200 | `#D4D0C8` | independent `--ou-grid-line: #D8DDE0` |
| Table body/input surface | `official-winbox3_work_area.png` (500,300) | 255,255,255 | `#FFFFFF` | `--ou-control-bg: #FFFFFF` |
| Input field | `official-Winbox-window-search.png` (490,60) | 255,255,255 | `#FFFFFF` | `--ou-control-bg: #FFFFFF` with semantic border |
| Active selection | `official-Winbox-window-search.png` (550,76) | 10,36,106 | `#0A246A` | independent `--ou-selection-strong: #1473B8` |
| Inactive/row selection | `official-winbox3_work_area.png` (300,420) | 157,192,234 | `#9DC0EA` | `--ou-selection: #C9E5FB` with focus outline |
| Selected tab surface | `official-Winbox-window-search.png` (15,29) | 212,208,200 | `#D4D0C8` | `--ou-window-chrome: #F0F0F0`; borders carry selection |
| Disabled text | `official-Winbox-window-search.png` (10,100) | 128,128,128 | `#808080` | `--ou-text-disabled: #858D93` |
| Primary text glyphs | `official-Winbox-window-search.png` table crop histogram | 0,0,0 | `#000000` | `--ou-text: #172027` |
| Child status/footer | `official-winbox3_work_area.png` (300,518) | 240,240,240 | `#F0F0F0` | `--ou-window-chrome: #F0F0F0` |
| Older classic chrome | `official-Winbox-window-search.png` (250,35) | 212,208,200 | `#D4D0C8` | evidence only; do not hard-code host theme color |

Reference SHA-256 checksums:

- main: `54e9364a51bb45240ecfaeb18b27cbd9633582efeaf0259d7d24ddc1e2da3426`
- work area: `a90b09f92608a1ff60beb080cf9e273071abb5ec8d366b6c7d71d28d533a8d87`
- search: `4c5d56f6bc811bf6667235f59ca0fb3a2e3f0a1c13cf21ee6a8ac66a4d0c47fe`
- detail: `14fa2fab07c30d653b408207ba3b8e6e07fcd68c087e20c3d48e47b66de32482`
- sort: `1edf50425c6e1388df892c8651d84e4eaf65528df491e8e187ffac05529ab467`

## Composition conclusions

The stable characteristic is not a particular Windows-blue value. It is the relationship between roles: a medium-gray spatial canvas, narrow light launcher, flat command strip, white data windows, 1 px separators, dense rows, obvious active/inactive title bars, selection blue, and small state flags. Exposed canvas around overlapping windows is intentional and helps communicate spatial window management.

Operator UI therefore reproduces the desktop interaction architecture and normalized role contrast. It deliberately keeps its own title blue, accessible focus treatment, icons and product identity.
