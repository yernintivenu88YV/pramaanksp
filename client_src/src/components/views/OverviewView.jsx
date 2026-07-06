import React, { useState, useEffect } from 'react';
import { activitySeries, cases, alerts } from '../../data/mock.js';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ExplainabilityTooltip } from '../common/ExplainabilityTooltip.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
  RefreshCw, AlertTriangle, Shield, 
  Briefcase, UserCheck, Key, ArrowRight, User, Sparkles, Activity, Layers, SlidersHorizontal
} from 'lucide-react';
import { api } from '../../api/client.js';

const crimeMixData = [
  { name: 'Burglary', value: 45, color: '#2B7A78' },
  { name: 'Chain Snatching', value: 25, color: '#3AAFA9' },
  { name: 'Vehicle Theft', value: 20, color: '#17252A' },
  { name: 'Other', value: 10, color: '#DEF2F1' },
];

export default function OverviewView({ onOpenCase, activeRole = 'ACP' }) {
  const [refreshing, setRefreshing] = useState(false);
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [weights, setWeights] = useState({
    wRecency: 1.0,
    wSeverity: 2.0,
    wCentrality: 1.5,
    wWarrant: 3.0
  });

  const suspectList = [
    { 
      name: 'Mohammed Rafi', 
      id: 'CANON-0042', 
      station: 'Indiranagar PS',
      score: 94.5, 
      rank: '#1',
      top: true,
      breakdown: { recency: 12, severity: 25, centrality: 1.5, warrant: 30 },
      variables: { prior_cases: 3, co_accused_count: 5, has_active_warrant: true }
    },
    { 
      name: 'S. Praveen Kumar', 
      id: 'CANON-0081', 
      station: 'Koramangala PS',
      score: 78.2, 
      rank: '#2',
      top: false,
      breakdown: { recency: 8, severity: 20, centrality: 1.2, warrant: 0 },
      variables: { prior_cases: 2, co_accused_count: 3, has_active_warrant: false }
    },
    { 
      name: 'Imran Sheikh', 
      id: 'CANON-0077', 
      station: 'Frazer Town PS',
      score: 65.0, 
      rank: '#3',
      top: false,
      breakdown: { recency: 5, severity: 15, centrality: 1.0, warrant: 0 },
      variables: { prior_cases: 1, co_accused_count: 2, has_active_warrant: false }
    },
    { 
      name: 'Naveen Gowda', 
      id: 'CANON-0092', 
      station: 'Malleshwaram PS',
      score: 52.4, 
      rank: '#4',
      top: false,
      breakdown: { recency: 4, severity: 10, centrality: 0.8, warrant: 0 },
      variables: { prior_cases: 1, co_accused_count: 1, has_active_warrant: false }
    },
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
  }, [weights]);

  const refresh = () => {
    setRefreshing(true);
    fetchPriority().finally(() => {
      setTimeout(() => setRefreshing(false), 900);
    });
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* WATCH FLOOR COMMAND BRIEFING Header Card (Restored exact posture from Image 1) */}
      <div className="p-6 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B3E3DE] pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2B7A78]">
              WATCH FLOOR COMMAND BRIEFING
            </div>
            <h1 className="text-xl font-black text-[#17252A] tracking-tight mt-0.5">
              KSP Crime Intelligence Command Overview
            </h1>
            <p className="text-xs text-[#2B7A78] mt-1 font-medium">
              Real-time situation brief, suspect priority scores, incident trends, and AI-derived evidence citations for Karnataka State Police.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#2B7A78] bg-[#DEF2F1] px-3.5 py-1.5 rounded-full border border-[#3AAFA9]/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#3AAFA9] animate-pulse" /> LIVE ZCQL
            </span>
            <button
              onClick={refresh}
              className="flex items-center gap-2 text-xs font-bold text-[#17252A] bg-[#DEF2F1] hover:bg-[#2B7A78] hover:text-white px-4 py-2 rounded-full border border-[#B3E3DE] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#3AAFA9]' : 'text-[#3AAFA9]'} /> Refresh
            </button>
          </div>
        </div>

        {/* 4 Stat Cards from Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* Stat 1: Active Cases */}
          <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B7A78]">ACTIVE CASES</div>
              <div className="text-3xl font-black font-mono text-[#17252A] mt-1">9</div>
              <div className="text-[10px] font-mono text-[#2B7A78] font-semibold mt-1">↑ +4 from yesterday</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/40 shadow-xs">
              <Activity size={20} />
            </div>
          </div>

          {/* Stat 2: Open Alerts */}
          <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B7A78]">OPEN ALERTS</div>
              <div className="text-3xl font-black font-mono text-[#17252A] mt-1">7</div>
              <div className="text-[10px] font-mono text-[#2B7A78] font-semibold mt-1">6 requiring review</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/40 shadow-xs">
              <AlertTriangle size={20} />
            </div>
          </div>

          {/* Stat 3: Critical Priority */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700">CRITICAL PRIORITY</div>
              <div className="text-3xl font-black font-mono text-red-600 mt-1">2</div>
              <div className="text-[10px] font-mono text-red-700 font-semibold mt-1">High urgency action</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 border border-red-200 shadow-xs">
              <Shield size={20} />
            </div>
          </div>

          {/* Stat 4: Resolved Identities */}
          <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B7A78]">RESOLVED IDENTITIES</div>
              <div className="text-3xl font-black font-mono text-[#17252A] mt-1">2</div>
              <div className="text-[10px] font-mono text-[#2B7A78] font-semibold mt-1">Canonical graph</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/40 shadow-xs">
              <Layers size={20} />
            </div>
          </div>

        </div>
      </div>

      {/* Row 2: Lower Grid Layout from Image 1 (Incident Trend, Crime Mix Donut, Target Leaderboard) */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Incident Load Trend Chart (5 cols) */}
        <div className="lg:col-span-5">
          <WorkPanel 
            eyebrow="INCIDENT LOAD"
            title="7-Day Crime Incident Trend"
          >
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activitySeries}>
                  <defs>
                    <linearGradient id="alertGradientTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3AAFA9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3AAFA9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#B3E3DE" vertical={false} />
                  <XAxis dataKey="time" stroke="#2B7A78" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#2B7A78" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17252A', borderColor: '#3AAFA9', borderRadius: '12px', color: '#FEFFFF', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3AAFA9' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2B7A78" strokeWidth={3} fillOpacity={1} fill="url(#alertGradientTeal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </WorkPanel>
        </div>

        {/* Crime Mix Category Breakdown Donut Chart (3 cols) */}
        <div className="lg:col-span-3">
          <WorkPanel 
            eyebrow="CRIME MIX"
            title="Crime Category Breakdown"
          >
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={crimeMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {crimeMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#17252A', borderColor: '#3AAFA9', borderRadius: '10px', color: '#FEFFFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono font-bold text-[#2B7A78] pt-1">
                {crimeMixData.map((c) => (
                  <span key={c.name} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name} ({c.value}%)
                  </span>
                ))}
              </div>
            </div>
          </WorkPanel>
        </div>

        {/* Target Leaderboard Priority Watchlist with Explainability Tooltip (4 cols) */}
        <div className="lg:col-span-4">
          <WorkPanel 
            eyebrow="TARGET LEADERBOARD"
            title="Priority Watchlist"
            actions={
              <button className="p-1 text-[#2B7A78] hover:text-[#17252A] cursor-pointer" title="Adjust Weights">
                <SlidersHorizontal size={15} />
              </button>
            }
          >
            <div className="space-y-3">
              {suspectList.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl border border-[#B3E3DE] bg-[#FEFFFF] hover:border-[#3AAFA9] transition-all shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DEF2F1] border border-[#3AAFA9]/40 font-mono font-black text-xs text-[#17252A]">
                      {s.rank}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-[#17252A]">{s.name}</div>
                      <div className="font-mono text-[10px] text-[#2B7A78] font-bold">{s.id} • {s.station}</div>
                    </div>
                  </div>

                  {/* Explainability Tooltip Badge */}
                  <ExplainabilityTooltip row={s} weights={weights} />
                </div>
              ))}
            </div>

            <div className="mt-4 text-right pt-2 border-t border-[#B3E3DE]">
              <a href="#all" onClick={(e) => { e.preventDefault(); onOpenCase(); }} className="text-xs text-[#2B7A78] hover:text-[#17252A] font-bold inline-flex items-center gap-1">
                View all suspect dossiers <ArrowRight size={13} />
              </a>
            </div>
          </WorkPanel>
        </div>

      </div>

    </div>
  );
}
