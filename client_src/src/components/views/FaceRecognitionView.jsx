import React, { useState, useRef } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { ScanFace, Sliders, RefreshCw, Eye, RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, Scan, Sparkles, Upload, Download, FileText, UserPlus, X, Camera } from 'lucide-react';
import { api } from '../../api/client.js';

const SAMPLE_TARGETS = [
  { id: 'CANON-0042', name: 'Mohammed', station: 'Indiranagar PS', age: 34, warrant: '1st ACMM Court Warrant #4412', filter: 'Indiranagar' },
  { id: 'CANON-0089', name: 'Ramesh', station: 'Mysuru South PS', age: 41, warrant: 'Active Look-Out Circular', filter: 'Mysuru' },
  { id: 'CANON-0182', name: 'Unknown', station: 'Koramangala PS', age: 29, warrant: 'Under Investigation', filter: 'Koramangala' },
  { id: 'CANON-0104', name: 'Sharif', station: 'Whitefield PS', age: 36, warrant: 'Interstate Cyber Warrant', filter: 'Whitefield' },
  { id: 'CANON-0118', name: 'Priya', station: 'Cubbon Park PS', age: 31, warrant: 'Bailable Warrant', filter: 'Indiranagar' },
  { id: 'CANON-0142', name: 'Anand', station: 'Jayanagar PS', age: 38, warrant: 'Bailable Warrant', filter: 'Indiranagar' },
  { id: 'CANON-0189', name: 'Surveillance', station: 'Electronic City PS', age: 33, warrant: 'CCTV Still Extraction', filter: 'Whitefield' },
  { id: 'CANON-0204', name: 'Night-Vision', station: 'Bengaluru Central PS', age: 35, warrant: 'Night IR Footage', filter: 'Mysuru' },
];

const MATCH_CANDIDATES = [
  { id: 'CANON-0042', name: 'Mohammed Rafi', score: 96, station: 'Indiranagar PS', age: 34, warrant: '1st ACMM Court Warrant #4412', euclidean: '0.036', eyeRatio: '0.468', noseRatio: '0.512', fir: '104430006202600001', offence: 'Burglary & Window Break-in', riskScore: '94 / 100' },
  { id: 'CANON-0089', name: 'Ramesh Kumar', score: 88, station: 'Mysuru South PS', age: 41, warrant: 'Active Look-Out Circular', euclidean: '0.082', eyeRatio: '0.452', noseRatio: '0.501', fir: '104430006202600002', offence: 'House Trespass & Theft', riskScore: '78 / 100' },
  { id: 'CANON-0104', name: 'Sharif Khan', score: 82, station: 'Whitefield PS', age: 36, warrant: 'Interstate Cyber Warrant', euclidean: '0.124', eyeRatio: '0.441', noseRatio: '0.490', fir: '104430006202600003', offence: 'Cyber Fraud & Phishing', riskScore: '65 / 100' },
  { id: 'CANON-0142', name: 'Anand V', score: 74, station: 'Jayanagar PS', age: 38, warrant: 'Bailable Warrant', euclidean: '0.168', eyeRatio: '0.430', noseRatio: '0.482', fir: '104430006202600004', offence: 'Vehicle Theft', riskScore: '52 / 100' },
];

export default function FaceRecognitionView({ activeRole = 'ACP' }) {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_TARGETS[0]);
  const [selectedCandidate, setSelectedCandidate] = useState(MATCH_CANDIDATES[0]);
  const [stationFilter, setStationFilter] = useState('All');
  const [meshOn, setMeshOn] = useState(true);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [simulatedAge, setSimulatedAge] = useState(34);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pdfNotice, setPdfNotice] = useState(null);
  const fileInputRef = useRef(null);

  const filteredSamples = SAMPLE_TARGETS.filter((s) => {
    if (stationFilter === 'All') return true;
    return s.filter === stationFilter || s.station.includes(stationFilter);
  });

  const handleResetControls = () => {
    setYaw(0);
    setPitch(0);
    setSimulatedAge(34);
    setMeshOn(true);
  };

  const handleExportPDF = async () => {
    setPdfNotice(`Exporting Suspect Dossier PDF for ${selectedCandidate.name} (${selectedCandidate.id})...`);
    const res = await api.exportDossierPdf(selectedCandidate.id, selectedCandidate.fir);
    setTimeout(() => {
      setPdfNotice(`Suspect Dossier PDF exported cleanly for ${selectedCandidate.name} (${selectedCandidate.id})`);
    }, 1000);
  };

  const handleLocalPhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      alert(`Local photo uploaded for 3D Face Alignment: ${e.target.files[0].name}`);
    }
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="BIOMETRIC INTELLIGENCE"
        title="Biometric Facial Forensics, 3D Pose Mesh & Aging Lab"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-1.5 rounded-full bg-[#17252A] text-white text-xs font-bold shadow-md cursor-pointer border border-[#3AAFA9]/40"
            >
              Recognition Canvas
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-1.5 rounded-full bg-[#DEF2F1] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE] text-xs font-bold transition-all cursor-pointer"
            >
              Manage Dataset
            </button>
          </div>
        }
      >
        <p className="text-xs text-[#2B7A78] font-medium mb-6">
          Zia AI DeepFace facial vector search, 3D Pitch/Yaw head alignment & aging/de-aging simulation for wanted fugitives.
        </p>

        {/* ========================================================================= */}
        {/* FIRST IMAGE SECTION (PLACED FIRST AT TOP): Target Sample Photos + 3D Pose Controls */}
        {/* ========================================================================= */}
        <div className="space-y-6 mb-8">
          
          {/* Target Sample Photo Selector Card */}
          <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/30 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B3E3DE] pb-3">
              <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#3AAFA9]" /> SELECT TARGET SAMPLE PHOTO TO TEST FACE DETECTION:
              </span>

              {/* Station Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#DEF2F1] rounded-full border border-[#B3E3DE]">
                <span className="text-[10px] font-mono font-bold text-[#2B7A78] px-2">Filter Station:</span>
                {['All', 'Indiranagar', 'Whitefield', 'Mysuru', 'Koramangala'].map((st) => {
                  const isSelected = stationFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setStationFilter(st)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-[#2B7A78] text-white border border-[#3AAFA9] shadow-xs scale-[1.02]'
                          : 'bg-[#FEFFFF] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE]'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sample Photos Grid (8 items from Image 1) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
              {filteredSamples.map((sample) => {
                const isSelected = selectedSample.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => setSelectedSample(sample)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 active:scale-95 ${
                      isSelected
                        ? 'bg-[#2B7A78] text-white border-[#3AAFA9] shadow-md ring-1 ring-[#3AAFA9]/50 scale-[1.02]'
                        : 'bg-[#FEFFFF] text-[#17252A] border-[#B3E3DE] hover:bg-[#DEF2F1]'
                    }`}
                  >
                    <div className="relative h-16 w-16 rounded-xl bg-[#DEF2F1] border border-[#B3E3DE] overflow-hidden flex items-center justify-center">
                      <ScanFace size={36} className={isSelected ? 'text-[#3AAFA9]' : 'text-[#2B7A78]'} />
                      <span className="absolute bottom-0.5 inset-x-0 bg-[#17252A]/90 text-white font-mono text-[8px] font-bold truncate py-0.5">
                        {sample.id}
                      </span>
                    </div>
                    <div className="min-w-0 w-full text-center">
                      <div className="font-extrabold text-xs truncate">{sample.name}</div>
                      <div className={`text-[9px] font-mono truncate ${isSelected ? 'text-white/80' : 'text-[#2B7A78]'}`}>
                        {sample.station}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Face Pose Alignment & Fugitive Aging Simulation Controls Card (Image 1 Bottom) */}
          <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B3E3DE] pb-3">
              <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                <Scan size={16} className="text-[#3AAFA9]" /> 3D FACE POSE ALIGNMENT & FUGITIVE AGING SIMULATION CONTROLS
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMeshOn(!meshOn)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
                    meshOn
                      ? 'bg-[#2B7A78] text-white border-[#3AAFA9] shadow-md ring-1 ring-[#3AAFA9]/50'
                      : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'
                  }`}
                >
                  🧊 68-Point Mesh {meshOn ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={handleResetControls}
                  className="px-4 py-1.5 rounded-full bg-[#DEF2F1] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE] text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Reset Pose & Age
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono font-bold text-[#2B7A78]">
              <div className="p-4 rounded-xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-2">
                <div className="flex justify-between">
                  <span>3D Head Yaw (Left/Right):</span>
                  <span className="text-[#17252A] font-extrabold">{yaw}°</span>
                </div>
                <input
                  type="range" min="-45" max="45" value={yaw}
                  onChange={(e) => setYaw(Number(e.target.value))}
                  className="w-full accent-[#2B7A78] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-2">
                <div className="flex justify-between">
                  <span>3D Head Pitch (Up/Down):</span>
                  <span className="text-[#17252A] font-extrabold">{pitch}°</span>
                </div>
                <input
                  type="range" min="-30" max="30" value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full accent-[#2B7A78] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-2">
                <div className="flex justify-between">
                  <span>Aging Simulation Engine:</span>
                  <span className="text-[#17252A] font-extrabold">Age {simulatedAge} Years</span>
                </div>
                <input
                  type="range" min="18" max="75" value={simulatedAge}
                  onChange={(e) => setSimulatedAge(Number(e.target.value))}
                  className="w-full accent-[#2B7A78] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECOND IMAGE SECTION (PLACED SECOND IN BELOW FIRST IMAGE): Viewport & Ranked Candidates */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Left Column: TARGET SUBJECT PHOTO VIEWPORT (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <Camera size={16} className="text-[#3AAFA9]" /> TARGET SUBJECT PHOTO VIEWPORT
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                  Simulated Age: {simulatedAge} Yrs
                </span>
              </div>

              {/* Viewport Canvas Box with 3D Landmark Overlay */}
              <div className="relative h-64 rounded-2xl bg-[#17252A] border border-[#3AAFA9]/50 overflow-hidden flex items-center justify-center p-4">
                {/* 3D Landmark Mesh Ring Overlay */}
                {meshOn && (
                  <div className="absolute inset-8 rounded-full border-2 border-dashed border-[#3AAFA9] opacity-70 animate-pulse pointer-events-none" />
                )}

                <div className="relative z-10 text-center space-y-2">
                  <ScanFace size={120} className="mx-auto text-[#3AAFA9]" />
                  <div className="px-3 py-1 bg-[#121E22] rounded-lg border border-[#3AAFA9]/40 text-[10px] font-mono text-white font-bold inline-block">
                    3D_POSE [YAW: {yaw}°, PITCH: {pitch}°]
                  </div>
                </div>
              </div>

              {/* Upload Local Photo Button */}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLocalPhotoUpload} />
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="w-full py-2.5 rounded-xl bg-[#DEF2F1] hover:bg-[#2B7A78] hover:text-white text-[#2B7A78] border border-[#B3E3DE] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-2"
              >
                <Upload size={14} className="text-[#3AAFA9]" /> Upload Local Photo
              </button>
            </div>
          </div>

          {/* Right Column: RANKED SIMILAR CANDIDATES (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#3AAFA9]" /> RANKED SIMILAR CANDIDATES ({MATCH_CANDIDATES.length} MATCHES)
                </span>
                <span className="px-3 py-1 rounded-full bg-[#DEF2F1] text-[#2B7A78] border border-[#3AAFA9]/40 text-[10px] font-mono font-bold">
                  Threshold: Facenet &lt; 0.40
                </span>
              </div>

              <div className="space-y-3.5">
                {MATCH_CANDIDATES.map((match, idx) => {
                  const isSelected = selectedCandidate.id === match.id;
                  return (
                    <div
                      key={match.id}
                      onClick={() => setSelectedCandidate(match)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 shadow-xs ${
                        isSelected
                          ? 'bg-[#DEF2F1] border-[#3AAFA9] ring-1 ring-[#3AAFA9]/50'
                          : 'bg-[#DEF2F1]/30 border-[#B3E3DE] hover:border-[#3AAFA9]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#2B7A78]">RANK #{idx + 1} CANDIDATE</span>
                          <span className="font-extrabold text-[#17252A] text-sm">{match.name} ({match.id})</span>
                        </div>
                        <span className="px-3 py-1 bg-[#2B7A78] text-white border border-[#3AAFA9] rounded-full font-mono font-black text-xs shadow-xs">
                          {match.score}% Match
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold text-[#2B7A78] flex items-center gap-3 flex-wrap">
                        <span>📍 {match.station}</span>
                        <span>•</span>
                        <span>Age {match.age}</span>
                        <span>•</span>
                        <span className="text-[#17252A]">{match.warrant}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* THIRD IMAGE SECTION (PLACED THIRD IN BELOW SECOND IMAGE): Biometric Candidate Match Analysis */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-5">
          {pdfNotice && (
            <div className="p-3.5 rounded-xl bg-[#DEF2F1] border border-[#3AAFA9]/40 text-xs font-mono font-bold text-[#17252A] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#3AAFA9]" />
              {pdfNotice}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B3E3DE] pb-4">
            <div>
              <h2 className="text-base font-black text-[#17252A] flex items-center gap-2">
                <ScanFace size={20} className="text-[#3AAFA9]" />
                <span>Biometric Candidate Match Analysis: {selectedCandidate.name} ({selectedCandidate.id})</span>
              </h2>
              <p className="text-xs font-mono text-[#2B7A78] mt-1 font-bold">
                Canonical ID: {selectedCandidate.id} · Station: {selectedCandidate.station}
              </p>
            </div>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <Download size={14} className="text-[#3AAFA9]" /> Export Suspect Dossier PDF
            </button>
          </div>

          {/* 3 Data Box Columns from Image 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Box 1: BIOMETRIC LANDMARK MESH */}
            <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 space-y-2.5 shadow-xs">
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#2B7A78]">
                BIOMETRIC LANDMARK MESH
              </div>
              <div className="space-y-1.5 text-xs font-mono font-bold text-[#17252A]">
                <div className="flex justify-between"><span className="text-[#2B7A78]">Match Confidence:</span><span>{selectedCandidate.score}%</span></div>
                <div className="flex justify-between"><span className="text-[#2B7A78]">Euclidean Vector Dist:</span><span>{selectedCandidate.euclidean}</span></div>
                <div className="flex justify-between"><span className="text-[#2B7A78]">Eye-to-Eye Ratio:</span><span>{selectedCandidate.eyeRatio}</span></div>
                <div className="flex justify-between"><span className="text-[#2B7A78]">Nose-to-Chin Ratio:</span><span>{selectedCandidate.noseRatio}</span></div>
              </div>
            </div>

            {/* Box 2: POLICE INTELLIGENCE */}
            <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 space-y-2.5 shadow-xs">
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#2B7A78]">
                POLICE INTELLIGENCE
              </div>
              <div className="space-y-1.5 text-xs font-mono font-bold text-[#17252A]">
                <div className="flex justify-between"><span className="text-[#2B7A78]">Associated FIR:</span><span>{selectedCandidate.fir}</span></div>
                <div className="flex justify-between"><span className="text-[#2B7A78]">Primary Offence:</span><span className="truncate max-w-[130px]">{selectedCandidate.offence}</span></div>
                <div className="flex justify-between"><span className="text-[#2B7A78]">Court Warrant:</span><span className="truncate max-w-[130px]">{selectedCandidate.warrant}</span></div>
                <div className="flex justify-between"><span className="text-[#2B7A78]">Priority Risk Score:</span><span className="text-[#17252A] font-black">{selectedCandidate.riskScore}</span></div>
              </div>
            </div>

            {/* Box 3: AI INTELLIGENCE BRIEFING */}
            <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 space-y-2.5 shadow-xs">
              <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#2B7A78]">
                AI INTELLIGENCE BRIEFING
              </div>
              <div className="p-3 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE] text-xs font-sans text-[#17252A] font-semibold leading-relaxed">
                Primary match verified via Zia AI facial landmark embedding model against {selectedCandidate.station} database.
              </div>
            </div>

          </div>
        </div>

      </WorkPanel>

      {/* Dataset Modal for Manage Dataset Button */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#17252A]/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[#FEFFFF] border border-[#B3E3DE] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
              <h3 className="font-extrabold text-sm text-[#17252A]">Manage Police Biometric Facial Dataset</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-[#2B7A78] hover:text-[#17252A] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#2B7A78] font-medium">
              Update authorized facial embeddings, upload high-resolution fugitive mugshots, or re-index police station facial vector database.
            </p>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-full bg-[#17252A] text-white text-xs font-bold cursor-pointer">
                Close Dataset Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
