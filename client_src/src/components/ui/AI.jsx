import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

export function Confidence({ score, label }) {
  const tone = score >= 80 ? 'pramaan-success' : score >= 60 ? 'pramaan-warning' : 'pramaan-critical';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-pramaan-panel">
        <div className={`h-full rounded-full bg-${tone}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-${tone}`} style={{ fontSize: 11, fontWeight: 600 }}>{score}%</span>
      {label && <span className="text-pramaan-text-secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>{label}</span>}
    </div>
  );
}

export function AiClaim({ score, evidence = [], children }) {
  const [open, setOpen] = useState(false);
  const tone = score >= 80 ? 'pramaan-success' : score >= 60 ? 'pramaan-warning' : 'pramaan-critical';
  return (
    <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated">
      <div className="p-3">
        <div className="text-pramaan-text" style={{ fontSize: 13, lineHeight: 1.65 }}>{children}</div>
        <div className="mt-2 flex items-center gap-2">
          <Confidence score={score} />
          {evidence.length > 0 && (
            <button
              onClick={() => setOpen(!open)}
              className="ml-auto flex items-center gap-1 text-pramaan-secondary hover:text-pramaan-primary"
              style={{ fontSize: 10.5, fontWeight: 500 }}
            >
              <Info size={11} strokeWidth={2} /> Why
              <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
      {open && evidence.length > 0 && (
        <div className="border-t border-pramaan-border bg-pramaan-panel/30 px-3 py-2">
          {evidence.map((e) => (
            <div key={e.id} className="tnum mt-1 flex items-center gap-2 font-mono text-pramaan-text-secondary first:mt-0" style={{ fontSize: 10.5 }}>
              <span className="text-pramaan-secondary">{e.id}</span>
              <span>{e.label}</span>
              <span className="text-pramaan-text-secondary/70">{e.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Cite({ id }) {
  return (
    <sup className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-pramaan-primary/20 text-[10px] font-bold text-pramaan-primary cursor-pointer hover:bg-pramaan-primary hover:text-pramaan-bg ml-0.5">
      {id}
    </sup>
  );
}

