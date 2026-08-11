# Layout Safety Contract

Operator UI compositions must preserve every action, label and window across resizing, localization, user fonts and DPI scaling. Clipping is never an acceptable responsive strategy.

## Required declaration

Before implementation, record:

```text
Minimum functional size:
Command priorities and overflow destination:
Pane minima and collapse/scroll policy:
Long-text policy:
Loading/empty/offline/error states:
Focus order:
```

## Action surfaces

- Define actions once in CommandRegistry.
- Give `CommandToolbar` commands an `essential`, `primary` or `secondary` priority.
- Keep at least one essential action visible; move lower-priority commands into the measured overflow menu.
- A generic Toolbar that cannot express command overflow must remain horizontally scrollable.
- A local row containing multiple application Commands must use `CommandToolbar`; raw `.ou-local-toolbar` composition is not a substitute for measured overflow.
- Never use `overflow: hidden` on an action surface without an accessible overflow destination.
- An icon-only command needs a real icon, accessible name and tooltip. A command without an icon falls back to a labelled button.
- Interactive targets are at least 24 by 24 CSS pixels. Icons remain 12–16 pixels.

## Text and control geometry

- Controls in one row use the same density tier.
- Control height must accommodate the configured font and line height.
- Button labels remain one line, ellipsize when constrained and expose the full label with `title`.
- Tabs keep their natural bounded width, move whole tabs into a portalled overflow menu, and expose every shortened label through `title`.
- Explanations, errors and empty-state copy wrap with `overflow-wrap`; do not force them into a fixed-height status bar.
- Test Russian labels and pseudo-localized labels expanded by 50 percent.

## Containers and panes

- Every flex/grid descendant that can shrink uses `min-width: 0` and `min-height: 0`.
- Structured data keeps column geometry and uses a designated horizontal scroller.
- SplitView declares useful pixel minima for both panes. If the container cannot fit them, SplitView scrolls instead of creating unreadable slivers.
- Optional application panes may collapse only through an explicit application command; information must remain reachable.
- Avoid nested scrollers in the same axis unless the inner content has an essential two-dimensional layout.

## MDI geometry

- Each tool definition owns a tested `defaultSize` and `minSize`.
- Persisted rectangles are validated for finite coordinates and dimensions.
- Restore and workspace resize keep each title bar reachable and repair stale geometry from another monitor or viewport.
- Windows may exceed the viewport only when the MDI workspace exposes working scrollbars.
- Maximum sizes are exceptional; ordinary tools remain maximizable.

## Overlays

- Menus, dialogs and context menus render above MDI content through a portal.
- Clamp overlays on both axes and make oversized bodies scroll.
- Escape closes the top overlay and focus returns to its trigger.

## States

Every official composition defines loading, empty, offline/stale, recoverable error and fatal error states. Errors use concise InlineStatus or ErrorDialog copy plus a deterministic recovery command; raw exception text must not stretch a tool window.

## Verification

Use `auditLayoutSafety` or `assertLayoutSafety` in component/Playwright tests. The audit checks root overflow, unmanaged local command rows, clipped tabs/actions, missing overflow destinations, mixed toolbar control heights, small targets and unreachable MDI title bars. Exercise:

- host widths 800, 1024, 1280, 1440, 1920 and 2560;
- child widths 320, 480 and 640;
- 125, 150 and 200 percent scale;
- supported user fonts and font sizes 10–20;
- English, Russian and 50-percent-expanded pseudo-localization;
- restored windows after a smaller viewport or monitor change.

Screenshot diffs are supporting evidence, not a substitute for geometry, keyboard and overflow assertions.
