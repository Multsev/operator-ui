import { useMemo, useState } from "react";
import { CommandMenu, CommandRegistry, CommandToolbar, DataView, type DataViewColumn } from "../../framework/src/index.ts";

type FileRow = { id: string; name: string; type: string; size: string };
type Context = { selected: readonly FileRow[] };
const files: FileRow[] = [
  { id: "1", name: "reports", type: "Folder", size: "" },
  { id: "2", name: "readme.txt", type: "Text", size: "4 KB" },
];
const columns: DataViewColumn<FileRow>[] = [
  { key: "name", label: "Name", width: 260 },
  { key: "type", label: "Type", width: 110 },
  { key: "size", label: "Size", width: 90, align: "right" },
];

export function FileManagerLikeExample() {
  const [selected, setSelected] = useState<FileRow[]>([]);
  const commands = useMemo(() => {
    const registry = new CommandRegistry<Context>();
    registry.register({ id: "refresh", title: "Refresh", icon: "refresh", shortcut: "Ctrl+R", execute: () => undefined });
    registry.register({ id: "copy", title: "Copy", icon: "copy", shortcut: "Ctrl+C", enabled: ({ selected }) => selected.length > 0, execute: () => undefined });
    registry.register({ id: "delete", title: "Delete", icon: "delete", enabled: ({ selected }) => selected.length > 0, execute: () => undefined });
    return registry;
  }, []);
  const context = { selected };
  return <section>
    <CommandToolbar registry={commands} commandIds={["refresh", "separator", "copy", "delete"]} context={context} />
    <CommandMenu label="File" registry={commands} commandIds={["copy", "delete"]} context={context} />
    <DataView rows={files} columns={columns} onSelectionChange={setSelected} storageKey="example:files" />
  </section>;
}
