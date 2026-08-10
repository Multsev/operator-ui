# Releases

## 1.3.0 — 2026-08-10

- Version: `1.3.0`
- Release content commit: recorded by the installed repository tag
- Annotated tag: `v1.3.0`
- Change: reusable DataView double-click policy for tree/detail applications that open expandable objects while keeping disclosure controls for expansion.
- Verification: complete suite required before tag.

## 1.2.0 — 2026-08-10

- Version: `1.2.0`
- Release content commit: `b1b52237f95dc8c8518ad5546f05c70da76a48b2`
- Annotated tag: `v1.2.0`
- Change: reusable DataView `defaultExpansion` policy (`roots`, `all`, `none`) for deterministic application expand/collapse-all commands across nested trees.
- Verification: build and examples passed; 33 unit, 45 Playwright interaction/visual/DPI, 6 accessibility, 4 performance and 1 release-artifact test passed.

## 1.1.0 — 2026-08-10

- Version: `1.1.0`
- Release content commit: `6a2f67f17f79bcc1c39f5a77854e3eb896a19dde`
- Annotated tag: `v1.1.0`
- Change: application-defined MDI tool registries, initial windows and isolated persistence keys, while preserving the no-argument 1.0 demo behavior.
- Verification: build and examples passed; 31 unit, 45 Playwright interaction/visual/DPI, 6 accessibility, 4 performance and 1 release-artifact test passed.

## 1.0.0 — 2026-08-10

- Version: `1.0.0`
- Release content commit: `739d5e2dbb8146926b8e8d71b3cf83d4f9b4587f`
- Annotated tag: `v1.0.0`
- Build: passed
- Examples type-check: passed
- Unit tests: 30 passed
- Playwright interaction, visual and DPI suite: 45 passed
- Accessibility: 6 passed
- Performance: 4 passed
- Release-artifact generation: 1 passed
- Known host-level limitations: browser DPI coverage does not replace native Windows font scaling, high-contrast, multi-monitor restore or platform host packaging checks.

The `v1.0.0` tag is immutable. Later WorkBox-driven framework changes require a new semantic version.
