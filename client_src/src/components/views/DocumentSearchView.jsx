import React, { useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { Search, FileText, Download, Sparkles, RefreshCw, CheckCircle2, ArrowUpRight, ExternalLink, X, FileSearch } from 'lucide-react';
import { api } from '../../api/client.js';

const SAMPLE_FIRS = [
  {
    id: 'FIR-2026-0114',
    station: 'Indiranagar PS',
    title: 'Burglary & Window Break-in',
    date: '2026-01-14',
    queryText: 'Burglary modus operandi in Indiranagar rear window crowbar leverage',
    summary: 'Complainant reported burglary at residence in Indiranagar 10th Main. Entry made through rear window using crowbar tool. Gold jewelry and cash stolen.'
  },
  {
    id: 'FIR-2026-0118',
    station: 'Whitefield PS',
    title: 'Cyber Fraud & Phishing',
    date: '2026-01-18',
    queryText: 'Cyber financial phishing fraud protocol SOP Whitefield',
    summary: 'IT employee duped in APK screen sharing phishing scam. ₹4.2 Lakhs transferred via Hawala accounts.'
  },
  {
    id: 'FIR-2026-0120',
    station: 'Mysuru South PS',
    title: 'Hawala Money Laundering',
    date: '2026-01-20',
    queryText: 'Hawala money laundering syndicate Mysuru South',
    summary: 'Illegal hawala cash distribution network intercepted near Mysuru highway checkpoint.'
  },
  {
    id: 'FIR-2026-0122',
    station: 'Electronic City PS',
    title: 'Extortion & Threat',
    date: '2026-01-22',
    queryText: 'Extortion threat calls Electronic City tech park',
    summary: 'Business owner received extortion threats demanding ₹50 Lakhs via encrypted messaging app.'
  }
];

export default function DocumentSearchView({ activeRole = 'ACP' }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  async function handleSearch(overrideQuery) {
    const textToSearch = overrideQuery || query;
    if (!textToSearch.trim()) return;

    setPending(true);
    setError('');
    const res = await api.ragSearch(textToSearch);
    setPending(false);

    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || 'Document search failed');
    }
  }

  const handleDownloadSample = (fir) => {
    alert(`Downloading official KSP FIR record for ${fir.station} (${fir.id})...`);
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="ANALYZE MODULE"
        title="Semantic Document Search & FIR Repository"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <span className="text-xs font-mono font-bold text-[#2B7A78] bg-[#DEF2F1] px-3.5 py-1 rounded-full border border-[#3AAFA9]/40 flex items-center gap-1.5 shadow-xs">
              <FileText size={14} className="text-[#3AAFA9]" /> 2,003 FIRs Indexed
            </span>
          </div>
        }
      >
        <p className="text-xs text-[#2B7A78] font-medium mb-5">
          Search over <strong className="text-[#17252A] font-mono">2,003 indexed KSP FIR records</strong> ('fir_dataset.csv') using trained TF-IDF cosine vector matching & Gemini LLM.
        </p>

        {/* Section 1: SAMPLE OFFICIAL FIR FILES & QUICK QUERIES (Restored from Screenshot) */}
        <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/30 space-y-4 mb-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
            <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#3AAFA9]" /> SAMPLE OFFICIAL FIR FILES & QUICK QUERIES
            </span>
            <span className="text-[10px] font-mono text-[#2B7A78] font-semibold">
              Click to preview & search
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_FIRS.map((fir) => (
              <div
                key={fir.id}
                className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] hover:border-[#3AAFA9] hover:bg-[#DEF2F1] transition-all space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#3AAFA9]" />
                      <span className="font-extrabold text-xs text-[#17252A]">{fir.station}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadSample(fir)}
                      className="p-1 text-[#2B7A78] hover:text-[#17252A] cursor-pointer"
                      title="Download Official FIR Document"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  <h4 className="font-extrabold text-xs text-[#17252A] leading-snug">{fir.title}</h4>
                  <div className="text-[10px] font-mono text-[#2B7A78] font-bold">{fir.date}</div>
                </div>

                <div className="pt-2 border-t border-[#B3E3DE] flex items-center justify-between">
                  <button
                    onClick={() => setPreviewDoc(fir)}
                    className="text-[10px] font-mono font-bold text-[#2B7A78] hover:underline cursor-pointer"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      setQuery(fir.queryText);
                      handleSearch(fir.queryText);
                    }}
                    className="text-xs font-mono font-bold text-[#2B7A78] hover:text-[#17252A] flex items-center gap-1 cursor-pointer"
                  >
                    Search <ArrowUpRight size={13} className="text-[#3AAFA9]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Search Input Bar (Restored from Screenshot) */}
        <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-3 mb-6">
          <div className="flex items-center gap-3 bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl px-4 py-2.5 focus-within:border-[#3AAFA9]">
            <Search size={16} className="text-[#3AAFA9] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Search burglary modus operandi in Indiranagar or cyber theft protocols..."
              className="w-full bg-transparent text-xs text-[#17252A] font-semibold outline-none placeholder-[#2B7A78]/60"
            />
            <button
              onClick={() => handleSearch()}
              disabled={pending}
              className="px-5 py-2 rounded-lg bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 border border-[#3AAFA9]/40"
            >
              {pending ? <RefreshCw size={14} className="animate-spin text-[#3AAFA9]" /> : <Search size={14} className="text-[#3AAFA9]" />}
              <span>{pending ? 'Searching...' : 'Run RAG Search'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: RAG Search Results & Retrived Evidence Documents */}
        {error && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs font-mono font-bold text-red-700 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="p-6 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-5">
            {/* AI Summary Card */}
            <div className="p-4 rounded-xl bg-[#DEF2F1] border border-[#3AAFA9]/40 space-y-2">
              <div className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#3AAFA9]" /> AI EVIDENCE SYNTHESIS & RETRIEVAL SUMMARY
              </div>
              <p className="text-xs text-[#17252A] font-semibold leading-relaxed">
                {result.answer || result.rag_summary}
              </p>
            </div>

            {/* Retrieved Documents List */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-extrabold uppercase text-[#2B7A78] tracking-widest block">
                RETRIEVED FIR DOCUMENTS:
              </span>

              {result.evidence && result.evidence.length > 0 ? (
                <div className="space-y-3">
                  {result.evidence.map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/30 hover:border-[#3AAFA9] transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#3AAFA9]" />
                          <span className="font-extrabold text-xs text-[#17252A]">{doc.title || doc.document_id || doc.case_id}</span>
                        </div>
                        <span className="px-3 py-1 bg-[#2B7A78] text-white border border-[#3AAFA9] rounded-full font-mono font-black text-xs shadow-xs">
                          Cosine Vector Similarity: {Math.round((1 - (doc.distance || 0)) * 100)}% Match
                        </span>
                      </div>
                      <p className="text-xs text-[#2B7A78] font-medium leading-relaxed">
                        {doc.chunk_text || JSON.stringify(doc)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-[#2B7A78] bg-[#DEF2F1]/30 rounded-xl border border-[#B3E3DE]">
                  No matching FIR documents retrieved.
                </div>
              )}
            </div>
          </div>
        )}

      </WorkPanel>

      {/* Preview FIR Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-[#17252A]/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-[#FEFFFF] border border-[#B3E3DE] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#17252A]">{previewDoc.station} — Official Record</h3>
                <span className="font-mono text-xs text-[#2B7A78]">{previewDoc.id} • {previewDoc.date}</span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-[#2B7A78] hover:text-[#17252A] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#17252A] font-semibold leading-relaxed">
              {previewDoc.summary}
            </p>
            <div className="pt-2 flex justify-end gap-3 border-t border-[#B3E3DE]">
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 rounded-full bg-[#DEF2F1] text-[#2B7A78] text-xs font-bold cursor-pointer">
                Close Preview
              </button>
              <button
                onClick={() => {
                  setQuery(previewDoc.queryText);
                  handleSearch(previewDoc.queryText);
                  setPreviewDoc(null);
                }}
                className="px-5 py-2 rounded-full bg-[#17252A] text-white text-xs font-bold cursor-pointer border border-[#3AAFA9]"
              >
                Run RAG Search →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
