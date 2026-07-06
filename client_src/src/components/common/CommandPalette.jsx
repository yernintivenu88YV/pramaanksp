import React, { useState, useEffect, useRef } from 'react';
import {
  Search, LayoutDashboard, FolderKanban, Fingerprint, CopyCheck,
  MapPinned, Share2, Sparkles, ScrollText, HelpCircle, History,
  UserCheck, FileText, ArrowRight, X, Shield, Sliders, Zap, AlertTriangle, Check
} from 'lucide-react';

const ITEMS = [
  // Navigation Views
  { id: 'overview', title: 'Command Overview', sub: 'Watch floor situation brief & threat priority leaderboard', category: 'Views', icon: LayoutDashboard, badge: 'VIEW' },
  { id: 'cases', title: 'Case Register (FIR Database Lookup)', sub: 'Search 18-digit CrimeNo records & dossiers', category: 'Views', icon: FolderKanban, badge: 'VIEW' },
  { id: 'resolution', title: 'Identity Resolution (Pair Resolver)', sub: 'Fellegi-Sunter probabilistic suspect deduplication', category: 'Views', icon: Fingerprint, badge: 'VIEW' },
  { id: 'similar', title: 'Case Twin Intelligence (MO Match)', category: 'Views', icon: CopyCheck, badge: 'VIEW', sub: 'Multilingual vector signature similarity engine' },
  { id: 'history', title: 'Investigation History & Archives', sub: 'Saved court dossiers, AI logs & exports', category: 'Views', icon: History, badge: 'VIEW' },
  { id: 'map', title: 'Live Crime Map & Cell Towers', sub: 'BTS signal triangulation & spatial hotspot clusters', category: 'Views', icon: MapPinned, badge: 'VIEW' },
  { id: 'graph', title: 'Entity Graph Network Explorer', sub: 'Criminal network topology & Leiden communities', category: 'Views', icon: Share2, badge: 'VIEW' },
  { id: 'assistant', title: 'AI Investigation Assistant', sub: 'Bilingual Gemini LLM & Local TF-IDF RAG engine', category: 'Views', icon: Sparkles, badge: 'VIEW' },
  { id: 'audit', title: 'Audit & Compliance Ledger', sub: 'Tamper-evident access audit log & security policy', category: 'Views', icon: ScrollText, badge: 'VIEW' },
  { id: 'helpdesk', title: 'Public Citizen Help Desk', sub: 'Section 154 CrPC guidance & emergency hotlines', category: 'Views', icon: HelpCircle, badge: 'VIEW' },

  // Active FIR Cases
  { id: 'cases', caseId: 'CASE-001', title: 'CASE-001 — Indiranagar Burglary', sub: 'CrimeNo 104430006202600001 · Rear window forced entry · Gold & Cash Stolen', category: 'Cases', icon: FileText, badge: 'FIR' },
  { id: 'cases', caseId: 'CASE-002', title: 'CASE-002 — Koramangala Burglary', sub: 'CrimeNo 104430006202600002 · Crowbar rear entry · 82% Twin Match', category: 'Cases', icon: FileText, badge: 'FIR' },
  { id: 'cases', caseId: 'CASE-005', title: 'CASE-005 — Malleshwaram Vehicle Theft', sub: 'CrimeNo 104440008202600005 · KA-02-MB-1234 Motorcycle Stolen', category: 'Cases', icon: FileText, badge: 'FIR' },

  // Suspect Dossiers
  { id: 'resolution', suspectId: 'CANON-0042', title: 'CANON-0042 — Mohammed Rafi (Age 34)', sub: 'Priority Threat 87.4% · Active Court Warrant WAR-2026-001 · Accused in 3 Cases', category: 'Suspects', icon: UserCheck, badge: 'SUSPECT' },
  { id: 'resolution', suspectId: 'CANON-0044', title: 'CANON-0044 — S. Praveen Kumar (Age 38)', sub: 'Priority Threat 64.2% · Active Court Warrant WAR-2026-002 · KA-04-HE-5678', category: 'Suspects', icon: UserCheck, badge: 'SUSPECT' },

  // Quick Actions
  { id: 'cases', action: 'export_dossier', title: 'Generate Official Dossier PDF', sub: 'Export court-ready PDF file containing case facts & twin evidence', category: 'Actions', icon: Zap, badge: 'ACTION' },
  { id: 'assistant', action: 'voice_search', title: 'Voice Assistant (Bhashini AI)', sub: 'Speak investigation queries in Kannada or English', category: 'Actions', icon: Sparkles, badge: 'ACTION' }
];

const CATEGORIES = ['All', 'Views', 'Cases', 'Suspects', 'Actions'];

export function CommandPalette({ isOpen, onClose, onSelectView, onNavigate }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  const handleSelect = onNavigate || onSelectView;

  // Filter items based on query & category
  const filtered = ITEMS.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.sub && item.sub.toLowerCase().includes(q)) ||
      (item.caseId && item.caseId.toLowerCase().includes(q)) ||
      (item.suspectId && item.suspectId.toLowerCase().includes(q))
    );
  });

  // Reset selection index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          triggerItemSelect(filtered[selectedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, selectedIndex]);

  if (!isOpen) return null;

  function triggerItemSelect(item) {
    if (handleSelect) {
      handleSelect(item.id);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-16 sm:pt-24 bg-[#17252A]/50 backdrop-blur-sm p-3 sm:p-4 font-sans select-none">
      <div className="w-full max-w-2xl rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Search Input */}
        <div className="flex items-center gap-3 border-b border-[#B3E3DE] px-4 py-3.5 bg-[#FEFFFF] shrink-0">
          <Search size={18} className="text-[#2B7A78] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FIR CrimeNo, suspect names, views, or commands (⌘K)..."
            className="w-full bg-transparent text-xs sm:text-sm font-sans text-[#17252A] outline-none placeholder:text-[#2B7A78]/60 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#2B7A78] hover:text-[#17252A] p-1 cursor-pointer">
              <X size={14} />
            </button>
          )}
          <button onClick={onClose} className="rounded-lg bg-[#DEF2F1] p-1.5 text-[#2B7A78] hover:text-[#17252A] border border-[#B3E3DE] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-1.5 border-b border-[#B3E3DE] bg-[#DEF2F1] px-4 py-2 overflow-x-auto shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#17252A] text-[#FEFFFF] shadow-sm'
                  : 'bg-[#FEFFFF] text-[#2B7A78] hover:bg-[#B3E3DE]/30 border border-[#B3E3DE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Scrollable List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#FEFFFF]">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#2B7A78] space-y-2">
              <AlertTriangle size={24} className="mx-auto text-amber-500" />
              <p className="font-bold text-[#17252A]">No matching intelligence records found</p>
              <p className="text-[11px] text-[#2B7A78]">Try searching for "CASE-001", "Rafi", "Burglary", "Map", or "AI Assistant"</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => triggerItemSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#DEF2F1] border-[#3AAFA9] text-[#17252A] shadow-xs'
                      : 'border-transparent text-[#2B7A78] hover:bg-[#DEF2F1]/50 hover:text-[#17252A]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                      isSelected ? 'bg-[#17252A] text-[#3AAFA9] border-[#17252A]' : 'bg-[#DEF2F1] border-[#B3E3DE] text-[#2B7A78]'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs truncate ${isSelected ? 'text-[#17252A]' : 'text-[#17252A]'}`}>
                          {item.title}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${
                          item.badge === 'FIR' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          item.badge === 'SUSPECT' ? 'bg-red-50 text-red-700 border-red-300' :
                          item.badge === 'ACTION' ? 'bg-[#3AAFA9]/20 text-[#17252A] border-[#3AAFA9]/40' :
                          'bg-[#DEF2F1] text-[#2B7A78] border-[#3AAFA9]/40'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      {item.sub && <p className="text-[11px] text-[#2B7A78] truncate">{item.sub}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-[#2B7A78] hidden sm:inline">
                      Jump
                    </span>
                    <ArrowRight size={12} className={isSelected ? 'text-[#17252A]' : 'text-[#2B7A78]/50'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Keybinding Hints Bar */}
        <div className="border-t border-[#B3E3DE] px-4 py-2.5 text-[11px] font-mono text-[#2B7A78] flex flex-wrap items-center justify-between gap-2 bg-[#DEF2F1] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded-md bg-[#FEFFFF] border border-[#B3E3DE] px-1.5 py-0.5 text-[10px] text-[#17252A] font-bold">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-md bg-[#FEFFFF] border border-[#B3E3DE] px-1.5 py-0.5 text-[10px] text-[#17252A] font-bold">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded-md bg-[#FEFFFF] border border-[#B3E3DE] px-1.5 py-0.5 text-[10px] text-[#17252A] font-bold">Esc</kbd> Exit
            </span>
          </div>

          <span className="text-[#17252A] font-bold">Pramaan Omni-Search (⌘K)</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
