import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';
import { FileText, Map, Clock, Users, BarChart2, RefreshCw, Link2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { candidateCases, fallbackMatches, targetCase } from '../../data/similarCases.js';

function pct(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

export default function SimilarCasesView() {
  const [result, setResult] = useState({ top_matches: fallbackMatches, flagged_linkages: fallbackMatches.filter((m) => m.shared_confirmed_suspect), mode: 'seed_preview' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const matches = useMemo(() => result?.top_matches || result?.ranked_similarity || [], [result]);
  const flagged = useMemo(() => result?.flagged_linkages || result?.flagged_shared_suspect || [], [result]);

  async function runMatch() {
    setPending(true);
    setError('');
    const res = await api.matchCaseTwin(targetCase, candidateCases, 3);
    setPending(false);
    if (!res.ok) {
      setError(res.error || 'Case twin request failed');
      return;
    }
    setResult({ ...res.data, mode: res.mode });
  }

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-0 overflow-hidden">
      <div className="grid h-full min-h-[720px] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
        <aside className="border-b border-pramaan-border bg-pramaan-surface p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-pramaan-text-secondary">Target Case</h2>
            <span className="rounded bg-pramaan-primary/15 px-2 py-1 text-[10px] font-semibold text-pramaan-primary">{result.mode || 'preview'}</span>
          </div>
          <div className="rounded-lg border border-pramaan-primary/40 bg-pramaan-elevated p-4">
            <div className="mb-3 flex items-center gap-2 font-mono text-sm text-pramaan-primary"><FileText size={16} /> {targetCase.case_id}</div>
            <h3 className="mb-4 font-semibold">{targetCase.crime_type}: rear-window entry pattern</h3>
            <div className="space-y-4 text-sm">
              <Info icon={Clock} label="Time" value={targetCase.date_time} />
              <Info icon={Map} label="Location" value={`${targetCase.latitude}, ${targetCase.longitude}`} />
              <Info icon={Users} label="Confirmed suspect" value={targetCase.canonical_suspect_ids.join(', ')} />
              <Info icon={BarChart2} label="MO" value={targetCase.modus_operandi} />
            </div>
          </div>
          <Button onClick={runMatch} disabled={pending} className="mt-4 w-full">
            <RefreshCw size={14} className={pending ? 'animate-spin' : ''} /> {pending ? 'Scoring...' : 'Run Case Twin API'}
          </Button>
          {error && <div className="mt-3 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-3 text-xs text-pramaan-critical">{error}</div>}
        </aside>

        <section className="overflow-y-auto p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-pramaan-text-secondary">Ranked Similarity Matches</h2>
          <div className="space-y-4">
            {matches.map((m, i) => (
              <article key={m.case_id} className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4 transition-colors hover:border-pramaan-border-strong">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-pramaan-primary/60 bg-pramaan-elevated text-lg font-bold">
                    {pct(m.total_score)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-pramaan-text-secondary">{m.case_id}</span>
                      <span className="rounded bg-pramaan-elevated px-2 py-0.5 text-xs text-pramaan-text-secondary">Rank #{i + 1}</span>
                    </div>
                    <h3 className="mb-2 font-semibold">{m.crime_type || 'Case'} - {m.modus_operandi}</h3>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {Object.entries(m.breakdown || {}).map(([key, val]) => (
                        <div key={key}>
                          <div className="mb-1 text-[10px] uppercase text-pramaan-text-secondary">{key}</div>
                          <div className="h-1.5 overflow-hidden rounded bg-pramaan-elevated">
                            <div className="h-full rounded bg-pramaan-primary" style={{ width: pct(val) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="border-t border-pramaan-border bg-pramaan-surface p-4 lg:border-l lg:border-t-0">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-pramaan-text-secondary"><Link2 size={15} /> Shared Suspect Flags</h2>
          <div className="space-y-3">
            {flagged.length ? flagged.map((m) => (
              <div key={m.case_id} className="rounded-lg border border-pramaan-warning/30 bg-pramaan-warning/10 p-3 text-sm">
                <div className="font-semibold text-pramaan-warning">{m.case_id}</div>
                <p className="mt-1 text-pramaan-text-secondary">Shares a confirmed canonical suspect with the target case. Kept separate from similarity score for auditability.</p>
              </div>
            )) : <p className="text-sm text-pramaan-text-secondary">No shared-suspect flags outside top ranked matches.</p>}
          </div>
        </aside>
      </div>
    </WorkPanel>
  );
}

function Info({ icon: Icon, label, value }) {
  return <div><div className="mb-1 flex items-center gap-1 text-xs text-pramaan-text-secondary"><Icon size={12} /> {label}</div><div>{value}</div></div>;
}
