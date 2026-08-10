# Responsive desktop behavior

Operator UI responds as desktop software, not as a mobile website.

## Preferred strategies

1. Resize windows and split panes.
2. Preserve table geometry and allow horizontal scrolling.
3. Collapse toolbar overflow into menus.
4. Hide optional panes or low-priority status segments.
5. Keep minimum functional sizes and expose workspace scrollbars.
6. Persist splitter, window and column state.
7. Show more information when more space exists.

Do not convert dense tables into card stacks, replace the launcher with a hamburger, add bottom navigation, or serialize independent tools into SPA routes.

## Viewport expectations

The executable matrix covers 800×600 through 3440×1440. Small workspaces may overflow; all MDI children must remain reachable by custom workspace scrollbars. Large workspaces keep canonical control sizes and expose more canvas, rows or simultaneous windows.

## Scaling

Application scaling is tested at 125%, 150% and 200%. Pointer deltas, window geometry, column resize and context-menu placement must remain coordinate-consistent. Browser device scale is useful evidence but does not replace native Windows font scaling, high contrast or multi-monitor host testing.
