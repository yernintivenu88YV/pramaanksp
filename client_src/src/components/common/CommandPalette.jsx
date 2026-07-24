import React, { useState, useEffect } from 'react';
import { Search, FolderKanban, Fingerprint, MapPinned, Share2, Sparkles, ScrollText, ArrowRight, X } from 'lucide-react';
import { type } from '../../design/scale';

const COMMANDS = [
  { id: 'overview', title: 'Command Overview', category: 'Navigation', icon: LayoutIcon },
  { id: 'cases', title: 'Case Register (FIR Lookup)', category: 'Navigation', icon: FolderKanban },
  { id: 'resolution', title: 'Identity Resolution (Pair Resolver)', category: 'Navigation', icon: Fingerprint },
  { id: 'similar', title: 'Case Twin Intelligence (MO Match)', category: 'Navigation', icon: FolderKanban },
  { id: 'map', title: 'Live Crime Map & Cell Towers', category: 'Navigation', icon: MapPinned },
  { id: 'graph', title: 'Entity Graph Network Explorer', category: 'Navigation', icon: Share2 },
  { id: 'assistant', title: 'AI Investigation Assistant', category: 'Navigation', icon: Sparkles },
  { id: 'audit', title: 'Audit & Compliance Ledger', category: 'Navigation', icon: ScrollText },
];

function LayoutIcon(props) {
  return <FolderKanban {...props} />;
}

export function CommandPalette({ isOpen, onClose, onSelectView, onNavigate }) {
  const [query, setQuery] = useState('');
  const handleSelect = onNavigate || onSelectView;

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          /* Trigger via props */
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-pramaan-border bg-pramaan-surface shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-pramaan-border px-4 py-3 bg-pramaan-elevated">
          <Search size={18} className="text-pramaan-primary shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, suspects, views, or press Esc to close..."
            className="w-full bg-transparent text-sm text-pramaan-text outline-none placeholder:text-pramaan-text-secondary font-sans"
          />
          <button onClick={onClose} className="text-pramaan-text-secondary hover:text-pramaan-text p-1">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-pramaan-text-secondary">
              No matching commands or cases found.
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    if (handleSelect) handleSelect(cmd.id);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-pramaan-primary/15 hover:text-pramaan-primary"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-pramaan-primary shrink-0" />
                    <span className="font-semibold text-pramaan-text">{cmd.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-pramaan-text-secondary flex items-center gap-1">
                    Jump <ArrowRight size={10} />
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-pramaan-border px-4 py-2 text-[10px] text-pramaan-text-secondary font-mono flex items-center justify-between bg-pramaan-bg">
          <span>Pramaan Omni-Search (⌘K)</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
