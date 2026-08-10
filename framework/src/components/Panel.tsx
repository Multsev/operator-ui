import type { ReactNode } from "react";

export function Panel({
  mode = "plain",
  title,
  toolbar,
  children,
  footer,
  className = "",
}: {
  mode?: "plain" | "scrollable" | "inspector" | "group";
  title?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ou-panel ou-panel--${mode} ${className}`}>
      {(title || toolbar) && (
        <header>
          {title && <strong>{title}</strong>}
          <span className="ou-panel-header-fill" />
          {toolbar}
        </header>
      )}
      <div className="ou-panel-content">{children}</div>
      {footer && <footer>{footer}</footer>}
    </section>
  );
}

export function Inspector({
  title,
  metadata,
  tabs,
  actions,
  children,
}: {
  title: ReactNode;
  metadata?: Array<{ label: string; value: ReactNode }>;
  tabs?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Panel mode="inspector" title={title} toolbar={actions}>
      <div className="ou-inspector-metadata">
        {metadata?.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <div>{item.value}</div>
          </div>
        ))}
      </div>
      {tabs}
      {children}
    </Panel>
  );
}
