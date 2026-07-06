import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function PageStack({ children, className = '' }) {
  return <div className={`flex flex-col gap-5 p-5 sm:p-6 font-sans ${className}`}>{children}</div>;
}

export function ZoneGrid({ children, className = '' }) {
  return <div className={`grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-12 ${className}`}>{children}</div>;
}

export function PrimaryZone({ span = 8, children, className = '' }) {
  const spanClass = span === 12 ? 'xl:col-span-12' : span === 10 ? 'xl:col-span-10' : span === 8 ? 'xl:col-span-8' : span === 6 ? 'xl:col-span-6' : 'xl:col-span-8';
  return <div className={`min-h-0 ${spanClass} ${className}`}>{children}</div>;
}

export function SupportZone({ span = 4, children, className = '' }) {
  const spanClass = span === 6 ? 'xl:col-span-6' : span === 4 ? 'xl:col-span-4' : span === 3 ? 'xl:col-span-3' : 'xl:col-span-4';
  return <div className={`min-h-0 ${spanClass} ${className}`}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, actions, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {eyebrow && <span className="rounded-lg bg-[#DEF2F1] px-2 py-0.5 text-[#2B7A78] border border-[#3AAFA9]/30 text-[10px] font-mono font-bold tracking-wider uppercase">{eyebrow}</span>}
        <h3 className="text-[#17252A] font-extrabold text-sm sm:text-base tracking-tight">{title}</h3>
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return <div className={`overflow-hidden rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs ${className}`}>{children}</div>;
}

export function WorkPanel({ eyebrow, title, actions, children, className = '', bodyClass = 'p-5 sm:p-6' }) {
  const hasHeader = Boolean(eyebrow || title || actions);
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between border-b border-[#B3E3DE] px-5 py-4 bg-[#FEFFFF] shrink-0">
          <div className="flex items-center gap-2.5">
            {eyebrow && <span className="rounded-lg bg-[#DEF2F1] px-2.5 py-1 text-[#2B7A78] border border-[#3AAFA9]/30 text-[10px] font-mono font-bold tracking-wider uppercase">{eyebrow}</span>}
            {title && <span className="text-[#17252A] font-extrabold text-sm sm:text-base tracking-tight">{title}</span>}
          </div>
          {actions}
        </div>
      )}
      <div className={`min-h-0 flex-1 ${bodyClass}`}>{children}</div>
    </div>
  );
}

export function CollapsiblePanel({ title, defaultOpen = true, children, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`overflow-hidden rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs ${className}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#DEF2F1]/50 cursor-pointer">
        <span className="text-[#17252A] font-extrabold text-sm sm:text-base">{title}</span>
        <ChevronDown size={16} className={`text-[#2B7A78] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-[#B3E3DE] p-5">{children}</div>}
    </div>
  );
}

export function StatTile({ label, value, unit, className = '' }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="tnum font-mono text-[#17252A] text-lg font-extrabold">{value}{unit && <span className="ml-1 text-[#2B7A78] text-xs font-semibold">{unit}</span>}</span>
      <span className="text-[#2B7A78] uppercase text-[10px] font-bold tracking-widest font-mono">{label}</span>
    </div>
  );
}
