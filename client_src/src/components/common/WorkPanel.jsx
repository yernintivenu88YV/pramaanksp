import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

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
  bodyClass = "p-5 sm:p-6"
}) {
  return (
    <section className={`rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs overflow-hidden flex flex-col ${className}`}>
      {(title || eyebrow || actions) && (
        <header className="flex items-center justify-between gap-4 border-b border-[#B3E3DE] px-6 py-4 bg-[#FEFFFF] shrink-0">
          <div>
            {eyebrow && (
              <span className="text-[#2B7A78] font-bold uppercase tracking-widest block text-[10px] mb-0.5">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-[#17252A] font-extrabold tracking-tight text-base sm:text-lg">
                {title}
              </h2>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
        </header>
      )}

      <div className={`min-h-0 flex-1 ${bodyClass}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#2B7A78] space-y-3">
            <RefreshCw size={22} className="animate-spin text-[#3AAFA9]" />
            <span className="text-xs font-semibold">Loading intelligence records...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#2B7A78] text-center">
            <span className="text-xs">{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default WorkPanel;
