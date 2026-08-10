# Codex installation

- Detected Codex configuration root: `/Users/max/.codex`
- Evidence: `/Users/max/.codex/config.toml` declares `CODEX_HOME = "/Users/max/.codex"`.
- Detected user skill root: `/Users/max/.codex/skills`
- Installed Operator UI location: `/Users/max/.codex/skills/operator-ui`
- Installation method: self-contained directory copy following the existing user-skill convention.
- Verification method: run `npm ci`, `npm run verify`, `npm run test:a11y`, `npm run benchmark`, and `npm run test:release-artifacts` from the installed `framework/` directory, then search tracked runtime files for absolute development paths.

## Recovery note

At the start of the controlled migration on 2026-08-10, the requested source path `/Users/max/Downloads/operator-ui` did not exist. A complete pre-existing installed package was found at the detected user-skill location with Git HEAD `6444927ee788ccd7a7b4fbb34b0cb95cafca12e8`. The missing Downloads source directory was reconstructed from that self-contained installed package before source verification. No WorkBox source files were used or changed during recovery.

The installed skill does not depend on the Downloads copy at runtime. Its framework, references, examples, tests, visual baselines, documentation and metadata are all local to the installed skill directory.
