import React, { useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { Fingerprint, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, RefreshCw, User, Phone, Car, MapPin, Upload, FileText } from 'lucide-react';
import { api } from '../../api/client.js';
import FileUploadZone from '../common/FileUploadZone.jsx';

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
  const [uploadedScan, setUploadedScan] = useState(null);

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
    <div className="space-y-5 font-sans select-none">
      <WorkPanel
        eyebrow="Investigate Module"
        title="Identity Resolution Canvas (Record Comparison)"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleResolvePair}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <RefreshCw size={14} className={`text-[#3AAFA9] ${loading ? 'animate-spin' : ''}`} /> Run Resolution Engine
            </button>
          </div>
        }
      >
        <p className="text-xs text-[#2B7A78] mb-5 font-medium">
          Probabilistic & Deterministic Fellegi-Sunter identity resolution canvas. Compares two suspect records for high-confidence canonical linking.
        </p>

        {/* Two-Record Compare Canvas (Record A vs Record B) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Record A */}
          <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/40 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#B3E3DE]">
              <span className="text-xs font-bold text-[#17252A] font-mono">RECORD A (FIR SOURCE)</span>
              <Cite id="FIR-2024-8841" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={recordA.name}
                  onChange={(e) => setRecordA({ ...recordA, name: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs text-[#17252A] font-bold outline-none focus:border-[#3AAFA9]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Phone Number:</label>
                <input
                  type="text"
                  value={recordA.phone}
                  onChange={(e) => setRecordA({ ...recordA, phone: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs font-mono text-[#17252A] outline-none focus:border-[#3AAFA9]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Vehicle Registration:</label>
                <input
                  type="text"
                  value={recordA.vehicle_reg}
                  onChange={(e) => setRecordA({ ...recordA, vehicle_reg: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs font-mono text-[#17252A] outline-none focus:border-[#3AAFA9]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Address:</label>
                <input
                  type="text"
                  value={recordA.address}
                  onChange={(e) => setRecordA({ ...recordA, address: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs text-[#17252A] outline-none focus:border-[#3AAFA9]"
                />
              </div>
            </div>
          </div>

          {/* Record B */}
          <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/40 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#B3E3DE]">
              <span className="text-xs font-bold text-[#17252A] font-mono">RECORD B (STATE REGISTRY)</span>
              <Cite id="FIR-2024-8842" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={recordB.name}
                  onChange={(e) => setRecordB({ ...recordB, name: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs text-[#17252A] font-bold outline-none focus:border-[#3AAFA9]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Phone Number:</label>
                <input
                  type="text"
                  value={recordB.phone}
                  onChange={(e) => setRecordB({ ...recordB, phone: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs font-mono text-[#17252A] outline-none focus:border-[#3AAFA9]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Vehicle Registration:</label>
                <input
                  type="text"
                  value={recordB.vehicle_reg}
                  onChange={(e) => setRecordB({ ...recordB, vehicle_reg: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs font-mono text-[#17252A] outline-none focus:border-[#3AAFA9]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block mb-1">Address:</label>
                <input
                  type="text"
                  value={recordB.address}
                  onChange={(e) => setRecordB({ ...recordB, address: e.target.value })}
                  className="w-full bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-2.5 text-xs text-[#17252A] outline-none focus:border-[#3AAFA9]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OPTIONAL BIOMETRIC PHOTO & DOCUMENT UPLOAD (ZIA AI SCAN) (Restored from Screenshot) */}
        <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] space-y-4 mb-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B3E3DE] pb-3">
            <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
              <Upload size={16} className="text-[#3AAFA9]" /> OPTIONAL BIOMETRIC PHOTO & DOCUMENT UPLOAD (ZIA AI SCAN)
            </span>
            <span className="text-[10px] font-mono text-[#2B7A78] font-bold">
              Supported: CCTV Stills, Driver Licenses, Scanned FIRs
            </span>
          </div>

          <FileUploadZone
            onFileSelect={(fileData) => setUploadedScan(fileData)}
            label="Upload Suspect Photo or Identity Card"
            sublabel="Zia Face Analytics & OCR will auto-extract facial landmarks and suspect details"
          />
        </div>

        {/* Instruction Footer Banner (Restored from Screenshot) */}
        <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/60 text-center text-xs font-mono font-bold text-[#2B7A78] mb-5 shadow-xs">
          Click "Run Resolution Engine" to compute deterministic & probabilistic match signals.
        </div>

        {/* Resolution Match Output Result Card */}
        {result && (
          <div className="p-6 rounded-2xl border border-[#3AAFA9] bg-[#DEF2F1] space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B3E3DE] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} className="text-[#3AAFA9]" />
                <h3 className="text-base font-extrabold text-[#17252A]">Resolution Engine Result</h3>
              </div>
              <span className="px-3.5 py-1 rounded-xl bg-[#3AAFA9] text-[#17252A] font-mono font-black text-xs shadow-xs">
                Match Confidence: {(result.match_score * 100).toFixed(1)}%
              </span>
            </div>

            <div className="text-xs text-[#2B7A78] font-bold leading-relaxed">
              Canonical identity link suggested between Record A and Record B with Fellegi-Sunter probabilistic score {(result.match_score * 100).toFixed(1)}%.
            </div>
          </div>
        )}
      </WorkPanel>
    </div>
  );
}
