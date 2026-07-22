import React from 'react';

/**
 * ModeBadge: Transparent indicator showing whether data is live from ZCQL,
 * from seed_fallback mode, or running in local mock mode.
 */
export function ModeBadge({ mode }) {
  let label = 'LIVE ZCQL';
  let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (mode === 'seed_fallback' || mode === 'fallback') {
    label = 'SEED FALLBACK';
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (mode === 'mock' || mode === 'mock_error') {
    label = 'MOCK MODE';
    colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider font-semibold ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {label}
    </span>
  );
}
