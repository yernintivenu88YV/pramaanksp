import React, { useState, useEffect } from 'react';
import { activitySeries, cases, alerts } from '../../data/mock.js';
import { SeverityBadge } from '../ui/Severity.jsx';
import { WorkPanel } from '../ui/Layout.jsx';
import { AiClaim } from '../ui/AI.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChevronRight, RefreshCw, ShieldCheck, Sliders, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client.js';
import { ExplainabilityTooltip } from '../common/ExplainabilityTooltip.jsx';

export default function OverviewView({ onOpenCase }) {
  const [refreshing, setRefreshing] = useState(false);
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWeights, setShowWeights] = useState(false);

  const [weights, setWeights] = useState({
    wRecency: 1.0,
    wSeverity: 2.0,
    wCentrality: 1.5,
    wWarrant: 3.0
  });

  const findings = [
    { score: 91, text: 'CANON-0042 is the highest-priority subject because the same resolved identity appears across burglary and vehicle theft records.' },
    { score: 84, text: 'CASE-002 is the strongest signature twin for CASE-001 based on MO, timing, location, weapon, and narrative similarity.' },
    { score: 76, text: 'Bengaluru Central has the densest active property-crime cluster in the seeded demo set.' },
  ];

  const fetchPriority = async () => {
    setLoading(true);
    setError(null);
    const res = await api.getPriorityScores({
      w_recency: weights.wRecency,
      w_severity: weights.wSeverity,
      w_centrality: weights.wCentrality,
      w_warrant: weights.wWarrant
    });
    setLoading(false);

    if (res.ok && res.data && Array.isArray(res.data.scores)) {
      setPriorityData(res.data.scores);
    } else {
      setError(res.error || 'Failed to fetch priority scores');
    }
  };

  useEffect(() => {
    fetchPriority();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    fetchPriority().finally(() => {
      setTimeout(() => setRefreshing(false), 900);
    });
  };

  // Derive counts dynamically
  const activeCasesCount = cases.length;
  const openAlertsCount = alerts.length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical').length;
  const resolvedIdsCount = priorityData.length;
  const activeWarrantsCount = priorityData.filter(s => s.variables?.has_active_warrant).length;

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-5 lg:p-6 overflow-auto">
      <div className="flex flex-col gap-3 border-b border-pramaan-border pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-pramaan-text">
            KSP Intelligence Briefing
            <span className="rounded bg-pramaan-primary/20 px-2 py-0.5 text-[10px] text-pramaan-primary">AI ASSISTED</span>
          </h1>
          <p className="text-sm text-pramaan-text-secondary">Investigator workflow: detect, resolve, compare, traverse, export.</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 text-sm text-pramaan-secondary transition-colors hover:text-pramaan-primary">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Active cases', value: activeCasesCount },
          { label: 'Open alerts', value: openAlertsCount },
          { label: 'Critical', value: criticalAlertsCount, critical: true },
          { label: 'Resolved IDs', value: resolvedIdsCount },
          { label: 'Warrants', value: activeWarrantsCount, critical: activeWarrantsCount > 0 },
          { label: 'Live APIs', value: 8 },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-pramaan-border bg-pramaan-surface p-3">
            <div className="mb-1 text-xs text-pramaan-text-secondary">{item.label}</div>
            <div className={`text-2xl font-semibold ${item.critical ? 'text-pramaan-critical' : 'text-pramaan-text'}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-5 xl:col-span-2">
          <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
            <h2 className="mb-4 text-sm font-semibold text-pramaan-text">Key Findings</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {findings.map((f) => <AiClaim key={f.text} score={f.score}>{f.text}</AiClaim>)}
            </div>
          </div>
          <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
            <h2 className="mb-4 text-sm font-semibold text-pramaan-text">Seven-Day Alert Load</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activitySeries}>
                  <defs>
                    <linearGradient id="alertValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A9EFF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4A9EFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" />
                  <XAxis dataKey="time" stroke="#9AA0A6" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9AA0A6" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#14171C', borderColor: '#2A2E35' }} itemStyle={{ color: '#E8EAED' }} />
                  <Area type="monotone" dataKey="value" stroke="#4A9EFF" fillOpacity={1} fill="url(#alertValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-pramaan-text flex items-center gap-2">
              <ShieldCheck size={16} className="text-pramaan-primary" /> Suspect Leaderboard
            </h2>
            <button 
              onClick={() => setShowWeights(!showWeights)} 
              className={`p-1 rounded transition-colors ${showWeights ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary hover:text-pramaan-text'}`}
              title="Tune Scoring Weights"
            >
              <Sliders size={15} />
            </button>
          </div>

          {showWeights && (
            <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-pramaan-primary">
                <span>Linear Scoring Weights</span>
                <button
                  onClick={fetchPriority}
                  disabled={loading}
                  className="px-2 py-0.5 bg-pramaan-primary/20 text-pramaan-secondary border border-pramaan-primary/30 rounded text-[10px] hover:bg-pramaan-primary/30"
                >
                  Apply
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Recency Decay</span>
                    <span className="font-mono">{weights.wRecency}</span>
                  </label>
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={weights.wRecency}
                    onChange={(e) => setWeights({ ...weights, wRecency: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-ew-resize"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Crime Severity</span>
                    <span className="font-mono">{weights.wSeverity}</span>
                  </label>
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={weights.wSeverity}
                    onChange={(e) => setWeights({ ...weights, wSeverity: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-ew-resize"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Network Centrality</span>
                    <span className="font-mono">{weights.wCentrality}</span>
                  </label>
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={weights.wCentrality}
                    onChange={(e) => setWeights({ ...weights, wCentrality: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-ew-resize"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Active Warrants</span>
                    <span className="font-mono">{weights.wWarrant}</span>
                  </label>
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={weights.wWarrant}
                    onChange={(e) => setWeights({ ...weights, wWarrant: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-critical cursor-ew-resize"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-2 bg-pramaan-critical/10 border border-pramaan-critical/20 text-pramaan-critical rounded text-xs">
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[460px] pr-1">
            {priorityData.length === 0 ? (
              <div className="text-center text-xs text-pramaan-text-secondary py-8">
                {loading ? 'Calculating threat vectors…' : 'No suspect vectors loaded.'}
              </div>
            ) : (
              priorityData.map((row) => (
                <div key={row.canonical_id} className="rounded-md border border-pramaan-border bg-pramaan-elevated p-3 text-sm flex flex-col gap-1 hover:border-pramaan-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-pramaan-text">{row.name}</span>
                      <div className="font-mono text-[10px] text-pramaan-text-secondary mt-0.5">{row.canonical_id}</div>
                    </div>
                    <ExplainabilityTooltip row={row} weights={weights} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {row.variables?.has_active_warrant && (
                      <span className="px-1.5 py-0.5 bg-pramaan-critical/15 text-pramaan-critical border border-pramaan-critical/30 rounded text-[9px] font-bold tracking-wider flex items-center gap-0.5">
                        <AlertTriangle size={10} /> WARRANT ACTIVE
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-pramaan-surface text-pramaan-text-secondary rounded text-[9px] font-mono">
                      {row.variables?.prior_cases || 0} cases
                    </span>
                    <span className="px-1.5 py-0.5 bg-pramaan-surface text-pramaan-text-secondary rounded text-[9px] font-mono">
                      {row.variables?.co_accused_count || 0} associates
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </WorkPanel>
  );
}

