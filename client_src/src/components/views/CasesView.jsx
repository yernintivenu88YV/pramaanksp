import React, { useState } from 'react';
import { cases } from '../../data/mock.js';
import { StatusChip, Button } from '../ui/Controls.jsx';
import { SeverityBadge } from '../ui/Severity.jsx';
import { WorkPanel } from '../ui/Layout.jsx';

export default function CasesView() {
  const [filter, setFilter] = useState('all');
  const [density, setDensity] = useState('comfortable');
  
  const filteredCases = filter === 'all' ? cases : cases.filter(c => c.status.toLowerCase() === filter);

  return (
    <WorkPanel className="flex flex-col h-full bg-pramaan-bg p-6 text-pramaan-text">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Cases</h1>
        <div className="flex gap-4 items-center">
          <div className="flex bg-pramaan-surface rounded p-1 border border-pramaan-border">
            {['all', 'active', 'escalated', 'review', 'closed'].map(f => (
              <button
                key={f}
                className={`px-3 py-1 text-sm rounded ${filter === f ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary hover:text-pramaan-text'}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex bg-pramaan-surface rounded p-1 border border-pramaan-border">
            <button className={`px-2 py-1 text-xs rounded ${density === 'dense' ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary'}`} onClick={() => setDensity('dense')}>Dense</button>
            <button className={`px-2 py-1 text-xs rounded ${density === 'comfortable' ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary'}`} onClick={() => setDensity('comfortable')}>Comfortable</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded border border-pramaan-border bg-pramaan-surface">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-pramaan-elevated sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Case ID</th>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border w-1/3">Title</th>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Status</th>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Priority</th>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Lead</th>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Entities</th>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Progress</th>
              <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c, i) => (
              <tr key={c.id} className={`border-b border-pramaan-border hover:bg-pramaan-elevated transition-colors ${density === 'dense' ? 'py-1' : 'py-3'}`}>
                <td className="px-4 py-2 font-medium text-pramaan-primary cursor-pointer">{c.id}</td>
                <td className="px-4 py-2 truncate max-w-[200px]">{c.title}</td>
                <td className="px-4 py-2"><StatusChip status={c.status} /></td>
                <td className="px-4 py-2"><SeverityBadge severity={c.priority} /></td>
                <td className="px-4 py-2 text-pramaan-text-secondary">{c.lead || 'Unassigned'}</td>
                <td className="px-4 py-2">{c.entities || 0}</td>
                <td className="px-4 py-2">
                  <div className="w-full bg-pramaan-bg rounded h-1.5 mt-1 border border-pramaan-border">
                    <div className="bg-pramaan-primary h-1.5 rounded" style={{ width: `${c.progress || 0}%` }}></div>
                  </div>
                </td>
                <td className="px-4 py-2 text-pramaan-text-secondary text-xs">{c.updatedAt || 'Just now'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WorkPanel>
  );
}
