import React, { useState } from 'react';
import { api } from '../../api/client';

export function CaseDetailView({ activeRole }) {
  const [ctTopK, setCtTopK] = useState(4);
  const [targetCase] = useState({
    case_id: 'CASE-001',
    crime_type: 'Burglary',
    modus_operandi: 'Rear window forced entry using crowbar, night time',
    narrative_text: 'Complainant reported burglary at residence. Entry made through rear window using a crowbar. Occurred between 1 AM and 3 AM. Jewelry and cash stolen.',
    weapon: 'Crowbar',
    latitude: 12.9352,
    longitude: 77.6245
  });

  const [ctResult, setCtResult] = useState(null);
  const [ctLoading, setCtLoading] = useState(false);
  const [ctError, setCtError] = useState(null);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfNotice, setPdfNotice] = useState(null);

  const runMatch = async () => {
    setCtLoading(true);
    setCtError(null);
    const candidates = [
      { case_id: 'CASE-002', crime_type: 'Burglary', modus_operandi: 'Rear window entry with crowbar', narrative_text: 'Victim reported house burglary. Entry via rear window using a crowbar.', weapon: 'Crowbar', latitude: 12.9784, longitude: 77.6408 },
      { case_id: 'CASE-003', crime_type: 'Burglary', modus_operandi: 'Front door lock picked', narrative_text: 'Front door lock picked during daytime.', weapon: 'Pick', latitude: 12.9600, longitude: 77.6100 },
      { case_id: 'CASE-004', crime_type: 'Chain snatching', modus_operandi: 'Snatched chain on motorbike', narrative_text: 'Chain snatched on motorbike.', weapon: null, latitude: 12.2958, longitude: 76.6394 },
      { case_id: 'CASE-005', crime_type: 'Vehicle theft', modus_operandi: 'Motorcycle stolen', narrative_text: 'Motorcycle stolen from parking area.', weapon: null, latitude: 13.0827, longitude: 77.5877 }
    ];

    const res = await api.matchCaseTwin(targetCase, candidates, Number(ctTopK));
    setCtLoading(false);
    if (res.ok && res.data) {
      setCtResult(res.data);
    } else {
      setCtError(res.error || res.data?.detail || 'Failed to match case twins');
    }
  };

  const generateDossierPdf = async () => {
    setPdfLoading(true);
    setPdfNotice(null);
    const res = await api.exportDossierPdf('CANON-0042', targetCase.case_id);
    setPdfLoading(false);

    if (res.ok) {
      setPdfNotice({
        type: 'success',
        msg: `Dossier PDF generated cleanly (${res.mode === 'smartbrowz' ? 'SmartBrowz PDF' : 'HTML Fallback Posture'})`
      });
    } else {
      setPdfNotice({ type: 'error', msg: res.error || res.data?.detail || 'Export failed' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Dossier Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>ಪ್ರಕರಣ ವಿವರ ಮತ್ತು ಸಿಗ್ನೇಚರ್ ಟ್ವಿನ್</span>
            <span className="text-gray-500 font-normal">|</span>
            <span className="text-cyan-400">Case Dossier & Twin Matcher</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Multilingual vector similarity engine (Kannada & English narratives) with transparent sub-score breakdown bars.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateDossierPdf}
            disabled={pdfLoading || activeRole === 'Analyst'}
            className={`px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2 ${
              activeRole === 'Analyst'
                ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/50'
            }`}
          >
            📄 {pdfLoading ? 'Generating Dossier...' : 'Generate Official Dossier PDF'}
          </button>
        </div>
      </div>

      {pdfNotice && (
        <div className={`p-3 rounded text-xs border ${pdfNotice.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {pdfNotice.msg}
        </div>
      )}

      {/* Target Case Overview */}
      <div className="pramaan-card p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <h2 className="text-base font-bold text-white">Target Case: {targetCase.case_id}</h2>
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-bold">
            {targetCase.crime_type}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
          <div>
            <div className="text-gray-400 mb-1">Modus Operandi (MO):</div>
            <div className="bg-[#1b1f26] p-2.5 rounded border border-white/5">{targetCase.modus_operandi}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">FIR Narrative Description:</div>
            <div className="bg-[#1b1f26] p-2.5 rounded border border-white/5">{targetCase.narrative_text}</div>
          </div>
        </div>
      </div>

      {/* Case-Twin Controls & Match Action */}
      <div className="pramaan-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-300 font-bold">Top-K Twin Matches:</label>
            <input
              type="number"
              value={ctTopK}
              onChange={(e) => setCtTopK(e.target.value)}
              min="1" max="4"
              className="w-16 bg-[#1b1f26] border border-white/10 text-white text-xs px-2 py-1 rounded font-mono"
            />
          </div>
          <button
            onClick={runMatch}
            disabled={ctLoading}
            className="px-4 py-2 bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 rounded text-xs font-bold hover:bg-cyan-600/50 transition-colors"
          >
            {ctLoading ? 'Computing Multilingual Matches...' : 'Find Signature Twins'}
          </button>
        </div>

        {ctError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-xs">
            ⚠️ {ctError}
          </div>
        )}

        {/* Ranked Similarity Results with Breakdown Bars */}
        {ctResult && ctResult.ranked_similarity && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">
              Ranked Case-Twin Matches & Sub-Score Breakdown
            </h3>

            <div className="space-y-3">
              {ctResult.ranked_similarity.map((item) => (
                <div key={item.case_id} className="bg-[#1b1f26] border border-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-400 text-sm">{item.case_id}</span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-mono font-bold text-xs">
                      Total Score: {Number(item.total_score).toFixed(3)}
                    </span>
                  </div>

                  {/* Sub-Score Breakdown Progress Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-gray-400">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Location:</span>
                        <span className="text-white font-mono">{Number(item.breakdown.location).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, item.breakdown.location * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Time Closeness:</span>
                        <span className="text-white font-mono">{Number(item.breakdown.time).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, item.breakdown.time * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>MO Similarity:</span>
                        <span className="text-white font-mono">{Number(item.breakdown.mo).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, item.breakdown.mo * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Weapon Match:</span>
                        <span className="text-white font-mono">{Number(item.breakdown.weapon).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, item.breakdown.weapon * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Narrative Vector:</span>
                        <span className="text-white font-mono">{Number(item.breakdown.narrative).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, item.breakdown.narrative * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
