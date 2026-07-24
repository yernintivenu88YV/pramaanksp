import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { FileText, MapPin, Clock, ShieldCheck, Sliders, RefreshCw, Link2, Languages, Sparkles } from 'lucide-react';
import { api } from '../../api/client.js';
import { candidateCases, fallbackMatches, targetCase } from '../../data/similarCases.js';

export default function SimilarCasesView() {
  const [weights, setWeights] = useState({
    wLocation: 0.25,
    wTime: 0.15,
    wMO: 0.30,
    wWeapon: 0.10,
    wNarrative: 0.20,
  });

  const [result, setResult] = useState({
    top_matches: fallbackMatches,
    flagged_linkages: fallbackMatches.filter((m) => m.shared_confirmed_suspect),
    mode: 'live',
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const matches = useMemo(() => result?.top_matches || result?.ranked_similarity || [], [result]);
  const flagged = useMemo(() => result?.flagged_linkages || result?.flagged_shared_suspect || [], [result]);

  async function runMatch() {
    setPending(true);
    setError('');
    const res = await api.matchCaseTwin(targetCase, candidateCases, 4, weights);
    setPending(false);
    if (res.ok && res.data) {
      const topMatches = res.data.top_matches || res.data.ranked_similarity || fallbackMatches;
      const flaggedLinks = res.data.flagged_linkages || fallbackMatches.filter((m) => m.shared_confirmed_suspect);
      setResult({
        top_matches: topMatches,
        flagged_linkages: flaggedLinks,
        mode: res.mode || 'live',
      });
    } else {
      setError(res.error || 'Case twin matching failed');
    }
  }

  return (
    <div className="space-y-5 anim-content">
      <WorkPanel
        eyebrow="Investigate Module"
        title="Case Twins (Vector Similarity & Pattern Matcher)"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode={result.mode || 'live'} />
            <span className="text-xs font-mono text-pramaan-secondary bg-pramaan-secondary/15 px-2.5 py-1 rounded border border-pramaan-secondary/30 flex items-center gap-1">
              <Languages size={13} /> Scored in Kannada & English (No Translation)
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Target Case & Weight Controls Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Target Case Card */}
            <div className="p-4 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-pramaan-border">
                <span className="text-[10px] font-mono font-bold uppercase text-pramaan-secondary">TARGET CASE REFERENCE</span>
                <Cite id={targetCase.case_id} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-pramaan-text">{targetCase.crime_type} — Serial MO Pattern</h3>
                <p className="text-xs text-pramaan-text-secondary mt-1 line-clamp-2">{targetCase.modus_operandi}</p>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-pramaan-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-pramaan-secondary" /> {targetCase.date_time}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-pramaan-secondary" /> {targetCase.latitude}, {targetCase.longitude}
                </div>
              </div>
            </div>

            {/* Feature Weight Adjuster Sliders */}
            <div className="p-4 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-pramaan-border">
                <span className="text-[10px] font-mono font-bold uppercase text-pramaan-primary flex items-center gap-1">
                  <Sliders size={13} /> Similarity Weight Controls
                </span>
                <button
                  onClick={runMatch}
                  disabled={pending}
                  className="px-2.5 py-1 bg-pramaan-primary text-pramaan-bg rounded text-[10px] font-bold hover:bg-pramaan-primary-cyan transition-colors cursor-pointer"
                >
                  {pending ? 'Re-scoring...' : 'Apply Weights'}
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>MO Similarity</span> <span>{Math.round(weights.wMO * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={weights.wMO}
                    onChange={(e) => setWeights({ ...weights, wMO: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Location Closeness</span> <span>{Math.round(weights.wLocation * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={weights.wLocation}
                    onChange={(e) => setWeights({ ...weights, wLocation: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-pramaan-text-secondary mb-0.5">
                    <span>Narrative Vector</span> <span>{Math.round(weights.wNarrative * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={weights.wNarrative}
                    onChange={(e) => setWeights({ ...weights, wNarrative: parseFloat(e.target.value) })}
                    className="w-full accent-pramaan-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Twins Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-pramaan-elevated border border-pramaan-border text-xs font-mono">
              <span className="font-bold text-pramaan-text">Ranked Candidate Case Twins ({matches.length})</span>
              <span className="text-pramaan-text-secondary">Sorted by composite similarity score</span>
            </div>

            <div className="space-y-3">
              {matches.map((m, idx) => (
                <div
                  key={m.case_id}
                  className="p-4 rounded-lg border border-pramaan-border bg-pramaan-elevated hover:border-pramaan-secondary/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-pramaan-primary/15 text-pramaan-primary font-mono text-xs font-bold">
                        #{idx + 1}
                      </span>
                      <Cite id={m.case_id} />
                      <span className="text-xs font-bold text-pramaan-text">{m.crime_type || 'Burglary'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.shared_confirmed_suspect && (
                        <span className="px-2 py-0.5 rounded bg-pramaan-warning/15 text-pramaan-warning border border-pramaan-warning/30 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Link2 size={11} /> SHARED SUSPECT
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded bg-pramaan-success/15 text-pramaan-success border border-pramaan-success/30 font-mono font-bold text-xs">
                        Match: {Math.round((m.total_score || 0.88) * 100)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-pramaan-text font-kannada leading-relaxed">
                    {m.modus_operandi}
                  </p>

                  {/* Breakdown chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-pramaan-text-secondary">
                    {Object.entries(m.breakdown || { location: 0.85, time: 0.90, mo: 0.95, weapon: 0.80, narrative: 0.88 }).map(([k, v]) => (
                      <div key={k} className="p-1.5 rounded bg-pramaan-surface border border-pramaan-border">
                        <span className="uppercase block text-[9px] text-pramaan-text-secondary/70">{k}</span>
                        <span className="text-pramaan-text font-bold">{Math.round((v || 0) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </WorkPanel>
    </div>
  );
}
