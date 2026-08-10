# Skill packaging audit

Audit date: 2026-08-10. Source revision: `eef168c`. The existing MDI architecture and framework behavior are frozen for packaging. This document records responsibility and destination before any move.

## Canonical framework inventory

| Source area | Responsibility | Packaging decision |
|---|---|---|
| `src/components/` | Compact visual primitives, DataView compatibility aliases, menu/dialog/status surfaces and composition helpers | **PRESERVED / MOVED** unchanged to `framework/src/components/` |
| `src/framework/` | CommandRegistry, SelectionModel, DataSource, AsyncTask and PersistenceStore | **PRESERVED / MOVED** unchanged to `framework/src/framework/`; exposed by the new canonical barrel |
| `src/mdi/` | Window state, placement, z-order, move/resize, min/max, cascade/tile, workspace overflow and persistence | **PRESERVED / MOVED** unchanged to `framework/src/mdi/` |
| `src/tokens/` and `src/styles/` | Semantic tokens, density metrics and canonical component styling | **PRESERVED / MOVED** to `framework/src/`; applications must consume rather than approximate them |
| `src/app/network/` | Network-domain validation harness used by interaction, MDI and performance tests | **KEPT AS TEST INFRASTRUCTURE** under `framework/src/app/`; not exported as core |
| `src/app/validation/` | Cross-domain Jira/mail/calendar/file/editor proof compositions | **REDUCED CONCEPTUALLY / KEPT AS TEST INFRASTRUCTURE**; focused reusable examples are extracted to root `examples/`, while the integrated harness remains for e2e coverage |
| `src/app/Gallery.tsx` | Wide-grid, state and dialog stress fixture | **KEPT AS TEST INFRASTRUCTURE**, not presented as an application template |
| `src/components/DataGrid.tsx`, `TreeView.tsx`, legacy control exports | Compatibility names delegating to current implementations | **PRESERVED** to avoid breaking tested callers; documented as aliases, not extra primitive families |
| `tests/` and `playwright.config.ts` | Unit, MDI interaction, accessibility, visual, DPI, release and performance gates | **PRESERVED / MOVED** to `framework/tests/` and `framework/playwright.config.ts` |
| `tests/visual/` | Executable visual regression baselines | **PRESERVED / MOVED** with tests |
| Vite/TypeScript/package configuration | Buildable reference host and dependency contract | **PRESERVED / MOVED** to `framework/` |
| `artifacts/audit/`, `artifacts/final-screenshots/` | Generated presentation/release evidence; not read by tests | **REMOVED** from the portable package; reproducible through the retained release-artifact test |
| `dist/`, `node_modules/`, `test-results/` | Generated or installed output | **REMOVED / IGNORED**; recreated by normal package-manager and test commands |
| Existing design and architecture docs | Detailed rules and historical decisions | **MOVED / CONSOLIDATED** into focused `references/`; only packaging and portability evidence remains in `docs/` |
| WinBox research and official screenshots | Provenance for interaction/density decisions, not branded runtime assets | **PRESERVED AS REFERENCE** under `references/research/`; never copied into application output |

## Canonical boundary

`framework/src/index.ts` will be the framework inventory entry point. It will export the 13 visual families, five behavioral systems, MDI infrastructure, compatibility aliases, and `OPERATOR_UI_VERSION`. Domain fixtures under `framework/src/app/` will not be exported.

The root skill will contain operational instructions and progressive references. Documentation explains intent; `framework/` defines behavior. The skill must never reference the pre-packaging absolute path at runtime.

## Demo-bloat decision

The integrated demo remains only because it is the executable host for the retained MDI, visual, accessibility and performance tests. It is not copied into examples. Root examples are small, domain-focused compositions that import canonical framework source. Generated release screenshots are excluded; regression baselines remain because tests consume them.

## Build and portability contract

Normal external dependencies are installed inside `framework/` with `npm ci`. From that directory, `npm run build`, `npm test`, `npm run test:visual`, and `npm run benchmark` must remain valid. Copying the skill root to another path must not require the original repository, global source files, fonts, branded assets, or absolute imports.
