# Releases

## 1.7.3 — 2026-08-11

- Version: `1.7.3`
- Release content commit: `116207cc36fcf4e5a08d500b23b33fd13ab9ca75`
- Annotated tag: `v1.7.3`
- Fix: leading command menus now share the same font-aware control-height contract as buttons, fields and overflow actions; the real toolbar fixture rejects mixed-height controls.
- Verification: build and examples passed; 50 unit and 51 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed after the only selector-ambiguity regressions were corrected and rerun.
- Known host-level limitations: browser geometry and DPI coverage do not replace native multi-monitor restoration, platform font rendering or assistive-technology testing.

## 1.7.2 — 2026-08-11

- Version: `1.7.2`
- Release content commit: `f02f377f4bbd11bd9b9e18a8fc2b5b1d0cc0c01a`
- Annotated tag: `v1.7.2`
- Fix: Tabs measure non-shrinking bounded labels and use a portalled overflow menu; CommandToolbar measures leading/trailing controls and supports visible label overrides; layout audits now reject root overflow, clipped tabs/actions, missing overflow destinations, mixed control heights and overflowing hand-built local command rows.
- Verification: build and examples passed; 50 unit and 51 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.
- Known host-level limitations: browser geometry and DPI coverage do not replace native multi-monitor restoration, platform font rendering or assistive-technology testing.

## 1.7.1 — 2026-08-11

- Version: `1.7.1`
- Release content commit: `9bae9ff81b6907925a19d1ed5a0d8566224ed30e`
- Annotated tag: `v1.7.1`
- Change: first public open-source release under MPL-2.0, with portable GitHub/Codex installation instructions, contribution policy, security policy and explicit third-party research notices.
- Compatibility: no framework API or rendering behavior changes from `1.7.0`.
- Verification: build and examples passed; 49 unit and 49 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed; focused accessibility (6), performance (4) and release-artifact (1) suites passed independently.
- Known host-level limitations: browser geometry and DPI coverage do not replace native multi-monitor restoration, platform font rendering or assistive-technology testing.

## 1.7.0 — 2026-08-11

- Version: `1.7.0`
- Release content commit: `8e53fd658aff089ae3bf03988a30076ecb295526`
- Annotated tag: `v1.7.0`
- Change: Layout Safety Contract adds priority-aware measured command overflow, labelled fallback for iconless compact commands, font-aware control geometry, pixel-safe SplitView minima, repaired MDI restore geometry and reusable automated layout audits.
- Verification: build and examples passed; 49 unit and 49 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.
- Known host-level limitations: browser geometry and DPI coverage do not replace native multi-monitor restoration, platform font rendering or assistive-technology testing.

## 1.6.0 — 2026-08-11

- Version: `1.6.0`
- Release content commit: `0b217e95004a9e5883e3572a9bc7f379f3a7c164`
- Annotated tag: `v1.6.0`
- Change: DataView exposes selection-safe row drag-and-drop callbacks with application-owned payload validation and a canonical drop-target state.
- Verification: build and examples passed; 43 unit and 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.

## 1.5.2 — 2026-08-11

- Version: `1.5.2`
- Release content commit: `3f5d387`
- Annotated tag: `v1.5.2`
- Fix: DataView preserves an existing multi-selection when a selected row opens a context menu; right-clicking an unselected row still selects that target.
- Test stability: the CalendarWorkspace visual fixture neutralizes the real current-day accent so deterministic baselines do not change at midnight.
- Verification: build and examples passed; 42 unit and 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.

## 1.5.1 — 2026-08-10

- Version: `1.5.1`
- Release content commit: `f283a4f87ba4346c62b4fd8dd6e992233aac37f6`
- Annotated tag: `v1.5.1`
- Fix: DataView disclosure controls no longer select their row on pointer press, and collapsing or filtering a tree preserves selection of hidden descendants for detail inspectors.
- Verification: build and examples passed; 41 unit and 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.

## 1.5.0 — 2026-08-10

- Version: `1.5.0`
- Release content commit: `a5ef7bf8e2877ef68e1a0984fc9e2173efaee08f`
- Annotated tag: `v1.5.0`
- Change: DataView recursively filters tree descendants while retaining their ancestor path, and Tabs moves items into overflow according to measured available width while keeping the active tab visible.
- Verification: build and examples passed; 39 unit and 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.

## 1.4.3 — 2026-08-10

- Version: `1.4.3`
- Release content commit: `997cc913e24f3a2ae8771b7aa581146c7bd5e41d`
- Annotated tag: `v1.4.3`
- Fix: context-menu command titles retain a measured visual gap before keyboard shortcuts at large interface fonts.
- Verification: build and examples passed; 37 unit and 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.

## 1.4.2 — 2026-08-10

- Version: `1.4.2`
- Release content commit: `0b65cadcdd3c41a8e2ab6f49d462340dcdef22b6`
- Annotated tag: `v1.4.2`
- Fix: context menus are portalled above MDI windows, size to their content, preserve one-line command labels at larger interface fonts, clamp under UI scaling, and align checks/titles/shortcuts consistently.
- Verification: build and examples passed; 37 unit and 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.

## 1.4.1 — 2026-08-10

- Version: `1.4.1`
- Release content commit: `2a103a184cd4e3b6f6d926df1ff6075c67501864`
- Annotated tag: `v1.4.1`
- Fix: Escape closes a portalled application menu regardless of whether focus remains on its trigger, then restores trigger focus.
- Verification: build and examples passed; 37 unit and 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.

## 1.4.0 — 2026-08-10

- Version: `1.4.0`
- Release content commit: `b03a3265cbc34fc8cc30f741ed89bbfad61ec59f`
- Annotated tag: `v1.4.0`
- Change: application menus are rendered in a viewport-level portal above MDI windows; DataView tree disclosure uses compact chevrons and bounded indentation; commands can use a canonical external-link icon.
- Verification: build and examples passed; 37 unit, 47 Playwright interaction/visual/DPI/accessibility/performance/release-artifact tests passed.
- Known host-level limitations: browser DPI coverage does not replace native multi-monitor placement validation.

## 1.3.0 — 2026-08-10

- Version: `1.3.0`
- Release content commit: `ad5870f08bb030f0f3b64c6983cb2c78506e9ecc`
- Annotated tag: `v1.3.0`
- Change: reusable DataView double-click policy for tree/detail applications that open expandable objects while keeping disclosure controls for expansion.
- Verification: build and examples passed; 34 unit, 45 Playwright interaction/visual/DPI, 6 accessibility, 4 performance and 1 release-artifact test passed.

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
