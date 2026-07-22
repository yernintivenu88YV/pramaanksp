import React from 'react';

/**
 * ExplainabilityTooltip: Renders a hand-reproducible mathematical formula breakdown
 * for suspect priority scores, making AI decision rationale transparent.
 */
export function ExplainabilityTooltip({ row, weights }) {
  const { wRecency = 1.0, wSeverity = 2.0, wCentrality = 1.5, wWarrant = 3.0 } = weights || {};
  const b = row.breakdown || { recency: 0, severity: 0, centrality: 0, warrant: 0 };
  const v = row.variables || { prior_cases: 0, co_accused_count: 0, has_active_warrant: false };

  return (
    <div className="explain-tooltip inline-block cursor-help">
      <span className="text-amber-400 font-mono font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
        {Number(row.total_score).toFixed(2)} pts ℹ️
      </span>
      <div className="explain-tooltip-content w-80 bg-[#1b1f26] border border-white/20 p-3 rounded-lg shadow-xl text-xs text-[#e8eaed]">
        <div className="font-bold text-cyan-400 mb-1 border-b border-white/10 pb-1">
          Auditable Priority Calculation
        </div>
        <div className="font-mono text-[11px] text-gray-300 mb-2 bg-[#14171c] p-2 rounded border border-white/5">
          ({wRecency} × {b.recency}) + ({wSeverity} × {b.severity}) + ({wCentrality} × {b.centrality}) + ({wWarrant} × {b.warrant}) = <span className="text-amber-400 font-bold">{row.total_score}</span>
        </div>
        <div className="space-y-1 text-[11px] text-gray-400">
          <div className="flex justify-between">
            <span>Prior Cases Count:</span>
            <span className="font-mono text-white">{v.prior_cases}</span>
          </div>
          <div className="flex justify-between">
            <span>Network Co-Accused:</span>
            <span className="font-mono text-white">{v.co_accused_count}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Warrant Flag:</span>
            <span className={`font-bold font-mono ${v.has_active_warrant ? 'text-red-400' : 'text-gray-400'}`}>
              {v.has_active_warrant ? 'YES (Active)' : 'NO'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
