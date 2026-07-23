import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';
import { ShieldCheck, Download, Search } from 'lucide-react';

const auditLogs = [
  { seq: '1042', officer: 'SI Kavya Rao', role: 'SI', time: '2026-07-22 20:41:12', target: 'CASE-001', resource: 'own_case_detail', decision: 'allow', reason: 'Opened case twin dossier', session: 'session-demo-si' },
  { seq: '1043', officer: 'Analyst Demo', role: 'Analyst', time: '2026-07-22 20:42:03', target: 'CANON-0042', resource: 'own_case_detail', decision: 'deny', reason: 'Attempted person detail access', session: 'session-demo-analyst' },
  { seq: '1044', officer: 'ACP Ramesh Bhat', role: 'ACP', time: '2026-07-22 20:43:55', target: 'HOTSPOT-1', resource: 'aggregate_analytics', decision: 'allow', reason: 'Reviewed district hotspot rollup', session: 'session-demo-acp' },
  { seq: '1045', officer: 'Policy Viewer', role: 'Policy', time: '2026-07-22 20:44:18', target: 'CASE-005', resource: 'own_case_detail', decision: 'deny', reason: 'Policy role blocked from case detail', session: 'session-demo-policy' },
];

export default function AuditView() {
  const [view, setView] = useState('table');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => auditLogs.filter((log) => JSON.stringify(log).toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-hidden flex flex-col">
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-pramaan-border bg-pramaan-surface p-3">
        <ShieldCheck className="text-pramaan-success" size={20} />
        <div>
          <div className="text-sm font-semibold">RBAC Audit Trail Active</div>
          <div className="text-xs text-pramaan-text-secondary">Every AppSail `/server/*` access writes an allow/deny decision to AccessAuditLog.</div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex rounded border border-pramaan-border bg-pramaan-surface p-1">
          <button className={`rounded px-4 py-1 text-sm ${view === 'table' ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary'}`} onClick={() => setView('table')}>Table</button>
          <button className={`rounded px-4 py-1 text-sm ${view === 'ledger' ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary'}`} onClick={() => setView('ledger')}>Hash Chain Preview</button>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 text-pramaan-text-secondary" size={14} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter logs..." className="h-8 rounded border border-pramaan-border bg-pramaan-surface pl-8 pr-3 text-sm text-pramaan-text outline-none focus:border-pramaan-primary" />
          </div>
          <Button variant="secondary" className="h-8 text-xs"><Download size={14} /> CSV</Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-pramaan-border bg-pramaan-surface">
        {view === 'table' ? (
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="sticky top-0 bg-pramaan-elevated"><tr>{['Seq', 'Officer', 'Timestamp', 'Target', 'Resource', 'Decision', 'Reason'].map((h) => <th key={h} className="border-b border-pramaan-border px-4 py-3 font-medium text-pramaan-text-secondary">{h}</th>)}</tr></thead>
            <tbody>{filtered.map((log) => <tr key={log.seq} className="border-b border-pramaan-border transition-colors hover:bg-pramaan-elevated"><td className="px-4 py-2 font-mono text-xs">{log.seq}</td><td className="px-4 py-2"><div>{log.officer}</div><div className="text-xs text-pramaan-text-secondary">{log.role}</div></td><td className="px-4 py-2 font-mono text-xs">{log.time}</td><td className="px-4 py-2 text-pramaan-primary">{log.target}</td><td className="px-4 py-2 text-pramaan-text-secondary">{log.resource}</td><td className="px-4 py-2"><span className={`rounded px-2 py-1 text-xs ${log.decision === 'allow' ? 'bg-pramaan-success/10 text-pramaan-success' : 'bg-pramaan-critical/10 text-pramaan-critical'}`}>{log.decision.toUpperCase()}</span></td><td className="px-4 py-2">{log.reason}</td></tr>)}</tbody>
          </table>
        ) : (
          <div className="space-y-4 p-6 font-mono text-xs">
            {filtered.map((log, idx) => <div key={log.seq} className="border-l-2 border-pramaan-primary pb-4 pl-4"><div className="mb-1 text-pramaan-text-secondary">Block #{log.seq} - Prev Hash: 0x{String(10420000 + idx * 7919).toString(16)}...</div><div className="rounded bg-pramaan-elevated p-3"><div><span className="text-pramaan-primary">Timestamp:</span> {log.time}</div><div><span className="text-pramaan-primary">Actor:</span> {log.officer} ({log.role})</div><div><span className="text-pramaan-primary">Decision:</span> {log.decision} / {log.resource}</div><div><span className="text-pramaan-primary">Target:</span> {log.target}</div><div className="mt-2 border-t border-pramaan-border pt-2 text-pramaan-success">Hash: 0x{String(5729000000 + idx * 121212).toString(16)}... Validated</div></div></div>)}
          </div>
        )}
      </div>
    </WorkPanel>
  );
}
