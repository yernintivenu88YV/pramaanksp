import React, { useState } from 'react';
import { Shield, PhoneCall, MapPin, FileText, HelpCircle, Send, CheckCircle2, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';

const HELPLINES = [
  { title: 'Emergency Response Support', number: '112', desc: '24/7 Police Emergency Hotline (Toll-Free)', tone: 'bg-red-50 border-red-200 text-red-700' },
  { title: 'Karnataka State Police Control', number: '100', desc: 'Direct Control Room Dispatch', tone: 'bg-blue-50 border-blue-200 text-blue-800' },
  { title: 'National Cyber Crime Helpline', number: '1930', desc: 'Financial Fraud & Online Harassment Helpline', tone: 'bg-purple-50 border-purple-200 text-purple-800' },
  { title: 'Women & Child Helpline', number: '1091 / 1098', desc: 'Dedicated Protection & Support Assistance', tone: 'bg-emerald-50 border-emerald-200 text-emerald-800' }
];

const COMPLAINT_STEPS = [
  { step: '01', title: 'Visit Nearest Police Station', desc: 'Locate your local police station jurisdiction based on incident area.' },
  { step: '02', title: 'Submit Written Statement', desc: 'Provide clear incident details, date/time, stolen property list, or suspect description.' },
  { step: '03', title: 'Obtain Free Copy of FIR', desc: 'Under Section 154 CrPC, complainants are entitled to a free signed copy of the FIR.' },
  { step: '04', title: 'Track FIR Status Online', desc: 'Use your 18-digit CrimeNo on the KSP Citizen Portal to track investigation progress.' }
];

export default function HelpDeskView({ activeRole = 'ACP' }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaskara! Welcome to Karnataka State Police Citizen Support. How can we assist you today?' }
  ]);

  function handleAsk(e) {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');

    setTimeout(() => {
      let reply = 'For emergency assistance, please call 112 immediately. For e-complaints, visit your nearest police station with valid photo ID.';
      const lower = userMsg.toLowerCase();
      if (lower.includes('fir') || lower.includes('copy')) {
        reply = 'Under Section 154 CrPC, you can receive a free copy of your FIR at the police station immediately upon registration.';
      } else if (lower.includes('cyber') || lower.includes('fraud') || lower.includes('money')) {
        reply = 'For cyber fraud or unauthorized bank transactions, call 1930 immediately within the golden hour to freeze fraudulent transfers.';
      } else if (lower.includes('station') || lower.includes('bengaluru')) {
        reply = 'Bengaluru Central PS is located on Infantry Road. Mysuru Main PS is located near Suburban Bus Stand.';
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  }

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="PUBLIC PORTAL"
        title="KSP Citizen Support & Station Finder"
        actions={
          <a
            href="https://ksp.karnataka.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
          >
            KSP Official Website <ExternalLink size={14} className="text-[#3AAFA9]" />
          </a>
        }
      >
        <p className="text-xs text-[#2B7A78] font-medium mb-6">
          Official emergency helplines, FIR guidance, and citizen assistance portal for Karnataka State Police.
        </p>

        {/* Emergency Hotlines 4-Up Grid (From Screenshots) */}
        <div className="space-y-3 mb-8">
          <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
            <PhoneCall size={16} className="text-red-600" /> EMERGENCY HOTLINES
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HELPLINES.map((h) => (
              <div key={h.number} className={`p-4 rounded-2xl border ${h.tone} shadow-xs space-y-2`}>
                <span className="text-2xl font-black font-mono tracking-tight block">{h.number}</span>
                <h3 className="font-extrabold text-xs">{h.title}</h3>
                <p className="text-[11px] font-medium opacity-90">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Combined 2 Columns Layout: How to File an FIR (Left) + Citizen Automated Assistant (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column: How to File an FIR Complaint (7 cols) */}
          <div className="xl:col-span-7 space-y-4">
            <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
              <FileText size={16} className="text-[#3AAFA9]" /> HOW TO FILE AN FIR COMPLAINT
            </span>

            {/* 4 Complaint Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMPLAINT_STEPS.map((s) => (
                <div key={s.step} className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs flex items-start gap-3">
                  <span className="text-xl font-black font-mono text-[#3AAFA9] shrink-0">{s.step}</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#17252A]">{s.title}</h4>
                    <p className="text-xs text-[#2B7A78] font-medium mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Supreme Court Compliance Notice Box (From Screenshot 2 Bottom Left) */}
            <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
              <AlertTriangle size={18} className="shrink-0 text-amber-700 mt-0.5" />
              <div>
                <span className="font-black block text-[#17252A]">Supreme Court Compliance Notice:</span>
                <p className="text-[11px] font-medium text-amber-900 mt-0.5 leading-relaxed">
                  Citizens are never required to provide Aadhaar numbers to register an FIR. Any government photo ID (Voter ID, DL, Passport) is valid for verification.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Citizen Automated Assistant Chat (5 cols) */}
          <div className="xl:col-span-5 p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs flex flex-col justify-between min-h-[440px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                  <HelpCircle size={16} className="text-[#3AAFA9]" /> CITIZEN AUTOMATED ASSISTANT
                </span>
                <span className="text-[10px] font-mono text-[#2B7A78] font-bold">24/7 Citizen Bot</span>
              </div>

              {/* Chat Messages Stream */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 font-sans">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl text-xs font-semibold leading-relaxed shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-[#17252A] text-[#FEFFFF] ml-6 border border-[#3AAFA9]/40'
                        : 'bg-[#DEF2F1] text-[#17252A] mr-6 border border-[#B3E3DE]'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Ask Bar (From Screenshot 2 Bottom Right) */}
            <form onSubmit={handleAsk} className="pt-3 border-t border-[#B3E3DE] flex items-center gap-2">
              <div className="flex-1 bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about FIR filing, stations..."
                  className="w-full bg-transparent text-xs text-[#17252A] font-semibold outline-none placeholder-[#2B7A78]/60"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border border-[#3AAFA9]/40"
              >
                <Send size={13} className="text-[#3AAFA9]" /> Ask
              </button>
            </form>
          </div>

        </div>

      </WorkPanel>
    </div>
  );
}
