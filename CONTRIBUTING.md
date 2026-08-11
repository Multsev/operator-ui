# Contributing to Operator UI

Operator UI accepts fixes and generally reusable capabilities. Application-specific behavior belongs in application code.

## Before changing the framework

1. Read `SKILL.md`, `MANIFEST.md` and the relevant source and reference files.
2. Record the application objects, commands, selection, composition pattern, primitives, async work and persistence involved.
3. Confirm that the requirement cannot be expressed with an existing primitive or official pattern.
4. For a new primitive, provide evidence from at least two substantially different application domains.

## Verification

Run from `framework/`:

```bash
npm ci
npm run verify
npm run test:a11y
npm run benchmark
npm run test:release-artifacts
```

Visual changes require deterministic screenshots and inspection across the documented widths, DPI scales, themes and user-font conditions. Layout work must satisfy the Layout Safety Contract.

## Contributions and licensing

Contributions are accepted under the Mozilla Public License 2.0. By submitting a contribution, you represent that you have the right to license it under MPL-2.0. Keep third-party code and assets out of the repository unless their license and attribution have been reviewed and documented.

Use focused commits. Do not commit generated output, credentials, tokens, machine-specific paths or application-domain code into framework core.
