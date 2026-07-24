import React, { useState } from 'react';
import { Shield, PhoneCall, MapPin, FileText, HelpCircle, Send, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';

const HELPLINES = [
  { title: 'Emergency Response Support', number: '112', desc: '24/7 Police Emergency Hotline (Toll-Free)', tone: 'border-red-500/30 text-red-400 bg-red-500/10' },
  { title: 'Karnataka State Police Control', number: '100', desc: 'Direct Control Room Dispatch', tone: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { title: 'National Cyber Crime Helpline', number: '1930', desc: 'Financial Fraud & Online Harassment Helpline', tone: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { title: 'Women & Child Helpline', number: '1091 / 1098', desc: 'Dedicated Protection & Support Assistance', tone: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' }
];

const COMPLAINT_STEPS = [
  { step: '01', title: 'Visit Nearest Police Station', desc: 'Locate your local police station jurisdiction based on incident area.' },
  { step: '02', title: 'Submit Written Statement', desc: 'Provide clear incident details, date/time, stolen property list, or suspect description.' },
  { step: '03', title: 'Obtain Free Copy of FIR', desc: 'Under Section 154 CrPC, complainants are entitled to a free signed copy of the FIR.' },
  { step: '04', title: 'Track FIR Status Online', desc: 'Use your 18-digit CrimeNo on the KSP Citizen Portal to track investigation progress.' }
];

export default function HelpDeskView() {
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
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-auto">
      {/* Public Banner */}
      <div className="mb-6 rounded-xl border border-pramaan-primary/30 bg-pramaan-primary/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-pramaan-primary/20 text-pramaan-primary">
            <Shield size={26} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-pramaan-primary font-bold">Public Portal</span>
            <h1 className="text-xl font-bold text-pramaan-text">KSP Citizen Support & Station Finder</h1>
            <p className="text-xs text-pramaan-text-secondary">Official emergency helplines, FIR guidance, and citizen assistance portal.</p>
          </div>
        </div>

        <a
          href="https://ksp.karnataka.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-pramaan-primary/40 bg-pramaan-surface px-4 py-2 text-xs font-semibold text-pramaan-primary hover:bg-pramaan-elevated transition-colors"
        >
          KSP Official Website <ExternalLink size={14} />
        </a>
      </div>

      {/* Emergency Helplines 4-Up Grid */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-pramaan-text-secondary mb-3 flex items-center gap-2">
          <PhoneCall size={14} className="text-red-400" /> Emergency Hotlines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HELPLINES.map((h) => (
            <div key={h.number} className={`rounded-lg border p-4 ${h.tone}`}>
              <span className="text-2xl font-bold font-mono tracking-tight block mb-1">{h.number}</span>
              <h3 className="text-xs font-bold text-pramaan-text">{h.title}</h3>
              <p className="text-[11px] text-pramaan-text-secondary mt-1">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Grid: Complaint Steps & Citizen FAQ Chat */}
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Left Column: Complaint Steps */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-pramaan-text-secondary flex items-center gap-2">
            <FileText size={14} className="text-pramaan-primary" /> How to File an FIR Complaint
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMPLAINT_STEPS.map((s) => (
              <div key={s.step} className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4 flex gap-3">
                <span className="text-xl font-bold font-mono text-pramaan-primary shrink-0">{s.step}</span>
                <div>
                  <h3 className="text-sm font-semibold text-pramaan-text">{s.title}</h3>
                  <p className="text-xs text-pramaan-text-secondary mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold block">Supreme Court Compliance Notice:</span>
              Citizens are never required to provide Aadhaar numbers to register an FIR. Any government photo ID (Voter ID, DL, Passport) is valid for verification.
            </div>
          </div>
        </div>

        {/* Right Column: Citizen FAQ Assistant */}
        <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4 flex flex-col justify-between h-[420px]">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-pramaan-text-secondary mb-3 flex items-center gap-2">
              <HelpCircle size={14} className="text-pramaan-primary" /> Citizen Automated Assistant
            </h2>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-pramaan-primary/20 text-pramaan-text ml-6 border border-pramaan-primary/30'
                      : 'bg-pramaan-elevated text-pramaan-text-secondary mr-6 border border-pramaan-border'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAsk} className="mt-3 flex gap-2 pt-3 border-t border-pramaan-border">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about FIR filing, stations..."
              className="flex-1 rounded-md border border-pramaan-border bg-pramaan-elevated px-3 py-2 text-xs text-pramaan-text outline-none focus:border-pramaan-primary"
            />
            <Button type="submit" size="sm">
              <Send size={13} /> Ask
            </Button>
          </form>
        </div>
      </div>
    </WorkPanel>
  );
}
