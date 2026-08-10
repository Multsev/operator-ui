# Density rules

Density is functional: it reduces pointer travel, keeps comparisons visible and lets experienced users hold more context at once.

## Canonical dimensions

Use the values from `../framework/src/tokens/tokens.css`:

| Element | Canonical compact dimension |
|---|---:|
| Data row | 20 px |
| Grid header | 22 px |
| Compact input/choice | 22 px |
| Menubar | 24 px |
| Child title | 24 px |
| Local toolbar | 28 px |
| Status segment | 20–22 px |
| Ordinary icon | 12–16 px |
| Separator/border | 1 px |

Spacing follows 2/4/6/8/12/16 px. Use 2–6 px inside dense command and form arrangements. Reserve 8–16 px for meaningful grouping, not cosmetic breathing room.

## Density decisions

- Keep labels short and commands recognizable.
- Prefer visible columns and scrollable width over converting rows into cards.
- Use splitters to allocate space rather than large fixed panels.
- Let windows and panes resize down to tested functional minima.
- Keep state and totals in segmented status bars.
- Use monospace and tabular numerals for values that must align.
- Show more rows, columns or panes at larger resolutions.

Do not increase control size, icon size or whitespace merely because the viewport is large. Relax density only when readability or input accuracy measurably fails.

Legacy WinBox screenshots demonstrate more extreme 15–16 px rows; Operator UI deliberately uses a 20 px default and keeps legacy density optional rather than treating it as an accessibility target.
