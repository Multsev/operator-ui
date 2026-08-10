# Official composition patterns

| Pattern | Composition | Typical uses |
|---|---|---|
| ObjectList | ToolWindow → CommandToolbar → DataView → LocalStatus | objects, files, routes, records |
| MasterDetail | ToolWindow → Toolbar → Splitter(DataView, Inspector) | mail, CRM, files, logs |
| TreeDetail | ToolWindow → Toolbar → Splitter(DataView tree/tree-table, Inspector) | issues, folders, configuration |
| TabbedInspector | Inspector → Tabs → application content | issue, object, event detail |
| Settings | PropertyDialog → Tabs/navigation → Panel → OK/Cancel/Apply | preferences and properties |
| CalendarWorkspace | ToolWindow → Toolbar → Splitter(CalendarGrid, DataView + Inspector) | scheduling |
| Editor | ToolWindow → Toolbar → PlainTextEditor → LocalStatus | scripts, logs, text files |
| MDI Workbench | ApplicationShell → Launcher → MDIWorkspace → ToolWindow[] | top-level desktop model |

Patterns own arrangement and interaction contracts. Applications own labels, columns, metadata, commands and data. A new domain should combine these patterns before requesting a new core component.
