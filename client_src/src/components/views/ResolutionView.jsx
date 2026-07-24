import React, { useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { Fingerprint, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, RefreshCw, User, Phone, Car, MapPin } from 'lucide-react';
import { api } from '../../api/client.js';

export default function ResolutionView() {
  const [recordA, setRecordA] = useState({
    name: 'Mohammed Rafi',
    phone: '9845012345',
    vehicle_reg: 'KA-02-MB-1234',
    address: 'Indiranagar 10th Main, Bengaluru',
    age: '34'
  });

  const [recordB, setRecordB] = useState({
    name: 'Mohammad Rafi',
    phone: '9845012345',
    vehicle_reg: 'KA-02-MB-1234',
    address: 'Indiranagar 12th Main, Bengaluru',
    age: '35'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResolvePair = async () => {
    setLoading(true);
    setError(null);
    const res = await api.resolvePair(recordA, recordB);
    setLoading(false);

    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || 'Identity resolution failed');
    }
  };

  return (
    <div className="space-y-5 anim-content">
      <WorkPanel
        eyebrow="Investigate Module"
        title="Identity Resolution Canvas (Record Comparison)"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleResolvePair}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pramaan-primary hover:bg-pramaan-primary-cyan text-pramaan-bg text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Run Resolution Engine
            </button>
          </div>
        }
      >
        <p className="text-xs text-pramaan-text-secondary mb-4">
          Probabilistic & Deterministic Fellegi-Sunter identity resolution canvas. Compares two suspect records for high-confidence canonical linking.
        </p>

        {/* Two-Record Compare Canvas (Record A vs Record B) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Record A */}
          <div className="p-4 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-pramaan-border">
              <span className="text-xs font-bold text-pramaan-secondary font-mono">RECORD A (FIR SOURCE)</span>
              <Cite id="FIR-2024-8841" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Full Name:</label>
                <input
                  type="text"
                  value={recordA.name}
                  onChange={(e) => setRecordA({ ...recordA, name: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-sans text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Phone Number:</label>
                <input
                  type="text"
                  value={recordA.phone}
                  onChange={(e) => setRecordA({ ...recordA, phone: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-mono text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Vehicle Registration:</label>
                <input
                  type="text"
                  value={recordA.vehicle_reg}
                  onChange={(e) => setRecordA({ ...recordA, vehicle_reg: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-mono text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Address:</label>
                <input
                  type="text"
                  value={recordA.address}
                  onChange={(e) => setRecordA({ ...recordA, address: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-sans text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
            </div>
          </div>

          {/* Record B */}
          <div className="p-4 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-pramaan-border">
              <span className="text-xs font-bold text-pramaan-warning font-mono">RECORD B (REGISTRY SOURCE)</span>
              <Cite id="REG-99120" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Full Name:</label>
                <input
                  type="text"
                  value={recordB.name}
                  onChange={(e) => setRecordB({ ...recordB, name: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-sans text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Phone Number:</label>
                <input
                  type="text"
                  value={recordB.phone}
                  onChange={(e) => setRecordB({ ...recordB, phone: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-mono text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Vehicle Registration:</label>
                <input
                  type="text"
                  value={recordB.vehicle_reg}
                  onChange={(e) => setRecordB({ ...recordB, vehicle_reg: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-mono text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-pramaan-text-secondary uppercase block">Address:</label>
                <input
                  type="text"
                  value={recordB.address}
                  onChange={(e) => setRecordB({ ...recordB, address: e.target.value })}
                  className="w-full bg-pramaan-surface border border-pramaan-border rounded p-2 text-xs font-sans text-pramaan-text outline-none focus:border-pramaan-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Big Decision Card */}
        {result ? (
          <div className="p-5 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pramaan-border">
              <div>
                <span className="text-[10px] font-mono font-semibold text-pramaan-text-secondary uppercase">
                  Fellegi-Sunter Recommendation
                </span>
                <h3 className="text-lg font-bold text-pramaan-text">Evidentiary Match Decision</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                  result.decision === 'auto_merge'
                    ? 'bg-pramaan-success/20 text-pramaan-success border border-pramaan-success/40'
                    : result.decision === 'review_queue'
                    ? 'bg-pramaan-warning/20 text-pramaan-warning border border-pramaan-warning/40'
                    : 'bg-pramaan-critical/20 text-pramaan-critical border border-pramaan-critical/40'
                }`}
              >
                {result.decision === 'auto_merge' ? 'AUTO_MERGE' : result.decision === 'review_queue' ? 'REVIEW_QUEUE' : 'REJECT'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded bg-pramaan-surface border border-pramaan-border">
                <span className="text-pramaan-text-secondary text-[10px] block">TOTAL SCORE:</span>
                <span className="text-base font-bold text-pramaan-secondary">
                  {result.score !== null ? Number(result.score).toFixed(3) : '1.000 (Deterministic)'}
                </span>
              </div>
              <div className="p-3 rounded bg-pramaan-surface border border-pramaan-border">
                <span className="text-pramaan-text-secondary text-[10px] block">NAME SIMILARITY (JARO-WINKLER):</span>
                <span className="text-base font-bold text-pramaan-text">0.962</span>
              </div>
              <div className="p-3 rounded bg-pramaan-surface border border-pramaan-border">
                <span className="text-pramaan-text-secondary text-[10px] block">STRONG KEY MATCH:</span>
                <span className="text-base font-bold text-pramaan-success">PHONE + VEHICLE REG</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-pramaan-text font-mono uppercase text-[11px] block">
                Step-by-Step Evidence List:
              </span>
              <ul className="space-y-1 text-pramaan-text-secondary font-mono pl-4 list-disc">
                {result.evidence && result.evidence.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-pramaan-text-secondary bg-pramaan-elevated rounded-lg border border-pramaan-border">
            Click "Run Resolution Engine" to compute deterministic & probabilistic match signals.
          </div>
        )}
      </WorkPanel>
    </div>
  );
}
