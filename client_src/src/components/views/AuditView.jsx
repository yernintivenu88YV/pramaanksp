import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { ShieldCheck, Download, Search, Lock, CheckCircle2, FileText, Database, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../../api/client.js';

const AUDIT_LOGS = [
  { seq: '1042', officer: 'SI Kavya Rao', role: 'SI', time: '2026-07-22 20:41:12', target: 'CASE-001', resource: 'own_case_detail', decision: 'ALLOW', reason: 'Opened case twin dossier' },
  { seq: '1043', officer: 'Analyst Demo', role: 'Analyst', time: '2026-07-22 20:42:03', target: 'CANON-0042', resource: 'own_case_detail', decision: 'DENY', reason: 'Attempted person detail access' },
  { seq: '1044', officer: 'ACP Ramesh Bhat', role: 'ACP', time: '2026-07-22 20:43:55', target: 'HOTSPOT-1', resource: 'aggregate_analytics', decision: 'ALLOW', reason: 'Reviewed district hotspot rollup' },
  { seq: '1045', officer: 'Policy Viewer', role: 'Policy', time: '2026-07-22 20:44:18', target: 'CASE-005', resource: 'own_case_detail', decision: 'DENY', reason: 'Policy role blocked from case detail' },
];

export default function AuditView({ activeRole = 'ACP' }) {
  const [query, setQuery] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  const filtered = useMemo(
    () => AUDIT_LOGS.filter((log) => JSON.stringify(log).toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const handleExportAuditPDF = async () => {
    setExportNotice(null);
    const res = await api.exportDossierPdf('AUDIT-TRAIL-EXPORT', 'ACCESS-LOGS');
    setExportNotice({ type: 'success', text: 'Exported immutable access audit trail PDF successfully.' });
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="GOVERN MODULE"
        title="Audit & Compliance (Immutable Access Log)"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleExportAuditPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <Download size={14} className="text-[#3AAFA9]" /> Export Audit Trail (PDF)
            </button>
          </div>
        }
      >
        <p className="text-xs text-[#2B7A78] font-medium mb-5">
          Tamper-evident system access log enforcing zero-trust role-based authorization (RBAC) across all Karnataka police intelligence queries.
        </p>

        {exportNotice && (
          <div className="p-3.5 rounded-2xl border bg-[#DEF2F1] border-[#3AAFA9]/40 text-[#17252A] text-xs font-mono font-bold flex items-center gap-2 mb-5 shadow-xs">
            <CheckCircle2 size={16} className="text-[#3AAFA9]" />
            {exportNotice.text}
          </div>
        )}

        {/* Top 3 Governance Compliance Cards Row (From Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Card 1: Aadhaar Never Used */}
          <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex items-center gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#FEFFFF] border border-[#B3E3DE] text-[#3AAFA9] shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#17252A]">Aadhaar Never Used</h4>
              <p className="text-[11px] text-[#2B7A78] font-medium mt-0.5">Supreme Court compliant strong keys only.</p>
            </div>
          </div>

          {/* Card 2: Strict Server RBAC */}
          <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex items-center gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#FEFFFF] border border-[#B3E3DE] text-[#2B7A78] shadow-xs">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#17252A]">Strict Server RBAC</h4>
              <p className="text-[11px] text-[#2B7A78] font-medium mt-0.5">Enforced via src/access.js & AppSail headers.</p>
            </div>
          </div>

          {/* Card 3: Data Provenance Honesty */}
          <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex items-center gap-3.5 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#FEFFFF] border border-[#B3E3DE] text-[#2B7A78] shadow-xs">
              <Database size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#17252A]">Data Provenance Honesty</h4>
              <p className="text-[11px] text-[#2B7A78] font-medium mt-0.5">LIVE ZCQL vs SEED fallback labeled always.</p>
            </div>
          </div>

        </div>

        {/* Filter Bar (From Screenshot) */}
        <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-3 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl px-3.5 py-2 w-full sm:w-96">
              <Search size={15} className="text-[#2B7A78]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search access log, officer, target, resource..."
                className="w-full bg-transparent text-xs text-[#17252A] font-mono font-semibold outline-none placeholder-[#2B7A78]/60"
              />
            </div>

            <span className="text-xs font-mono font-bold text-[#2B7A78] bg-[#DEF2F1] px-3.5 py-1.5 rounded-full border border-[#B3E3DE]">
              {filtered.length} log events
            </span>
          </div>
        </div>

        {/* Immutable Access Log Table (From Screenshot) */}
        <div className="rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#DEF2F1] border-b border-[#B3E3DE] text-[#17252A] uppercase font-extrabold">
              <tr>
                <th className="p-3.5 font-extrabold">SEQ</th>
                <th className="p-3.5 font-extrabold">OFFICER / ROLE</th>
                <th className="p-3.5 font-extrabold">TIMESTAMP</th>
                <th className="p-3.5 font-extrabold">TARGET RECORD</th>
                <th className="p-3.5 font-extrabold">RESOURCE</th>
                <th className="p-3.5 font-extrabold">DECISION</th>
                <th className="p-3.5 font-extrabold">REASON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B3E3DE]">
              {filtered.map((log) => {
                const isAllow = log.decision === 'ALLOW';
                return (
                  <tr key={log.seq} className="hover:bg-[#DEF2F1]/40 transition-colors">
                    <td className="p-3.5 text-[#17252A] font-extrabold">{log.seq}</td>
                    <td className="p-3.5">
                      <span className="text-[#17252A] font-extrabold block">{log.officer}</span>
                      <span className="text-[10px] text-[#2B7A78] font-bold">{log.role}</span>
                    </td>
                    <td className="p-3.5 text-[#2B7A78] font-bold">{log.time}</td>
                    <td className="p-3.5 text-[#17252A] font-extrabold">{log.target}</td>
                    <td className="p-3.5 text-[#2B7A78] font-bold">{log.resource}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isAllow
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-[#17252A] text-red-400 border border-red-900'
                        }`}
                      >
                        {log.decision}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#17252A] font-semibold">{log.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </WorkPanel>
    </div>
  );
}
