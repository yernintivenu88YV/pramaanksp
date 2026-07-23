import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Cite } from '../ui/AI.jsx';
import { Sparkles, Download, Copy, Send, RefreshCw } from 'lucide-react';
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
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask Pramaan to route an investigator query..." className="min-w-0 flex-1 bg-transparent text-sm text-pramaan-text outline-none placeholder:text-pramaan-text-secondary" />
          <Button onClick={ask} disabled={pending}><Send size={14} /> {pending ? 'Routing...' : 'Send Query'}</Button>
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
            <p className="text-sm leading-relaxed text-pramaan-text-secondary">
              CASE-001 should be handled as a connected property-crime investigation. The strongest automated signals are the canonical suspect CANON-0042 <Cite id="1" />, exact vehicle registration match KA-02-MB-1234 <Cite id="2" />, and a high-similarity burglary signature against CASE-002 <Cite id="3" />.
            </p>
          </section>

          <section>
            <h2 className="mb-2 border-b border-pramaan-border pb-1 text-sm font-semibold text-pramaan-primary">Routed Result</h2>
            <div className="rounded border border-pramaan-border bg-pramaan-surface p-4">
              {pending ? <div className="flex items-center gap-2 text-sm text-pramaan-text-secondary"><RefreshCw size={14} className="animate-spin" /> Waiting for AppSail route...</div> : result ? <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap text-xs text-pramaan-text-secondary">{JSON.stringify(result, null, 2)}</pre> : <p className="text-sm text-pramaan-text-secondary">Send the sample query to exercise `/server/intent_router_fn/route`.</p>}
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

function ConfidenceRow({ label, value, tone }) {
  return <div className="mb-3 flex items-center justify-between rounded border border-pramaan-border bg-pramaan-elevated p-3 text-sm"><span>{label}</span><span className={`font-semibold ${tone}`}>{value}</span></div>;
}
