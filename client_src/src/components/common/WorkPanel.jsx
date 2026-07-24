import React from 'react';
import { type } from '../../design/scale';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function WorkPanel({
  title,
  eyebrow,
  actions,
  children,
  loading = false,
  empty = false,
  emptyMessage = "No records found.",
  error = null,
  className = "",
  bodyClass = "p-4 sm:p-5"
}) {
  return (
    <section className={`rounded-xl border border-pramaan-border bg-pramaan-surface shadow-sm overflow-hidden flex flex-col ${className}`}>
      {(title || eyebrow || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-pramaan-border px-4 py-3 bg-pramaan-surface/80 shrink-0">
          <div>
            {eyebrow && (
              <span className="text-pramaan-text-secondary/70 font-semibold uppercase tracking-wider block" style={type.eyebrow}>
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-pramaan-text font-bold" style={type.subheading}>
                {title}
              </h2>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}

      <div className={`min-h-0 flex-1 ${bodyClass}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-pramaan-text-secondary space-y-3">
            <RefreshCw size={20} className="animate-spin text-pramaan-primary" />
            <span style={type.label}>Loading intelligence records...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-pramaan-critical/30 bg-pramaan-critical/10 p-4 text-xs text-pramaan-critical flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center py-12 text-pramaan-text-secondary text-center">
            <span style={type.body}>{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default WorkPanel;
