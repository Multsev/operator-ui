import { useState } from "react";
import { DataView, Inspector, SplitView, type DataViewColumn } from "../../framework/src/index.ts";

type Node = { id: string; name: string; kind: string; children?: Node[] };
const roots: Node[] = [{ id: "root", name: "Infrastructure", kind: "Group", children: [
  { id: "edge", name: "Edge services", kind: "Folder" },
  { id: "data", name: "Data services", kind: "Folder" },
]}];
const columns: DataViewColumn<Node>[] = [
  { key: "name", label: "Name", width: 230 },
  { key: "kind", label: "Type", width: 100 },
];

export function TreeDetailExample() {
  const [selected, setSelected] = useState<Node[]>([roots[0]]);
  const node = selected[0] ?? roots[0];
  return <SplitView initial={32} first={
    <DataView mode="tree-table" rows={roots} columns={columns} getChildren={(row) => row.children} onSelectionChange={setSelected} storageKey="example:tree" />
  } second={<Inspector title={node.name} metadata={[{ label: "Kind", value: node.kind }]}>Properties for the selected node.</Inspector>} />;
}
