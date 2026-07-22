import React, { useState } from 'react';
import { activitySeries, alerts, cases } from '../../data/mock.js';
import { SeverityBadge } from '../ui/Severity.jsx';
import { type } from '../../design/scale.js';
import { WorkPanel } from '../ui/Layout.jsx';
import { AiClaim, Confidence } from '../ui/AI.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChevronRight, RefreshCw, Info } from 'lucide-react';

export default function OverviewView() {
  const [expandedAlert, setExpandedAlert] = useState(null);

  const findings = [
    { claim: "Subject likely coordinating with local syndicate.", confidence: 0.85 },
    { claim: "Funds diverted through 3 shell companies.", confidence: 0.92 },
    { claim: "Anomalous cross-border movement detected.", confidence: 0.78 }
  ];

  return (
    <WorkPanel className="flex flex-col h-full bg-pramaan-bg text-pramaan-text p-6 gap-6 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-pramaan-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-pramaan-text flex items-center gap-2">
            Intelligence Briefing <span className="bg-pramaan-primary/20 text-pramaan-primary text-[10px] px-2 py-0.5 rounded">AI-GENERATED</span>
          </h1>
          <p className="text-pramaan-text-secondary text-sm">Last updated: Just now</p>
        </div>
        <button className="flex items-center gap-2 text-pramaan-secondary hover:text-pramaan-primary text-sm transition-colors">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Active cases', value: 63 },
          { label: 'Open alerts', value: 128 },
          { label: 'Critical', value: 9, critical: true },
          { label: 'Entities', value: 3412 },
          { label: 'Warrants pending', value: 5 },
          { label: 'Sources online', value: 14 }
        ].map(item => (
          <div key={item.label} className="bg-pramaan-surface border border-pramaan-border rounded p-3">
            <div className="text-xs text-pramaan-text-secondary mb-1">{item.label}</div>
            <div className={`text-xl font-medium ${item.critical ? 'text-pramaan-critical' : 'text-pramaan-text'}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 h-full">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-pramaan-surface border border-pramaan-border p-4 rounded">
            <h2 className="text-sm font-semibold mb-4 text-pramaan-text">Key Findings</h2>
            <div className="flex flex-col gap-3">
              {findings.map((f, i) => (
                <AiClaim key={i} claim={f.claim} confidence={f.confidence} />
              ))}
            </div>
          </div>
          <div className="bg-pramaan-surface border border-pramaan-border p-4 rounded flex-1">
            <h2 className="text-sm font-semibold mb-4 text-pramaan-text">Threat Activity</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activitySeries}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A9EFF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4A9EFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" />
                  <XAxis dataKey="time" stroke="#9AA0A6" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9AA0A6" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#14171C', borderColor: '#2A2E35' }} itemStyle={{ color: '#E8EAED' }} />
                  <Area type="monotone" dataKey="value" stroke="#4A9EFF" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-pramaan-surface border border-pramaan-border p-4 rounded flex flex-col h-full overflow-hidden">
          <h2 className="text-sm font-semibold mb-4 text-pramaan-text">Priority Queue</h2>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2">
            {cases.slice(0, 6).map(c => (
              <div key={c.id} className="bg-pramaan-elevated p-3 rounded text-sm border border-transparent hover:border-pramaan-border cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-pramaan-text">{c.id}</span>
                  <SeverityBadge severity={c.priority} />
                </div>
                <div className="text-pramaan-text-secondary text-xs truncate mb-2">{c.title}</div>
                <div className="flex items-center text-xs text-pramaan-primary gap-1">
                  View Details <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkPanel>
  );
}
