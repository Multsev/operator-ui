# Interaction contract

Operator UI follows conventional desktop interaction so users can predict behavior without onboarding.

## Keyboard

- Arrow keys navigate DataView, tree, tabs, menus and splitters according to context.
- Enter opens the selected object or invokes a dialog default.
- Escape closes/cancels transient UI and discards uncommitted dialog state.
- Space toggles checkboxes and toggleable rows.
- Ctrl/Cmd+A selects all available rows.
- Ctrl/Cmd+C copies selected structured data.
- Ctrl/Cmd+F focuses search/filter.
- Shift extends selection ranges.
- Ctrl/Cmd-click toggles independent selection.
- Alt+Enter opens Properties where applicable.
- F6/Shift+F6 cycles MDI children; Ctrl/Cmd+F4 closes the active child.

## Focus and selection

Focused, selected, inactive-selected, hovered, pressed and disabled states must remain distinct. Closing dialogs and context menus restores focus to the exact useful owner where practical. A modeless property child reactivates its owner on close.

Modal dialogs trap focus, support Escape, focus the first meaningful field and restore prior focus. Property editors use controlled draft state: Apply commits without closing, OK commits and closes, Cancel/Escape discard.

## Commands and menus

Every enabled item executes deterministic behavior. Unsupported actions are disabled or absent. Menus provide disabled, checked, separators, shortcuts and nested submenus. Context menus select their target row, clamp to the viewport, close after execution and restore focus.

## MDI manipulation

Child title bars move windows; resize zones enforce minimum dimensions. Minimize, maximize, restore, cascade and tile must preserve identity and reachability. Scale-normalized pointer math must track physical cursor movement at 125–200% UI scale.
