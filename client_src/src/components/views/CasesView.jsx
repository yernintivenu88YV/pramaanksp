import React, { useState } from 'react';
import { cases } from '../../data/mock.js';
import { StatusChip } from '../ui/Controls.jsx';
import { SeverityBadge } from '../ui/Severity.jsx';
import { WorkPanel } from '../ui/Layout.jsx';

export default function CasesView() {
  const [filter, setFilter] = useState('all');
  const [density, setDensity] = useState('comfortable');
  const filteredCases = filter === 'all' ? cases : cases.filter((c) => c.status.toLowerCase() === filter);

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-hidden flex flex-col">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-xl font-bold">Case Register</h1>
          <p className="text-sm text-pramaan-text-secondary">Seeded FIRs used by case twins, graph traversal, priority scoring, and dossier export.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded border border-pramaan-border bg-pramaan-surface p-1">
            {['all', 'active', 'escalated', 'review', 'closed'].map((f) => <button key={f} className={`rounded px-3 py-1 text-sm ${filter === f ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary hover:text-pramaan-text'}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
          </div>
          <div className="flex rounded border border-pramaan-border bg-pramaan-surface p-1">
            {['dense', 'comfortable'].map((d) => <button key={d} className={`rounded px-2 py-1 text-xs ${density === d ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary'}`} onClick={() => setDensity(d)}>{d}</button>)}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-pramaan-border bg-pramaan-surface">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="sticky top-0 z-10 bg-pramaan-elevated">
            <tr>
              {['Case ID', 'FIR', 'Title', 'Station', 'Status', 'Priority', 'Lead', 'Entities', 'Progress', 'Updated'].map((head) => <th key={head} className="border-b border-pramaan-border px-4 py-3 font-medium text-pramaan-text-secondary">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => <tr key={c.id} className="border-b border-pramaan-border transition-colors hover:bg-pramaan-elevated"><td className="px-4 py-2 font-medium text-pramaan-primary">{c.id}</td><td className="px-4 py-2 font-mono text-xs text-pramaan-text-secondary">{c.fir}</td><td className="max-w-[260px] truncate px-4 py-2">{c.title}</td><td className="px-4 py-2 text-pramaan-text-secondary">{c.station}</td><td className="px-4 py-2"><StatusChip status={c.status} /></td><td className="px-4 py-2"><SeverityBadge severity={c.priority} /></td><td className="px-4 py-2 text-pramaan-text-secondary">{c.lead}</td><td className="px-4 py-2">{c.entities}</td><td className="px-4 py-2"><div className="h-1.5 w-28 rounded border border-pramaan-border bg-pramaan-bg"><div className="h-full rounded bg-pramaan-primary" style={{ width: `${c.progress || 0}%` }} /></div></td><td className="px-4 py-2 text-xs text-pramaan-text-secondary">{c.updated}</td></tr>)}
          </tbody>
        </table>
      </div>
    </WorkPanel>
  );
}
