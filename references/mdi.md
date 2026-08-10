# Frozen MDI architecture

```text
ApplicationShell
  MenuBar + session strip + grouped launcher
  MDIWorkspace
    ToolWindow
      title bar
      local toolbar / tabs
      table, split, property, log or terminal content
      local status
  global status
```

`WindowManager` owns lifecycle and geometry; tools own domain state; reusable components own interaction contracts; tokens own appearance. This boundary is frozen for Operator UI 1.x. See `window-manager.md` for lifecycle details and `cookbook.md` for extension recipes. Canonical source is `../framework/src/mdi/`.
