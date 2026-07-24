import React, { useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { Sparkles, Mic, Globe, Send, Download, RefreshCw, FileText, Fingerprint, Share2, Copy } from 'lucide-react';
import { CitationPanel } from '../ui/CitationPanel.jsx';
import { api } from '../../api/client.js';

export default function AssistantView({ activeRole = 'ACP' }) {
  const [query, setQuery] = useState('Find similar burglary cases to CASE-001 in Kannada');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [exportNotice, setExportNotice] = useState(null);

  const suggestedPrompts = [
    'Find similar burglary cases to CASE-001',
    'Resolve identity pair Mohammed Rafi vs Mohammad Rafi',
    'Traverse associate network for CANON-0042',
    'ಮನೆಗಳ್ಳತನ ಪ್ರಕರಣ CASE-001 ಸಮಾನ ಅಪರಾಧಗಳನ್ನು ಹುಡುಕಿ'
  ];

  async function handleSendQuery(textToSend) {
    const targetText = textToSend || query;
    setPending(true);
    setError('');
    const res = await api.ragQuery(targetText);
    setPending(false);
    if (!res.ok) {
      setError(res.error || 'Assistant RAG query failed');
      return;
    }
    setResult(res.data);
  }

  const handleExportPDF = async () => {
    setExportNotice(null);
    const res = await api.exportDossierPdf('ASSISTANT-SESSION-01', 'CASE-001');
    if (res.ok) {
      setExportNotice({ type: 'success', text: 'Exported conversation dossier PDF successfully.' });
    } else {
      setExportNotice({ type: 'error', text: res.error || 'Failed to export dossier PDF' });
    }
  };

  return (
    <div className="space-y-5 anim-content">
      <WorkPanel
        eyebrow="Analyze Module"
        title="AI Investigation Assistant (Bilingual Voice & Text)"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pramaan-elevated border border-pramaan-border hover:border-pramaan-secondary/40 text-xs font-semibold text-pramaan-secondary transition-colors cursor-pointer"
            >
              <Download size={14} /> Export Conversation PDF
            </button>
          </div>
        }
      >
        {exportNotice && (
          <div className={`p-3 rounded-lg border text-xs mb-4 font-mono ${exportNotice.type === 'success' ? 'bg-pramaan-success/15 border-pramaan-success/30 text-pramaan-success' : 'bg-pramaan-critical/15 border-pramaan-critical/30 text-pramaan-critical'}`}>
            {exportNotice.text}
          </div>
        )}

        {/* Conversational Input Panel */}
        <div className="p-4 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pramaan-secondary shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask in Kannada or English: e.g. Find twin cases to CASE-001..."
              className="flex-1 bg-transparent text-sm text-pramaan-text placeholder-pramaan-text-secondary outline-none font-sans"
            />
            
            {/* Voice Input Sim */}
            <button
              type="button"
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isVoiceActive ? 'bg-pramaan-critical/20 text-pramaan-critical border-pramaan-critical/40 animate-pulse' : 'bg-pramaan-surface text-pramaan-text-secondary border-pramaan-border hover:text-pramaan-text'
              }`}
              title="Bhashini Voice Input (Microphone)"
            >
              <Mic size={16} />
            </button>

            {/* Send Button */}
            <button
              onClick={() => handleSendQuery()}
              disabled={pending}
              className="px-4 py-2 bg-pramaan-primary hover:bg-pramaan-primary-cyan text-pramaan-bg text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={13} /> {pending ? 'Routing...' : 'Send'}
            </button>
          </div>

          {/* Suggested Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-pramaan-border/60">
            <span className="text-[10px] font-mono uppercase text-pramaan-text-secondary font-semibold">
              Suggested Prompts:
            </span>
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(prompt);
                  handleSendQuery(prompt);
                }}
                className="text-[11px] font-mono bg-pramaan-surface hover:bg-pramaan-panel border border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Result & Assessment Panel */}
        {result ? (
          <div className="p-5 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pramaan-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-pramaan-secondary bg-pramaan-secondary/15 px-2 py-0.5 rounded border border-pramaan-secondary/30">
                  Detected Intent: {result.intent || 'hybrid-rag-search'}
                </span>
                <span className="text-xs font-mono text-pramaan-text-secondary">
                  Engine: <strong className="text-pramaan-text">AppSail Vector Router</strong>
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <span className="text-[11px] font-mono uppercase font-bold text-pramaan-text-secondary block">
                Evidence Synthesis & Citation Output:
              </span>
              <div className="p-4 rounded-lg bg-pramaan-surface border border-pramaan-border text-pramaan-text leading-relaxed space-y-2 font-sans">
                <p className="text-sm text-pramaan-text mb-4 leading-relaxed">{result.answer || result.rag_summary}</p>
                {result.citations && (
                  <CitationPanel 
                    citations={result.citations} 
                    evidence={result.evidence} 
                    confidenceScore={result.confidence_score} 
                  />
                )}
                {result.pipeline && (
                  <div className="mt-4 pt-4 border-t border-pramaan-border">
                    <span className="text-xs font-semibold px-2 py-1 bg-pramaan-surface border border-pramaan-border rounded-md text-pramaan-text-secondary">
                      Pipeline Used: {result.pipeline}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-pramaan-text-secondary bg-pramaan-elevated rounded-lg border border-pramaan-border">
            Type or speak a question to query Pramaan intelligence engine.
          </div>
        )}
      </WorkPanel>
    </div>
  );
}
