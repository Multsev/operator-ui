# Minimal core primitives

Operator UI has thirteen conceptual visual families: **Button, Input, Choice, DataView, Tabs, Menu, Toolbar, Splitter, Panel, Dialog, Status, CalendarGrid, PlainTextEditor**. Compact geometry is the default, not a variant tier.

The non-visual core is smaller: `CommandRegistry`, `SelectionModel`, `DataSource`, `AsyncTask`, and `PersistenceStore`. These own behavior reused across domains.

`DataGrid` and `TreeView` remain compatibility names over `DataView`. `CompactTabs` and the legacy shell `Tabs` delegate to the shared Tabs implementation. `Inspector` is a Panel composition. Object lists, master/detail, tree/detail, settings and editors are patterns, not additional primitive families.

`CalendarGrid` is the only domain-shaped layout admitted to core: a month grid cannot be expressed usefully as a normal table. It owns dates and keyboard geometry, not event business rules. `PlainTextEditor` owns a native text surface, not rich-text or document semantics.

Every primitive uses the existing `--ou-*` tokens, 20 px data rows, 22–28 px controls, thin borders, zero/low radius and no shadow unless it is transient UI.
