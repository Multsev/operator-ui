# Codex installation

Codex user skills conventionally live under `${CODEX_HOME}/skills`. When `CODEX_HOME` is not explicitly set, use `$HOME/.codex`.

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
git clone https://github.com/Multsev/operator-ui.git "$CODEX_HOME/skills/operator-ui"
cd "$CODEX_HOME/skills/operator-ui/framework"
npm ci
npm run verify
npm run test:a11y
npm run benchmark
npm run test:release-artifacts
```

The installed directory is a complete, independent repository. It does not require another source checkout at runtime, during development or for verification.

## Canonical development repository

Operator UI may be developed directly from its versioned installed skill repository:

```text
${CODEX_HOME}/skills/operator-ui
```

Run Git commands from that directory and framework commands from its `framework/` child. Applications consume an exact tagged release by vendoring it or by using a package reference; they must not import an installed skill through an absolute runtime path.

The repository contains the framework, references, examples, tests, deterministic visual baselines, documentation and metadata. Reproducible output (`node_modules`, `dist`, `test-results` and `artifacts`) is intentionally excluded from version control.
