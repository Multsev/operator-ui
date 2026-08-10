# Operator UI v1 Stable style guide

The target is a compact engineering desktop: restrained chrome, medium-gray spatial MDI canvas, overlapping child windows, white/dark data surfaces, dense tables and 1 px separators. WinBox 3 is pattern evidence, not a brand asset.

- Menubar 24 px; child title 24 px; local toolbar 28 px; grid header 22 px; row 20 px; status 20–21 px.
- Spacing uses 2/4/6/8/12/16 px. Radius is 0 for persistent controls and at most 2–4 px for transient surfaces.
- Segoe UI/system UI at 12 px; monospace for terminal, addresses and logs where useful.
- Color is semantic. Reserve blue for active title, selection and focus; states also require flags, marks or text.
- Active/inactive selection, focus, hover, pressed and disabled must remain distinguishable.
- Use Lucide’s existing icon set at 12–16 px; never draw replacement SVGs.
- Desktop responsiveness means splitters, overflow, scrollbars and priority hiding—not mobile cards.

Canonical values live in `../framework/src/tokens/tokens.css` and rendering rules in `../framework/src/styles/index.css`. Historical research under `research/` is evidence only; application assets must not copy it.
