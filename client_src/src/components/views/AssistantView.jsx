import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Cite } from '../ui/AI.jsx';
import { SeverityBadge } from '../ui/Severity.jsx';
import { Sparkles, Download, Copy, Send, RefreshCw, ChevronDown, ChevronUp, FileText, Fingerprint, Share2, Layers } from 'lucide-react';
import { Button } from '../ui/Controls.jsx';
import { api } from '../../api/client.js';

export default function AssistantView() {
  const [query, setQuery] = useState('Find similar burglary cases to CASE-001');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  async function ask() {
    setPending(true);
    setError('');
    const res = await api.routeQuery(query);
    setPending(false);
    if (!res.ok) {
      setError(res.error || 'Assistant route failed');
      return;
    }
    setResult(res.data);
  }

  async function exportDossier() {
    setExportMessage('');
    const res = await api.exportDossierPdf('CASE-001', 3);
    if (!res.ok) {
      setExportMessage(res.error || 'Dossier export failed');
      return;
    }
    setExportMessage(`Export endpoint responded in ${res.mode} mode.`);
  }

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-auto">
      <div className="mb-6 rounded-lg border border-pramaan-border bg-pramaan-surface p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Sparkles className="text-pramaan-primary" size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Pramaan to route an investigator query..."
            className="min-w-0 flex-1 bg-transparent text-sm text-pramaan-text outline-none placeholder:text-pramaan-text-secondary"
          />
          <Button onClick={ask} disabled={pending}>
            <Send size={14} /> {pending ? 'Routing...' : 'Send Query'}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold">AI Investigation Assistant</h1>
          <p className="text-sm text-pramaan-text-secondary">Natural-language router for entity resolution, case-twin search, and graph traversal.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs"><Copy size={14} /> Copy Citation</Button>
          <Button onClick={exportDossier} className="text-xs"><Download size={14} /> Export CASE-001 Dossier</Button>
        </div>
      </div>

      {error && <div className="mb-4 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-3 text-sm text-pramaan-critical">{error}</div>}
      {exportMessage && <div className="mb-4 rounded border border-pramaan-primary/30 bg-pramaan-primary/10 p-3 text-sm text-pramaan-primary">{exportMessage}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 border-b border-pramaan-border pb-1 text-sm font-semibold text-pramaan-primary">Current Assessment</h2>
            {result?.rag_summary ? (
              <div className="rounded border border-pramaan-border bg-pramaan-surface p-4 text-sm leading-relaxed text-pramaan-text whitespace-pre-wrap">
                {result.rag_summary}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-pramaan-text-secondary">
                CASE-001 should be handled as a connected property-crime investigation. The strongest automated signals are the canonical suspect CANON-0042 <Cite id="1" />, exact vehicle registration match KA-02-MB-1234 <Cite id="2" />, and a high-similarity burglary signature against CASE-002 <Cite id="3" />.
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-2 border-b border-pramaan-border pb-1 text-sm font-semibold text-pramaan-primary">Routed Result</h2>
            <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
              {pending ? (
                <div className="flex items-center gap-2 text-sm text-pramaan-text-secondary">
                  <RefreshCw size={14} className="animate-spin" /> Waiting for AppSail route...
                </div>
              ) : result ? (
                <RoutedResultCard result={result} />
              ) : (
                <p className="text-sm text-pramaan-text-secondary">Send the sample query to exercise `/server/intent_router_fn/route`.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2 border-b border-pramaan-border pb-1 text-sm font-semibold text-pramaan-primary">Recommended Next Actions</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-pramaan-text-secondary">
              <li>Open CASE-002 and compare MO, timing, and narrative explanation before merging the investigation thread.</li>
              <li>Verify active warrant WAR-2026-001 before field action.</li>
              <li>Export a court-ready dossier after SmartBrowz is enabled in Catalyst.</li>
            </ul>
          </section>
        </div>

        <aside className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Evidence Confidence</h2>
          <ConfidenceRow label="Exact phone and vehicle" value="100%" tone="text-pramaan-success" />
          <ConfidenceRow label="Burglary signature twin" value="82%" tone="text-pramaan-success" />
          <ConfidenceRow label="Graph relationship density" value="73%" tone="text-pramaan-warning" />
          <ConfidenceRow label="Voice query availability" value="Depends on Bhashini env" tone="text-pramaan-text-secondary" />
        </aside>
      </div>
    </WorkPanel>
  );
}

function RoutedResultCard({ result }) {
  const [showRaw, setShowRaw] = useState(false);
  const intent = result.intent || 'unknown';
  const mode = result.mode || 'live';
  const resp = result.response || {};
  const cls = result.classification || {};

  return (
    <div className="space-y-4">
      {/* Header Badge Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pramaan-border pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-pramaan-primary/15 px-2.5 py-1 font-mono text-xs font-bold uppercase text-pramaan-primary">
            {intent.replace(/-/g, ' ')}
          </span>
          <span className="text-xs font-mono text-pramaan-text-secondary">Mode: {mode}</span>
        </div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-1 text-xs text-pramaan-text-secondary hover:text-pramaan-text transition-colors"
        >
          {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showRaw ? 'Hide Raw JSON' : 'Inspect Raw JSON'}
        </button>
      </div>

      {/* Structured Content Views */}
      {intent === 'case-similarity-search' && (
        <div className="space-y-3">
          <div className="text-xs text-pramaan-text-secondary">
            Target Case: <span className="font-mono font-bold text-pramaan-text">{cls.case_similarity_target_id || 'CASE-001'}</span>
          </div>
          {Array.isArray(resp.top_matches) && resp.top_matches.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-pramaan-text-secondary">Matched Twin Cases:</span>
              {resp.top_matches.map((m) => (
                <div key={m.case_id} className="flex items-center justify-between rounded border border-pramaan-border bg-pramaan-elevated p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-pramaan-primary" />
                    <span className="font-mono font-bold">{m.case_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-pramaan-success">{(Number(m.total_score || 0) * 100).toFixed(0)}% Similarity</span>
                    {m.shared_confirmed_suspect && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400 font-semibold">Shared Suspect</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {intent === 'entity-lookup' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Fingerprint size={16} className="text-pramaan-primary" />
            <span className="text-xs text-pramaan-text-secondary">Decision:</span>
            <span className="rounded bg-pramaan-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-pramaan-primary uppercase">
              {resp.decision || 'AUTO_MERGE'}
            </span>
          </div>
          {Array.isArray(resp.evidence) && resp.evidence.length > 0 && (
            <ul className="list-disc space-y-1 pl-4 text-xs text-pramaan-text-secondary">
              {resp.evidence.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {intent === 'graph-network-query' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-pramaan-text-secondary">
            <Share2 size={14} className="text-pramaan-primary" />
            Canonical ID: <span className="font-mono font-bold text-pramaan-text">{cls.graph_query_canonical_id || 'CANON-0042'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-pramaan-border bg-pramaan-elevated p-2">
              <span className="text-pramaan-text-secondary">Connected Nodes:</span>
              <div className="font-bold text-pramaan-text mt-0.5">{Array.isArray(resp.nodes) ? resp.nodes.length : 0}</div>
            </div>
            <div className="rounded border border-pramaan-border bg-pramaan-elevated p-2">
              <span className="text-pramaan-text-secondary">Relationships:</span>
              <div className="font-bold text-pramaan-text mt-0.5">{Array.isArray(resp.relationships) ? resp.relationships.length : 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Inspect Accordion */}
      {showRaw && (
        <pre className="max-h-[260px] overflow-auto rounded bg-black/50 p-3 font-mono text-[11px] text-cyan-300 border border-pramaan-border">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function ConfidenceRow({ label, value, tone }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded border border-pramaan-border bg-pramaan-elevated p-3 text-sm">
      <span>{label}</span>
      <span className={`font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
