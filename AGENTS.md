# Operator UI agent instructions

For every UX/UI change, follow `SKILL.md`. Treat `framework/` as the canonical implementation and never rebuild an existing primitive from prose or custom CSS.

Before implementing substantial UI:

1. Read `MANIFEST.md` and inspect `framework/src/index.ts` plus the relevant source module.
2. Record Objects, Commands, Selection, Pattern, Primitives, Async and Persistence. The expected new-primitive count is `NONE`.
3. Prefer the eight official patterns and the 13 visual families over new layout or component systems.
4. Keep `ApplicationShell → MDIWorkspace → WindowManager → ToolWindow` intact for complex desktop applications.
5. Use semantic variables from `framework/src/tokens/tokens.css`; do not add arbitrary screen colors, spacing or sizing.
6. Put Jira, mail, calendar, file, CRM, database and other domain semantics in application code.
7. Add focused tests, run the relevant verification commands from `framework/`, capture screenshots for significant visual work and inspect them.

UI work is incomplete while overlap, clipping, focus, selection, scrolling, density, DPI or keyboard defects remain. Do not introduce SaaS cards, hero content, pill-heavy controls, floating actions, glass effects, oversized rounding or mobile navigation unless a written product requirement explicitly overrides Operator UI.
