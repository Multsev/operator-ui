import { useEffect, useMemo, useState } from "react";
import { CalendarGrid } from "../../components/CalendarGrid";
import { CommandToolbar } from "../../components/CommandUI";
import { DataView, type DataViewColumn } from "../../components/DataView";
import { Inspector, Panel } from "../../components/Panel";
import {
  PlainTextEditor,
  PlainTextViewer,
} from "../../components/PlainTextEditor";
import { SplitView } from "../../components/SplitView";
import { Tabs } from "../../components/Tabs";
import { Menu } from "../../components/shell";
import {
  AsyncTask,
  CommandRegistry,
  SelectionModel,
  useAsyncTask,
  type CommandContext,
} from "../../framework";

export type ValidationKind = "jira" | "mail" | "calendar" | "files" | "editor";

export function ValidationTool({
  kind,
  height,
}: {
  kind: ValidationKind;
  height: number;
}) {
  if (kind === "jira") return <JiraComposition height={height} />;
  if (kind === "mail") return <MailComposition height={height} />;
  if (kind === "calendar") return <CalendarComposition height={height} />;
  if (kind === "editor") return <EditorComposition />;
  return <FileComposition height={height} />;
}

type Issue = {
  id: string;
  key: string;
  title: string;
  status: string;
  owner: string;
  children?: Issue[];
};
const issues: Issue[] = [
  {
    id: "epic-1",
    key: "OPS-40",
    title: "Desktop framework",
    status: "In progress",
    owner: "M. Chen",
    children: [
      {
        id: "issue-1",
        key: "OPS-51",
        title: "Consolidate commands",
        status: "Review",
        owner: "A. Reed",
      },
      {
        id: "issue-2",
        key: "OPS-52",
        title: "Unify DataView",
        status: "In progress",
        owner: "K. Shah",
        children: [
          {
            id: "issue-3",
            key: "OPS-55",
            title: "Tree-table keyboard model",
            status: "Open",
            owner: "K. Shah",
          },
        ],
      },
    ],
  },
  {
    id: "epic-2",
    key: "OPS-70",
    title: "Operator clients",
    status: "Open",
    owner: "S. Ivanov",
    children: [
      {
        id: "issue-4",
        key: "OPS-71",
        title: "Mail validation",
        status: "Open",
        owner: "S. Ivanov",
      },
    ],
  },
];
const issueColumns: DataViewColumn<Issue>[] = [
  { key: "key", label: "Key", width: 82 },
  { key: "title", label: "Summary", width: 260 },
  { key: "status", label: "Status", width: 90 },
  { key: "owner", label: "Assignee", width: 100 },
];

function JiraComposition({ height }: { height: number }) {
  const selection = useMemo(() => new SelectionModel<string>(), []);
  const [selected, setSelected] = useState<Issue[]>([issues[0]]);
  const [tab, setTab] = useState("Details");
  const active = selected.at(-1) || issues[0];
  return (
    <PatternFrame status={`${selected.length} selected · generic TreeDetail`}>
      <div className="ou-local-toolbar">
        <span>Issues</span>
        <span className="ou-local-toolbar-separator" />
        <span>Hierarchy + columns</span>
        <span className="ou-local-toolbar-fill" />
        <span>SelectionModel</span>
      </div>
      <SplitView
        storageKey="validation:jira"
        initial={58}
        first={
          <DataView
            rows={issues}
            columns={issueColumns}
            mode="tree-table"
            getChildren={(row) => row.children}
            selectionModel={selection}
            onSelectionChange={setSelected}
            height={Math.max(140, height - 70)}
            storageKey="validation:jira:issues"
            ariaLabel="Hierarchical issues"
          />
        }
        second={
          <Inspector
            title={`${active.key} — ${active.title}`}
            metadata={[
              { label: "Status", value: active.status },
              { label: "Assignee", value: active.owner },
            ]}
            tabs={
              <Tabs
                items={[
                  { id: "Details", label: "Details" },
                  { id: "Activity", label: "Activity" },
                  { id: "Links", label: "Links" },
                ]}
                active={tab}
                onChange={setTab}
                storageKey="validation:jira:tabs"
              />
            }
          >
            <PlainTextViewer
              label="Issue details"
              value={
                tab === "Details"
                  ? "A domain-neutral Inspector assembled from metadata, Tabs and plain text."
                  : `${tab} remains application-owned content.`
              }
            />
          </Inspector>
        }
      />
    </PatternFrame>
  );
}

type MailRow = {
  id: string;
  from: string;
  subject: string;
  date: string;
  folder: string;
};
const messages: MailRow[] = [
  {
    id: "m1",
    from: "NOC",
    subject: "Gateway maintenance window",
    date: "10:42",
    folder: "Inbox",
  },
  {
    id: "m2",
    from: "Build service",
    subject: "Release candidate ready",
    date: "09:18",
    folder: "Inbox",
  },
  {
    id: "m3",
    from: "A. Reed",
    subject: "Command review notes",
    date: "Yesterday",
    folder: "Archive",
  },
];
const mailColumns: DataViewColumn<MailRow>[] = [
  { key: "from", label: "From", width: 105 },
  { key: "subject", label: "Subject", width: 250 },
  { key: "date", label: "Date", width: 80 },
];

function MailComposition({ height }: { height: number }) {
  const [folder, setFolder] = useState("Inbox");
  const [message, setMessage] = useState<MailRow>(messages[0]);
  const { task, state } = useAsyncTask<string, [MailRow]>(
    async (signal, row) => {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, row.id === "m1" ? 160 : 45);
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
      return `${row.subject}\n\nThis body was loaded through AsyncTask. Selecting another row cancels the old generation, so stale content cannot replace the current inspector.`;
    },
  );
  useEffect(() => {
    void task.run(message);
  }, [message, task]);
  const visible = messages.filter((row) => row.folder === folder);
  return (
    <PatternFrame status={`${visible.length} messages · ${state.status}`}>
      <div className="ou-local-toolbar">
        <Menu
          label={folder}
          items={[
            {
              type: "submenu",
              label: "operator@example",
              items: [
                { label: "Inbox", action: () => setFolder("Inbox") },
                {
                  type: "submenu",
                  label: "Archive",
                  items: [
                    { label: "2026", action: () => setFolder("Archive") },
                  ],
                },
              ],
            },
          ]}
        />
        <span className="ou-local-toolbar-separator" />
        <span>MasterDetail</span>
        <span className="ou-local-toolbar-fill" />
        {state.status === "pending" && <span>Loading…</span>}
      </div>
      <SplitView
        storageKey="validation:mail"
        initial={48}
        first={
          <DataView
            rows={visible}
            columns={mailColumns}
            mode="list"
            onSelectionChange={(rows) =>
              rows.at(-1) && setMessage(rows.at(-1)!)
            }
            height={Math.max(140, height - 70)}
            storageKey="validation:mail:list"
            ariaLabel="Messages"
          />
        }
        second={
          <Inspector
            title={message.subject}
            metadata={[
              { label: "From", value: message.from },
              { label: "Date", value: message.date },
            ]}
          >
            {state.status === "success" ? (
              <PlainTextViewer value={state.value} label="Message body" />
            ) : state.status === "error" ? (
              <p role="alert">Body could not be loaded.</p>
            ) : (
              <p className="ou-inline-status">Loading message body…</p>
            )}
          </Inspector>
        }
      />
    </PatternFrame>
  );
}

type EventRow = { id: string; time: string; title: string; owner: string };
const events: Record<string, EventRow[]> = {
  "2026-08-10": [
    { id: "e1", time: "10:00", title: "Release review", owner: "Platform" },
    { id: "e2", time: "15:30", title: "Operations sync", owner: "NOC" },
  ],
  "2026-08-14": [
    { id: "e3", time: "09:00", title: "Change window", owner: "Network" },
  ],
};
const eventColumns: DataViewColumn<EventRow>[] = [
  { key: "time", label: "Time", width: 65 },
  { key: "title", label: "Event", width: 180 },
  { key: "owner", label: "Owner", width: 90 },
];
const dateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

function CalendarComposition({ height }: { height: number }) {
  const [month, setMonth] = useState(new Date(2026, 7, 1));
  const [selected, setSelected] = useState(new Date(2026, 7, 10));
  const dayEvents = events[dateKey(selected)] || [];
  const [event, setEvent] = useState<EventRow | null>(dayEvents[0] || null);
  const activeEvent = event || dayEvents[0] || null;
  useEffect(() => setEvent(dayEvents[0] || null), [selected]);
  const selectDate = (date: Date) => {
    setSelected(date);
    setEvent((events[dateKey(date)] || [])[0] || null);
  };
  return (
    <PatternFrame status={`${dayEvents.length} events · CalendarWorkspace`}>
      <div className="ou-local-toolbar">
        <button
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          ◀
        </button>
        <strong>
          {new Intl.DateTimeFormat(undefined, {
            month: "long",
            year: "numeric",
          }).format(month)}
        </strong>
        <button
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          ▶
        </button>
        <span className="ou-local-toolbar-fill" />
        <span>{dateKey(selected)}</span>
      </div>
      <SplitView
        storageKey="validation:calendar"
        initial={58}
        first={
          <Panel mode="plain">
            <CalendarGrid
              month={month}
              selected={selected}
              onSelect={selectDate}
              onMonthChange={setMonth}
              eventDates={Object.keys(events)}
            />
          </Panel>
        }
        second={
          <SplitView
            orientation="horizontal"
            storageKey="validation:calendar:detail"
            initial={46}
            first={
              <DataView
                rows={dayEvents}
                columns={eventColumns}
                mode="list"
                onSelectionChange={(rows) => {
                  if (rows.at(-1)) setEvent(rows.at(-1)!);
                }}
                height={Math.max(100, height * 0.34)}
                storageKey="validation:calendar:events"
                ariaLabel="Day events"
              />
            }
            second={
              <Inspector
                title={activeEvent?.title || "No event"}
                metadata={
                  activeEvent
                    ? [
                        { label: "Time", value: activeEvent.time },
                        { label: "Owner", value: activeEvent.owner },
                      ]
                    : []
                }
              >
                <PlainTextViewer
                  value={
                    activeEvent
                      ? "Event detail uses the same Inspector pattern as issues and mail."
                      : "Select a marked date."
                  }
                />
              </Inspector>
            }
          />
        }
      />
    </PatternFrame>
  );
}

type FileRow = {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
};
const initialFiles: FileRow[] = [
  { id: "f1", name: "docs", type: "Folder", size: "—", modified: "10:20" },
  {
    id: "f2",
    name: "release-notes.txt",
    type: "Text",
    size: "12 KiB",
    modified: "09:42",
  },
  {
    id: "f3",
    name: "operator-ui.zip",
    type: "Archive",
    size: "384 KiB",
    modified: "Yesterday",
  },
];
const fileColumns: DataViewColumn<FileRow>[] = [
  { key: "name", label: "Name", width: 235 },
  { key: "type", label: "Type", width: 90 },
  { key: "size", label: "Size", width: 75, align: "right" },
  { key: "modified", label: "Modified", width: 95 },
];
type FileContext = CommandContext & { selected: FileRow[] };

function FileComposition({ height }: { height: number }) {
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState<FileRow[]>([]);
  const [status, setStatus] = useState("Ready");
  const task = useMemo(
    () =>
      new AsyncTask<string, [FileRow]>(async (_signal, row) => {
        await new Promise((resolve) => setTimeout(resolve, 70));
        return `Opened ${row.name}`;
      }),
    [],
  );
  const registry = useMemo(() => {
    const next = new CommandRegistry<FileContext>();
    next.register({
      id: "open",
      title: "Open",
      icon: "add",
      shortcut: "Enter",
      enabled: ({ selected: rows }) => rows.length === 1,
      execute: async ({ selected: rows }) => {
        const result = await task.run(rows[0]);
        if (result) setStatus(result);
      },
    });
    next.register({
      id: "copy",
      title: "Copy",
      icon: "copy",
      shortcut: "Ctrl+C",
      enabled: ({ selected: rows }) => rows.length > 0,
      execute: ({ selected: rows }) =>
        void navigator.clipboard?.writeText(
          rows.map((row) => row.name).join("\n"),
        ),
    });
    next.register({
      id: "delete",
      title: "Delete",
      icon: "delete",
      shortcut: "Delete",
      enabled: ({ selected: rows }) => rows.length > 0,
      execute: ({ selected: rows }) => {
        setFiles((value) =>
          value.filter((row) => !rows.some((item) => item.id === row.id)),
        );
        setStatus(`${rows.length} item(s) removed`);
      },
    });
    return next;
  }, [task]);
  const context = useMemo<FileContext>(() => ({ selected }), [selected]);
  return (
    <PatternFrame status={`${files.length} items · ${status}`}>
      <CommandToolbar
        registry={registry}
        commandIds={["open", "copy", "delete"]}
        context={context}
        label="File commands"
        trailing={<span>ObjectList + Commands + AsyncTask</span>}
      />
      <DataView
        rows={files}
        columns={fileColumns}
        onSelectionChange={setSelected}
        onOpen={(row) => {
          void registry.execute("open", { selected: [row] });
        }}
        height={Math.max(140, height - 70)}
        storageKey="validation:files"
        ariaLabel="Files"
      />
    </PatternFrame>
  );
}

function PatternFrame({
  children,
  status,
}: {
  children: React.ReactNode;
  status: string;
}) {
  return (
    <div className="ou-validation-pattern">
      {children}
      <div className="ou-local-status">
        <span>{status}</span>
        <span className="ou-local-status-fill" />
        <span>Operator UI primitives</span>
      </div>
    </div>
  );
}

function EditorComposition() {
  const [value, setValue] = useState(
    "# Operator task\n\nUse the same compact editor for scripts, notes and configuration text.\n",
  );
  const [saved, setSaved] = useState(value);
  return (
    <PatternFrame
      status={`${value.length} characters · ${value === saved ? "saved" : "modified"}`}
    >
      <div className="ou-local-toolbar">
        <button disabled={value === saved} onClick={() => setSaved(value)}>
          Save
        </button>
        <span className="ou-local-toolbar-separator" />
        <span>Plain text · UTF-8</span>
        <span className="ou-local-toolbar-fill" />
        <span>Editor pattern</span>
      </div>
      <PlainTextEditor
        aria-label="Plain text editor"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onAutosave={setSaved}
      />
    </PatternFrame>
  );
}
