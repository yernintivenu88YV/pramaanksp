import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

function toneClasses(score) {
  if (score >= 80) return { bar: 'bg-pramaan-success', text: 'text-pramaan-success' };
  if (score >= 60) return { bar: 'bg-pramaan-warning', text: 'text-pramaan-warning' };
  return { bar: 'bg-pramaan-critical', text: 'text-pramaan-critical' };
}

export function Confidence({ score = 0, label }) {
  const tone = toneClasses(score);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-pramaan-panel">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={tone.text} style={{ fontSize: 11, fontWeight: 600 }}>{score}%</span>
      {label && <span className="text-pramaan-text-secondary" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>{label}</span>}
    </div>
  );
}

export function AiClaim({ score = 0, evidence = [], children, claim, confidence }) {
  const [open, setOpen] = useState(false);
  const finalScore = Math.round(score || (confidence ? confidence * 100 : 0));
  return (
    <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated">
      <div className="p-3">
        <div className="text-pramaan-text" style={{ fontSize: 13, lineHeight: 1.65 }}>{children || claim}</div>
        <div className="mt-2 flex items-center gap-2">
          <Confidence score={finalScore} />
          {evidence.length > 0 && (
            <button onClick={() => setOpen(!open)} className="ml-auto flex items-center gap-1 text-pramaan-secondary hover:text-pramaan-primary" style={{ fontSize: 10.5, fontWeight: 500 }}>
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
    <sup className="ml-0.5 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-pramaan-primary/20 text-[10px] font-bold text-pramaan-primary hover:bg-pramaan-primary hover:text-pramaan-bg">
      {id}
    </sup>
  );
}
