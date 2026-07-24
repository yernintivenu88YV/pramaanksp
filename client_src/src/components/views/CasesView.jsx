import React, { useState } from 'react';
import { cases } from '../../data/mock.js';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { Cite } from '../common/Cite.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { CaseDetailView } from '../cases/CaseDetailView.jsx';
import { Search, Filter, FileText, Download, CopyCheck, MapPin, Clock, X, ChevronRight } from 'lucide-react';

export default function CasesView({ activeRole = 'ACP' }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(cases[0]);
  const [activeTab, setActiveTab] = useState('Overview');

  const filteredCases = cases.filter((c) => {
    if (filterStatus !== 'all' && c.status.toLowerCase() !== filterStatus) return false;
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
    <div className="space-y-5 anim-content">
      <WorkPanel
        eyebrow="Investigate Module"
        title="Case Register & Dossier Workspace"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <span className="text-xs font-mono text-pramaan-text-secondary">
              {filteredCases.length} records
            </span>
          </div>
        }
      >
        {/* Search & Status Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 w-full md:w-80 bg-pramaan-elevated border border-pramaan-border rounded-lg px-3 py-1.5">
            <Search size={14} className="text-pramaan-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case ID, FIR number, title..."
              className="bg-transparent text-xs text-pramaan-text placeholder-pramaan-text-secondary outline-none w-full font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'active', 'escalated', 'review', 'closed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium capitalize transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-pramaan-primary text-pramaan-bg font-bold'
                    : 'bg-pramaan-elevated text-pramaan-text-secondary hover:text-pramaan-text border border-pramaan-border'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Master–Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Master Table Column (5 cols) */}
          <div className="lg:col-span-5 rounded-lg border border-pramaan-border bg-pramaan-elevated overflow-hidden">
            <div className="p-3 border-b border-pramaan-border bg-pramaan-surface text-[11px] font-mono font-semibold uppercase text-pramaan-text-secondary">
              Case Register Index ({filteredCases.length})
            </div>
            <div className="max-h-[560px] overflow-y-auto divide-y divide-pramaan-border">
              {filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-pramaan-primary/15 border-l-4 border-l-pramaan-primary' : 'hover:bg-pramaan-surface'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-pramaan-primary">{c.id}</span>
                        <span className="font-mono text-[10px] text-pramaan-text-secondary">{c.fir}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                            c.status === 'active'
                              ? 'bg-pramaan-success/15 text-pramaan-success'
                              : 'bg-pramaan-warning/15 text-pramaan-warning'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-pramaan-text truncate">{c.title}</h4>
                      <div className="text-[10px] text-pramaan-text-secondary font-mono flex items-center gap-2">
                        <span>{c.station}</span>
                        <span>•</span>
                        <span>{c.updated}</span>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-pramaan-text-secondary opacity-60 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedCase ? (
              <div className="p-5 rounded-lg border border-pramaan-border bg-pramaan-surface space-y-4">
                {/* Header & Main Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pramaan-border">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-pramaan-secondary font-semibold">
                      Case Workspace Detail
                    </span>
                    <h2 className="text-base font-bold text-pramaan-text flex items-center gap-2">
                      <span>{selectedCase.title}</span>
                      <span className="text-xs font-mono font-normal text-pramaan-text-secondary">({selectedCase.id})</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-pramaan-elevated hover:bg-pramaan-panel border border-pramaan-border text-xs font-semibold text-pramaan-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CopyCheck size={14} /> Find Twins
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-pramaan-primary hover:bg-pramaan-primary-cyan text-xs font-bold text-pramaan-bg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> Dossier PDF
                    </button>
                  </div>
                </div>

                {/* Detail Tabs Bar */}
                <div className="flex border-b border-pramaan-border gap-4 text-xs font-semibold">
                  {['Overview', 'Suspects', 'Twins', 'Timeline', 'Evidence/Audit'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                        activeTab === tab
                          ? 'border-pramaan-primary text-pramaan-primary font-bold'
                          : 'border-transparent text-pramaan-text-secondary hover:text-pramaan-text'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content Rendering */}
                {activeTab === 'Overview' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-pramaan-elevated border border-pramaan-border font-mono">
                      <div>
                        <span className="text-pramaan-text-secondary block text-[10px]">FIR NUMBER:</span>
                        <span className="text-pramaan-text font-bold">{selectedCase.fir}</span>
                      </div>
                      <div>
                        <span className="text-pramaan-text-secondary block text-[10px]">STATION:</span>
                        <span className="text-pramaan-text font-bold">{selectedCase.station}</span>
                      </div>
                      <div>
                        <span className="text-pramaan-text-secondary block text-[10px]">INVESTIGATION LEAD:</span>
                        <span className="text-pramaan-text font-bold">{selectedCase.lead}</span>
                      </div>
                      <div>
                        <span className="text-pramaan-text-secondary block text-[10px]">CRIME SEVERITY:</span>
                        <span className="text-pramaan-critical font-bold">{selectedCase.priority}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-pramaan-elevated border border-pramaan-border space-y-1">
                      <span className="text-[10px] font-mono text-pramaan-secondary font-semibold">
                        FIR Narrative (Original Kannada & English):
                      </span>
                      <p className="text-pramaan-text font-kannada leading-relaxed text-xs">
                        ಪ್ರಕರಣ ದಿನಾಂಕ {selectedCase.updated}: ಸಂಶಯಾಸ್ಪದ ವ್ಯಕ್ತಿಗಳ ಚಲನವಲನ ದಾಖಲಾಗಿದೆ. (Modus Operandi: Rear forced entry with crowbar).
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'Twins' && <CaseDetailView activeRole={activeRole} />}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-pramaan-text-secondary bg-pramaan-surface rounded-lg border border-pramaan-border">
                Select a case record from the left index to view details.
              </div>
            )}
          </div>
        </div>
      </WorkPanel>
    </div>
  );
}
