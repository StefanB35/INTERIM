import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Honorabilite, StatutConforme, StatutHorsTaux } from '../icons';
import './ui.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export function Button({ variant = 'primary', size = 'md', loading = false, children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return <button className={`ui-button ui-button--${variant} ui-button--${size}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading && <span className="ui-button__spinner" aria-hidden="true" />}<span>{loading ? 'Chargement...' : children}</span></button>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }>(function Input({ label, hint, error, id, ...props }, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <label className="ui-field" htmlFor={inputId}><span className="ui-label">{label}</span><input ref={ref} className="ui-control" id={inputId} aria-invalid={Boolean(error)} aria-describedby={hint || error ? `${inputId}-message` : undefined} {...props} />{(hint || error) && <span className="ui-hint" id={`${inputId}-message`}>{error ?? hint}</span>}</label>;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string; children: ReactNode }>(function Select({ label, hint, error, id, children, ...props }, ref) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return <label className="ui-field" htmlFor={selectId}><span className="ui-label">{label}</span><select ref={ref} className="ui-control" id={selectId} aria-invalid={Boolean(error)} aria-describedby={hint || error ? `${selectId}-message` : undefined} {...props}>{children}</select>{(hint || error) && <span className="ui-hint" id={`${selectId}-message`}>{error ?? hint}</span>}</label>;
});

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string }>(function Checkbox({ label, error, id, ...props }, ref) { const generatedId = useId(); const inputId = id ?? generatedId; return <label className="ui-field ui-check" htmlFor={inputId}><span><input ref={ref} id={inputId} type="checkbox" aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-message` : undefined} {...props} /><span>{label}</span></span>{error && <span className="ui-hint" id={`${inputId}-message`}>{error}</span>}</label>; });

export const Radio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string }>(function Radio({ label, error, id, ...props }, ref) { const generatedId = useId(); const inputId = id ?? generatedId; return <label className="ui-field ui-radio" htmlFor={inputId}><span><input ref={ref} id={inputId} type="radio" aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-message` : undefined} {...props} /><span>{label}</span></span>{error && <span className="ui-hint" id={`${inputId}-message`}>{error}</span>}</label>; });

export const DatePicker = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }>(function DatePicker(props, ref) { return <Input ref={ref} type="date" {...props} />; });

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
function StatusIcon({ tone }: { tone: BadgeTone }) { if (tone === 'success') return <StatutConforme size={16} aria-hidden="true" />; if (tone === 'danger' || tone === 'warning') return <StatutHorsTaux size={16} aria-hidden="true" />; if (tone === 'info') return <Honorabilite size={16} aria-hidden="true" />; return null; }
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) { return <span className={`ui-badge ui-badge--${tone}`}><StatusIcon tone={tone} />{children}</span>; }
export function StatusPill({ tone = 'info', children }: { tone?: Exclude<BadgeTone, 'neutral'>; children: ReactNode }) { return <span className={`ui-status ui-status--${tone}`}><StatusIcon tone={tone} />{children}</span>; }
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`ui-card ${className}`}>{children}</section>; }

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="ui-table-wrap"><table className="ui-table"><thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function Tabs({ tabs, activeTab, onChange }: { tabs: { id: string; label: string }[]; activeTab: string; onChange: (id: string) => void }) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const move = (index: number, direction: number) => { const next = (index + direction + tabs.length) % tabs.length; tabRefs.current[next]?.focus(); onChange(tabs[next].id); };
  return <div className="ui-tabs" role="tablist">{tabs.map((tab, index) => <button className="ui-tab" key={tab.id} type="button" role="tab" aria-selected={tab.id === activeTab} tabIndex={tab.id === activeTab ? 0 : -1} ref={(element) => { tabRefs.current[index] = element; }} onKeyDown={(event) => { if (event.key === 'ArrowRight') move(index, 1); if (event.key === 'ArrowLeft') move(index, -1); }} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>;
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
      if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="ui-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="ui-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}><div className="ui-dialog__header"><h2 id={titleId}>{title}</h2><button className="ui-dialog__close" type="button" aria-label="Fermer" onClick={onClose}>×</button></div><div>{children}</div></div></div>;
}

type Toast = { id: number; message: string; tone: 'info' | 'error' };
type ToastContextValue = { addToast: (message: string, tone?: Toast['tone']) => void };
export const ToastContext = createContext<ToastContextValue | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, tone: Toast['tone'] = 'info') => setToasts((current) => [...current, { id: Date.now(), message, tone }]);
  useEffect(() => {
    const onToast = (event: Event) => { const detail = (event as CustomEvent<{ message: string; tone?: Toast['tone'] }>).detail; addToast(detail.message, detail.tone); };
    window.addEventListener('apik:toast', onToast);
    return () => window.removeEventListener('apik:toast', onToast);
  }, []);
  return <ToastContext.Provider value={{ addToast }}><>{children}<div className="ui-toast-region" aria-live="polite">{toasts.map((toast) => <div className={`ui-toast ${toast.tone === 'error' ? 'ui-toast--error' : ''}`} key={toast.id}>{toast.message}</div>)}</div></></ToastContext.Provider>;
}
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) { return <div className="ui-empty"><strong>{title}</strong>{children && <p>{children}</p>}</div>; }
export function Skeleton({ width = '100%', height = '1rem' }: { width?: string; height?: string }) { return <div className="ui-skeleton" style={{ width, height }} aria-hidden="true" />; }

export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error('useToast must be used within ToastProvider'); return context; }

