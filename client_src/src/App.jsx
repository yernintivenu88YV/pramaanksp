import React, { useState } from 'react';
import { getApiRole, setApiRole } from './api/client';
import { RoleBadge } from './components/common/RoleSelector';
import { CommandDashboard } from './components/dashboard/CommandDashboard';
import { CaseDetailView } from './components/cases/CaseDetailView';
import { EntityResolutionView } from './components/resolution/EntityResolutionView';
import { NetworkGraphExplorer } from './components/graph/NetworkGraphExplorer';
import { NLVoiceQueryBar } from './components/search/NLVoiceQueryBar';
import { PublicHelpDesk } from './components/helpdesk/PublicHelpDesk';

export default function App() {
  const [activeRole, setActiveRole] = useState(getApiRole());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPublicMode, setIsPublicMode] = useState(false);

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    setApiRole(newRole);
  };

  if (isPublicMode) {
    return (
      <div className="bg-[#0b0d10] min-h-screen text-[#e8eaed]">
        <div className="bg-[#14171c] border-b border-white/10 p-3 flex justify-between items-center max-w-4xl mx-auto">
          <span className="text-xs text-cyan-400 font-bold font-mono">Public Mode Active</span>
          <button
            onClick={() => setIsPublicMode(false)}
            className="px-3 py-1 bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded text-xs font-bold hover:bg-cyan-600/50"
          >
            🔒 Return to Authenticated Command Center
          </button>
        </div>
        <PublicHelpDesk />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e8eaed] font-sans flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#14171c] border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-base">PRAMAAN</span>
              <span className="text-xs text-gray-400">ಪ್ರಮಾಣ</span>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                KSP OS v3.2
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              Karnataka State Police Crime Intelligence Platform
            </div>
          </div>
        </div>

        {/* Security Controls & Public Mode Switch */}
        <div className="flex flex-wrap items-center gap-4">
          <RoleBadge currentRole={activeRole} onRoleChange={handleRoleChange} />
          <button
            onClick={() => setIsPublicMode(true)}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 border border-white/10 rounded text-xs hover:bg-gray-700 transition-colors"
          >
            🌐 Public Citizen Desk
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="bg-[#14171c]/80 border-b border-white/10 px-6 py-2 flex flex-wrap gap-2 sticky top-[57px] z-30 backdrop-blur">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1b1f26]'
          }`}
        >
          📊 Command Dashboard
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            activeTab === 'cases'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1b1f26]'
          }`}
        >
          📂 Case Detail & Signature Twin
        </button>

        <button
          onClick={() => setActiveTab('resolution')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            activeTab === 'resolution'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1b1f26]'
          }`}
        >
          🔍 Identity Resolution
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            activeTab === 'graph'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1b1f26]'
          }`}
        >
          🕸️ Network Graph Explorer
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            activeTab === 'search'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1b1f26]'
          }`}
        >
          🗣️ NL & Voice Router
        </button>
      </nav>

      {/* Main View Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <CommandDashboard activeRole={activeRole} />}
        {activeTab === 'cases' && <CaseDetailView activeRole={activeRole} />}
        {activeTab === 'resolution' && <EntityResolutionView activeRole={activeRole} />}
        {activeTab === 'graph' && <NetworkGraphExplorer activeRole={activeRole} />}
        {activeTab === 'search' && <NLVoiceQueryBar activeRole={activeRole} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-3 text-center text-xs text-gray-500">
        Karnataka State Police Datathon 2026 · Pramaan Crime Intelligence System · Security Clearance: {activeRole}
      </footer>
    </div>
  );
}
