import React, { useState } from 'react';
import { api } from '../../api/client';

export function EntityResolutionView() {
  const [recordA, setRecordA] = useState({ name: 'Mohammed Rafi', phone: '9845012345', vehicle_reg: 'KA-02-MB-1234' });
  const [recordB, setRecordB] = useState({ name: 'Mohammad Rafi', phone: '9845012345', vehicle_reg: 'KA-02-MB-1234' });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResolve = async () => {
    setLoading(true);
    setError(null);
    const res = await api.resolvePair(recordA, recordB);
    setLoading(false);

    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || res.data?.detail || 'Entity resolution failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>ಸಂಸ್ಥೆಯ ನಿರ್ಣಯ</span>
          <span className="text-gray-500 font-normal">|</span>
          <span className="text-cyan-400">Deterministic & Probabilistic Entity Resolution</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Fellegi-Sunter log-likelihood identity resolution model utilizing Supreme Court compliant non-Aadhaar strong keys.
        </p>
      </div>

      {/* Record Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="pramaan-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-cyan-400 border-b border-white/10 pb-2">Record A (FIR Source)</h2>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name:</label>
            <input
              type="text"
              value={recordA.name}
              onChange={(e) => setRecordA({ ...recordA, name: e.target.value })}
              className="w-full bg-[#1b1f26] border border-white/10 text-white text-xs p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Phone Number:</label>
            <input
              type="text"
              value={recordA.phone}
              onChange={(e) => setRecordA({ ...recordA, phone: e.target.value })}
              className="w-full bg-[#1b1f26] border border-white/10 text-white text-xs p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Vehicle Registration:</label>
            <input
              type="text"
              value={recordA.vehicle_reg}
              onChange={(e) => setRecordA({ ...recordA, vehicle_reg: e.target.value })}
              className="w-full bg-[#1b1f26] border border-white/10 text-white text-xs p-2 rounded"
            />
          </div>
        </div>

        <div className="pramaan-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-amber-400 border-b border-white/10 pb-2">Record B (Registry Source)</h2>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name:</label>
            <input
              type="text"
              value={recordB.name}
              onChange={(e) => setRecordB({ ...recordB, name: e.target.value })}
              className="w-full bg-[#1b1f26] border border-white/10 text-white text-xs p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Phone Number:</label>
            <input
              type="text"
              value={recordB.phone}
              onChange={(e) => setRecordB({ ...recordB, phone: e.target.value })}
              className="w-full bg-[#1b1f26] border border-white/10 text-white text-xs p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Vehicle Registration:</label>
            <input
              type="text"
              value={recordB.vehicle_reg}
              onChange={(e) => setRecordB({ ...recordB, vehicle_reg: e.target.value })}
              className="w-full bg-[#1b1f26] border border-white/10 text-white text-xs p-2 rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleResolve}
          disabled={loading}
          className="px-6 py-2.5 bg-cyan-600 text-white font-bold text-xs rounded hover:bg-cyan-500 transition-colors shadow-lg"
        >
          {loading ? 'Resolving Identity Pair...' : 'Resolve Identity Pair'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* Resolution Output Card */}
      {result && (
        <div className="pramaan-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">Resolution Result & Evidentiary Decision</h3>
            <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
              result.decision === 'auto_merge' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              result.decision === 'review_queue' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {result.decision}
            </span>
          </div>

          <div className="text-xs space-y-2">
            <div>
              <span className="text-gray-400">Combined Fellegi-Sunter Match Score: </span>
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {result.score !== null ? Number(result.score).toFixed(3) : '1.000 (Deterministic Link)'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-300 font-bold">Evidentiary Match Rationale:</span>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2">
                {result.evidence && result.evidence.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
