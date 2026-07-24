import React, { useState, useRef } from 'react';
import { api } from '../../api/client';

export function NLVoiceQueryBar() {
  const [query, setQuery] = useState('');
  const [voiceLang, setVoiceLang] = useState('kn');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSendQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    const res = await api.routeQuery(query);
    setLoading(false);

    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || res.data?.detail || 'Intent routing failed');
    }
  };

  const sendVoiceAudio = async (b64Audio) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await api.routeVoice(b64Audio, voiceLang);
    setLoading(false);

    if (res.ok && res.data) {
      if (res.data.transcript) {
        setTranscript(res.data.transcript);
        setQuery(res.data.transcript);
      }
      if (res.data.route) setResult(res.data.route);

      // Playback TTS audio if returned
      const b64 = res.data.tts && res.data.tts.audio_base64;
      if (b64) {
        try { new Audio('data:audio/wav;base64,' + b64).play(); } catch (e) {}
      }
    } else {
      setError(res.error || 'Voice transcription request failed');
    }
  };

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError('Browser microphone capture (MediaRecorder) is not supported.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = String(reader.result).split(',')[1] || '';
          sendVoiceAudio(b64);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      setError('Microphone access was denied or unavailable.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>ಸಂಭಾಷಣೆಯ ಹುಡುಕಾಟ</span>
          <span className="text-gray-500 font-normal">|</span>
          <span className="text-cyan-400">Conversational Intent Router & Bhashini Voice</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Unstructured bilingual Kannada/English natural language router with native Bhashini voice ASR and TTS playback.
        </p>
      </div>

      {/* Query Bar Container */}
      <div className="pramaan-card p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2">
            Natural Language Query (English or Kannada):
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="e.g. Find similar burglary cases to CASE-001 or Resolve identities for Mohammed Rafi"
            className="w-full bg-[#1b1f26] border border-white/10 text-white text-xs p-3 rounded-lg focus:outline-none focus:border-cyan-500"
          />
          <div className="text-[11px] text-gray-400 mt-2 space-y-1">
            <strong>Suggested Query Prompts:</strong>
            <div>• <em>Find similar burglary cases to CASE-001</em></div>
            <div>• <em>Resolve identities for Mohammed Rafi (9845012345) and Mohammad Rafi</em></div>
            <div>• <em>Who is linked to suspect CANON-0042?</em></div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendQuery}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 text-white font-bold text-xs rounded hover:bg-cyan-500 transition-colors shadow"
            >
              {loading ? 'Routing Query...' : 'Send Query'}
            </button>

            {/* Bhashini Voice Recorder */}
            <button
              onClick={toggleRecording}
              className={`px-4 py-2 text-white font-bold text-xs rounded transition-colors flex items-center gap-2 ${
                isRecording ? 'bg-red-600 animate-pulse' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isRecording ? '⏹ Stop & Transcribe' : '🎤 Speak (Bhashini Voice)'}
            </button>

            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              className="bg-[#1b1f26] text-white border border-white/10 text-xs px-2 py-1.5 rounded"
            >
              <option value="kn">Kannada (ಕನ್ನಡ)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {transcript && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded text-xs">
            🗣 <strong>Bhashini Heard:</strong> {transcript}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Intent Output Card */}
        {result && (
          <div className="bg-[#1b1f26] border border-white/10 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-xs text-gray-400">Classified Intent:</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-mono font-bold text-xs">
                {result.intent}
              </span>
            </div>

            <div className="text-xs space-y-3">
              {/* Structured Parameters Summary */}
              {result.classification && (
                <div className="rounded bg-[#0b0d10] p-3 border border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-gray-300">Structured Parameters:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    {Object.entries(result.classification).map(([key, val]) => (
                      <div key={key} className="flex flex-col bg-white/5 p-2 rounded">
                        <span className="text-gray-400 text-[10px]">{key}</span>
                        <span className="text-cyan-300 truncate">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RAG Summary Card */}
              {result.rag_summary && (
                <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300 whitespace-pre-wrap">
                  {result.rag_summary}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
