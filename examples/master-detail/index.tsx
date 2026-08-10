import { useState } from "react";
import { DataView, Inspector, SplitView, type DataViewColumn } from "../../framework/src/index.ts";

type Server = { id: string; host: string; address: string; state: string };
const rows: Server[] = [
  { id: "api-1", host: "api-1", address: "10.0.0.11", state: "Online" },
  { id: "api-2", host: "api-2", address: "10.0.0.12", state: "Maintenance" },
];
const columns: DataViewColumn<Server>[] = [
  { key: "host", label: "Host", width: 150 },
  { key: "address", label: "Address", width: 130 },
  { key: "state", label: "State", width: 110 },
];

export function MasterDetailExample() {
  const [selected, setSelected] = useState<Server[]>([rows[0]]);
  const current = selected[0] ?? rows[0];
  return <SplitView storageKey="example:servers" first={
    <DataView rows={rows} columns={columns} onSelectionChange={setSelected} storageKey="example:server-list" />
  } second={
    <Inspector title={current.host} metadata={[{ label: "Address", value: current.address }, { label: "State", value: current.state }]}>
      Select another row to inspect it without leaving the list.
    </Inspector>
  } />;
}
