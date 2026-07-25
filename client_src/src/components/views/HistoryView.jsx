import React, { useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Search, Download, Clock, FolderKanban, Fingerprint, Sparkles, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client.js';

const MOCK_HISTORY_LOGS = [
  { id: 'HIST-2026-001', type: 'dossier_export', title: 'Court Dossier Export - CASE-001 (Indiranagar Burglary)', timestamp: '2026-07-24 19:42:10', officer: 'ACP K. Sharma', status: 'Completed', details: 'Full 18-digit CrimeNo 104430006202600001 exported with twin matches.' },
  { id: 'HIST-2026-002', type: 'twin_match', title: 'Case Twin Execution - Target CASE-001 vs Candidates', timestamp: '2026-07-24 18:30:15', officer: 'SI R. Patil', status: '82% Match Found', details: 'Top twin match: CASE-002 (Koramangala Burglary) with shared suspect CANON-0042.' },
  { id: 'HIST-2026-003', type: 'identity_resolve', title: 'Fellegi-Sunter Pair Resolution - P-101 vs P-102', timestamp: '2026-07-24 17:15:00', officer: 'IO M. Swamy', status: 'AUTO_MERGE', details: 'Canonical ID CANON-0042 assigned to suspect Mohammed Rafi based on phone & vehicle match.' },
  { id: 'HIST-2026-004', type: 'rag_query', title: 'AI Assistant Session - "Find similar burglary cases to CASE-001"', timestamp: '2026-07-24 15:05:22', officer: 'ACP K. Sharma', status: 'Answered', details: 'Vector TF-IDF RAG pipeline returned 3 evidence records with citations.' }
];

export default function HistoryView() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const filteredLogs = MOCK_HISTORY_LOGS.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleDownload = async (caseId, logId) => {
    setDownloadingId(logId);
    const targetCaseId = caseId || 'CASE-001';
    
    // Call export API
    const res = await api.exportDossierPdf(targetCaseId);
    setDownloadingId(null);

    // Create downloadable blob
    const content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pramaan_Official_Dossier_${targetCaseId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 anim-content">
      <WorkPanel
        eyebrow="Investigate & Audit History"
        title="Investigation Session History & Report Archives"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <span className="text-xs font-mono text-pramaan-text-secondary">{filteredLogs.length} logs saved</span>
          </div>
        }
      >
        <p className="text-xs text-pramaan-text-secondary mb-4">
          Complete historical audit of generated court dossiers, AI query sessions, case twin matching runs, and resolved suspect pairs.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-pramaan-elevated border border-pramaan-border rounded-lg px-3 py-1.5">
            <Search size={14} className="text-pramaan-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by keyword or ID..."
              className="bg-transparent text-xs text-pramaan-text outline-none w-full placeholder:text-pramaan-text-secondary font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'dossier_export', 'twin_match', 'identity_resolve', 'rag_query'].map((typeKey) => (
              <button
                key={typeKey}
                onClick={() => setFilterType(typeKey)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize transition-colors cursor-pointer ${
                  filterType === typeKey
                    ? 'bg-pramaan-primary text-pramaan-bg font-bold'
                    : 'bg-pramaan-elevated text-pramaan-text-secondary border border-pramaan-border hover:text-pramaan-text'
                }`}
              >
                {typeKey.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-pramaan-border bg-pramaan-elevated overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-pramaan-surface text-pramaan-text-secondary font-mono text-[11px] uppercase border-b border-pramaan-border">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Title & Action Description</th>
                <th className="p-3">Officer</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Download Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pramaan-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-pramaan-surface/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-pramaan-primary">{log.id}</td>
                  <td className="p-3">
                    <div className="font-semibold text-pramaan-text">{log.title}</div>
                    <div className="text-[11px] text-pramaan-text-secondary mt-0.5">{log.details}</div>
                  </td>
                  <td className="p-3 font-mono text-pramaan-text-secondary">{log.officer}</td>
                  <td className="p-3 font-mono text-pramaan-text-secondary whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pramaan-success/15 text-pramaan-success border border-pramaan-success/30">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDownload('CASE-001', log.id)}
                      disabled={downloadingId === log.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-pramaan-primary/15 text-pramaan-primary border border-pramaan-primary/30 rounded text-xs font-semibold hover:bg-pramaan-primary/25 transition-colors cursor-pointer"
                    >
                      <Download size={12} />
                      {downloadingId === log.id ? 'Exporting...' : 'PDF Dossier'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkPanel>
    </div>
  );
}
