import React, { useState, useEffect } from 'react';
import { activitySeries, cases, alerts } from '../../data/mock.js';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { Cite } from '../common/Cite.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { RefreshCw, ShieldCheck, Sliders, AlertTriangle, ChevronRight, Activity, Users, Shield, Layers } from 'lucide-react';
import { api } from '../../api/client.js';
import { ExplainabilityTooltip } from '../common/ExplainabilityTooltip.jsx';

export default function OverviewView({ onOpenCase, activeRole = 'ACP' }) {
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

  const isAggregateOnly = activeRole === 'Analyst' || activeRole === 'Policy';

  const findings = [
    { score: 91, cite: 'FIR-2024-8841', text: 'CANON-0042 identified as highest-priority threat linked to multi-district serial burglaries.' },
    { score: 84, cite: 'CASE-002', text: 'CASE-002 flagged as 88% twin match to CASE-001 based on MO, timing, and weapon similarity.' },
    { score: 76, cite: 'CLUS-BLR-CENTRAL', text: 'Bengaluru Central station registered densest property crime cluster in past 7 days.' },
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

  const activeCasesCount = cases.length;
  const openAlertsCount = alerts.length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical').length;
  const resolvedIdsCount = priorityData.length;

  return (
    <div className="space-y-5 anim-content">
      {/* Header Banner */}
      <WorkPanel
        eyebrow="Watch Floor Command Briefing"
        title="KSP Crime Intelligence Command Overview"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs font-semibold text-pramaan-secondary bg-pramaan-elevated px-3 py-1.5 rounded-lg border border-pramaan-border hover:border-pramaan-secondary/40 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        }
      >
        <p className="text-xs text-pramaan-text-secondary">
          Real-time situation brief, suspect priority scores, incident trends, and AI-derived evidence citations for Karnataka State Police.
        </p>

        {/* Row 1 — Stat tiles (4-up grid) */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3.5 flex flex-col justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-pramaan-text-secondary/70">
              Active Cases
            </div>
            <div className="text-2xl font-mono font-bold text-pramaan-text mt-1">{activeCasesCount}</div>
            <div className="text-[11px] font-medium text-pramaan-success mt-1">↑ +4 from yesterday</div>
          </div>

          <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3.5 flex flex-col justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-pramaan-text-secondary/70">
              Open Alerts
            </div>
            <div className="text-2xl font-mono font-bold text-pramaan-text mt-1">{openAlertsCount}</div>
            <div className="text-[11px] font-medium text-pramaan-warning mt-1">6 requiring review</div>
          </div>

          <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3.5 flex flex-col justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-pramaan-text-secondary/70">
              Critical Priority
            </div>
            <div className="text-2xl font-mono font-bold text-pramaan-critical mt-1">{criticalAlertsCount}</div>
            <div className="text-[11px] font-medium text-pramaan-critical mt-1">High urgency action</div>
          </div>

          <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3.5 flex flex-col justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-pramaan-text-secondary/70">
              {isAggregateOnly ? 'Cluster Rollups' : 'Resolved Identities'}
            </div>
            <div className="text-2xl font-mono font-bold text-pramaan-secondary mt-1">
              {isAggregateOnly ? 14 : resolvedIdsCount}
            </div>
            <div className="text-[11px] font-medium text-pramaan-secondary mt-1">Canonical graph</div>
          </div>
        </div>
      </WorkPanel>

      {/* Row 2 — 2 Column Layout */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Left 2 Cols: Priority Watchlist & Trends */}
        <div className="space-y-5 xl:col-span-2">
          {/* Activity Trend Chart */}
          <WorkPanel eyebrow="Incident Load" title="7-Day Crime Incident Trend">
            <div className="h-60 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activitySeries}>
                  <defs>
                    <linearGradient id="alertValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3346" />
                  <XAxis dataKey="time" stroke="#8A97AD" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8A97AD" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121722', borderColor: '#2A3346', borderRadius: '8px' }}
                    itemStyle={{ color: '#EAF0FA' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#alertValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </WorkPanel>

          {/* AI Key Findings */}
          <WorkPanel eyebrow="Automated Intelligence" title="AI Key Findings & Citations">
            <div className="grid gap-3 md:grid-cols-3">
              {findings.map((f) => (
                <div key={f.cite} className="p-3.5 rounded-lg border border-pramaan-border bg-pramaan-elevated flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-pramaan-secondary bg-pramaan-secondary/10 px-1.5 py-0.5 rounded border border-pramaan-secondary/20">
                      Score: {f.score}%
                    </span>
                    <Cite id={f.cite} onClick={onOpenCase} />
                  </div>
                  <p className="text-xs text-pramaan-text leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </WorkPanel>
        </div>

        {/* Right Rail: Priority Watchlist */}
        <WorkPanel
          eyebrow="Target Leaderboard"
          title="Priority Watchlist"
          actions={
            !isAggregateOnly && activeRole === 'ACP' ? (
              <button
                onClick={() => setShowWeights(!showWeights)}
                className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                  showWeights ? 'bg-pramaan-elevated text-pramaan-primary border-pramaan-primary' : 'border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text'
                }`}
                title="Adjust Weight Sliders"
              >
                <Sliders size={14} />
              </button>
            ) : null
          }
        >
          {showWeights && activeRole === 'ACP' && (
            <div className="mb-4 rounded-lg border border-pramaan-border bg-pramaan-elevated p-3 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-pramaan-secondary">
                <span>Priority Weights</span>
                <button
                  onClick={fetchPriority}
                  disabled={loading}
                  className="px-2 py-0.5 bg-pramaan-primary/20 text-pramaan-primary border border-pramaan-primary/30 rounded text-[10px] hover:bg-pramaan-primary/30 cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Recency Decay</span> <span>{weights.wRecency}</span>
                  </div>
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={weights.wRecency}
                    onChange={(e) => setWeights({ ...weights, wRecency: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Crime Severity</span> <span>{weights.wSeverity}</span>
                  </div>
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={weights.wSeverity}
                    onChange={(e) => setWeights({ ...weights, wSeverity: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {isAggregateOnly ? (
            <div className="p-4 text-center text-xs text-pramaan-text-secondary bg-pramaan-elevated rounded-lg border border-pramaan-border">
              <Shield className="w-6 h-6 mx-auto mb-2 text-pramaan-warning opacity-80" />
              Individual suspect profiles are masked for <strong>{activeRole}</strong> role. Showing aggregated district crime scores.
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {priorityData.length === 0 ? (
                <div className="text-center text-xs text-pramaan-text-secondary py-8">
                  {loading ? 'Calculating priority vectors...' : 'No priority records loaded.'}
                </div>
              ) : (
                priorityData.map((row) => (
                  <div
                    key={row.canonical_id}
                    className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3 hover:border-pramaan-secondary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-pramaan-text">{row.name}</span>
                        <div className="font-mono text-[10px] text-pramaan-text-secondary mt-0.5">{row.canonical_id}</div>
                      </div>
                      <ExplainabilityTooltip row={row} weights={weights} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {row.variables?.has_active_warrant && (
                        <span className="px-1.5 py-0.5 bg-pramaan-critical/15 text-pramaan-critical border border-pramaan-critical/30 rounded text-[9px] font-mono font-bold flex items-center gap-0.5">
                          <AlertTriangle size={9} /> WARRANT
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-pramaan-panel text-pramaan-text-secondary rounded text-[9px] font-mono">
                        {row.variables?.prior_cases || 0} cases
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </WorkPanel>
      </div>
    </div>
  );
}
