import { useEffect, useMemo, useRef, useState } from "react";
import {
  CompactButton,
  CompactCheckbox,
  CompactComboBox,
  CompactTabs,
  CompactTextField,
  FlagsColumn,
  PropertyRow,
  StateText,
} from "../../../components/compact-controls";
import type { GridColumn } from "../../../components/DataGrid";
import type { ToolWindowState } from "../../../mdi/types";
import { Gallery } from "../../Gallery";
import {
  ValidationTool,
  type ValidationKind,
} from "../../validation/ValidationTool";
import {
  fileRows,
  firewallRows,
  logRows,
  routeRows,
  userRows,
  type InterfaceRow,
} from "../../data";
import { useNetworkStore, type InterfaceProperties } from "../NetworkStore";
import { ObjectTableWindow } from "./ObjectTableWindow";

type InterfaceView = InterfaceRow & { flags: string; mtu: number };

export function ToolContents({
  window,
  openProperties,
  closeWindow,
}: {
  window: ToolWindowState;
  openProperties: (row: InterfaceRow) => void;
  closeWindow: () => void;
}) {
  const network = useNetworkStore();
  const contentHeight = window.rect.height - 27;
  const interfaces = useMemo<InterfaceView[]>(
    () =>
      network.interfaces.map((row, index) => ({
        ...row,
        flags:
          row.status === "Disabled"
            ? "X"
            : row.status === "Warning"
              ? "R"
              : index % 13 === 0
                ? "RS"
                : "R",
        mtu: row.type === "Tunnel" ? 1420 : 1500,
      })),
    [network.interfaces],
  );
  if (window.tool === "interfaces")
    return (
      <ObjectTableWindow
        rows={interfaces}
        columns={interfaceColumns}
        height={contentHeight}
        storageKey="Interfaces"
        onOpen={(row) => openProperties(row)}
        onAdd={network.add}
        onEnable={(rows) =>
          network.setStatus(
            rows.map((row) => row.id),
            "Running",
          )
        }
        onDisable={(rows) =>
          network.setStatus(
            rows.map((row) => row.id),
            "Disabled",
          )
        }
        onRemove={(rows) => network.remove(rows.map((row) => row.id))}
        onRefresh={network.refresh}
      />
    );
  if (window.tool === "routes")
    return (
      <ObjectTableWindow
        rows={routeRows}
        columns={routeColumns}
        height={contentHeight}
        storageKey="Routes"
        commands="read"
        domainFilter={
          <CompactComboBox aria-label="Routing table" defaultValue="main">
            <option>main</option>
            <option>operations</option>
          </CompactComboBox>
        }
      />
    );
  if (window.tool === "firewall")
    return (
      <ObjectTableWindow
        rows={firewallRows}
        columns={firewallColumns}
        height={contentHeight}
        storageKey="Firewall"
        commands="read"
        domainFilter={
          <CompactComboBox aria-label="Firewall chain" defaultValue="all">
            <option>all</option>
            <option>input</option>
            <option>forward</option>
            <option>output</option>
          </CompactComboBox>
        }
      />
    );
  if (window.tool === "logs")
    return (
      <ObjectTableWindow
        rows={logRows}
        columns={logColumns}
        height={contentHeight}
        storageKey="Log"
        commands="read"
      />
    );
  if (window.tool === "users")
    return (
      <ObjectTableWindow
        rows={userRows}
        columns={userColumns}
        height={contentHeight}
        storageKey="Users"
        commands="read"
      />
    );
  if (window.tool === "files")
    return (
      <ObjectTableWindow
        rows={fileRows}
        columns={fileColumns}
        height={contentHeight}
        storageKey="Files"
        commands="read"
      />
    );
  if (window.tool === "terminal") return <TerminalWindow />;
  if (window.tool === "properties") {
    const objectId = window.params?.objectId || "";
    const initial = network.properties[objectId] || {
      name: window.params?.name || "Interface",
      mtu: "1500",
      comment: "",
      enabled: true,
      arp: "enabled",
      loopProtect: false,
    };
    return (
      <PropertiesWindow
        initial={initial}
        onCommit={(draft) =>
          objectId && network.updateProperties(objectId, draft)
        }
        onClose={closeWindow}
      />
    );
  }
  if (window.tool === "gallery")
    return (
      <div className="ou-gallery-window">
        <Gallery />
      </div>
    );
  if (window.tool === "validation")
    return (
      <ValidationTool
        kind={(window.params?.kind || "jira") as ValidationKind}
        height={contentHeight}
      />
    );
  return null;
}

const interfaceColumns: GridColumn<InterfaceView>[] = [
  {
    key: "flags",
    label: "Flags",
    width: 46,
    render: (row) => <FlagsColumn flags={row.flags} title={row.status} />,
  },
  { key: "name", label: "Name", width: 165 },
  { key: "type", label: "Type", width: 92 },
  { key: "mtu", label: "L2 MTU", width: 70, align: "right" },
  { key: "address", label: "Address", width: 130 },
  { key: "rx", label: "RX", width: 96, align: "right" },
  { key: "tx", label: "TX", width: 96, align: "right" },
];
const routeColumns: GridColumn<(typeof routeRows)[number]>[] = [
  {
    key: "flags",
    label: "Flags",
    width: 45,
    render: (row) => <FlagsColumn flags={row.flags} />,
  },
  { key: "destination", label: "Dst. Address", width: 145 },
  { key: "gateway", label: "Gateway", width: 140 },
  { key: "distance", label: "Distance", width: 70, align: "right" },
  { key: "table", label: "Routing Table", width: 105 },
];
const firewallColumns: GridColumn<(typeof firewallRows)[number]>[] = [
  {
    key: "flags",
    label: "Flags",
    width: 44,
    render: (row) => <FlagsColumn flags={row.flags} />,
  },
  { key: "chain", label: "Chain", width: 85 },
  { key: "action", label: "Action", width: 80 },
  { key: "source", label: "Src. Address", width: 130 },
  { key: "destination", label: "Dst. Address", width: 130 },
  { key: "packets", label: "Packets", width: 90, align: "right" },
];
const logColumns: GridColumn<(typeof logRows)[number]>[] = [
  { key: "time", label: "Time", width: 82 },
  {
    key: "level",
    label: "Type",
    width: 76,
    render: (row) => (
      <StateText state={row.level === "warning" ? "warning" : "active"}>
        {row.level}
      </StateText>
    ),
  },
  { key: "source", label: "Topic", width: 95 },
  { key: "message", label: "Message", width: 460 },
];
const userColumns: GridColumn<(typeof userRows)[number]>[] = [
  {
    key: "flags",
    label: "Flags",
    width: 45,
    render: (row) => <FlagsColumn flags={row.flags} />,
  },
  { key: "name", label: "Name", width: 130 },
  { key: "group", label: "Group", width: 90 },
  { key: "lastSeen", label: "Last Seen", width: 110 },
  { key: "address", label: "Address", width: 120 },
];
const fileColumns: GridColumn<(typeof fileRows)[number]>[] = [
  {
    key: "flags",
    label: "Flags",
    width: 45,
    render: (row) => <FlagsColumn flags={row.flags} />,
  },
  { key: "name", label: "Name", width: 230 },
  { key: "type", label: "Type", width: 85 },
  { key: "size", label: "Size", width: 80, align: "right" },
  { key: "modified", label: "Modified", width: 125 },
];

function TerminalWindow() {
  return (
    <div className="ou-terminal">
      <div className="ou-terminal-output" role="log">
        <span>Operator Console 1.0</span>
        <span>Connected to core-gateway-01</span>
        <span className="is-command">
          [operator@core-gateway-01] &gt; interface print count-only
        </span>
        <span>10000</span>
        <span className="is-command">[operator@core-gateway-01] &gt; _</span>
      </div>
      <div className="ou-local-status">
        <span>Session: active</span>
        <span className="ou-local-status-fill" />
        <span>UTF-8</span>
      </div>
    </div>
  );
}

function PropertiesWindow({
  initial,
  onCommit,
  onClose,
}: {
  initial: InterfaceProperties;
  onCommit: (draft: InterfaceProperties) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("General");
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(draft);
  const nameRef = useRef<HTMLInputElement>(null);
  const error = !draft.name.trim()
    ? "Name is required."
    : Number(draft.mtu) < 576 || Number(draft.mtu) > 9216
      ? "MTU must be between 576 and 9216."
      : "";
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    nameRef.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  const apply = () => {
    if (!error) {
      const committed = { ...draft, name: draft.name.trim() };
      onCommit(committed);
      setDraft(committed);
      setSaved(committed);
    }
  };
  const accept = () => {
    if (error) return;
    apply();
    onClose();
  };
  return (
    <div className="ou-property-window">
      <CompactTabs
        tabs={["General", "Status", "Traffic", "Advanced"]}
        active={tab}
        onChange={setTab}
      />
      <div className="ou-property-page" role="tabpanel" aria-label={tab}>
        {tab === "General" && (
          <>
            <PropertyRow label="Name">
              <CompactTextField
                ref={nameRef}
                aria-label="Name"
                aria-invalid={!draft.name.trim()}
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </PropertyRow>
            <PropertyRow label="Type">
              <CompactComboBox aria-label="Type" defaultValue="Ethernet">
                <option>Ethernet</option>
              </CompactComboBox>
            </PropertyRow>
            <PropertyRow label="MTU">
              <CompactTextField
                aria-label="MTU"
                aria-invalid={Boolean(error && draft.name.trim())}
                type="number"
                value={draft.mtu}
                onChange={(event) =>
                  setDraft({ ...draft, mtu: event.target.value })
                }
              />
            </PropertyRow>
            <PropertyRow label="Comment">
              <CompactTextField
                aria-label="Comment"
                value={draft.comment}
                onChange={(event) =>
                  setDraft({ ...draft, comment: event.target.value })
                }
              />
            </PropertyRow>
            <PropertyRow label="Enabled">
              <CompactCheckbox
                label="Enabled"
                checked={draft.enabled}
                onChange={(event) =>
                  setDraft({ ...draft, enabled: event.target.checked })
                }
              />
            </PropertyRow>
            {error && (
              <div className="ou-inline-error" role="alert">
                {error}
              </div>
            )}
          </>
        )}
        {tab === "Status" && (
          <>
            <PropertyRow label="Link">
              <StateText state="active">running</StateText>
            </PropertyRow>
            <PropertyRow label="Last change">2 min 18 sec ago</PropertyRow>
            <PropertyRow label="MAC address">02:5A:91:6F:20:01</PropertyRow>
          </>
        )}
        {tab === "Traffic" && (
          <>
            <PropertyRow label="RX rate">152.2 KiB/s</PropertyRow>
            <PropertyRow label="TX rate">168.2 KiB/s</PropertyRow>
            <PropertyRow label="RX packets">18,442,105</PropertyRow>
          </>
        )}
        {tab === "Advanced" && (
          <>
            <PropertyRow label="ARP">
              <CompactComboBox
                aria-label="ARP"
                value={draft.arp}
                onChange={(event) =>
                  setDraft({ ...draft, arp: event.target.value })
                }
              >
                <option>enabled</option>
                <option>disabled</option>
              </CompactComboBox>
            </PropertyRow>
            <PropertyRow label="Loop protect">
              <CompactCheckbox
                label="Enabled"
                checked={draft.loopProtect}
                onChange={(event) =>
                  setDraft({ ...draft, loopProtect: event.target.checked })
                }
              />
            </PropertyRow>
          </>
        )}
      </div>
      <div className="ou-property-actions">
        <CompactButton onClick={accept} disabled={Boolean(error)}>
          OK
        </CompactButton>
        <CompactButton onClick={onClose}>Cancel</CompactButton>
        <CompactButton onClick={apply} disabled={!dirty || Boolean(error)}>
          Apply
        </CompactButton>
      </div>
    </div>
  );
}
