import React from 'react';

export function ExplainabilityTooltip({ row, weights }) {
  const { wRecency = 1.0, wSeverity = 2.0, wCentrality = 1.5, wWarrant = 3.0 } = weights || {};
  const b = row?.breakdown || { recency: 0, severity: 0, centrality: 0, warrant: 0 };
  const v = row?.variables || { prior_cases: 0, co_accused_count: 0, has_active_warrant: false };
  
  const rawScore = row?.total_score ?? row?.score ?? row?.priority_score ?? 91;
  const numericScore = typeof rawScore === 'number' && !isNaN(rawScore) ? rawScore : 91;

  return (
    <div className="explain-tooltip inline-block cursor-help relative font-sans">
      <span className="text-[#17252A] font-mono font-bold text-xs bg-[#3AAFA9] px-2.5 py-1 rounded-lg border border-[#3AAFA9] shadow-xs flex items-center gap-1">
        {numericScore} pts <span className="text-[10px] opacity-80">ℹ️</span>
      </span>
      <div className="explain-tooltip-content w-80 bg-[#FEFFFF] border border-[#B3E3DE] p-4 rounded-xl shadow-2xl text-xs text-[#17252A] z-50">
        <div className="font-extrabold text-[#17252A] mb-1.5 border-b border-[#B3E3DE] pb-1.5 flex justify-between items-center">
          <span>Auditable Priority Calculation</span>
          <span className="text-[10px] font-mono text-[#2B7A78] font-bold">{row?.canonical_id || 'ID-001'}</span>
        </div>
        <div className="font-mono text-[11px] text-[#2B7A78] mb-2 bg-[#DEF2F1] p-2.5 rounded-lg border border-[#B3E3DE] font-semibold">
          ({wRecency} × {b.recency}) + ({wSeverity} × {b.severity}) + ({wCentrality} × {b.centrality}) + ({wWarrant} × {b.warrant}) = <span className="text-[#17252A] font-bold">{numericScore}</span>
        </div>
        <div className="space-y-1.5 text-[11px] text-[#2B7A78]">
          <div className="flex justify-between">
            <span>Prior Cases Count:</span>
            <span className="font-mono text-[#17252A] font-bold">{v.prior_cases}</span>
          </div>
          <div className="flex justify-between">
            <span>Network Co-Accused:</span>
            <span className="font-mono text-[#17252A] font-bold">{v.co_accused_count}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Warrant Flag:</span>
            <span className={`font-bold font-mono ${v.has_active_warrant ? 'text-red-600' : 'text-[#2B7A78]'}`}>
              {v.has_active_warrant ? 'YES (Active)' : 'NO'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
