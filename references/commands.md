# Command system

`Command` is a single action definition with identity, title, optional icon/shortcut and context-aware `visible`, `enabled`, `checked`, and `execute` functions. `CommandRegistry` registers, unregisters, looks up, lists, executes and dispatches normalized shortcuts.

`CommandToolbar`, `CommandButton`, `CommandMenuItem`, and the `CommandMenu` MenuBar adapter consume the same registry entry. Application context carries current selection or object; business logic remains in application code. Disabled capability is computed by the command, so an enabled toolbar item cannot silently differ from its menu or context-menu equivalent.

For resizable toolbars, declare `priorities` by command id: `essential`, `primary`, or `secondary`. The measured toolbar keeps essential work on the primary surface and moves lower-priority commands into its shared overflow menu. Ordering remains deterministic and the overflow entries still execute the original CommandRegistry definitions. Commands without canonical icons render with labels; they never become blank compact buttons.

Registries should be scoped to a tool or application service. A command ID is stable within that scope. Commands must never contain layout state or network work; they invoke services or `AsyncTask`. Unsupported commands are omitted or disabled.

Use `leading` for a compact shared menu, `trailing` for bounded search/choice controls, and `labels` when the primary surface needs a shorter visible caption than the canonical command title. These regions participate in measurement; command priorities still decide which actions move to `More actions`.
