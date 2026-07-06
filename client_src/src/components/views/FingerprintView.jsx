import React, { useState, useRef } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { Fingerprint, Sliders, RefreshCw, Eye, RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, Scan, Sparkles, Upload, Download, FileText } from 'lucide-react';
import { api } from '../../api/client.js';

const LATENT_SAMPLES = [
  { id: 'SAMP-01', name: 'Mohammed', pattern: 'Right Loop (Ulnar)', station: 'Indiranagar PS', fir: '104430006202600001' },
  { id: 'SAMP-02', name: 'Ramesh', pattern: 'Plain Whorl', station: 'Mysuru South PS', fir: '104430006202600002' },
  { id: 'SAMP-03', name: 'Sharif', pattern: 'Double Loop Whorl', station: 'Whitefield PS', fir: '104430006202600003' },
  { id: 'SAMP-04', name: 'Anand', pattern: 'Tented Arch', station: 'Jayanagar PS', fir: '104430006202600004' },
];

const MATCH_CANDIDATES = [
  { 
    id: 'CANON-0042', 
    name: 'Mohammed Rafi', 
    score: 94.8, 
    pattern: 'Right Loop (Ulnar)', 
    station: 'Indiranagar PS', 
    status: 'Confirmed AFIS Match', 
    minutiaeCount: 38,
    rank: '#1',
    endings: 42,
    bifurcations: 28,
    ridgeCount: '14 ridges',
    fir: '104430006202600001',
    warrant: '1st ACMM Court Warrant #4412',
    riskScore: '94 / 100'
  },
  { 
    id: 'CANON-0081', 
    name: 'S. Praveen Kumar', 
    score: 88.5, 
    pattern: 'Plain Whorl', 
    station: 'Koramangala PS', 
    status: 'High Probability', 
    minutiaeCount: 32,
    rank: '#2',
    endings: 36,
    bifurcations: 22,
    ridgeCount: '11 ridges',
    fir: '104430006202600002',
    warrant: '2nd ACMM Court Warrant #3192',
    riskScore: '78 / 100'
  },
  { 
    id: 'CANON-0104', 
    name: 'Sharif Khan', 
    score: 79.1, 
    pattern: 'Double Loop Whorl', 
    station: 'Whitefield PS', 
    status: 'Interstate Cyber Warrant', 
    minutiaeCount: 26,
    rank: '#3',
    endings: 29,
    bifurcations: 18,
    ridgeCount: '8 ridges',
    fir: '104430006202600003',
    warrant: 'Interstate Cyber Warrant #8841',
    riskScore: '65 / 100'
  },
];

export default function FingerprintView({ activeRole = 'ACP' }) {
  const [selectedSample, setSelectedSample] = useState(LATENT_SAMPLES[0]);
  const [selectedCandidate, setSelectedCandidate] = useState(MATCH_CANDIDATES[0]);
  const [activeFilter, setActiveFilter] = useState('ENHANCED');
  const [splitCompare, setSplitCompare] = useState(false);
  const [contrast, setContrast] = useState(140);
  const [brightness, setBrightness] = useState(110);
  const [binarization, setBinarization] = useState(128);
  const [gaborFreq, setGaborFreq] = useState(6);
  const [scanning, setScanning] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfNotice, setPdfNotice] = useState(null);
  const fileInputRef = useRef(null);

  const handleReset = () => {
    setContrast(140);
    setBrightness(110);
    setBinarization(128);
    setGaborFreq(6);
    setActiveFilter('ENHANCED');
    setSplitCompare(false);
  };

  const handleRunMatcher = async () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 1000);
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    setPdfNotice(null);
    const res = await api.exportDossierPdf(selectedCandidate.id, selectedCandidate.fir);
    setPdfLoading(false);

    if (res.ok) {
      setPdfNotice({
        type: 'success',
        msg: `Fingerprint PDF Dossier generated cleanly for ${selectedCandidate.name} (${selectedCandidate.id})`
      });
    } else {
      setPdfNotice({ type: 'error', msg: res.error || 'Export failed' });
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      alert(`Smudged Latent Print Image uploaded: ${e.target.files[0].name}`);
    }
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="Biometric Intelligence Suite"
        title="Biometric Fingerprint Minutiae Matching & Latent Print Lab"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleRunMatcher}
              disabled={scanning}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <Fingerprint size={15} className={`text-[#3AAFA9] ${scanning ? 'animate-pulse' : ''}`} />
              {scanning ? 'Extracting Minutiae...' : 'Run Minutiae Matcher'}
            </button>
          </div>
        }
      >
        <p className="text-xs text-[#2B7A78] font-medium mb-5">
          Latent crime scene print enhancement suite (CLAHE, Binarization, Skeletonization, Gabor Filtering) & 1:N minutiae vector matching.
        </p>

        {/* Section 1: SELECT LATENT CRIME SCENE PRINT SAMPLE TO SEARCH DATABASE */}
        <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/30 space-y-4 mb-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#B3E3DE] pb-3">
            <Sparkles size={16} className="text-[#2B7A78]" />
            <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] tracking-wider">
              SELECT LATENT CRIME SCENE PRINT SAMPLE TO SEARCH DATABASE:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LATENT_SAMPLES.map((sample) => {
              const isSelected = selectedSample.id === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 active:scale-95 ${
                    isSelected
                      ? 'bg-[#2B7A78] text-white border-[#3AAFA9] shadow-md ring-1 ring-[#3AAFA9]/50 scale-[1.02]'
                      : 'bg-[#FEFFFF] text-[#17252A] border-[#B3E3DE] hover:bg-[#DEF2F1]'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${isSelected ? 'bg-[#17252A] text-[#3AAFA9] border-[#17252A]' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'}`}>
                    <Fingerprint size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs truncate">{sample.name}</div>
                    <div className={`text-[10px] font-mono truncate mt-0.5 ${isSelected ? 'text-[#3AAFA9] font-bold' : 'text-[#2B7A78]'}`}>
                      {sample.pattern}
                    </div>
                    <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-white/80' : 'text-[#2B7A78]/70'}`}>
                      {sample.station}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: LATENT CRIME SCENE PRINT PRE-PROCESSING & ENHANCEMENT CONTROLS */}
        <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] space-y-4 mb-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#B3E3DE] pb-3">
            <Sliders size={16} className="text-[#2B7A78]" />
            <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] tracking-wider">
              LATENT CRIME SCENE PRINT PRE-PROCESSING & ENHANCEMENT CONTROLS
            </span>
          </div>

          {/* Mode Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto p-1 bg-[#DEF2F1] rounded-full border border-[#B3E3DE]">
              {['RAW', 'ENHANCED', 'BINARY', 'SKELETON'].map((mode) => {
                const isSelected = activeFilter === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setActiveFilter(mode)}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#2B7A78] text-white border border-[#3AAFA9] shadow-md ring-1 ring-[#3AAFA9]/50 scale-[1.02]'
                        : 'bg-[#FEFFFF] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE]'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSplitCompare(!splitCompare)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 border ${
                  splitCompare
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-1 ring-amber-400'
                    : 'bg-[#FEFFFF] text-[#2B7A78] border-[#B3E3DE] hover:bg-[#DEF2F1]'
                }`}
              >
                <Eye size={14} /> Split Compare
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded-full bg-[#DEF2F1] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE] text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>

          {/* Enhancement Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2 text-xs font-mono font-bold text-[#2B7A78]">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Contrast Normalization:</span>
                <span className="text-[#17252A]">{contrast}%</span>
              </div>
              <input
                type="range"
                min="100" max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-[#2B7A78] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Brightness Adjustment:</span>
                <span className="text-[#17252A]">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50" max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-[#2B7A78] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Binarization Cutoff:</span>
                <span className="text-[#17252A]">{binarization}</span>
              </div>
              <input
                type="range"
                min="50" max="200"
                value={binarization}
                onChange={(e) => setBinarization(Number(e.target.value))}
                className="w-full accent-[#2B7A78] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Gabor Ridge Frequency:</span>
                <span className="text-[#17252A]">{gaborFreq} Hz</span>
              </div>
              <input
                type="range"
                min="1" max="12"
                value={gaborFreq}
                onChange={(e) => setGaborFreq(Number(e.target.value))}
                className="w-full accent-[#2B7A78] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: LATENT MINUTIAE HUD SCANNER & RANKED MATCHES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Left Column: Latent Minutiae HUD Scanner (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <Scan size={16} className="text-[#3AAFA9]" /> LATENT MINUTIAE HUD SCANNER
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/30 text-[10px] font-mono font-bold">
                  Filter: {activeFilter}
                </span>
              </div>

              {/* Minutiae Metrics Badges Bar (From Screenshot) */}
              <div className="flex items-center justify-between gap-2 p-2 bg-[#DEF2F1] rounded-xl border border-[#B3E3DE] text-[10px] font-mono font-bold text-[#17252A]">
                <span className="px-2 py-0.5 rounded bg-[#FEFFFF] border border-[#B3E3DE]">42 Endings</span>
                <span className="px-2 py-0.5 rounded bg-[#FEFFFF] border border-[#B3E3DE]">28 Bifurcations</span>
                <span className="px-2 py-0.5 rounded bg-[#FEFFFF] border border-[#B3E3DE]">Core Center</span>
              </div>

              {/* Interactive Visual Canvas */}
              <div className="relative h-60 rounded-2xl bg-[#17252A] border border-[#3AAFA9]/50 overflow-hidden flex items-center justify-center p-4">
                {/* Minutiae Ridge Grid Graphic */}
                <div className="absolute inset-0 bg-[radial-gradient(#3AAFA9_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                
                {/* Animated Laser Scan Bar */}
                {scanning && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#3AAFA9] shadow-[0_0_15px_#3AAFA9] animate-[bounce_2s_infinite]" />
                )}

                {/* Fingerprint Silhouette & Minutiae Point Markers */}
                <div className="relative z-10 text-center space-y-2">
                  <Fingerprint size={110} className="mx-auto text-[#3AAFA9] opacity-80" />
                  <div className="text-[10px] font-mono text-[#DEF2F1] font-bold">
                    {selectedSample.name} ({selectedSample.pattern})
                  </div>
                </div>

                {/* Minutiae Legend Overlay */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-[#121E22]/90 px-2.5 py-1 rounded-lg border border-[#3AAFA9]/30 text-[9px] font-mono text-white">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Bifurcation</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#3AAFA9] inline-block" /> Ridge Ending</span>
                </div>
              </div>

              {/* Upload Smudged Latent Print Image Button (Restored from Screenshot) */}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="w-full py-2.5 rounded-xl bg-[#DEF2F1] hover:bg-[#2B7A78] hover:text-white text-[#2B7A78] border border-[#B3E3DE] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-2"
              >
                <Upload size={14} className="text-[#3AAFA9]" /> Upload Smudged Latent Print Image
              </button>
            </div>
          </div>

          {/* Right Column: Ranked Fingerprint Matches (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#3AAFA9]" /> RANKED FINGERPRINT MATCHES ({MATCH_CANDIDATES.length} CANDIDATES)
                </span>
                <span className="px-3 py-1 rounded-full bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/40 text-[10px] font-mono font-bold">
                  Threshold &gt; 85% Match
                </span>
              </div>

              <div className="space-y-3.5">
                {MATCH_CANDIDATES.map((match) => {
                  const isSelected = selectedCandidate.id === match.id;
                  return (
                    <div
                      key={match.id}
                      onClick={() => setSelectedCandidate(match)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 shadow-xs ${
                        isSelected
                          ? 'bg-[#DEF2F1] border-[#3AAFA9] ring-1 ring-[#3AAFA9]/50'
                          : 'bg-[#DEF2F1]/30 border-[#B3E3DE] hover:border-[#3AAFA9]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#17252A] text-sm">{match.rank} Match {match.name}</span>
                          <span className="font-mono text-xs font-bold text-[#2B7A78]">({match.id})</span>
                        </div>
                        <span className="px-3 py-1 bg-[#2B7A78] text-white border border-[#3AAFA9] rounded-full font-mono font-black text-xs shadow-xs">
                          {match.score}% Match
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono font-bold text-[#2B7A78]">
                        <div>Pattern: <span className="text-[#17252A]">{match.pattern}</span></div>
                        <div>Minutiae Points: <span className="text-[#17252A]">{match.minutiaeCount} linked</span></div>
                        <div>Station: <span className="text-[#17252A]">{match.station}</span></div>
                      </div>

                      <div className="pt-2 border-t border-[#B3E3DE] flex items-center justify-between text-xs font-bold">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#3AAFA9] text-[#17252A] font-mono text-[10px]">
                          {match.status}
                        </span>
                        <span className="text-[#2B7A78] hover:text-[#17252A] font-extrabold text-xs">
                          {isSelected ? '✓ Selected' : 'Select Candidate →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Section 4: BOTTOM DETAILED FINGERPRINT ANALYSIS CARD (Restored from Screenshot) */}
        <div className="p-6 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-5">
          {pdfNotice && (
            <div className={`p-3.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
              pdfNotice.type === 'success' ? 'bg-[#DEF2F1] border-[#3AAFA9]/40 text-[#17252A]' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <CheckCircle2 size={16} className="text-[#3AAFA9]" />
              {pdfNotice.msg}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B3E3DE] pb-4">
            <div>
              <h2 className="text-base font-black text-[#17252A] flex items-center gap-2">
                <Fingerprint size={20} className="text-[#3AAFA9]" />
                <span>Fingerprint Analysis: {selectedCandidate.name} ({selectedCandidate.id})</span>
              </h2>
              <p className="text-xs font-mono text-[#2B7A78] mt-1 font-bold">
                Canonical ID: {selectedCandidate.id} · Station: {selectedCandidate.station}
              </p>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <Download size={14} className="text-[#3AAFA9]" />
              {pdfLoading ? 'Generating PDF...' : 'Export Fingerprint PDF Dossier'}
            </button>
          </div>

          {/* 3 Columns Analysis Data Box Grid from Screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Box 1: MINUTIAE RIDGE METRICS */}
            <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 space-y-2.5 shadow-xs">
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#2B7A78]">
                MINUTIAE RIDGE METRICS
              </div>
              <div className="space-y-1.5 text-xs font-mono font-bold text-[#17252A]">
                <div className="flex justify-between">
                  <span className="text-[#2B7A78]">Ridge Endings:</span>
                  <span>{selectedCandidate.endings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2B7A78]">Bifurcations:</span>
                  <span>{selectedCandidate.bifurcations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2B7A78]">Matching Ridge Count:</span>
                  <span>{selectedCandidate.ridgeCount}</span>
                </div>
              </div>
            </div>

            {/* Box 2: POLICE INTELLIGENCE */}
            <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 space-y-2.5 shadow-xs">
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#2B7A78]">
                POLICE INTELLIGENCE
              </div>
              <div className="space-y-1.5 text-xs font-mono font-bold text-[#17252A]">
                <div className="flex justify-between">
                  <span className="text-[#2B7A78]">Associated FIR:</span>
                  <span>{selectedCandidate.fir}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2B7A78]">Court Warrant:</span>
                  <span className="truncate max-w-[140px]">{selectedCandidate.warrant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2B7A78]">Priority Risk Score:</span>
                  <span className="text-[#17252A] font-black">{selectedCandidate.riskScore}</span>
                </div>
              </div>
            </div>

            {/* Box 3: MINUTIAE PATTERN ANALYSIS */}
            <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 space-y-2.5 shadow-xs">
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#2B7A78]">
                MINUTIAE PATTERN ANALYSIS
              </div>
              <div className="p-3 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE] text-xs font-sans text-[#17252A] font-semibold leading-relaxed">
                Minutiae ridge matching verified against {selectedCandidate.station} latent print database.
              </div>
            </div>

          </div>
        </div>

      </WorkPanel>
    </div>
  );
}
