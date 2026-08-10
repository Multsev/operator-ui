# Operator UI philosophy

Operator UI exists for professional desktop work where users inspect, compare and manipulate structured information for long periods.

## Sources of inspiration

The framework adopts general interaction lessons from MikroTik WinBox, classic Win32 administrative tools, MMC, Sysinternals, Total Commander, WinSCP and Wireshark:

- persistent command/navigation areas;
- simultaneous tool windows;
- dense tables as primary information surfaces;
- local toolbars and context menus near their data;
- keyboard shortcuts alongside visible commands;
- resizable panes, columns and windows;
- state persistence between sessions;
- color as a secondary state channel.

This is interaction research, not permission to reproduce branding or proprietary iconography. The provenance study lives in `research/`.

## Product priorities

1. Function before decoration.
2. Information density before empty space.
3. Direct interaction before abstract navigation.
4. Predictability before novelty.
5. Desktop keyboard/mouse speed before touch-oriented sizing.
6. A small orthogonal core before domain component families.
7. Composition before new primitives.

## What universality means

Universality does not mean neutralizing the framework into a generic web component library. It means the same compact primitives can express network administration, issues, mail, calendars, files, CRM, databases, finance, editors and monitoring.

The domain changes; the structural language remains:

- collections use DataView;
- actions use Commands;
- selected identities use SelectionModel;
- details use Panel/Inspector and Tabs;
- relationships use Splitter and tree modes;
- long work uses ToolWindows inside MDI;
- background activity uses AsyncTask;
- UI state uses PersistenceStore.

## Decision test

Ask: “Did the application gain capability without gaining a parallel visual language or domain-specific framework?”

If capability came from more cards, special dashboards or a separate component family, the design moved away from Operator UI. If it came from composing existing primitives with domain data and commands, the framework is working as intended.
