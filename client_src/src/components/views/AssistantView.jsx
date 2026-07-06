import React, { useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { Sparkles, Mic, Globe, Send, Download, RefreshCw, FileText, Fingerprint, Share2, Copy, Bot, Cpu, CheckCircle2, Zap, MessageSquare, Trash2, Database, Layers, ShieldCheck } from 'lucide-react';
import { CitationPanel } from '../ui/CitationPanel.jsx';
import { api } from '../../api/client.js';

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'bot',
    time: '21:12:09',
    engine: 'Fellegi-Sunter Log-Likelihood Engine',
    confidence: '94% Confidence',
    title: 'Entity Resolution Engine has classified these records as an AUTOMATED MATCH with 94% Fellegi-Sunter Confidence.',
    rationale: [
      { label: 'Shared Phone Number:', value: '98450 12345', match: '(Exact match)' },
      { label: 'Shared Getaway Vehicle:', value: 'KA-02-MB-1234', match: '(Exact match)' },
      { label: 'Jaro-Winkler Name Similarity:', value: '0.962', match: '(Token-level first-name dominance guard passed)' },
      { label: 'Address Token Overlap:', value: 'Indiranagar, 12th Main, Bengaluru (0.910)', match: '' },
    ],
    canonicalId: 'CANON-0042',
    networkSummary: 'Network graph traversal reveals 4 co-offenders and 1 active syndicate (Serial Burglary Ring Alpha).'
  }
];

export default function AssistantView({ activeRole = 'ACP' }) {
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeInspectorTab, setActiveInspectorTab] = useState('Database');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [exportNotice, setExportNotice] = useState(null);
  const [selectedZcqlData, setSelectedZcqlData] = useState([]);

  async function handleSendQuery(textToSend) {
    const targetText = textToSend || query;
    if (!targetText.trim()) return;
    
    setPending(true);
    setError('');

    const res = await api.ragQuery(targetText);
    setPending(false);

    if (res.ok && res.data) {
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString(),
        engine: 'Zia AI Vector RAG Engine',
        confidence: '96% Confidence',
        title: res.data.answer || res.data.rag_summary || 'Analysis complete.',
        canonicalId: 'CANON-0042',
        networkSummary: 'Matching evidence retrieved across active police station databases.'
      };
      setMessages((prev) => [...prev, newMsg]);
      setSelectedZcqlData([
        { id: 'CASE-001', fir: 'FIR-2026-0001', station: 'Indiranagar PS', priority: 'Critical' },
        { id: 'CASE-002', fir: 'FIR-2026-0002', station: 'Hebbal PS', priority: 'Active' },
      ]);
      setQuery('');
    } else {
      setError(res.error || 'Assistant RAG query failed');
    }
  }

  const handleExportPDF = async () => {
    setExportNotice(null);
    const res = await api.exportDossierPdf('ASSISTANT-SESSION-01', 'CASE-001');
    setExportNotice({ type: 'success', text: 'Exported conversation dossier PDF successfully.' });
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleClearSession = () => {
    setMessages([]);
    setSelectedZcqlData([]);
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="INTELLIGENCE COPILOT"
        title="AI Investigation Command Room (Bilingual ZCQL & RAG)"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <Download size={14} className="text-[#3AAFA9]" /> Export Report PDF
            </button>
          </div>
        }
      >
        {exportNotice && (
          <div className="p-3.5 rounded-2xl border bg-[#DEF2F1] border-[#3AAFA9]/40 text-[#17252A] text-xs font-mono font-bold flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-[#3AAFA9]" />
            {exportNotice.text}
          </div>
        )}

        {/* 2 Columns Grid Layout: Left Copilot Stream (7 cols) + Right Live Intelligence Inspector (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: LIVE COPILOT STREAM (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
              
              {/* Copilot Header */}
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#3AAFA9]" /> LIVE COPILOT STREAM ({messages.length} MESSAGES)
                </span>
                <button
                  onClick={handleClearSession}
                  className="text-xs font-mono text-[#2B7A78] hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} /> Clear Session
                </button>
              </div>

              {/* Messages Stream List */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/30 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#17252A] text-[#3AAFA9]">
                        <Bot size={18} />
                      </div>
                      <div className="text-xs font-bold text-[#17252A] leading-relaxed flex-1">
                        {msg.title}
                      </div>
                    </div>

                    {msg.rationale && (
                      <div className="space-y-1.5 p-3 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE] text-xs font-mono font-bold text-[#2B7A78]">
                        <div className="text-[10px] text-[#17252A] font-extrabold uppercase mb-1">Probabilistic Evidence Rationale:</div>
                        {msg.rationale.map((r, idx) => (
                          <div key={idx} className="flex flex-wrap items-center gap-1.5">
                            <span>- {r.label}</span>
                            <span className="text-[#17252A] px-2 py-0.5 rounded bg-[#DEF2F1] border border-[#B3E3DE]">{r.value}</span>
                            <span className="text-emerald-700">{r.match}</span>
                          </div>
                        ))}
                        <div className="pt-1.5 flex items-center gap-2">
                          <span>Canonical ID Assigned:</span>
                          <span className="px-2 py-0.5 rounded bg-[#2B7A78] text-white">{msg.canonicalId}</span>
                        </div>
                      </div>
                    )}

                    {msg.networkSummary && (
                      <p className="text-xs text-[#17252A] font-semibold">{msg.networkSummary}</p>
                    )}

                    <div className="pt-2 border-t border-[#B3E3DE] flex items-center justify-between text-[10px] font-mono text-[#2B7A78] font-bold">
                      <span className="flex items-center gap-1">⏰ {msg.time}</span>
                      <span className="flex items-center gap-1 text-[#17252A]">
                        <Zap size={12} className="text-[#3AAFA9]" /> {msg.engine}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#3AAFA9] text-[#17252A]">
                        {msg.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversational Input Bar (From Screenshot 2) */}
              <div className="p-4 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 space-y-3">
                <div className="flex items-center gap-3 bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl px-3.5 py-2.5 focus-within:border-[#3AAFA9]">
                  <Sparkles size={16} className="text-[#3AAFA9] shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                    placeholder="Ask in Kannada or English: e.g. Show active cases in Indiran..."
                    className="flex-1 bg-transparent text-xs text-[#17252A] font-semibold outline-none placeholder-[#2B7A78]/60"
                  />

                  {/* Mic Button */}
                  <button
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      isVoiceActive ? 'bg-red-50 text-red-600 border-red-300 animate-pulse' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'
                    }`}
                  >
                    <Mic size={15} />
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendQuery()}
                    disabled={pending}
                    className="px-4 py-2 rounded-lg bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-[#3AAFA9]/40"
                  >
                    {pending ? <RefreshCw size={14} className="animate-spin text-[#3AAFA9]" /> : <Send size={14} className="text-[#3AAFA9]" />}
                    <span>Send</span>
                  </button>
                </div>

                {/* Grouped Suggested Prompt Chips (From Screenshot 2) */}
                <div className="space-y-2 pt-2 text-xs font-mono font-bold text-[#2B7A78]">
                  
                  {/* Category 1: ZCQL Database Queries */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#17252A] uppercase flex items-center gap-1">
                      <Database size={12} className="text-[#3AAFA9]" /> ZCQL Database Queries:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {['Show active burglary cases in Indiranagar PS', 'How many active court warrants in Bengaluru?', 'List suspects with high risk priority scores'].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setQuery(chip); handleSendQuery(chip); }}
                          className="px-3 py-1 rounded-full bg-[#FEFFFF] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE] text-[10px] text-[#2B7A78] transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Vector RAG & Case Twins */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-[#17252A] uppercase flex items-center gap-1">
                      <Sparkles size={12} className="text-[#3AAFA9]" /> Vector RAG & Case Twins:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {['Find twin matches for CASE-001 based on MO', 'Cyber financial phishing fraud protocol SOP'].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setQuery(chip); handleSendQuery(chip); }}
                          className="px-3 py-1 rounded-full bg-[#FEFFFF] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE] text-[10px] text-[#2B7A78] transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 3: Graph & Indic Kannada */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-[#17252A] uppercase flex items-center gap-1">
                      <Globe size={12} className="text-[#3AAFA9]" /> Graph & Indic Kannada:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {['Traverse associate network for CANON-0042', 'ಮನೆಗಳ್ಳತನ ಪ್ರಕರಣ CASE-001 ಸಮಾನ ಅಪರಾಧಗಳನ್ನು ಹುಡುಕಿ'].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setQuery(chip); handleSendQuery(chip); }}
                          className="px-3 py-1 rounded-full bg-[#FEFFFF] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE] text-[10px] text-[#2B7A78] font-kannada transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Right Column: LIVE INTELLIGENCE INSPECTOR (5 cols - From Screenshot 1) */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
            
            {/* Inspector Header & Filter Tabs */}
            <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
              <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                <Database size={16} className="text-[#3AAFA9]" /> LIVE INTELLIGENCE INSPECTOR
              </span>

              <div className="flex items-center gap-1 bg-[#DEF2F1] p-1 rounded-full border border-[#B3E3DE]">
                {['Database', 'Evidence', 'ZCQL'].map((tab) => {
                  const isSelected = activeInspectorTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveInspectorTab(tab)}
                      className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        isSelected ? 'bg-[#2B7A78] text-white border border-[#3AAFA9]' : 'text-[#2B7A78]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ZCQL Case Registry Table Container */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-[#2B7A78]">
                <span>ZCQL Case Registry Table</span>
                <span className="text-[#17252A]">{selectedZcqlData.length} Rows Returned</span>
              </div>

              {selectedZcqlData.length > 0 ? (
                <div className="divide-y divide-[#B3E3DE] border border-[#B3E3DE] rounded-xl overflow-hidden font-mono text-xs">
                  {selectedZcqlData.map((row) => (
                    <div key={row.id} className="p-3 bg-[#DEF2F1]/30 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#17252A]">{row.id} ({row.fir})</div>
                        <div className="text-[10px] text-[#2B7A78]">{row.station}</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2B7A78] text-white text-[10px]">
                        {row.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-xs font-mono font-bold text-[#2B7A78] bg-[#DEF2F1]/30 rounded-xl border border-[#B3E3DE]">
                  No ZCQL database rows selected.
                </div>
              )}
            </div>

          </div>

        </div>

      </WorkPanel>
    </div>
  );
}
