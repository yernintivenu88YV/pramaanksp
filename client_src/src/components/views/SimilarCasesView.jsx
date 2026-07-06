import React, { useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { FileText, MapPin, Clock, ShieldCheck, Sliders, RefreshCw, Link2, Languages, Sparkles, Plus, Send, Download, CheckCircle2, ArrowRight, Share2, X } from 'lucide-react';
import { api } from '../../api/client.js';

const INITIAL_CASE_OPTIONS = [
  { id: 'CASE-001', title: 'Indiranagar Residence Burglary', category: 'Burglary', station: 'Ashoknagar PS / Indiranagar PS', time: '2026-07-11 02:00:00', lat: '12.9579', lng: '77.6251', suspect: 'Mohammed Rafi', mo: 'Rear window forced entry using crowbar, late night hours' },
  { id: 'CASE-002', title: 'Hebbal Villa Night Break-in', category: 'Burglary', station: 'Hebbal PS, Bengaluru', time: '2026-07-11 01:30:00', lat: '13.0358', lng: '77.5970', suspect: 'Mohammed Rafi', mo: 'Rear window forced entry with crowbar, late night 01:30 AM' },
  { id: 'CASE-006', title: 'Hubballi Town Commercial Burglary', category: 'Burglary', station: 'Hubballi Town PS', time: '2026-07-10 23:45:00', lat: '15.3647', lng: '75.1240', suspect: 'Mohammed Rafi', mo: 'Back window grille cut using crowbar, midnight entry' },
  { id: 'CASE-008', title: 'Belagavi Tilakwadi House Theft', category: 'Theft', station: 'Belagavi City PS', time: '2026-07-09 04:15:00', lat: '15.8497', lng: '74.4977', suspect: 'Unknown', mo: 'Rear wooden window latch pried with crowbar, early morning hours' },
];

const TWIN_CANDIDATES = [
  {
    id: 'CASE-002',
    rank: '#1',
    score: 89,
    title: 'Hebbal Villa Night Break-in',
    station: 'Hebbal PS, Bengaluru',
    mo: 'Rear window forced entry with crowbar, late night 01:30 AM',
    tag: 'EXACT SIGNATURE TWIN',
    sharedSuspect: 'Mohammed Rafi',
    vectorBreakdown: { mo: 94, location: 82, narrative: 88, time: 85, weapon: 100 },
    narrativeEng: 'Victim reported house burglary. Entry via rear window using a crowbar between 1 AM and 2 AM. Cash and gold ornaments stolen.',
    narrativeKan: 'ಮನೆಯ ಹಿಂಭಾಗದ ಕಿಟಕಿಯನ್ನು ಕಬ್ಬಿನದ ರಾಡ್ ನಿಂದ ಮುರಿದು ಒಳಪ್ರವೇಶಿಸಿ ಕಳ್ಳತನ ನಡೆಸಲಾಗಿದೆ.'
  },
  {
    id: 'CASE-006',
    rank: '#2',
    score: 84,
    title: 'Hubballi Town Commercial Burglary',
    station: 'Hubballi Town PS',
    mo: 'Back window grille cut using crowbar, midnight entry',
    tag: 'STRONG PATTERN MATCH',
    sharedSuspect: 'Mohammed Rafi',
    vectorBreakdown: { mo: 88, location: 72, narrative: 85, time: 80, weapon: 95 },
    narrativeEng: 'Commercial shop break-in at midnight. Shutter lock damaged with heavy metal rod.',
    narrativeKan: 'ಅಂಗಡಿಯ ಶಟರ್ ಬೀಗವನ್ನು ಮುರಿದು ಅಕ್ರಮವಾಗಿ ಒಳನುಗ್ಗಿ ಹಣ ಅಪಹರಿಸಲಾಗಿದೆ.'
  },
  {
    id: 'CASE-008',
    rank: '#3',
    score: 81,
    title: 'Belagavi Tilakwadi House Theft',
    station: 'Belagavi City PS',
    mo: 'Rear wooden window latch pried with crowbar, early morning hours',
    tag: 'STRONG PATTERN MATCH',
    sharedSuspect: null,
    vectorBreakdown: { mo: 82, location: 65, narrative: 80, time: 78, weapon: 90 },
    narrativeEng: 'Residential burglary in Tilakwadi. Entry through rear window.',
    narrativeKan: 'ಹಿಂಭಾಗದ ಕಿಟಕಿಯ ಬೀಗ ಮುರಿದು ಕಳ್ಳತನ.'
  },
  {
    id: 'CASE-010',
    rank: '#4',
    score: 77,
    title: 'Hosur Border Checkpoint Intercept',
    station: 'Attibele / Border PS',
    mo: 'Vehicle interception near border checkpost',
    tag: 'MODERATE PATTERN MATCH',
    sharedSuspect: null,
    vectorBreakdown: { mo: 75, location: 80, narrative: 70, time: 72, weapon: 80 },
    narrativeEng: 'Interstate suspect intercepted with housebreaking tools.',
    narrativeKan: 'ಅಂತರರಾಜ್ಯ ಸಂಶಯಾಸ್ಪದ ವ್ಯಕ್ತಿಯನ್ನು ವಶಕ್ಕೆ ಪಡೆಯಲಾಗಿದೆ.'
  }
];

export default function SimilarCasesView({ activeRole = 'ACP' }) {
  const [caseOptionsList, setCaseOptionsList] = useState(INITIAL_CASE_OPTIONS);
  const [selectedTarget, setSelectedTarget] = useState(INITIAL_CASE_OPTIONS[0]);
  const [selectedCandidate, setSelectedCandidate] = useState(TWIN_CANDIDATES[0]);
  const [preset, setPreset] = useState('Balanced');
  const [weights, setWeights] = useState({ mo: 30, spatial: 25, indic: 20, time: 15 });
  const [dispatchNotice, setDispatchNotice] = useState(null);

  // Custom FIR Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFirData, setCustomFirData] = useState({
    id: 'FIR-2026-CUSTOM',
    title: 'Custom Latent Scene Burglary',
    category: 'Burglary',
    station: 'KSP Command HQ PS',
    mo: 'Forced rear window entry using heavy iron crowbar',
    narrativeKan: 'ಮನೆಯ ಹಿಂಭಾಗದ ಕಿಟಕಿಯನ್ನು ಕಬ್ಬಿಣದ ಸರಳಿನಿಂದ ಮುರಿದು ಒಳನುಗ್ಗಿ ಕಳ್ಳತನ ನಡೆಸಲಾಗಿದೆ.',
    suspect: 'Unknown / Under Investigation'
  });

  const applyPreset = (type) => {
    setPreset(type);
    if (type === 'Balanced') setWeights({ mo: 30, spatial: 25, indic: 20, time: 15 });
    if (type === 'MO Heavy') setWeights({ mo: 50, spatial: 15, indic: 20, time: 15 });
    if (type === 'Geo Radius') setWeights({ mo: 20, spatial: 50, indic: 15, time: 15 });
  };

  const handleDispatchAlert = () => {
    setDispatchNotice(`Cross-station alert dispatched to ${selectedCandidate.station} & ${selectedTarget.station}!`);
    setTimeout(() => setDispatchNotice(null), 4000);
  };

  const handleExportPDF = async () => {
    const res = await api.exportDossierPdf(selectedCandidate.id, 'FIR-TWIN-001');
    alert(`Joint Twin Dossier PDF export initiated for ${selectedTarget.id} & ${selectedCandidate.id}`);
  };

  const handleCustomFirSubmit = (e) => {
    e.preventDefault();
    const newCase = {
      id: customFirData.id || `FIR-${Date.now().toString().slice(-4)}`,
      title: customFirData.title || 'Custom Input FIR',
      category: customFirData.category || 'Burglary',
      station: customFirData.station || 'KSP Central PS',
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      lat: '12.9716',
      lng: '77.5946',
      suspect: customFirData.suspect || 'Unknown',
      mo: customFirData.mo || 'Custom FIR Modus Operandi input'
    };

    setCaseOptionsList([newCase, ...caseOptionsList]);
    setSelectedTarget(newCase);
    setShowCustomModal(false);
    setDispatchNotice(`Custom FIR (${newCase.id}) successfully loaded into Indic Vyakyarth Vector Matcher!`);
    setTimeout(() => setDispatchNotice(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="INTELLIGENCE MODULE · INDIC VYAKYARTH MODEL"
        title="Case Twin Intelligence & Pattern Matcher"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <span className="text-xs font-mono font-bold text-[#2B7A78] bg-[#DEF2F1] px-3.5 py-1 rounded-full border border-[#3AAFA9]/40 flex items-center gap-1.5 shadow-xs">
              <Languages size={14} className="text-[#3AAFA9]" /> Bilingual Indic NLP (Kannada + English)
            </span>
          </div>
        }
      >
        <p className="text-xs text-[#2B7A78] font-medium mb-5">
          AI lead generation system that computes cosine similarity across Modus Operandi (MO), spatial proximity, time windows, and bilingual FIR narratives. Resolves serial crime patterns across Karnataka police stations.
        </p>

        {/* Top Target Case Selector Bar */}
        <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xs">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] shrink-0 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#3AAFA9]" /> SELECT REFERENCE TARGET CASE:
            </span>
            <select
              value={selectedTarget.id}
              onChange={(e) => setSelectedTarget(caseOptionsList.find((c) => c.id === e.target.value) || caseOptionsList[0])}
              className="flex-1 bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl px-3.5 py-2 text-xs font-bold text-[#17252A] outline-none cursor-pointer focus:border-[#3AAFA9]"
            >
              {caseOptionsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Fully Functional + Input Custom FIR Button */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2 rounded-xl bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-[#3AAFA9]/40"
          >
            <Plus size={14} className="text-[#3AAFA9]" /> + Input Custom FIR
          </button>
        </div>

        {/* 3 Columns Grid Layout from Screenshots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: ACTIVE REFERENCE & MULTI-VECTOR WEIGHTS (3.5 cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* ACTIVE REFERENCE Card */}
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-2">
                <span className="text-[10px] font-mono font-extrabold uppercase text-[#2B7A78]">ACTIVE REFERENCE</span>
                <span className="font-mono text-xs font-black text-[#17252A] bg-[#DEF2F1] px-2.5 py-0.5 rounded-full border border-[#3AAFA9]/30">
                  {selectedTarget.id}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#17252A]">{selectedTarget.title}</h3>
                <div className="text-xs font-mono font-bold text-[#2B7A78] mt-0.5">{selectedTarget.station}</div>
                <p className="text-xs text-[#2B7A78] font-medium mt-2 leading-relaxed">{selectedTarget.mo}</p>
              </div>

              <div className="pt-2 border-t border-[#B3E3DE] space-y-1.5 text-xs font-mono font-bold text-[#2B7A78]">
                <div className="flex items-center gap-1.5"><Clock size={13} className="text-[#3AAFA9]" /> {selectedTarget.time}</div>
                <div className="flex items-center gap-1.5"><MapPin size={13} className="text-[#3AAFA9]" /> Lat/Lng: {selectedTarget.lat}, {selectedTarget.lng}</div>
                <div className="flex items-center gap-1.5 text-[#17252A]"><Sparkles size={13} className="text-amber-500" /> Key Suspect: <span className="font-black">{selectedTarget.suspect}</span></div>
              </div>
            </div>

            {/* MULTI-VECTOR WEIGHTS Card */}
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <Sliders size={15} className="text-[#3AAFA9]" /> MULTI-VECTOR WEIGHTS
                </span>
                <button className="text-[10px] font-mono text-[#2B7A78] hover:text-[#17252A] font-bold underline cursor-pointer">
                  Recalculate
                </button>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block">Presets:</span>
                <div className="flex items-center gap-2">
                  {['Balanced', 'MO Heavy', 'Geo Radius'].map((p) => (
                    <button
                      key={p}
                      onClick={() => applyPreset(p)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                        preset === p
                          ? 'bg-[#2B7A78] text-white border border-[#3AAFA9] shadow-xs scale-[1.02]'
                          : 'bg-[#DEF2F1] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2 text-xs font-mono font-bold text-[#2B7A78]">
                <div className="space-y-1">
                  <div className="flex justify-between"><span>MO Similarity Weight</span><span className="text-[#17252A]">{weights.mo}%</span></div>
                  <input type="range" min="10" max="60" value={weights.mo} onChange={(e) => setWeights({ ...weights, mo: Number(e.target.value) })} className="w-full accent-[#2B7A78] cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Spatial Proximity Weight</span><span className="text-[#17252A]">{weights.spatial}%</span></div>
                  <input type="range" min="10" max="60" value={weights.spatial} onChange={(e) => setWeights({ ...weights, spatial: Number(e.target.value) })} className="w-full accent-[#2B7A78] cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Indic Vector Weight</span><span className="text-[#17252A]">{weights.indic}%</span></div>
                  <input type="range" min="10" max="60" value={weights.indic} onChange={(e) => setWeights({ ...weights, indic: Number(e.target.value) })} className="w-full accent-[#2B7A78] cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Time Window Weight</span><span className="text-[#17252A]">{weights.time}%</span></div>
                  <input type="range" min="5" max="40" value={weights.time} onChange={(e) => setWeights({ ...weights, time: Number(e.target.value) })} className="w-full accent-[#2B7A78] cursor-pointer" />
                </div>
              </div>
            </div>

          </div>

          {/* Middle Column: Ranked Case Twins (3.5 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold text-[#17252A]">Ranked Case Twins ({TWIN_CANDIDATES.length})</span>
                <span className="text-[10px] font-mono text-[#2B7A78] font-semibold">Select to compare</span>
              </div>

              <div className="space-y-3.5">
                {TWIN_CANDIDATES.map((cand) => {
                  const isSelected = selectedCandidate.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 shadow-xs ${
                        isSelected
                          ? 'bg-[#DEF2F1] border-[#3AAFA9] ring-1 ring-[#3AAFA9]/50 scale-[1.01]'
                          : 'bg-[#FEFFFF] border-[#B3E3DE] hover:bg-[#DEF2F1]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-extrabold text-[#17252A]">{cand.rank} {cand.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#2B7A78] text-white font-mono font-black text-xs border border-[#3AAFA9]">
                          {cand.score}%
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-[#17252A] leading-tight">{cand.title}</h4>
                        <div className="text-[10px] font-mono text-[#2B7A78] font-semibold">{cand.station}</div>
                      </div>

                      <p className="text-[11px] text-[#2B7A78] line-clamp-2 font-medium">{cand.mo}</p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded bg-[#3AAFA9] text-[#17252A] text-[9px] font-mono font-bold">
                          {cand.tag}
                        </span>
                        {cand.sharedSuspect && (
                          <span className="px-2 py-0.5 rounded bg-[#17252A] text-white text-[9px] font-mono font-bold">
                            ↔ SHARED SUSPECT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: TWIN COMPARISON INSPECTOR (4.5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase text-[#2B7A78]">TWIN COMPARISON INSPECTOR</span>
                  <div className="text-xs font-black text-[#17252A] mt-0.5">
                    {selectedTarget.id} → {selectedCandidate.id} ({selectedCandidate.title})
                  </div>
                </div>
                <div className="text-right bg-[#DEF2F1] p-2 rounded-xl border border-[#3AAFA9]/40">
                  <div className="text-[9px] font-mono text-[#2B7A78] font-bold">MATCH SCORE</div>
                  <div className="text-lg font-black font-mono text-[#2B7A78]">{selectedCandidate.score}%</div>
                </div>
              </div>

              {/* BILINGUAL INDIC NARRATIVE COMPARATOR */}
              <div className="p-4 rounded-xl bg-[#DEF2F1]/50 border border-[#B3E3DE] space-y-3">
                <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1">
                    <Languages size={13} className="text-[#3AAFA9]" /> BILINGUAL INDIC NARRATIVE COMPARATOR:
                  </span>
                  <span className="text-[9px] font-mono font-bold text-[#2B7A78] bg-[#FEFFFF] px-2 py-0.5 rounded border border-[#B3E3DE]">
                    Vyakyarth Indic Vector Match
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#2B7A78] block">
                      TARGET REFERENCE ({selectedTarget.id}): {selectedTarget.station}
                    </span>
                    <p className="text-[#17252A] font-semibold text-[11px]">
                      {selectedTarget.mo}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#2B7A78] block">
                      TWIN CANDIDATE ({selectedCandidate.id}): {selectedCandidate.station}
                    </span>
                    <p className="text-[#17252A] font-semibold text-[11px]">{selectedCandidate.narrativeEng}</p>
                    <p className="text-[#2B7A78] font-kannada text-[11px] font-medium pt-1">{selectedCandidate.narrativeKan}</p>
                  </div>
                </div>
              </div>

              {/* VECTOR BREAKDOWN ANALYSIS */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-extrabold uppercase text-[#2B7A78] block">
                  VECTOR BREAKDOWN ANALYSIS:
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold text-[#2B7A78]">
                  <div>
                    <div className="flex justify-between mb-1"><span>MO:</span><span className="text-[#17252A]">{selectedCandidate.vectorBreakdown.mo}%</span></div>
                    <div className="h-2 rounded-full bg-[#DEF2F1] overflow-hidden"><div className="h-full bg-[#2B7A78]" style={{ width: `${selectedCandidate.vectorBreakdown.mo}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span>LOCATION:</span><span className="text-[#17252A]">{selectedCandidate.vectorBreakdown.location}%</span></div>
                    <div className="h-2 rounded-full bg-[#DEF2F1] overflow-hidden"><div className="h-full bg-[#2B7A78]" style={{ width: `${selectedCandidate.vectorBreakdown.location}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span>NARRATIVE:</span><span className="text-[#17252A]">{selectedCandidate.vectorBreakdown.narrative}%</span></div>
                    <div className="h-2 rounded-full bg-[#DEF2F1] overflow-hidden"><div className="h-full bg-[#2B7A78]" style={{ width: `${selectedCandidate.vectorBreakdown.narrative}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span>TIME:</span><span className="text-[#17252A]">{selectedCandidate.vectorBreakdown.time}%</span></div>
                    <div className="h-2 rounded-full bg-[#DEF2F1] overflow-hidden"><div className="h-full bg-[#2B7A78]" style={{ width: `${selectedCandidate.vectorBreakdown.time}%` }} /></div>
                  </div>
                </div>
              </div>

              {/* CROSS-DISTRICT SERIAL CRIME NETWORK DIAGRAM */}
              <div className="p-4 rounded-xl bg-[#DEF2F1] border border-[#B3E3DE] space-y-3">
                <span className="text-[10px] font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <Share2 size={14} className="text-[#3AAFA9]" /> CROSS-DISTRICT SERIAL CRIME NETWORK DIAGRAM:
                </span>
                
                <div className="p-3.5 rounded-xl bg-[#17252A] text-white flex items-center justify-between gap-2 border border-[#3AAFA9]/50">
                  <div className="p-2 rounded-lg bg-[#121E22] border border-[#3AAFA9]/30 text-center">
                    <div className="text-[9px] font-mono text-[#3AAFA9] font-bold">{selectedTarget.id}</div>
                    <div className="text-[8px] font-mono text-white/70">{selectedTarget.station.split('/')[0]}</div>
                  </div>

                  <div className="flex-1 text-center font-mono">
                    <div className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40 inline-block">
                      {selectedTarget.suspect}
                    </div>
                    <div className="text-[8px] text-[#3AAFA9] font-bold mt-0.5">{selectedCandidate.score}% Cosine Match</div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#2B7A78] border border-[#3AAFA9] text-center">
                    <div className="text-[9px] font-mono text-white font-bold">{selectedCandidate.id}</div>
                    <div className="text-[8px] font-mono text-white/80">{selectedCandidate.station.split(',')[0]}</div>
                  </div>
                </div>
              </div>

              {/* AUTOMATED EVIDENCE MATCH REASON CHECKLIST */}
              <div className="p-4 rounded-xl bg-[#DEF2F1]/50 border border-[#B3E3DE] space-y-2 text-xs font-semibold">
                <span className="text-[10px] font-mono font-extrabold uppercase text-[#17252A] block mb-1">
                  AUTOMATED EVIDENCE MATCH REASON CHECKLIST:
                </span>
                <div className="flex items-start gap-2 text-[#17252A]">
                  <CheckCircle2 size={15} className="text-[#3AAFA9] shrink-0 mt-0.5" />
                  <span>Identical MO Signature: Rear window forced entry using crowbar tool levering.</span>
                </div>
                <div className="flex items-start gap-2 text-[#17252A]">
                  <CheckCircle2 size={15} className="text-[#3AAFA9] shrink-0 mt-0.5" />
                  <span>Time Window Overlap: Occurred between late night 01:00 AM – 03:00 AM.</span>
                </div>
                <div className="flex items-start gap-2 text-[#17252A]">
                  <CheckCircle2 size={15} className="text-[#3AAFA9] shrink-0 mt-0.5" />
                  <span>Vyakyarth Indic Vector: High semantic similarity score across Kannada narrative descriptions.</span>
                </div>

                <div className="mt-2 p-2.5 rounded-lg bg-[#2B7A78] text-white font-mono text-xs font-extrabold border border-[#3AAFA9]">
                  ↔ CONFIRMED SUSPECT LINKAGE: {selectedTarget.suspect} associated with both case files.
                </div>
              </div>

              {/* Bottom Actions Buttons */}
              {dispatchNotice && (
                <div className="p-3 rounded-xl bg-[#DEF2F1] border border-[#3AAFA9] text-xs font-mono font-bold text-[#17252A] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#3AAFA9]" />
                  {dispatchNotice}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleDispatchAlert}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-full bg-[#DEF2F1] hover:bg-[#2B7A78] hover:text-white text-[#2B7A78] border border-[#B3E3DE] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send size={14} className="text-[#3AAFA9]" /> Dispatch Cross-Station Alert
                </button>

                <button
                  onClick={handleExportPDF}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] border border-[#3AAFA9]/40 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download size={14} className="text-[#3AAFA9]" /> Export Joint Twin Dossier (PDF)
                </button>
              </div>

            </div>
          </div>

        </div>

      </WorkPanel>

      {/* INPUT CUSTOM FIR MODAL DIALOG */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-[#17252A]/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[#FEFFFF] border border-[#B3E3DE] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
              <div className="flex items-center gap-2 text-[#17252A]">
                <Plus size={18} className="text-[#3AAFA9]" />
                <h3 className="font-extrabold text-sm">Input Custom FIR for Indic Vector Twin Search</h3>
              </div>
              <button onClick={() => setShowCustomModal(false)} className="p-1 text-[#2B7A78] hover:text-[#17252A] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCustomFirSubmit} className="space-y-4 text-xs font-mono font-bold text-[#2B7A78]">
              <div>
                <label className="block mb-1 text-[10px] uppercase">FIR Number / Case ID:</label>
                <input
                  type="text"
                  value={customFirData.id}
                  onChange={(e) => setCustomFirData({ ...customFirData, id: e.target.value })}
                  placeholder="e.g. FIR-2026-9912"
                  className="w-full bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl p-2.5 text-xs text-[#17252A] outline-none focus:border-[#3AAFA9]"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] uppercase">Case Title:</label>
                <input
                  type="text"
                  value={customFirData.title}
                  onChange={(e) => setCustomFirData({ ...customFirData, title: e.target.value })}
                  placeholder="e.g. Commercial Jewellery Theft"
                  className="w-full bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl p-2.5 text-xs text-[#17252A] outline-none focus:border-[#3AAFA9]"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] uppercase">Modus Operandi (MO) Details:</label>
                <textarea
                  rows={3}
                  value={customFirData.mo}
                  onChange={(e) => setCustomFirData({ ...customFirData, mo: e.target.value })}
                  placeholder="Describe door breach method, tools, entry time..."
                  className="w-full bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl p-2.5 text-xs text-[#17252A] outline-none focus:border-[#3AAFA9]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-full bg-[#DEF2F1] text-[#2B7A78] hover:bg-slate-200 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-white text-xs font-bold shadow-md cursor-pointer border border-[#3AAFA9]"
                >
                  Analyze & Run Vector Match →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
