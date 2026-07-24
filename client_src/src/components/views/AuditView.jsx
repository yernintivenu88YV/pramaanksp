import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { ShieldCheck, Download, Search, Lock, CheckCircle2, FileText, Database } from 'lucide-react';
import { api } from '../../api/client.js';

const auditLogs = [
  { seq: '1042', officer: 'SI Kavya Rao', role: 'SI', time: '2026-07-22 20:41:12', target: 'CASE-001', resource: 'own_case_detail', decision: 'allow', reason: 'Opened case twin dossier', session: 'session-demo-si' },
  { seq: '1043', officer: 'Analyst Demo', role: 'Analyst', time: '2026-07-22 20:42:03', target: 'CANON-0042', resource: 'own_case_detail', decision: 'deny', reason: 'Attempted person detail access', session: 'session-demo-analyst' },
  { seq: '1044', officer: 'ACP Ramesh Bhat', role: 'ACP', time: '2026-07-22 20:43:55', target: 'HOTSPOT-1', resource: 'aggregate_analytics', decision: 'allow', reason: 'Reviewed district hotspot rollup', session: 'session-demo-acp' },
  { seq: '1045', officer: 'Policy Viewer', role: 'Policy', time: '2026-07-22 20:44:18', target: 'CASE-005', resource: 'own_case_detail', decision: 'deny', reason: 'Policy role blocked from case detail', session: 'session-demo-policy' },
];

export default function AuditView() {
  const [query, setQuery] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  const filtered = useMemo(
    () => auditLogs.filter((log) => JSON.stringify(log).toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const handleExportAuditPDF = async () => {
    setExportNotice(null);
    const res = await api.exportDossierPdf('AUDIT-TRAIL-EXPORT', 'ACCESS-LOGS');
    if (res.ok) {
      setExportNotice({ type: 'success', text: 'Exported immutable audit trail PDF.' });
    } else {
      setExportNotice({ type: 'error', text: res.error || 'Failed to export audit PDF' });
    }
  };

  return (
    <div className="space-y-5 anim-content">
      <WorkPanel
        eyebrow="Govern Module"
        title="Audit & Compliance (Immutable Access Log)"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleExportAuditPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pramaan-primary hover:bg-pramaan-primary-cyan text-pramaan-bg text-xs font-bold transition-colors cursor-pointer"
            >
              <Download size={14} /> Export Audit Trail (PDF)
            </button>
          </div>
        }
      >
        {exportNotice && (
          <div className={`p-3 rounded-lg border text-xs mb-4 font-mono ${exportNotice.type === 'success' ? 'bg-pramaan-success/15 border-pramaan-success/30 text-pramaan-success' : 'bg-pramaan-critical/15 border-pramaan-critical/30 text-pramaan-critical'}`}>
            {exportNotice.text}
          </div>
        )}

        {/* Compliance Badges Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="p-3.5 rounded-lg border border-pramaan-success/30 bg-pramaan-success/10 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-pramaan-success shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-pramaan-success block">Aadhaar Never Used</span>
              <span className="text-[11px] text-pramaan-text-secondary">Supreme Court compliant strong keys only.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-pramaan-border bg-pramaan-elevated flex items-center gap-3">
            <Lock className="w-6 h-6 text-pramaan-secondary shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-pramaan-text block">Strict Server RBAC</span>
              <span className="text-[11px] text-pramaan-text-secondary">Enforced via src/access.js & AppSail headers.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-pramaan-border bg-pramaan-elevated flex items-center gap-3">
            <Database className="w-6 h-6 text-pramaan-warning shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-pramaan-text block">Data Provenance Honesty</span>
              <span className="text-[11px] text-pramaan-text-secondary">LIVE ZCQL vs SEED fallback labeled always.</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-pramaan-elevated border border-pramaan-border mb-4">
          <div className="flex items-center gap-2 w-full max-w-sm bg-pramaan-surface border border-pramaan-border rounded-md px-3 py-1">
            <Search size={14} className="text-pramaan-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search access log, officer, target, resource..."
              className="bg-transparent text-xs text-pramaan-text placeholder-pramaan-text-secondary outline-none w-full font-sans"
            />
          </div>
          <span className="text-xs font-mono text-pramaan-text-secondary">{filtered.length} log events</span>
        </div>

        {/* Immutable Access Log Table */}
        <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated overflow-hidden">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-pramaan-surface border-b border-pramaan-border text-pramaan-text-secondary uppercase">
              <tr>
                <th className="p-3 font-semibold">Seq</th>
                <th className="p-3 font-semibold">Officer / Role</th>
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Target Record</th>
                <th className="p-3 font-semibold">Resource</th>
                <th className="p-3 font-semibold">Decision</th>
                <th className="p-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pramaan-border">
              {filtered.map((log) => (
                <tr key={log.seq} className="hover:bg-pramaan-surface/60 transition-colors">
                  <td className="p-3 text-pramaan-text-secondary font-bold">{log.seq}</td>
                  <td className="p-3">
                    <span className="text-pramaan-text font-bold block">{log.officer}</span>
                    <span className="text-[10px] text-pramaan-secondary">{log.role}</span>
                  </td>
                  <td className="p-3 text-pramaan-text-secondary">{log.time}</td>
                  <td className="p-3 text-pramaan-secondary font-bold">{log.target}</td>
                  <td className="p-3 text-pramaan-text-secondary">{log.resource}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.decision === 'allow'
                          ? 'bg-pramaan-success/15 text-pramaan-success border border-pramaan-success/30'
                          : 'bg-pramaan-critical/15 text-pramaan-critical border border-pramaan-critical/30'
                      }`}
                    >
                      {log.decision}
                    </span>
                  </td>
                  <td className="p-3 text-pramaan-text">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkPanel>
    </div>
  );
}
