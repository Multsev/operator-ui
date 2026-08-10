import { useMemo, useState } from "react";
import { CommandRegistry, CommandToolbar, PlainTextEditor, StatusBar } from "../../framework/src/index.ts";

type Context = { text: string; save: () => void };

export function EditorExample() {
  const [text, setText] = useState("# Runbook\n\nKeep operational notes compact.\n");
  const commands = useMemo(() => {
    const registry = new CommandRegistry<Context>();
    registry.register({ id: "save", title: "Save", shortcut: "Ctrl+S", execute: ({ save }) => save() });
    return registry;
  }, []);
  const context = { text, save: () => undefined };
  return <section>
    <CommandToolbar registry={commands} commandIds={["save"]} context={context} />
    <PlainTextEditor value={text} onChange={(event) => setText(event.currentTarget.value)} onAutosave={() => context.save()} aria-label="Runbook" />
    <StatusBar><span>{text.length} characters</span><span>Plain text</span></StatusBar>
  </section>;
}
