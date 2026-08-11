# Operator UI manifest

Version: **1.7.4**
Canonical framework: [`./framework/`](./framework/)
Canonical TypeScript entry: [`./framework/src/index.ts`](./framework/src/index.ts)
Canonical tokens: [`./framework/src/tokens/tokens.css`](./framework/src/tokens/tokens.css)

## 13 visual families

Button · Input · Choice · DataView · Tabs · Menu · Toolbar · Splitter · Panel · Dialog · Status · CalendarGrid · PlainTextEditor

Compatibility aliases: `DataGrid` → DataView table mode; `TreeView` → DataView tree mode; compact/legacy Tabs → shared Tabs. Aliases are not separate families.

## 5 behavioral systems

`CommandRegistry` · `SelectionModel` · `DataSource` · `AsyncTask` · `PersistenceStore`

## 8 official patterns

ObjectList · MasterDetail · TreeDetail · TabbedInspector · Settings · CalendarWorkspace · Editor · MDI Workbench

## Important source locations

- `framework/src/components/`: canonical visual primitives and composition helpers.
- `framework/src/framework/`: commands, selection, data, async and persistence.
- `framework/src/mdi/`: WindowManager, MDIWorkspace and ToolWindow.
- `useWindowManager(options)`: optional application tool registry, initial windows and isolated persistence key; the no-argument demo contract remains compatible.
- `framework/src/tokens/`: semantic design tokens and density dimensions.
- `framework/src/styles/`: canonical rendering rules.
- `framework/src/app/`: executable validation/test harness; not core exports.
- `framework/tests/`: unit, interaction, visual, DPI and performance coverage.
- `examples/`: small application-level compositions importing canonical source.

## Fast reference routing

- Direction and philosophy: `references/philosophy.md`
- Primitive inventory: `references/primitives.md`
- Composition selection: `references/patterns.md`
- Appearance and density: `references/visual-language.md`, `references/density.md`
- MDI/window changes: `references/mdi.md`, `references/window-manager.md`
- Collections: `references/dataview.md`
- Commands and selection: `references/commands.md`, `references/selection.md`
- Data and async work: `references/data-source.md`, `references/async.md`
- Persistence: `references/persistence.md`
- Interaction/responsiveness: `references/interaction.md`, `references/responsive-desktop.md`
- Layout invariants and automated audit: `references/layout-safety.md`, `auditLayoutSafety`
- Verification: `references/testing.md`

## Commands

Run inside `framework/`:

```bash
npm ci
npm run build
npm run test:examples
npm test
npm run test:visual
npm run test:a11y
npm run benchmark
npm run verify
```

Framework source is authoritative. Do not reconstruct these capabilities from the reference prose.
