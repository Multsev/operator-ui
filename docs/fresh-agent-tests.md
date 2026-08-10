# Fresh-agent simulations

Date: 2026-08-10. These are cold-start reasoning checks using only the packaged `SKILL.md`, `MANIFEST.md`, bundled framework, references and examples. They are not new product implementations.

## Desktop GitLab client

### Required plan produced from the skill

```text
Objects: Project, Issue, MergeRequest, Pipeline, ActivityEntry
Commands: refresh, open, create, assign, changeStatus, retryPipeline, copyLink
Selection: SelectionModel per visible DataView; stable GitLab object IDs
Pattern: MDI Workbench containing MasterDetail and ObjectList tools
Primitives: Menu, Toolbar, DataView, Splitter, Panel/Inspector, Tabs, Dialog, Status
Async: AsyncTask around project/issue/pipeline queries and mutations
Persistence: ToolWindow bounds, splitters, columns, sorts, filters, active tabs
New framework primitives required: NONE
```

### Composition selected

```text
ApplicationShell
└── MDIWorkspace
    ├── Projects ToolWindow
    │   └── MasterDetail
    │       ├── DataView
    │       └── Inspector
    ├── Issues ToolWindow
    │   └── DataView
    ├── Pipelines ToolWindow
    │   └── DataView
    └── Activity ToolWindow
        └── DataView
```

Commands are registered once and surfaced through toolbar, menu, context menu and shortcuts. No `ProjectCard`, `IssueCard`, `GitLabDashboard`, SPA router or domain collection framework is introduced.

Result: **PASS**. The bundled rules naturally select canonical desktop primitives and simultaneous tools.

## Desktop personal finance manager

### Required plan produced from the skill

```text
Objects: Account, Transaction, Category, Budget, Payee
Commands: refresh, addTransaction, edit, reconcile, categorize, export
Selection: SelectionModel for transactions, accounts and categories
Pattern: MDI Workbench containing MasterDetail, TreeDetail and CalendarWorkspace
Primitives: Menu, Toolbar, DataView, Splitter, Inspector, Tabs, Dialog, Status, CalendarGrid
Async: AsyncTask around import, synchronization and report queries
Persistence: Window bounds, account/category tree width, transaction columns, filters, tabs
New framework primitives required: NONE
```

### Composition selected

```text
ApplicationShell
└── MDIWorkspace
    ├── Accounts ToolWindow
    │   └── TreeDetail
    ├── Transactions ToolWindow
    │   └── MasterDetail
    ├── Budget ToolWindow
    │   └── DataView + Inspector
    └── Schedule ToolWindow
        └── CalendarWorkspace
```

The agent uses table and tree-table modes rather than financial cards, large KPI tiles or a dashboard route. Finance behavior remains in application services; the framework remains domain-neutral.

Result: **PASS**. The same small primitive set expresses a substantially different domain without network-specific concepts.
