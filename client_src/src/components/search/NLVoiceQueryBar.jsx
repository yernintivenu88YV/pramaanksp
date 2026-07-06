import React, { useState, useRef } from 'react';
import { api } from '../../api/client';
import { Mic, Sparkles, Send, Bot, RefreshCw, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-6 font-sans select-none">
      {/* Header Banner with Animated Glowing Orb */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FEFFFF] p-5 rounded-2xl border border-[#B3E3DE] shadow-xs">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#17252A] flex items-center gap-2">
            <span>ಸಂಭಾಷಣೆಯ ಹುಡುಕಾಟ</span>
            <span className="text-[#2B7A78] font-normal">|</span>
            <span className="text-[#3AAFA9]">Conversational Intent Router & Bhashini Voice</span>
          </h1>
          <p className="text-xs text-[#2B7A78] mt-1 font-medium">
            Bilingual Kannada/English natural language router with native Bhashini voice ASR and TTS playback.
          </p>
        </div>
      </div>

      {/* Query Bar Container */}
      <div className="bg-[#FEFFFF] border border-[#B3E3DE] p-6 rounded-2xl shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#17252A] mb-2 uppercase tracking-wider">
            Natural Language Query (English or Kannada):
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="e.g. Find similar burglary cases to CASE-001 or Resolve identities for Mohammed Rafi"
            className="w-full bg-[#DEF2F1]/50 border border-[#B3E3DE] text-[#17252A] text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#3AAFA9] font-medium placeholder-[#2B7A78]/60"
          />
          <div className="text-[11px] text-[#2B7A78] mt-2 space-y-1 font-mono font-medium">
            <strong>Suggested Query Prompts:</strong>
            <div>• <em>Find similar burglary cases to CASE-001</em></div>
            <div>• <em>Resolve identities for Mohammed Rafi (9845012345) and Mohammad Rafi</em></div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendQuery}
              disabled={loading}
              className="px-4 py-2.5 bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] font-bold text-xs rounded-full transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="animate-spin text-[#3AAFA9]" size={14} /> : <Send className="text-[#3AAFA9]" size={14} />}
              {loading ? 'Routing Query...' : 'Send Query'}
            </button>

            {/* Bhashini Voice Recorder */}
            <button
              onClick={toggleRecording}
              className={`px-4 py-2.5 text-white font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                isRecording ? 'bg-red-600 ring-2 ring-red-400/40 animate-pulse' : 'bg-[#2B7A78] hover:bg-[#17252A] border border-[#3AAFA9]'
              }`}
            >
              <Mic size={15} />
              {isRecording ? 'Stop & Transcribe' : 'Speak (Bhashini Voice)'}
            </button>

            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              className="bg-[#DEF2F1] text-[#17252A] border border-[#B3E3DE] text-xs px-3 py-2 rounded-full font-mono font-bold outline-none cursor-pointer"
            >
              <option value="kn">Kannada (ಕನ್ನಡ)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {transcript && (
          <div className="p-3.5 bg-[#DEF2F1] border border-[#3AAFA9]/40 text-[#17252A] rounded-xl text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#3AAFA9]" />
            <span>Bhashini Heard: {transcript}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Intent Output Card */}
        {result && (
          <div className="bg-[#DEF2F1]/40 border border-[#B3E3DE] rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-[#B3E3DE] pb-3">
              <span className="text-xs text-[#2B7A78] font-bold">Classified Intent:</span>
              <span className="px-3 py-1 bg-[#3AAFA9] text-[#17252A] rounded-full font-mono font-black text-xs shadow-xs">
                {result.intent}
              </span>
            </div>

            <div className="text-xs space-y-3">
              {result.rag_summary && (
                <div className="rounded-xl bg-[#FEFFFF] border border-[#B3E3DE] p-4 text-xs text-[#17252A] font-semibold leading-relaxed shadow-xs">
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
