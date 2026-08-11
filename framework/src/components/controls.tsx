import { cloneElement, forwardRef, isValidElement, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'danger'; icon?: IconName }>(function Button({ variant = 'default', icon, className = '', children, ...props }, ref) {
  const title = props.title ?? (typeof children === 'string' ? children : undefined);
  return <button ref={ref} className={`ou-button ou-button--${variant} ${className}`} title={title} {...props}>{icon && <Icon name={icon} />}{children}</button>;
});

export function IconButton({ label, icon, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: IconName }) {
  return <Button className="ou-icon-button" title={label} aria-label={label} icon={icon} {...props} />;
}

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(function TextField({ error, className = '', ...props }, ref) {
  return <input ref={ref} className={`ou-input ${error ? 'is-error' : ''} ${className}`} aria-invalid={error || undefined} {...props} />;
});

export function SearchField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <label className="ou-search"><Icon name="search" /><TextField type="search" {...props} /></label>;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ou-select ${className}`} {...props} />;
}

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="ou-check"><input type="checkbox" {...props} /><span>{label}</span></label>;
}

export function RadioButton({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="ou-check"><input type="radio" {...props} /><span>{label}</span></label>;
}

export function FormRow({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  const generatedId = useId();
  const controlId = isValidElement(children) ? (children.props as { id?: string }).id || generatedId : generatedId;
  const child = isValidElement(children) ? cloneElement(children as ReactElement<{ id?: string; 'aria-required'?: boolean }>, { id: controlId, 'aria-required': required || undefined }) : children;
  return <div className="ou-form-row"><label className="ou-field-label" htmlFor={controlId}>{label}{required && <span aria-hidden="true"> *</span>}</label><div>{child}{hint && <div className="ou-field-hint">{hint}</div>}</div></div>;
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) {
  return <span className={`ou-badge ou-badge--${tone}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="ou-progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}><div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function InlineStatus({ tone, children }: { tone: 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) {
  const icon = tone === 'danger' ? 'error' : tone === 'success' ? 'check' : tone;
  return <span className={`ou-inline ou-inline--${tone}`}><Icon name={icon} />{children}</span>;
}
