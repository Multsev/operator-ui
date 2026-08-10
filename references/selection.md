# Selection model

`SelectionModel<Key>` owns selected keys, anchor and active key outside visual components. It supports single, toggle, contiguous range, select all, clear, active item and reconciliation after filtering/removal. `selectionIntent` maps Ctrl/Cmd-click to toggle and Shift-click to range.

`DataView` accepts an external model or creates one for compatibility. Summaries, toolbars and inspectors consume selection snapshots instead of deriving parallel sets. Stable row IDs are mandatory; sorting and filtering may change order but not identity.
