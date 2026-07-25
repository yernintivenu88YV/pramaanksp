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
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-16 sm:pt-24 bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-pramaan-border bg-pramaan-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Search Input */}
        <div className="flex items-center gap-3 border-b border-pramaan-border px-4 py-3.5 bg-pramaan-elevated/70 shrink-0">
          <Search size={18} className="text-pramaan-primary shrink-0 animate-pulse" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FIR CrimeNo, suspect names, views, or commands (⌘K)..."
            className="w-full bg-transparent text-sm font-sans text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/70"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-pramaan-text-secondary hover:text-pramaan-text p-1">
              <X size={14} />
            </button>
          )}
          <button onClick={onClose} className="rounded-md bg-pramaan-surface p-1 text-pramaan-text-secondary hover:text-pramaan-text border border-pramaan-border">
            <X size={16} />
          </button>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-1.5 border-b border-pramaan-border bg-pramaan-bg/60 px-4 py-2 overflow-x-auto shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-pramaan-primary text-pramaan-bg font-bold shadow-sm'
                  : 'bg-pramaan-surface text-pramaan-text-secondary hover:text-pramaan-text border border-pramaan-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Scrollable List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-pramaan-text-secondary space-y-2">
              <AlertTriangle size={24} className="mx-auto text-pramaan-warning/60" />
              <p className="font-semibold text-pramaan-text">No matching intelligence records found</p>
              <p className="text-[11px] text-pramaan-text-secondary">Try searching for "CASE-001", "Rafi", "Burglary", "Map", or "AI Assistant"</p>
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
                      ? 'bg-pramaan-primary/20 border-pramaan-primary text-pramaan-text shadow-sm'
                      : 'border-transparent text-pramaan-text-secondary hover:bg-pramaan-elevated hover:text-pramaan-text'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                      isSelected ? 'bg-pramaan-primary text-pramaan-bg border-pramaan-primary' : 'bg-pramaan-elevated border-pramaan-border text-pramaan-primary'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs truncate ${isSelected ? 'text-pramaan-primary font-bold' : 'text-pramaan-text'}`}>
                          {item.title}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                          item.badge === 'FIR' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                          item.badge === 'SUSPECT' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                          item.badge === 'ACTION' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                          'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      {item.sub && <p className="text-[11px] text-pramaan-text-secondary truncate">{item.sub}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono font-semibold text-pramaan-text-secondary hidden sm:inline">
                      Jump
                    </span>
                    <ArrowRight size={12} className={isSelected ? 'text-pramaan-primary' : 'text-pramaan-text-secondary/50'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Keybinding Hints Bar */}
        <div className="border-t border-pramaan-border px-4 py-2.5 text-[11px] font-mono text-pramaan-text-secondary flex flex-wrap items-center justify-between gap-2 bg-pramaan-bg/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-pramaan-surface border border-pramaan-border px-1.5 py-0.5 text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-pramaan-surface border border-pramaan-border px-1.5 py-0.5 text-[10px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-pramaan-surface border border-pramaan-border px-1.5 py-0.5 text-[10px]">Esc</kbd> Exit
            </span>
          </div>

          <span className="text-pramaan-primary font-bold">Pramaan Omni-Search (⌘K)</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
