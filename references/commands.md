# Command system

`Command` is a single action definition with identity, title, optional icon/shortcut and context-aware `visible`, `enabled`, `checked`, and `execute` functions. `CommandRegistry` registers, unregisters, looks up, lists, executes and dispatches normalized shortcuts.

`CommandToolbar`, `CommandButton`, `CommandMenuItem`, and the `CommandMenu` MenuBar adapter consume the same registry entry. Application context carries current selection or object; business logic remains in application code. Disabled capability is computed by the command, so an enabled toolbar item cannot silently differ from its menu or context-menu equivalent.

Registries should be scoped to a tool or application service. A command ID is stable within that scope. Commands must never contain layout state or network work; they invoke services or `AsyncTask`. Unsupported commands are omitted or disabled.
