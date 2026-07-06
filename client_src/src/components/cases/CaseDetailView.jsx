import React, { useState } from 'react';
import { api } from '../../api/client';
import { FileText, Sparkles, AlertCircle, ArrowRight, Shield } from 'lucide-react';

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
    <div className="space-y-6 font-sans select-none">
      
      {/* Header & Dossier Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FEFFFF] p-5 rounded-2xl border border-[#B3E3DE] shadow-xs">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#17252A] flex items-center gap-2">
            <span>ಪ್ರಕರಣ ವಿವರ ಮತ್ತು ಸಿಗ್ನೇಚರ್ ಟ್ವಿನ್</span>
            <span className="text-[#2B7A78] font-normal">|</span>
            <span className="text-[#3AAFA9]">Case Dossier & Twin Matcher</span>
          </h1>
          <p className="text-xs text-[#2B7A78] mt-1 font-medium">
            Multilingual vector similarity engine (Kannada & English narratives) with sub-score breakdown bars.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={generateDossierPdf}
            disabled={pdfLoading || activeRole === 'Analyst'}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeRole === 'Analyst'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-[#17252A] text-[#FEFFFF] hover:bg-[#2B7A78] border border-[#17252A]'
            }`}
          >
            <FileText size={15} className="text-[#3AAFA9]" />
            {pdfLoading ? 'Generating Dossier...' : 'Generate Official Dossier PDF'}
          </button>
        </div>
      </div>

      {pdfNotice && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
          pdfNotice.type === 'success' ? 'bg-[#DEF2F1] border-[#3AAFA9]/40 text-[#17252A]' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <AlertCircle size={16} />
          {pdfNotice.msg}
        </div>
      )}

      {/* Target Case Overview */}
      <div className="bg-[#FEFFFF] p-5 rounded-2xl border border-[#B3E3DE] shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#B3E3DE] pb-3">
          <h2 className="text-base font-extrabold text-[#17252A]">Target Case: {targetCase.case_id}</h2>
          <span className="px-3 py-1 bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/40 rounded-lg text-xs font-mono font-bold">
            {targetCase.crime_type}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#DEF2F1]/50 p-4 rounded-xl border border-[#B3E3DE]">
            <div className="text-[#2B7A78] font-bold uppercase tracking-wider text-[10px] mb-1">Modus Operandi (MO):</div>
            <div className="text-[#17252A] font-medium leading-relaxed">{targetCase.modus_operandi}</div>
          </div>
          <div className="bg-[#DEF2F1]/50 p-4 rounded-xl border border-[#B3E3DE]">
            <div className="text-[#2B7A78] font-bold uppercase tracking-wider text-[10px] mb-1">FIR Narrative Description:</div>
            <div className="text-[#17252A] font-medium leading-relaxed">{targetCase.narrative_text}</div>
          </div>
        </div>
      </div>

      {/* Case-Twin Controls & Match Action */}
      <div className="bg-[#FEFFFF] p-5 rounded-2xl border border-[#B3E3DE] shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-[#17252A] font-bold">Top-K Twin Matches:</label>
            <input
              type="number"
              value={ctTopK}
              onChange={(e) => setCtTopK(e.target.value)}
              min="1" max="4"
              className="w-16 bg-[#DEF2F1] border border-[#B3E3DE] text-[#17252A] text-xs px-2.5 py-1.5 rounded-lg font-mono font-bold outline-none"
            />
          </div>
          <button
            onClick={runMatch}
            disabled={ctLoading}
            className="px-4 py-2.5 bg-[#17252A] text-[#FEFFFF] hover:bg-[#2B7A78] border border-[#17252A] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Sparkles size={14} className="text-[#3AAFA9]" />
            {ctLoading ? 'Computing Multilingual Matches...' : 'Find Signature Twins'}
          </button>
        </div>

        {ctError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            {ctError}
          </div>
        )}

        {/* Ranked Similarity Results with Breakdown Bars */}
        {ctResult && ctResult.ranked_similarity && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-extrabold text-[#17252A] border-b border-[#B3E3DE] pb-2">
              Ranked Case-Twin Matches & Sub-Score Breakdown
            </h3>

            <div className="space-y-3">
              {ctResult.ranked_similarity.map((item) => (
                <div key={item.case_id} className="bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#17252A] text-sm">{item.case_id}</span>
                    <span className="px-3 py-1 bg-[#3AAFA9] text-[#17252A] rounded-lg font-mono font-bold text-xs shadow-xs">
                      Total Score: {Number(item.total_score).toFixed(3)}
                    </span>
                  </div>

                  {/* Sub-Score Breakdown Progress Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[11px] text-[#2B7A78]">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Location:</span>
                        <span className="text-[#17252A] font-mono font-bold">{Number(item.breakdown.location).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#DEF2F1] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#3AAFA9] h-full" style={{ width: `${Math.min(100, item.breakdown.location * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Time Closeness:</span>
                        <span className="text-[#17252A] font-mono font-bold">{Number(item.breakdown.time).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#DEF2F1] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#17252A] h-full" style={{ width: `${Math.min(100, item.breakdown.time * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>MO Similarity:</span>
                        <span className="text-[#17252A] font-mono font-bold">{Number(item.breakdown.mo).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#DEF2F1] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#2B7A78] h-full" style={{ width: `${Math.min(100, item.breakdown.mo * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Weapon Match:</span>
                        <span className="text-[#17252A] font-mono font-bold">{Number(item.breakdown.weapon).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#DEF2F1] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#3AAFA9] h-full" style={{ width: `${Math.min(100, item.breakdown.weapon * 100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Narrative Vector:</span>
                        <span className="text-[#17252A] font-mono font-bold">{Number(item.breakdown.narrative).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#DEF2F1] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#17252A] h-full" style={{ width: `${Math.min(100, item.breakdown.narrative * 100)}%` }}></div>
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
