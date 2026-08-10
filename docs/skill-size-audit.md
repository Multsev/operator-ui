# Skill size and self-containment audit

Date: 2026-08-10. Version: 1.0.0.

## Package size

Generated dependencies and outputs are excluded from these figures (`.git`, `framework/node_modules`, `framework/dist`, `framework/test-results`, `framework/artifacts`).

| Area | Files | Disk usage |
|---|---:|---:|
| Canonical source (`framework/src`) | 39 | 284 KiB |
| Tests and visual baselines (`framework/tests`) | 40 | 3,552 KiB |
| References, including primary visual evidence | 38 | 1,208 KiB |
| Focused examples | 9 | 36 KiB |
| Packaging and portability audits | 3 | 20 KiB |
| Complete portable package | 144 | 5,248 KiB |

`SKILL.md` contains 301 lines and 1,396 words. It stays within the requested 150–350 meaningful-line target while routing detail to `references/`.

The package is deliberately test-heavy: retained visual baselines account for about 3,476 KiB and official reference images for about 1,136 KiB. These files verify DPI, viewport, MDI and visual behavior and therefore are not presentation bloat.

## Reduction decisions

- Removed 23 generated release screenshots and three obsolete presentation/audit composites. The retained Playwright scenario can regenerate release evidence.
- Removed six superseded internal audit reports after packaging; their active rules already live in `SKILL.md` and focused `references/`.
- Kept the executable network and cross-domain validation harness because interaction, MDI, performance and visual tests use it.
- Extracted eight small examples that import canonical framework code; no framework implementation is duplicated in examples.
- Preserved compatibility aliases because callers and tests rely on them, while documenting them as aliases rather than extra primitive families.
- Kept official research images as provenance for density and composition, not as branding assets or visual templates.
- Added no runtime assets: iconography remains an npm dependency and the framework does not require a local asset bundle.

## Self-containment test

Assumption: the package is copied as one directory and normal npm dependencies are installed from `framework/package-lock.json`.

| Question | Evidence | Result |
|---|---|---|
| Can an agent understand Operator UI? | `SKILL.md`, `MANIFEST.md`, philosophy and pattern references | YES |
| Inspect every canonical primitive? | `framework/src/index.ts`, `framework/src/components/` | YES |
| Reuse the framework? | Public barrel, package exports and compiling examples | YES |
| Build it? | `framework/package.json`, lockfile, TypeScript and Vite configuration | YES |
| Run framework tests? | Unit, Playwright, visual, DPI, accessibility and performance tests are bundled | YES |
| Understand MDI? | Source plus `references/mdi.md` and `window-manager.md` | YES |
| Understand DataView? | Source plus `references/dataview.md` | YES |
| Understand Commands? | Source plus `references/commands.md` | YES |
| Understand Selection? | Source plus `references/selection.md` | YES |
| Understand AsyncTask? | Source plus `references/async.md` | YES |
| Understand PersistenceStore? | Source plus `references/persistence.md` | YES |
| Build a new application? | Eight compiling examples and the tested validation host | YES |

## Portability checks

- Runtime documentation, source imports and configuration contain no source-machine absolute path.
- Internal documentation links and framework imports are relative to the skill directory.
- The canonical implementation lives physically under `framework/`; no external Operator UI checkout is referenced.
- `VERSION`, package metadata and `OPERATOR_UI_VERSION` agree at `1.0.0`.
- The framework builds and tests from its relocated `framework/` directory.
- A dependency-free copy under a new temporary directory passed skill validation, clean `npm ci`, production build, compilation of all examples and all 30 unit tests.

## Fresh-agent result

The GitLab and personal-finance cold-start simulations in `fresh-agent-tests.md` both converged on DataView, official split/detail patterns, MDI ToolWindows and the five behavioral systems. Neither invented domain cards, dashboards, SPA routing or a parallel primitive family. Result: **PASS**.
