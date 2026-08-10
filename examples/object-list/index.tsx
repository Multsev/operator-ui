import { useMemo, useState } from "react";
import {
  CommandRegistry,
  CommandToolbar,
  DataView,
  SelectionModel,
  StatusBar,
  type DataViewColumn,
} from "../../framework/src/index.ts";

type Job = { id: string; name: string; owner: string; state: string };
type Context = { selected: readonly Job[] };

const rows: Job[] = [
  { id: "1", name: "Nightly import", owner: "Ops", state: "Running" },
  { id: "2", name: "Index rebuild", owner: "DBA", state: "Ready" },
];
const columns: DataViewColumn<Job>[] = [
  { key: "name", label: "Name", width: 210 },
  { key: "owner", label: "Owner", width: 100 },
  { key: "state", label: "State", width: 100 },
];

export function ObjectListExample() {
  const [selected, setSelected] = useState<Job[]>([]);
  const selection = useMemo(() => new SelectionModel<string>(), []);
  const commands = useMemo(() => {
    const registry = new CommandRegistry<Context>();
    registry.register({ id: "refresh", title: "Refresh", icon: "refresh", execute: () => undefined });
    registry.register({ id: "remove", title: "Remove", icon: "remove", enabled: ({ selected }) => selected.length > 0, execute: () => undefined });
    return registry;
  }, []);
  return <section>
    <CommandToolbar registry={commands} commandIds={["refresh", "separator", "remove"]} context={{ selected }} />
    <DataView rows={rows} columns={columns} selectionModel={selection} onSelectionChange={setSelected} storageKey="example:jobs" />
    <StatusBar><span>{rows.length} jobs</span><span>{selected.length} selected</span></StatusBar>
  </section>;
}
