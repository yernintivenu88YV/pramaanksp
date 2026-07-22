import React from 'react';

export const ENTITY_TYPES = ['person', 'vehicle', 'phone', 'organisation', 'location', 'fir'];

export const entityColor = {
  person: '#4A9EFF',
  vehicle: '#FFB84D',
  phone: '#5FA37E',
  organisation: '#A98BD0',
  location: '#E5675C',
  fir: '#7FB3C9',
};

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function ThinkingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="thinking-dot inline-block h-1.5 w-1.5 rounded-full bg-pramaan-primary" />
      ))}
    </span>
  );
}

export function RailLabel({ children }) {
  return (
    <div className="mb-1.5 text-pramaan-text-secondary/60 uppercase" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em' }}>
      {children}
    </div>
  );
}

export function ConfidenceWhy({ confidence, claim, evidence = [] }) {
  const tone = confidence >= 80 ? 'pramaan-success' : confidence >= 60 ? 'pramaan-warning' : 'pramaan-critical';
  return (
    <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-pramaan-panel">
          <div className={`h-full rounded-full bg-${tone}`} style={{ width: `${confidence}%` }} />
        </div>
        <span className={`text-${tone}`} style={{ fontSize: 11, fontWeight: 600 }}>{confidence}%</span>
      </div>
      <p className="text-pramaan-text" style={{ fontSize: 12, lineHeight: 1.6 }}>{claim}</p>
      {evidence.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {evidence.map((e, i) => (
            <div key={i} className="flex items-center gap-1.5 text-pramaan-text-secondary" style={{ fontSize: 10.5 }}>
              <span className="h-1 w-1 rounded-full bg-pramaan-primary" />
              {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
