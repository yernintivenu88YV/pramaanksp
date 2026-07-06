import React, { useState } from 'react';
import { cases } from '../../data/mock.js';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { Cite } from '../common/Cite.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { CaseDetailView } from '../cases/CaseDetailView.jsx';
import { Search, Filter, FileText, Download, CopyCheck, MapPin, Clock, X, ChevronRight, Plus, Camera, ShieldAlert, User, FileCheck, Eye, Layers } from 'lucide-react';

export default function CasesView({ activeRole = 'ACP', onOpenCommandPalette }) {
  const [filterStatus, setFilterStatus] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(cases[0]);
  const [activeTab, setActiveTab] = useState('Overview');

  const filteredCases = cases.filter((c) => {
    if (filterStatus !== 'all') {
      const st = c.status ? c.status.toLowerCase() : '';
      if (filterStatus === 'review' && !st.includes('review') && !st.includes('investigation')) return false;
      if (filterStatus !== 'review' && !st.includes(filterStatus)) return false;
    }
    if (
      searchQuery &&
      !c.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.fir.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 font-sans select-none">
      <WorkPanel
        eyebrow="Investigate Module"
        title="Case Register & Dossier Workspace"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <span className="text-xs font-mono font-bold text-[#2B7A78]">
              {filteredCases.length} records
            </span>
          </div>
        }
      >
        {/* Search, + New Case Button & Status Filter Tabs Bar (Restored from Screenshots) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5 w-full lg:w-auto flex-1 max-w-xl">
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 flex-1 bg-[#DEF2F1] border border-[#B3E3DE] rounded-2xl px-3.5 py-2 shadow-xs">
              <Search size={15} className="text-[#2B7A78]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case ID, FIR number, title..."
                className="bg-transparent text-xs text-[#17252A] placeholder-[#2B7A78]/70 outline-none w-full font-sans font-semibold"
              />
            </div>

            {/* + New Case Button (Restored from Screenshot) */}
            <button
              onClick={onOpenCommandPalette}
              className="px-4 py-2 rounded-2xl bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-[#3AAFA9]/40 shrink-0"
            >
              <Plus size={15} className="text-[#3AAFA9]" />
              <span>+ New Case</span>
            </button>
          </div>

          {/* Status Filter Tab Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto p-1 bg-[#DEF2F1] rounded-full border border-[#B3E3DE]">
            {['all', 'active', 'escalated', 'review', 'closed'].map((st) => {
              const isSelected = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold capitalize transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#2B7A78] text-white border border-[#3AAFA9] shadow-md ring-1 ring-[#3AAFA9]/50 scale-[1.02]'
                      : 'bg-[#FEFFFF] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE]'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Master–Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Master Table Column */}
          <div className="lg:col-span-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-[#B3E3DE] bg-[#DEF2F1] text-[11px] font-mono font-bold uppercase tracking-wider text-[#2B7A78]">
              Case Register Index ({filteredCases.length})
            </div>
            <div className="max-h-[560px] overflow-y-auto divide-y divide-[#B3E3DE]">
              {filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-[#DEF2F1] border-l-4 border-l-[#2B7A78] shadow-xs' 
                        : 'hover:bg-[#DEF2F1]/50'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#17252A]">{c.id}</span>
                        <span className="font-mono text-[10px] text-[#2B7A78] font-semibold">{c.fir}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${
                            c.status === 'active'
                              ? 'bg-[#2B7A78] text-white border border-[#3AAFA9]'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-[#17252A] truncate">{c.title}</h4>
                      <div className="text-[10px] text-[#2B7A78] font-mono flex items-center gap-2 font-semibold">
                        <span>{c.station}</span>
                        <span>•</span>
                        <span>{c.updated}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`shrink-0 transition-transform ${isSelected ? 'text-[#2B7A78] translate-x-0.5' : 'text-[#2B7A78]/40'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Column */}
          <div className="lg:col-span-7 space-y-4">
            {selectedCase ? (
              <div className="p-6 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-5">
                {/* Header & Main Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#B3E3DE]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#2B7A78] font-bold">
                      CASE WORKSPACE DETAIL
                    </span>
                    <h2 className="text-base font-black text-[#17252A] flex items-center gap-2 mt-0.5">
                      <span>{selectedCase.title}</span>
                      <span className="text-xs font-mono font-normal text-[#2B7A78]">({selectedCase.id})</span>
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('Twins')}
                      className="px-4 py-2 rounded-full bg-[#2B7A78] text-white border border-[#3AAFA9] text-xs font-bold transition-all shadow-md hover:bg-[#17252A] hover:border-[#3AAFA9] active:scale-95 flex items-center gap-1.5 cursor-pointer ring-1 ring-[#3AAFA9]/50"
                    >
                      <CopyCheck size={14} className="text-[#3AAFA9]" /> Find Twins
                    </button>
                    <button
                      className="px-4 py-2 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-white border border-[#3AAFA9]/40 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} className="text-[#3AAFA9]" /> Dossier PDF
                    </button>
                  </div>
                </div>

                {/* Restored All 8 Workspace Detail Tabs (From Screenshot) */}
                <div className="flex border-b border-[#B3E3DE] gap-1.5 text-xs font-bold p-1 bg-[#DEF2F1] rounded-full overflow-x-auto">
                  {['Overview', 'Twins', 'Complainant', 'Victims', 'Suspects', 'Witnesses', 'Evidence', 'Crime Scene'].map((tab) => {
                    const isSelected = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#2B7A78] text-white border border-[#3AAFA9] shadow-md ring-1 ring-[#3AAFA9]/50 font-extrabold scale-[1.02]'
                            : 'bg-[#FEFFFF] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE]'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Rendering */}
                {activeTab === 'Overview' && (
                  <div className="space-y-4 text-xs">
                    {/* Crime Scene Location Evidence Graphic Box (Restored from Screenshot) */}
                    <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#17252A] text-white space-y-3 shadow-md relative overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-[#3AAFA9]/30 pb-2">
                        <Camera size={15} className="text-[#3AAFA9]" />
                        <span className="font-mono text-xs font-bold text-[#DEF2F1]">
                          Crime Scene / Location Evidence Media:
                        </span>
                      </div>

                      {/* SVG Crime Scene Location Graphic with Dotted Breach & Tape */}
                      <div className="relative h-44 rounded-xl bg-[#121E22] border border-[#3AAFA9]/40 overflow-hidden flex flex-col justify-between p-4">
                        {/* Dotted Breach Box */}
                        <div className="absolute top-8 left-1/3 w-28 h-20 border-2 border-dashed border-red-500 rounded-lg flex items-center justify-center bg-red-500/10">
                          <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider">BREACH</span>
                        </div>

                        {/* Police Strobe Lights Graphic */}
                        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-[#17252A] p-2 rounded-full border border-[#3AAFA9]">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                        </div>

                        {/* Police Tape & Pins */}
                        <div className="mt-auto pt-4 border-t-2 border-amber-400 relative z-10 flex items-center justify-between px-4 bg-amber-500/20 py-1 rounded-sm">
                          <span className="text-[10px] font-mono font-black text-amber-300 tracking-widest uppercase">
                            CRIME SCENE - DO NOT CROSS
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-amber-400 text-[#17252A] text-[10px] font-mono font-extrabold flex items-center justify-center">1</span>
                            <span className="h-5 w-5 rounded-full bg-amber-400 text-[#17252A] text-[10px] font-mono font-extrabold flex items-center justify-center">3</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FIR Metadata & Narrative Cards */}
                    <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl bg-[#DEF2F1] border border-[#B3E3DE] font-mono">
                      <div>
                        <span className="text-[#2B7A78] block text-[10px] font-bold">FIR NUMBER:</span>
                        <span className="text-[#17252A] font-bold">{selectedCase.fir}</span>
                      </div>
                      <div>
                        <span className="text-[#2B7A78] block text-[10px] font-bold">STATION:</span>
                        <span className="text-[#17252A] font-bold">{selectedCase.station}</span>
                      </div>
                      <div>
                        <span className="text-[#2B7A78] block text-[10px] font-bold">INVESTIGATION LEAD:</span>
                        <span className="text-[#17252A] font-bold">{selectedCase.lead}</span>
                      </div>
                      <div>
                        <span className="text-[#2B7A78] block text-[10px] font-bold">CRIME SEVERITY:</span>
                        <span className="text-red-600 font-bold uppercase">{selectedCase.priority}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#DEF2F1]/60 border border-[#B3E3DE] space-y-1.5">
                      <span className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase tracking-wider block">
                        FIR Narrative (Original Kannada & English):
                      </span>
                      <p className="text-[#17252A] font-kannada leading-relaxed text-xs font-semibold">
                        ಪ್ರಕರಣ ದಿನಾಂಕ {selectedCase.updated}: ಸಂಶಯಾಸ್ಪದ ವ್ಯಕ್ತಿಗಳ ಚಲನವಲನ ದಾಖಲಾಗಿದೆ. (Modus Operandi: Rear forced entry with crowbar).
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'Twins' && <CaseDetailView activeRole={activeRole} />}

                {activeTab === 'Complainant' && (
                  <div className="p-5 rounded-2xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-3 text-xs">
                    <h3 className="font-extrabold text-[#17252A] text-sm border-b border-[#B3E3DE] pb-2">Complainant Verification Log</h3>
                    <div className="grid grid-cols-2 gap-3 font-mono font-bold text-[#2B7A78]">
                      <div>Name: <span className="text-[#17252A]">Smt. Sunitha Rao</span></div>
                      <div>Contact: <span className="text-[#17252A]">9845012345</span></div>
                      <div className="col-span-2">Residence Address: <span className="text-[#17252A]">Indiranagar 10th Main, Bengaluru</span></div>
                    </div>
                  </div>
                )}

                {activeTab === 'Victims' && (
                  <div className="p-5 rounded-2xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-3 text-xs">
                    <h3 className="font-extrabold text-[#17252A] text-sm border-b border-[#B3E3DE] pb-2">Victim Loss Checklist & Inventory</h3>
                    <ul className="space-y-2 text-[#17252A] font-semibold">
                      <li className="flex justify-between p-2 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE]">
                        <span>• Gold Ornaments (Necklace & Bangles)</span>
                        <span className="font-mono text-[#2B7A78]">120 grams</span>
                      </li>
                      <li className="flex justify-between p-2 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE]">
                        <span>• Cash Stolen from Bedroom Safe</span>
                        <span className="font-mono text-[#2B7A78]">₹85,000</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === 'Suspects' && (
                  <div className="p-5 rounded-2xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-3 text-xs">
                    <h3 className="font-extrabold text-[#17252A] text-sm border-b border-[#B3E3DE] pb-2">Primary Linked Suspect Dossiers</h3>
                    <div className="p-3.5 rounded-xl bg-[#FEFFFF] border border-[#B3E3DE] flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-[#17252A]">Mohammed Rafi (CANON-0042)</div>
                        <div className="font-mono text-[10px] text-[#2B7A78]">Active Warrant #4412 • 87.4% Threat Score</div>
                      </div>
                      <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-mono text-[10px] font-bold">
                        WARRANT ACTIVE
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'Witnesses' && (
                  <div className="p-5 rounded-2xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-3 text-xs">
                    <h3 className="font-extrabold text-[#17252A] text-sm border-b border-[#B3E3DE] pb-2">Eyewitness Testimonies</h3>
                    <div className="p-3 rounded-xl bg-[#FEFFFF] border border-[#B3E3DE] space-y-1">
                      <div className="font-bold text-[#17252A]">Security Guard Ramesh:</div>
                      <p className="text-[#2B7A78] font-medium">Observed two men in dark hoodies leaving rear alley at 2:15 AM carrying a black bag.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'Evidence' && (
                  <div className="p-5 rounded-2xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-3 text-xs">
                    <h3 className="font-extrabold text-[#17252A] text-sm border-b border-[#B3E3DE] pb-2">Physical & Digital Evidence Log</h3>
                    <div className="space-y-2 font-mono font-bold text-[#2B7A78]">
                      <div className="flex justify-between p-2 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE]">
                        <span>FP-01: Latent Fingerprint Lifted from Window Pane</span>
                        <span className="text-[#17252A]">Verified AFIS</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE]">
                        <span>TM-04: Crowbar Toolmark Impression</span>
                        <span className="text-[#17252A]">Matched CASE-002</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Crime Scene' && (
                  <div className="p-5 rounded-2xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-3 text-xs">
                    <h3 className="font-extrabold text-[#17252A] text-sm border-b border-[#B3E3DE] pb-2">Spatial GPS Coordinates & Crime Scene Plan</h3>
                    <div className="font-mono text-[#17252A] font-bold p-3 rounded-xl bg-[#FEFFFF] border border-[#B3E3DE]">
                      GPS: 12.9352° N, 77.6245° E (Indiranagar 10th Main)
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[#2B7A78] bg-[#FEFFFF] rounded-2xl border border-[#B3E3DE]">
                Select a case record from the left index to view details.
              </div>
            )}
          </div>
        </div>
      </WorkPanel>
    </div>
  );
}
