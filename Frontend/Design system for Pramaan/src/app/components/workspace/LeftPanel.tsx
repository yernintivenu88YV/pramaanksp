import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  FolderSearch,
  FileStack,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { navItems, caseMeta } from "../../data/caseFile";

const icons: Record<string, typeof Clock> = {
  timeline: Clock,
  evidence: FolderSearch,
  files: FileStack,
  witnesses: Users,
  documents: FileText,
};

export function LeftPanel({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState("evidence");

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-pramaan-border bg-sidebar">
      <div className="border-b border-pramaan-border p-3">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-pramaan-text-secondary transition-colors hover:text-pramaan-text"
          style={{ fontSize: 12 }}
        >
          <ArrowLeft size={14} strokeWidth={1.75} /> All cases
        </button>
        <div className="font-mono text-pramaan-secondary" style={{ fontSize: 11 }}>
          {caseMeta.id}
        </div>
        <div className="mt-0.5 text-pramaan-text" style={{ fontSize: 14, fontWeight: 600 }}>
          {caseMeta.title}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-pramaan-critical/12 px-2 py-0.5 text-pramaan-critical" style={{ fontSize: 11, fontWeight: 500 }}>
            {caseMeta.status}
          </span>
          <span className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>
            Opened {caseMeta.opened}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-pramaan-text-secondary/70 transition-colors hover:text-pramaan-text"
          style={{ fontSize: 10, letterSpacing: "0.08em" }}
        >
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          CASE STRUCTURE
        </button>

        {open && (
          <nav className="mt-1 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = icons[item.key];
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-pramaan-primary/12 text-pramaan-text"
                      : "text-pramaan-text-secondary hover:bg-pramaan-elevated hover:text-pramaan-text"
                  }`}
                  style={{ fontSize: 13 }}
                >
                  <Icon size={16} strokeWidth={1.75} className={isActive ? "text-pramaan-primary" : ""} />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span
                    className={`rounded-md px-1.5 ${
                      isActive ? "bg-pramaan-primary/20 text-pramaan-secondary" : "bg-pramaan-panel text-pramaan-text-secondary"
                    }`}
                    style={{ fontSize: 10, fontWeight: 500 }}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <div className="border-t border-pramaan-border p-3">
        <div className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>
          Lead analyst
        </div>
        <div className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 500 }}>
          {caseMeta.lead}
        </div>
        <div className="mt-1 text-pramaan-text-secondary/70" style={{ fontSize: 10 }}>
          {caseMeta.classification}
        </div>
      </div>
    </aside>
  );
}
