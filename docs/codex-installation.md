# Codex installation

- Detected Codex configuration root: `/Users/max/.codex`
- Evidence: `/Users/max/.codex/config.toml` declares `CODEX_HOME = "/Users/max/.codex"`.
- Detected user skill root: `/Users/max/.codex/skills`
- Installed Operator UI location: `/Users/max/.codex/skills/operator-ui`
- Installation method: self-contained directory copy following the existing user-skill convention.
- Verification method: run `npm ci`, `npm run verify`, `npm run test:a11y`, `npm run benchmark`, and `npm run test:release-artifacts` from the installed `framework/` directory, then search tracked runtime files for absolute development paths.

## Canonical development repository

All Operator UI development now happens directly in the versioned installed skill repository:

```text
/Users/max/.codex/skills/operator-ui
```

Run Git commands from that directory and framework commands from its `framework/` child. Do not recreate or use `/Users/max/Downloads/operator-ui` as a source checkout. Applications consume an exact tagged release by vendoring it; they must not import the installed skill through an absolute runtime path.

Before the Downloads copy was retired, every canonical source, reference, example, test, deterministic visual baseline, asset and document was checksum-compared with this repository. The only additional Downloads content was reproducible output (`node_modules`, `dist`, `test-results` and `artifacts`), which is intentionally excluded from version control and regenerated through the documented commands.

## Recovery note

At the start of the controlled migration on 2026-08-10, the requested source path `/Users/max/Downloads/operator-ui` did not exist. A complete pre-existing installed package was found at the detected user-skill location with Git HEAD `6444927ee788ccd7a7b4fbb34b0cb95cafca12e8`. The missing Downloads source directory was reconstructed from that self-contained installed package before source verification. No WorkBox source files were used or changed during recovery.

The installed skill does not depend on a Downloads copy at runtime or during development. Its framework, references, examples, tests, visual baselines, documentation and metadata are all local to the installed skill directory.
