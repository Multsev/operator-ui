import {
  Boxes,
  FileText,
  Flame,
  ListTree,
  Network,
  Route,
  TerminalSquare,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { Menu, MenuBar } from "../components/shell";
import { MDIWorkspace } from "../mdi/MDIWorkspace";
import type { ToolType } from "../mdi/types";
import { useWindowManager } from "../mdi/useWindowManager";
import { useNetworkStore } from "./network/NetworkStore";
import { ToolContents } from "./network/windows/ToolContents";

const launcherGroups: Array<{
  label: string;
  items: Array<{ tool: ToolType; label: string; icon: typeof Network }>;
}> = [
  {
    label: "Network",
    items: [
      { tool: "interfaces", label: "Interfaces", icon: Network },
      { tool: "routes", label: "Routes", icon: Route },
      { tool: "firewall", label: "Firewall", icon: Flame },
    ],
  },
  {
    label: "Operations",
    items: [
      { tool: "logs", label: "Log", icon: ListTree },
      { tool: "terminal", label: "Terminal", icon: TerminalSquare },
    ],
  },
  {
    label: "System",
    items: [
      { tool: "users", label: "Users", icon: Users },
      { tool: "files", label: "Files", icon: FileText },
    ],
  },
];

export function ApplicationShell({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const manager = useWindowManager();
  const network = useNetworkStore();
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "F6") {
        event.preventDefault();
        const index = manager.state.activeId
          ? manager.state.order.indexOf(manager.state.activeId)
          : -1;
        const direction = event.shiftKey ? -1 : 1;
        const next =
          manager.state.order[
            (index + direction + manager.state.order.length) %
              manager.state.order.length
          ];
        if (next) manager.activateWindow(next);
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "F4" &&
        manager.state.activeId
      )
        manager.closeWindow(manager.state.activeId);
      if (event.key === "F5") network.refresh();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [manager, network]);
  const windowItems = [
    ...manager.state.order.map((id) => ({
      label: `${manager.state.activeId === id ? "• " : ""}${manager.state.windows[id].title}`,
      action: () => manager.activateWindow(id),
    })),
    { label: "Cascade", action: manager.cascade },
    { label: "Tile Horizontally", action: manager.tileHorizontally },
    { label: "Tile Vertically", action: manager.tileVertically },
    {
      label: "Close Active",
      shortcut: "Ctrl+F4",
      disabled: !manager.state.activeId,
      action: () =>
        manager.state.activeId && manager.closeWindow(manager.state.activeId),
    },
    {
      label: "Close All",
      disabled: !manager.state.order.length,
      action: manager.closeAll,
    },
  ];
  return (
    <div className="ou-desktop-shell">
      <div className="ou-desktop-title">
        <div className="ou-desktop-app-icon">
          <Boxes />
        </div>
        <strong>Operator UI</strong>
        <span>operator@core-gateway-01 — Engineering Workspace</span>
      </div>
      <MenuBar>
        <Menu
          label="File"
          items={[
            {
              label: "New Terminal",
              shortcut: "Alt+T",
              action: () => manager.openTool("terminal"),
            },
            {
              label: "Close Window",
              shortcut: "Ctrl+F4",
              action: () =>
                manager.state.activeId &&
                manager.closeWindow(manager.state.activeId),
            },
          ]}
        />
        <Menu
          label="Edit"
          items={[
            { label: "Find", shortcut: "Ctrl+F" },
            { label: "Comment", shortcut: "Ctrl+M" },
          ]}
        />
        <Menu
          label="View"
          items={[
            {
              label: "UI Gallery — Developer",
              action: () => manager.openTool("gallery"),
            },
            { type: "separator" },
            {
              type: "submenu",
              label: "Composition validation",
              items: [
                {
                  label: "Jira-like TreeDetail",
                  action: () =>
                    manager.openTool("validation", {
                      kind: "jira",
                      title: "Issues — TreeDetail",
                    }),
                },
                {
                  label: "Mail-like MasterDetail",
                  action: () =>
                    manager.openTool("validation", {
                      kind: "mail",
                      title: "Mail — MasterDetail",
                    }),
                },
                {
                  label: "Calendar workspace",
                  action: () =>
                    manager.openTool("validation", {
                      kind: "calendar",
                      title: "Calendar — Workspace",
                    }),
                },
                {
                  label: "File-like ObjectList",
                  action: () =>
                    manager.openTool("validation", {
                      kind: "files",
                      title: "Files — ObjectList",
                    }),
                },
                {
                  label: "Plain-text Editor",
                  action: () =>
                    manager.openTool("validation", {
                      kind: "editor",
                      title: "Text — Editor",
                    }),
                },
              ],
            },
            { type: "separator" },
            {
              label: `${theme === "light" ? "Dark" : "Light"} theme`,
              action: onToggleTheme,
            },
          ]}
        />
        <Menu
          label="Tools"
          items={[
            { label: "Terminal", action: () => manager.openTool("terminal") },
            { label: "Workspace settings" },
          ]}
        />
        <Menu label="Window" items={windowItems} />
        <Menu
          label="Help"
          items={[
            { label: "Keyboard shortcuts" },
            { label: "About Operator UI" },
          ]}
        />
      </MenuBar>
      <div className="ou-session-strip">
        <button className="is-safe" aria-pressed="true">
          Safe Mode
        </button>
        <span>Session: core-gateway-01</span>
        <span className="ou-session-fill" />
        <span>CPU 3%</span>
        <span>Memory 36%</span>
        <span className="ou-connection-led" aria-label="Connected" />
      </div>
      <div className="ou-desktop-body">
        <aside className="ou-launcher" aria-label="Tools">
          <div className="ou-launcher-heading">Tools</div>
          {launcherGroups.map((group) => (
            <div className="ou-launcher-group" key={group.label}>
              <div className="ou-launcher-group-label">{group.label}</div>
              {group.items.map(({ tool, label, icon: Icon }) => (
                <button
                  key={tool}
                  className={`${manager.state.windows[tool] ? "is-open" : ""} ${manager.state.activeId === tool ? "is-active" : ""}`}
                  onClick={() => manager.openTool(tool)}
                >
                  <Icon />
                  <span>{label}</span>
                  {manager.state.windows[tool] && (
                    <span className="ou-open-indicator" aria-label="Open" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </aside>
        <MDIWorkspace
          manager={manager}
          renderWindow={(window) => (
            <ToolContents
              window={window}
              closeWindow={() => {
                const ownerId = window.params?.ownerId;
                manager.closeWindow(window.id);
                if (ownerId)
                  requestAnimationFrame(() => manager.activateWindow(ownerId));
              }}
              openProperties={(row) =>
                manager.openTool("properties", {
                  objectId: row.id,
                  name: row.name,
                  ownerId: window.id,
                })
              }
            />
          )}
        />
      </div>
      <div className="ou-global-status">
        <span>{manager.state.order.length} windows open</span>
        <span className="ou-global-status-fill">
          Active:{" "}
          {manager.state.activeId
            ? manager.state.windows[manager.state.activeId]?.title
            : "none"}
        </span>
        <span>Live data</span>
        <span>Operator UI v1 Stable</span>
      </div>
    </div>
  );
}
