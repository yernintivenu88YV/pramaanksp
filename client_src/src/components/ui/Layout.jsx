import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function PageStack({ children, className = '' }) {
  return <div className={`flex flex-col gap-4 p-5 ${className}`}>{children}</div>;
}

export function ZoneGrid({ children, className = '' }) {
  return <div className={`grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-12 ${className}`}>{children}</div>;
}

export function PrimaryZone({ span = 8, children, className = '' }) {
  return <div className={`min-h-0 xl:col-span-${span} ${className}`}>{children}</div>;
}

export function SupportZone({ span = 4, children, className = '' }) {
  return <div className={`min-h-0 xl:col-span-${span} ${className}`}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, actions, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {eyebrow && (
          <span className="rounded bg-pramaan-elevated px-1.5 py-0.5 text-pramaan-secondary" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em' }}>
            {eyebrow}
          </span>
        )}
        <h3 className="text-pramaan-text" style={{ fontSize: 14, fontWeight: 600 }}>{title}</h3>
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-pramaan-border bg-pramaan-surface ${className}`}>
      {children}
    </div>
  );
}

export function WorkPanel({ eyebrow, title, actions, children, className = '', bodyClass = 'p-3' }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border border-pramaan-border bg-pramaan-surface ${className}`}>
      <div className="flex items-center justify-between border-b border-pramaan-border px-3 py-2">
        <div className="flex items-center gap-2">
          {eyebrow && (
            <span className="rounded bg-pramaan-elevated px-1.5 py-0.5 text-pramaan-secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>
              {eyebrow}
            </span>
          )}
          <span className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        </div>
        {actions}
      </div>
      <div className={`min-h-0 flex-1 overflow-auto ${bodyClass}`}>{children}</div>
    </div>
  );
}

export function CollapsiblePanel({ title, defaultOpen = true, children, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`overflow-hidden rounded-lg border border-pramaan-border bg-pramaan-surface ${className}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-pramaan-hover">
        <span className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        <ChevronDown size={14} className={`text-pramaan-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-pramaan-border p-3">{children}</div>}
    </div>
  );
}

export function StatTile({ label, value, unit, className = '' }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="tnum font-mono text-pramaan-text" style={{ fontSize: 15, fontWeight: 600 }}>
        {value}{unit && <span className="ml-0.5 text-pramaan-text-secondary" style={{ fontSize: 11 }}>{unit}</span>}
      </span>
      <span className="text-pramaan-text-secondary/80 uppercase" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}
