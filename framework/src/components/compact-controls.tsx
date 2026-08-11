import { Check, Filter, MessageSquareText, Minus, Plus, RefreshCw, Search, X } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Tabs } from './Tabs';

export function CompactButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { const title = props.title ?? (typeof children === 'string' ? children : undefined); return <button className={`ou-compact-button ${className}`} title={title} {...props}>{children}</button>; }
export const CompactTextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function CompactTextField(props, ref) { return <input ref={ref} className="ou-compact-field" {...props} />; });
export function CompactComboBox(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select className="ou-compact-field ou-compact-combo" {...props} />; }
export function CompactCheckbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="ou-compact-check"><input type="checkbox" {...props} /><span>{label}</span></label>; }
export function CompactRadio({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="ou-compact-check"><input type="radio" {...props} /><span>{label}</span></label>; }
export function ToolbarSeparator() { return <span className="ou-local-toolbar-separator" role="separator" />; }

const toolbarIcons = { add: Plus, remove: Minus, enable: Check, disable: X, comment: MessageSquareText, filter: Filter, refresh: RefreshCw } as const;
export function ToolbarButton16({ icon, label, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: keyof typeof toolbarIcons; label: string }) { const Icon = toolbarIcons[icon]; return <button className="ou-toolbar-button-16" title={label} aria-label={label} {...props}><Icon /></button>; }
export const TinyIconButton = ToolbarButton16;

export const QuickFind = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function QuickFind(props, ref) { return <label className="ou-quick-find"><span>Find</span><Search aria-hidden="true" /><CompactTextField ref={ref} {...props} /></label>; });
export function FlagsColumn({ flags, title }: { flags: string; title?: string }) { return <span className="ou-flags" title={title} aria-label={title || flags}>{flags || ' '}</span>; }
export function StateIcon({ state }: { state: 'active' | 'disabled' | 'dynamic' | 'warning' }) { return <span className={`ou-state-icon is-${state}`} aria-hidden="true" />; }
export function StateText({ state, children }: { state: 'active' | 'disabled' | 'dynamic' | 'warning'; children: ReactNode }) { return <span className={`ou-state-text is-${state}`}><StateIcon state={state} />{children}</span>; }
export function CompactTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (value: string) => void }) { return <Tabs items={tabs.map((tab) => ({ id: tab, label: tab }))} active={active} onChange={onChange} />; }
export function PropertyRow({ label, children }: { label: string; children: ReactNode }) { return <div className="ou-property-row"><span>{label}</span><div>{children}</div></div>; }
