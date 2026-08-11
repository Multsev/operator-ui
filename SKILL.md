---
name: operator-ui
description: Build, modify, design, review, or visually test compact desktop-first applications with the bundled Operator UI framework. Mandatory whenever Operator UI is explicitly requested or when working inside an Operator UI application on screens, navigation, forms, tables, dialogs, toolbars, menus, MDI layout, styling, responsiveness, interaction, or new UI components. Reuse the canonical framework included with this skill; do not recreate it from prose.
---

# Operator UI

Use the bundled implementation to build compact, information-dense professional desktop applications.

## Canonical source rule

**Do not reimplement Operator UI from documentation.**

Treat `framework/` relative to this file as the canonical implementation. Documentation explains intent; framework source defines actual APIs and behavior.

Before writing custom UI code:

1. Read `MANIFEST.md`.
2. Inspect `framework/src/index.ts`.
3. Inspect the relevant implementation under `framework/src/`.
4. Read only the relevant file in `references/`.
5. Search for an existing primitive.
6. Search for an official composition pattern.
7. Reuse the implementation.
8. Write only application-specific composition and domain adapters.

Never approximate an existing Operator UI primitive with custom CSS.

Never create a parallel implementation of DataView, Tabs, Toolbar, Dialog, Menu, Splitter, WindowManager, SelectionModel, CommandRegistry, AsyncTask, or PersistenceStore without explicit architectural justification.

## Operating philosophy

Prioritize, in order:

1. Function and direct manipulation.
2. Information density.
3. Predictable desktop behavior.
4. Keyboard and mouse efficiency.
5. Small orthogonal primitives.
6. Composition over specialization.
7. Restrained visual treatment.

Use fewer primitives. Compose them more often.

Operator UI borrows interaction principles from WinBox and classic Win32 engineering tools. Do not copy MikroTik names, branding, logos, icons, or proprietary compositions.

Read `references/philosophy.md` when evaluating product direction or reviewing a proposed interface.

## Required reasoning sequence

Follow this order for every substantial UI requirement:

```text
UI requirement
→ identify domain objects
→ identify user actions
→ define Commands
→ define SelectionModel
→ choose an official pattern
→ choose existing primitives
→ identify AsyncTask operations
→ identify persisted state
→ implement with framework/
→ test
→ screenshot
→ visually inspect
→ fix and retest
```

Do not start by inventing visual components.

## Mandatory pre-implementation plan

For substantial UI work, write this compact plan before coding:

```text
Objects:
Commands:
Selection:
Pattern:
Primitives:
Async:
Persistence:
Minimum functional size:
Command priorities and overflow destination:
Pane minima and collapse/scroll policy:
Long-text and state policy:
New framework primitives required: NONE
```

The expected final line is normally `NONE`.

## Minimal core

Use the existing 13 visual families:

- Button
- Input
- Choice
- DataView
- Tabs
- Menu
- Toolbar
- Splitter
- Panel
- Dialog
- Status
- CalendarGrid
- PlainTextEditor

Use the existing five behavioral systems:

- CommandRegistry
- SelectionModel
- DataSource
- AsyncTask
- PersistenceStore

Treat compatibility exports as aliases, not extra component families. See `references/primitives.md` and `MANIFEST.md`.

## Official composition patterns

Choose one or combine only where necessary:

1. ObjectList
2. MasterDetail
3. TreeDetail
4. TabbedInspector
5. Settings
6. CalendarWorkspace
7. Editor
8. MDI Workbench

Prefer these over new layout systems. Read `references/patterns.md` and inspect the matching directory in `examples/`.

## New primitive gate

Add a framework primitive only when every condition is true:

1. Existing primitives cannot express the behavior cleanly.
2. Existing patterns cannot express it cleanly.
3. The requirement is not domain-specific.
4. It is useful in at least two substantially different domains.
5. Repeated composition would otherwise create substantial complexity.
6. The proposed API is small.
7. It does not significantly overlap another primitive.

If any condition fails, keep the component in application code.

Never add domain primitives such as `IssueCard`, `MailMessageView`, `FileManager`, `CustomerDashboard`, or `EventList` to the framework.

## MDI workbench rule

Preserve the canonical desktop architecture for complex applications:

```text
ApplicationShell
├── MenuBar
├── LauncherNavigation
├── MDIWorkspace
│   ├── ToolWindow
│   ├── ToolWindow
│   └── ToolWindow
└── GlobalStatusBar
```

Launcher and menu actions open or activate tools. Ordinary tools remain first-class child windows. Do not replace the workspace with SPA page routing, a dashboard grid, or one-at-a-time mobile navigation.

Allow simultaneous information when useful. Keep window lifecycle, z-order, geometry, overflow, layout and persistence in the existing WindowManager.

Read `references/mdi.md` and `references/window-manager.md` before changing shell or window behavior.

## DataView rule

Use DataView for structured collections: issues, messages, files, users, routes, logs, events, attachments, database rows, and records.

Select the existing mode: `table`, `list`, `tree`, or `tree-table`.

Reuse its columns, sorting, filtering, scrolling, virtualization, selection, keyboard navigation, context hooks and persisted layout. Do not create domain collection frameworks or enable inline editing by default.

Read `references/dataview.md` before changing collection behavior.

## Command rule

Define each action once in CommandRegistry. Reuse it through toolbar, application menu, context menu, button and shortcut.

Compute visible, enabled and checked state from context. Every enabled command must have deterministic behavior. Keep network or heavy work outside command rendering and invoke services or AsyncTask.

Read `references/commands.md` before adding application actions.

## Selection rule

Use SelectionModel. Do not implement screen-specific selection engines.

Respect click, Ctrl/Cmd-click, Shift-click, keyboard navigation, select all, stable keys, active item and reconciliation after filtering or removal.

Read `references/selection.md` before changing selection behavior.

## Async and data rule

Use DataSource as a small read-first boundary for remote, local or in-memory origins. Keep domain mutations in application services and Commands.

Use AsyncTask for asynchronous UI work. Keep the UI responsive, pass AbortSignal where supported, report state compactly inside the active ToolWindow, and prevent stale results from overwriting newer selection.

Read `references/data-source.md` and `references/async.md` when integrating data.

## Persistence rule

Use PersistenceStore for window bounds, splitters, columns, sorting, filters, tabs, theme and other common UI state.

Provide stable component IDs. Validate old state and fail safely. Do not invent per-screen localStorage formats.

Read `references/persistence.md` before persisting UI state.

## Web publication rule

Treat browser publication as a host capability, not a visual primitive. Reuse the same application services and allowlisted Commands through a second authenticated transport; never expose a native bridge, filesystem API, credential API or arbitrary method dispatcher to the browser.

Default to loopback-only publication. Require an explicit security decision before binding to a LAN or public interface. Keep access tokens outside URLs sent to the server, logs, localStorage and application source; use an URL fragment only for one-time browser bootstrap, then remove it and retain the token in session storage. Require TLS or a trusted reverse proxy outside loopback.

Compose publication controls with the Settings pattern and existing Choice, Button and Status primitives. Persist enabled/scope/port separately from the secret. Show the current address, running/error state, copy-address action and revoke-sessions action. Read `references/web-publication.md` before adding browser access or a web transport.

## Density and visual language

Consume `framework/src/tokens/tokens.css` and existing component classes. Do not invent arbitrary colors, spacing, radii, typography, row heights, control heights or shadows.

Prefer compact controls, 12–16 px icons, 1 px borders, small gaps, dense tables, split panes, visible scrollbars and context menus.

At larger resolutions, show more useful information. Do not enlarge controls merely because space exists.

Use horizontal scrolling for genuinely wide structured data. Desktop responsiveness means resize, overflow, priority hiding and pane management—not mobile cards.

Read `references/visual-language.md`, `references/density.md`, and `references/responsive-desktop.md` before styling or layout changes.

## Layout Safety Contract

Every substantial composition must declare its minimum functional size, command priorities, overflow destination, pane minima, long-text behavior and loading/empty/offline/error states before implementation.

Use measured `CommandToolbar` overflow instead of clipping actions. Generic toolbars must stay scrollable when no command model is available. SplitView panes require useful pixel minima. Restored MDI windows must keep their title bars reachable after viewport or monitor changes. A compact command without an icon must fall back to a labelled button.

Run `auditLayoutSafety` or `assertLayoutSafety` in focused tests. Verify Russian and expanded labels, user font sizes, child widths 320/480/640, desktop widths 800–2560 and 125/150/200% scaling. Read `references/layout-safety.md` before modifying layout, sizing, toolbars, panes or windows.

## Anti-SaaS defaults

Do not introduce by default:

- SaaS dashboards or KPI card grids
- hero or welcome areas
- giant rounded containers
- pill-heavy status UI
- floating action buttons
- hamburger or bottom navigation
- huge search fields or headings
- marketing copy or decorative illustration
- glassmorphism or decorative gradients
- oversized toggles or controls
- excessive animation

Cards are not a default primitive. Use DataView for collections and Panel/Inspector for details.

## Interaction requirements

Maintain visible focus, inactive selection, correct tab order, menu keyboard traversal, context-menu clamping, dialog focus trapping/restoration and MDI z-order.

Use desktop conventions: arrows navigate, Enter opens/defaults, Escape closes/cancels, Space toggles, Delete performs a guarded removal, Alt+Enter opens Properties, Ctrl/Cmd+F finds.

Read `references/interaction.md` before modifying menus, dialogs or keyboard behavior.

## Implementation workflow

1. Work from the bundled `framework/`; never depend on another Operator UI path.
2. Keep domain code outside canonical framework modules unless the primitive gate passes.
3. Import canonical primitives from `framework/src/index.ts` or their source module when the host build requires it.
4. Preserve compatibility aliases unless performing an explicit major-version migration.
5. Use semantic tokens for every visual change.
6. Add focused unit tests for behavior.
7. Add Playwright interaction coverage for composed flows.
8. Add or update visual baselines only after inspection.

## Verification contract

Run from `framework/`:

```bash
npm ci
npm run build
npm test
npm run test:visual
```

Run focused accessibility and performance checks when relevant:

```bash
npm run test:a11y
npm run benchmark
```

For significant visual work, always perform:

```text
run → screenshot → inspect → fix → retest
```

Inspect overlap, clipping, alignment, density, scrolling, headers, toolbars, dialogs, child windows, focus, light/dark themes, narrow desktops and DPI scaling.

Never approve a visual baseline merely to make a test pass. Read `references/testing.md`.

## Final review

Before completion, ask:

- Did the implementation reuse bundled framework source?
- Did capability increase without a parallel component family?
- Are domain concepts confined to application code?
- Is MDI preserved where the application benefits from simultaneous tools?
- Are commands, selection, async work and persistence centralized?
- Does the UI remain compact, direct and predictable?
- Were screenshots actually inspected?
- Would the result still make sense for a different professional domain?

If the answer to any relevant question is no, revise before handoff.
