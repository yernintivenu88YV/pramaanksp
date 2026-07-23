import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';
import { Search, User, Phone, Car, MapPin, FileText, ChevronDown, ChevronUp, Fingerprint, RefreshCw } from 'lucide-react';
import { api } from '../../api/client.js';
import { profiles, sampleRecordA, sampleRecordB, searchTypes } from '../../data/resolution.js';

export default function ResolutionView() {
  const [expandedId, setExpandedId] = useState('CANON-0042');
  const [recordA, setRecordA] = useState(sampleRecordA);
  const [recordB, setRecordB] = useState(sampleRecordB);
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function resolve() {
    setPending(true);
    setError('');
    const res = await api.resolvePair(recordA, recordB);
    setPending(false);
    if (!res.ok) {
      setError(res.error || 'Entity resolution failed');
      return;
    }
    setResult(res.data);
  }

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-auto">
      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <h1 className="mb-4 flex items-center gap-2 text-xl font-bold"><Fingerprint size={20} className="text-pramaan-primary" /> Identity Resolution</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-pramaan-text-secondary" size={18} />
            <input type="text" placeholder="Search canonical IDs, aliases, phones, vehicles, addresses..." className="w-full rounded-lg border border-pramaan-border bg-pramaan-surface py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-pramaan-primary" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTypes.map((type) => <span key={type} className="cursor-pointer rounded-full border border-pramaan-border bg-pramaan-elevated px-3 py-1 text-xs transition-colors hover:bg-pramaan-surface">{type}</span>)}
          </div>
        </div>

        <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live Pair Resolver</h2>
            <Button onClick={resolve} disabled={pending} size="sm"><RefreshCw size={13} className={pending ? 'animate-spin' : ''} /> Resolve</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniRecord title="Record A" record={recordA} setRecord={setRecordA} />
            <MiniRecord title="Record B" record={recordB} setRecord={setRecordB} />
          </div>
          {error && <div className="mt-3 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-2 text-xs text-pramaan-critical">{error}</div>}
          {result && (
            <div className="mt-3 rounded border border-pramaan-primary/30 bg-pramaan-primary/10 p-3 text-xs">
              <div className="font-semibold text-pramaan-primary">Decision: {String(result.decision || '').toUpperCase()}</div>
              <div className="mt-1 text-pramaan-text-secondary">Score: {result.score == null ? 'deterministic' : Number(result.score).toFixed(3)}</div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-pramaan-text-secondary">
                {(result.evidence || []).map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 pr-1">
        {profiles.map((profile) => {
          const isExpanded = expandedId === profile.id;
          return (
            <div key={profile.id} className="overflow-hidden rounded-lg border border-pramaan-border bg-pramaan-surface">
              <button className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-pramaan-elevated" onClick={() => setExpandedId(isExpanded ? null : profile.id)}>
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pramaan-elevated text-pramaan-text-secondary"><User size={20} /></div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <div className="truncate text-xs text-pramaan-text-secondary">{profile.primaryId} - {profile.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="mb-1 text-xs text-pramaan-text-secondary">Confidence</div>
                    <span className="font-semibold text-pramaan-success">{profile.confidence}%</span>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-pramaan-text-secondary" /> : <ChevronDown size={20} className="text-pramaan-text-secondary" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-pramaan-border bg-pramaan-elevated/30 p-4">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <InfoList title="Contact & Vehicle" items={[...(profile.phones || []).map((p) => ({ icon: Phone, text: `${p.number} - ${p.lastSeen}` })), ...(profile.vehicles || []).map((v) => ({ icon: Car, text: `${v.plate} - ${v.model}` }))]} />
                    <InfoList title="Addresses & FIRs" items={[...(profile.addresses || []).map((a) => ({ icon: MapPin, text: a.line })), ...(profile.firs || []).map((f) => ({ icon: FileText, text: `${f.id} - ${f.title}` }))]} />
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase text-pramaan-text-secondary">Match Signals</h4>
                      <div className="space-y-2">
                        {profile.matchedVia?.map((m) => <div key={m.id} className="rounded border border-pramaan-border bg-pramaan-surface p-2 text-sm"><span className="text-pramaan-success">●</span> {m.label}<div className="mt-1 text-xs text-pramaan-text-secondary">{m.detail}</div></div>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </WorkPanel>
  );
}

function MiniRecord({ title, record, setRecord }) {
  return (
    <div className="rounded border border-pramaan-border bg-pramaan-elevated p-3">
      <div className="mb-2 text-xs font-semibold uppercase text-pramaan-text-secondary">{title}</div>
      {['source_id', 'source_table', 'name', 'phone', 'vehicle_reg'].map((key) => (
        <input key={key} value={record[key] || ''} onChange={(e) => setRecord({ ...record, [key]: e.target.value })} placeholder={key} className="mb-2 w-full rounded border border-pramaan-border bg-pramaan-surface px-2 py-1 text-xs outline-none focus:border-pramaan-primary" />
      ))}
    </div>
  );
}

function InfoList({ title, items }) {
  return <div><h4 className="mb-3 text-xs font-semibold uppercase text-pramaan-text-secondary">{title}</h4><div className="space-y-3">{items.map(({ icon: Icon, text }, i) => <div key={i} className="flex items-start gap-3 text-sm"><Icon size={14} className="mt-0.5 text-pramaan-primary" /> {text}</div>)}</div></div>;
}
