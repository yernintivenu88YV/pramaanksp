import React, { useState } from 'react';
import { activitySeries, cases } from '../../data/mock.js';
import { SeverityBadge } from '../ui/Severity.jsx';
import { WorkPanel } from '../ui/Layout.jsx';
import { AiClaim } from '../ui/AI.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChevronRight, RefreshCw, ShieldCheck } from 'lucide-react';

export default function OverviewView({ onOpenCase }) {
  const [refreshing, setRefreshing] = useState(false);
  const findings = [
    { score: 91, text: 'CANON-0042 is the highest-priority subject because the same resolved identity appears across burglary and vehicle theft records.' },
    { score: 84, text: 'CASE-002 is the strongest signature twin for CASE-001 based on MO, timing, location, weapon, and narrative similarity.' },
    { score: 76, text: 'Bengaluru Central has the densest active property-crime cluster in the seeded demo set.' },
  ];

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

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
          { label: 'Active cases', value: 5 },
          { label: 'Open alerts', value: 5 },
          { label: 'Critical', value: 2, critical: true },
          { label: 'Resolved IDs', value: 2 },
          { label: 'Warrants', value: 2 },
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

        <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-pramaan-text"><ShieldCheck size={16} /> Priority Queue</h2>
          <div className="flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1">
            {cases.slice(0, 6).map((c) => (
              <button key={c.id} onClick={onOpenCase} className="rounded-md border border-transparent bg-pramaan-elevated p-3 text-left text-sm transition-colors hover:border-pramaan-border">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className="font-medium text-pramaan-text">{c.id}</span>
                  <SeverityBadge severity={c.priority} />
                </div>
                <div className="truncate text-xs text-pramaan-text-secondary">{c.title}</div>
                <div className="mt-2 flex items-center gap-1 text-xs text-pramaan-primary">Open case <ChevronRight size={12} /></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </WorkPanel>
  );
}
