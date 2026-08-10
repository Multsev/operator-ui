# Testing

Run from `framework/`:

```bash
npm run build
npm test
npm run test:visual
npm run test:a11y
npm run benchmark
npm run test:release-artifacts
```

The matrix covers 800, 1024, 1366, 1920 and 2560 widths plus 125/150/200% application scaling; layout assertions additionally exercise 1280, 1440 and 3440. Release evidence covers overlap, four-window z-order, cascade/tile, maximize, minimize, minimum size, edge overflow, dedicated firewall/log/terminal views, 800/1920/2560 viewports, properties, validation, context menu, Window menu, Gallery and 6/12/20/25-column grids.

`framework.test.tsx` covers CommandRegistry/toolbar/menu/shortcuts, SelectionModel conventions, all DataView modes and virtualization, DataSource, AsyncTask generations/cancel/error, calendar boundaries, Tabs, Splitter and safe persistence. `universal.spec.ts` records ObjectList, MasterDetail, TreeDetail, TabbedInspector, Settings, CalendarWorkspace and Editor examples at 1024 and 1920. DPI projects additionally render CalendarWorkspace at 125/150/200%.

Visual baselines may be updated only after inspecting the new result and a side-by-side official-reference comparison. Browser device scale is not a substitute for native Windows text scaling; native high-contrast, font scaling and multi-monitor restore remain host QA.
