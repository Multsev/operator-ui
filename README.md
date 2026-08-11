# Operator UI

Operator UI is an open-source React/TypeScript framework and self-contained Codex skill for compact, information-dense desktop applications. It combines reusable UI primitives, behavioral infrastructure, MDI window management, layout-safety rules, tests, references and focused examples.

The package is portable as one directory. Normal npm dependencies are the only external requirement.

## Start here

Agents read [`SKILL.md`](./SKILL.md), scan [`MANIFEST.md`](./MANIFEST.md), then inspect [`framework/src/index.ts`](./framework/src/index.ts). Documentation explains intended use; source code defines canonical behavior.

Do not recreate Operator UI from screenshots or prose. Reuse the bundled framework.

## Install

Clone the repository directly into the Codex user-skill directory:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
git clone https://github.com/Multsev/operator-ui.git "$CODEX_HOME/skills/operator-ui"
cd "$CODEX_HOME/skills/operator-ui/framework"
npm ci
npm run verify
```

For ordinary framework development, clone it anywhere and work from `framework/`. Applications should consume a tagged release or vendor an exact release snapshot; they must not depend on a developer-specific absolute path.

## Structure

```text
operator-ui/
├── SKILL.md                 operational agent rules
├── MANIFEST.md              one-minute capability inventory
├── VERSION                  semantic framework version
├── agents/                  skill-list metadata
├── framework/               canonical buildable implementation and tests
├── references/              progressively loaded design/architecture guidance
├── examples/                focused application-level compositions
├── docs/                    packaging, minimalism and provenance audits
└── assets/                  only runtime assets if ever required
```

## Build and test

Requirements: Node.js 22+, npm 10+, and Chromium for Playwright.

```bash
cd framework
npm ci
npm run build
npm run test:examples
npm test
npm run test:visual
```

Focused commands:

```bash
npm run dev
npm run test:a11y
npm run benchmark
npm run test:release-artifacts
```

The executable host opens at `http://127.0.0.1:5173` during development. It is a validation harness for the framework, not the template for a domain application.

## Architecture

The accepted desktop model is `ApplicationShell → MDIWorkspace → ToolWindow[]`. WindowManager owns lifecycle and geometry. DataView owns structured collection behavior. CommandRegistry, SelectionModel, DataSource, AsyncTask and PersistenceStore provide reusable behavioral infrastructure. Applications own domain objects, adapters and compositions.

The Layout Safety Contract keeps commands, labels, panes and MDI title bars reachable under resize, localization, user fonts and DPI scaling. `CommandToolbar` provides measured priority overflow; SplitView supports useful pixel minima; `auditLayoutSafety` provides deterministic geometry checks.

## Versioning

The package starts at `1.0.0`.

- PATCH: compatible bug fixes and visual corrections.
- MINOR: backwards-compatible primitive capabilities.
- MAJOR: breaking APIs or architectural changes.

Update `VERSION`, `framework/package.json`, `OPERATOR_UI_VERSION`, `MANIFEST.md` and relevant compatibility notes together.

## Adding a feature safely

Choose an official pattern, reuse exports from `framework/src/index.ts`, keep domain code outside the framework core, add focused tests, run the full verification matrix, and visually inspect screenshots. A new framework primitive requires evidence from two substantially different domains.

## Contributing and license

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) before proposing framework changes. Operator UI is distributed under the [Mozilla Public License 2.0](./LICENSE). Applications may combine it with code under other licenses; changes to MPL-covered Operator UI source files remain governed by MPL-2.0.

Unless explicitly excluded by [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md), original Operator UI source and documentation present in this repository's history are also offered under MPL-2.0.
