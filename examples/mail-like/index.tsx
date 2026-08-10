import { useState } from "react";
import { DataView, Inspector, Panel, SplitView, type DataViewColumn } from "../../framework/src/index.ts";

type Mail = { id: string; from: string; subject: string; received: string };
const messages: Mail[] = [
  { id: "m1", from: "Build system", subject: "Nightly build completed", received: "08:41" },
  { id: "m2", from: "Operations", subject: "Maintenance window", received: "Yesterday" },
];
const columns: DataViewColumn<Mail>[] = [
  { key: "from", label: "From", width: 150 },
  { key: "subject", label: "Subject", width: 280 },
  { key: "received", label: "Received", width: 90 },
];

export function MailLikeExample() {
  const [selected, setSelected] = useState<Mail[]>([messages[0]]);
  const message = selected[0] ?? messages[0];
  return <SplitView initial={18} first={<Panel title="Folders"><nav>Inbox<br />Archive<br />Sent</nav></Panel>} second={
    <SplitView orientation="horizontal" initial={45} first={<DataView rows={messages} columns={columns} onSelectionChange={setSelected} storageKey="example:mail" />} second={
      <Inspector title={message.subject} metadata={[{ label: "From", value: message.from }, { label: "Received", value: message.received }]}>Message body</Inspector>
    } />
  } />;
}
