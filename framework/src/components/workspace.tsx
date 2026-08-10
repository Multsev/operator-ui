import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, StatusBar, Toolbar } from './shell';

export function MainWindow({ menu, toolbar, children, status }: { menu?: ReactNode; toolbar?: ReactNode; children: ReactNode; status?: ReactNode }) { return <div className="ou-main-window">{menu}{toolbar && <Toolbar>{toolbar}</Toolbar>}<main>{children}</main>{status && <StatusBar>{status}</StatusBar>}</div>; }
export function ToolWindow({ title, children }: { title: string; children: ReactNode }) { return <section className="ou-tool-window"><header>{title}</header><div>{children}</div></section>; }
export function PropertyDialog(props: Parameters<typeof Dialog>[0]) { return <Dialog {...props} />; }
export function ModalConfirmation({ open, title, message, onConfirm, onClose }: { open: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void }) { return <Dialog open={open} title={title} onApply={onConfirm} onClose={onClose} danger><p className="ou-message">{message}</p></Dialog>; }
export function ErrorDialog({ open, title = 'Operation failed', message, onClose }: { open: boolean; title?: string; message: string; onClose: () => void }) { return <Dialog open={open} title={title} onClose={onClose}><div className="ou-error-message" role="alert">{message}</div></Dialog>; }
export function PropertyGrid({ items }: { items: Array<{ label: string; value: ReactNode }> }) { return <dl className="ou-property-grid">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>; }
export function ConnectionState({ connected, label }: { connected: boolean; label: string }) { return <span className={`ou-connection ${connected ? 'is-connected' : 'is-disconnected'}`}><span />{label}</span>; }
export function Tooltip({ text, children }: { text: string; children: ReactNode }) { return <span className="ou-tooltip" data-tooltip={text}>{children}</span>; }

export function ContextMenu({ open, x, y, onClose, children }: { open: boolean; x: number; y: number; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState({ left: x, top: y, maxWidth: window.innerWidth - 6 });
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const scale = Number(getComputedStyle(document.documentElement).getPropertyValue('--ou-ui-scale')) || 1;
    const bounds = ref.current.getBoundingClientRect();
    const next = {
      left: Math.max(3, Math.min(x, window.innerWidth - bounds.width - 3)),
      top: Math.max(3, Math.min(y, window.innerHeight - bounds.height - 3)),
      maxWidth: Math.max(172, (window.innerWidth - 6) / scale),
    };
    setPosition((current) => current.left === next.left && current.top === next.top && current.maxWidth === next.maxWidth ? current : next);
  }, [open, x, y]);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const close = () => onClose(); window.addEventListener('pointerdown', close); return () => { window.removeEventListener('pointerdown', close); previousFocus.current?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(<div ref={ref} className="ou-context-menu" role="menu" style={position} onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => {
    const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')]; const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1 + items.length) % items.length]?.focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length]?.focus(); }
    if (event.key === 'Home') { event.preventDefault(); items[0]?.focus(); }
    if (event.key === 'End') { event.preventDefault(); items.at(-1)?.focus(); }
  }}>{children}</div>, document.body);
}
export function ContextMenuItem({ children, shortcut, onClick, disabled }: { children: ReactNode; shortcut?: string; onClick?: () => void; disabled?: boolean }) { return <button role="menuitem" disabled={disabled} onClick={onClick}><span className="ou-menu-check" /><span>{children}</span>{shortcut && <kbd>{shortcut}</kbd>}</button>; }
export function ContextMenuSeparator() { return <div role="separator" />; }
