import { useState } from "react";
import { DataView, Inspector, SplitView, Tabs, type DataViewColumn } from "../../framework/src/index.ts";

type Issue = { id: string; key: string; summary: string; status: string; children?: Issue[] };
const issues: Issue[] = [{ id: "epic", key: "OPS-10", summary: "Release readiness", status: "In progress", children: [
  { id: "task-1", key: "OPS-11", summary: "Verify backups", status: "Done" },
  { id: "task-2", key: "OPS-12", summary: "Run failover drill", status: "Open" },
]}];
const columns: DataViewColumn<Issue>[] = [
  { key: "key", label: "Key", width: 90 },
  { key: "summary", label: "Summary", width: 300 },
  { key: "status", label: "Status", width: 110 },
];

export function JiraLikeExample() {
  const [selected, setSelected] = useState<Issue[]>([issues[0]]);
  const [tab, setTab] = useState("Details");
  const issue = selected[0] ?? issues[0];
  return <SplitView initial={62} first={
    <DataView mode="tree-table" rows={issues} columns={columns} getChildren={(row) => row.children} onSelectionChange={setSelected} storageKey="example:issues" />
  } second={<Inspector title={`${issue.key} — ${issue.summary}`} tabs={<Tabs items={[{ id: "Details", label: "Details" }, { id: "Activity", label: "Activity" }]} active={tab} onChange={setTab} />}>
    {tab === "Details" ? `Status: ${issue.status}` : "Activity is loaded on demand."}
  </Inspector>} />;
}
