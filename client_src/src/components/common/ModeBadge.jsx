import React from 'react';

/**
 * ModeBadge: Pill with pulsing dot — LIVE ZCQL (green) / SEED FALLBACK (amber) / MOCK (cyan).
 * Ensures data provenance and honesty as per UI_DESIGN.md section 2.4.
 */
export function ModeBadge({ mode }) {
  let label = 'LIVE ZCQL';
  let badgeStyle = 'bg-pramaan-success/15 text-pramaan-success border-pramaan-success/30';
  let dotStyle = 'bg-pramaan-success';

  if (mode === 'seed_fallback' || mode === 'fallback') {
    label = 'SEED FALLBACK';
    badgeStyle = 'bg-pramaan-warning/15 text-pramaan-warning border-pramaan-warning/30';
    dotStyle = 'bg-pramaan-warning';
  } else if (mode === 'mock' || mode === 'mock_error') {
    label = 'MOCK MODE';
    badgeStyle = 'bg-pramaan-secondary/15 text-pramaan-secondary border-pramaan-secondary/30';
    dotStyle = 'bg-pramaan-secondary';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono tracking-wider font-semibold uppercase ${badgeStyle}`}
      title={`Data Source Mode: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle} dot-pulse`}></span>
      {label}
    </span>
  );
}
