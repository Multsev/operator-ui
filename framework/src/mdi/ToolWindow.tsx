import { Copy, Maximize2, Minus, X } from 'lucide-react';
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { Rect, ToolWindowState } from './types';
import type { WorkspaceMetrics } from './types';
import { normalizeWindowRect } from './windowManager';

type Props = {
  window: ToolWindowState; active: boolean; zIndex: number; children: ReactNode;
  workspaceMetrics?: WorkspaceMetrics;
  onActivate: () => void; onClose: () => void; onMinimize: () => void; onMaximize: () => void; onRestore: () => void; onRectChange: (rect: Rect) => void;
};

export function ToolWindow({ window, active, zIndex, children, workspaceMetrics, onActivate, onClose, onMinimize, onMaximize, onRestore, onRectChange }: Props) {
  const windowRef = useRef<HTMLElement>(null);
  const gesture = useRef<{ kind: 'move' | `resize-${string}`; startX: number; startY: number; rect: Rect } | null>(null);
  useEffect(() => { if (active && !windowRef.current?.contains(document.activeElement)) windowRef.current?.focus({ preventScroll: true }); }, [active]);
  const begin = (event: ReactPointerEvent, kind: 'move' | `resize-${string}`) => { if (event.button !== 0 || window.mode !== 'normal') return; if ((event.target as HTMLElement).closest('button,input,select')) return; gesture.current = { kind, startX: event.clientX, startY: event.clientY, rect: window.rect }; event.currentTarget.setPointerCapture(event.pointerId); onActivate(); };
  const move = (event: ReactPointerEvent) => { const current = gesture.current; if (!current) return; const scale = Number(getComputedStyle(document.documentElement).getPropertyValue('--ou-ui-scale')) || 1; const dx = (event.clientX - current.startX) / scale; const dy = (event.clientY - current.startY) / scale; if (current.kind === 'move') { onRectChange(normalizeWindowRect({ ...current.rect, x: current.rect.x + dx, y: current.rect.y + dy }, window.minSize, workspaceMetrics)); return; } const edges = current.kind.slice(7); let { x, y, width, height } = current.rect; if (edges.includes('e')) width = Math.max(window.minSize.width, width + dx); if (edges.includes('s')) height = Math.max(window.minSize.height, height + dy); if (edges.includes('w')) { const right = x + width; x = Math.max(0, Math.min(right - window.minSize.width, x + dx)); width = right - x; } if (edges.includes('n')) { const bottom = y + height; y = Math.max(0, Math.min(bottom - window.minSize.height, y + dy)); height = bottom - y; } onRectChange({ x, y, width, height }); };
  const end = () => { gesture.current = null; };
  const displayRect = window.mode === 'minimized' ? { ...window.rect, width: 230, height: 27 } : window.rect;
  return <section ref={windowRef} role="region" aria-label={window.title} tabIndex={-1} data-window-id={window.id} data-window-mode={window.mode} className={`ou-mdi-window ${active ? 'is-active' : ''} is-${window.mode}`} style={{ left: displayRect.x, top: displayRect.y, width: displayRect.width, height: displayRect.height, zIndex }} onClick={onActivate} onKeyDown={(event) => { if (!event.altKey || window.mode !== 'normal' || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); const step = event.shiftKey ? 12 : 4; const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0; const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0; onRectChange(event.shiftKey ? { ...window.rect, width: Math.max(window.minSize.width, window.rect.width + dx), height: Math.max(window.minSize.height, window.rect.height + dy) } : normalizeWindowRect({ ...window.rect, x: window.rect.x + dx, y: window.rect.y + dy }, window.minSize, workspaceMetrics)); }}>
    <header className="ou-window-titlebar" onDoubleClick={window.mode === 'maximized' ? onRestore : onMaximize} onPointerDown={(event) => begin(event, 'move')} onPointerMove={move} onPointerUp={end}>
      <span className="ou-window-title">{window.title}</span><div className="ou-window-controls" onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}><button aria-label={`Minimize ${window.title}`} onClick={() => { onActivate(); onMinimize(); }}><Minus /></button><button aria-label={`${window.mode === 'maximized' ? 'Restore' : 'Maximize'} ${window.title}`} onClick={() => { onActivate(); window.mode === 'maximized' ? onRestore() : onMaximize(); }}>{window.mode === 'maximized' ? <Copy /> : <Maximize2 />}</button><button aria-label={`Close ${window.title}`} onClick={onClose}><X /></button></div>
    </header>
    {window.mode !== 'minimized' && <div className="ou-window-content">{children}</div>}
    {window.mode === 'normal' && ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'].map((edge) => <div key={edge} className={`ou-window-resize-handle is-${edge}`} aria-hidden="true" onPointerDown={(event) => begin(event, `resize-${edge}`)} onPointerMove={move} onPointerUp={end} />)}
  </section>;
}
