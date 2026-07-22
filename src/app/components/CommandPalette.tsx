import { Command } from "cmdk";
import { FolderOpen, User, Building2, Car, FileText, Sparkles, ClipboardList, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { id: string; label: string; meta: string; icon: LucideIcon; kind: string };

/* One unified, fuzzy-searchable list — cases, entities, documents and actions
   grouped by type with a small label. Never four separate search boxes. */
const groups: { heading: string; items: Item[] }[] = [
  {
    heading: "Cases",
    items: [
      { id: "c1", label: "PRM-4821 · Operation Vellum", meta: "Active", icon: FolderOpen, kind: "CASE" },
      { id: "c2", label: "PRM-4790 · Mahadevapura extortion", meta: "Open", icon: FolderOpen, kind: "CASE" },
    ],
  },
  {
    heading: "Entities",
    items: [
      { id: "e1", label: "R. Kumar", meta: "Person · Subject", icon: User, kind: "ENTITY" },
      { id: "e2", label: "Vellum Traders", meta: "Organisation", icon: Building2, kind: "ENTITY" },
      { id: "e3", label: "KA-05-MN-4812", meta: "Vehicle", icon: Car, kind: "ENTITY" },
    ],
  },
  {
    heading: "Documents",
    items: [
      { id: "d1", label: "UPI transaction statement", meta: "EV-00836 · Verified", icon: FileText, kind: "DOC" },
      { id: "d2", label: "Call detail record · 98452 11876", meta: "EV-00829", icon: FileText, kind: "DOC" },
    ],
  },
  {
    heading: "Actions",
    items: [
      { id: "a1", label: "Generate investigation report", meta: "PRM-4821", icon: Sparkles, kind: "ACTION" },
      { id: "a2", label: "Assign task to field unit", meta: "Whitefield division", icon: ClipboardList, kind: "ACTION" },
      { id: "a3", label: "Compare two entity timelines", meta: "Alibi / overlap", icon: ClipboardList, kind: "ACTION" },
    ],
  },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="anim-content fixed inset-0 z-50 grid place-items-start bg-black/55 pt-[16vh]"
      onMouseDown={onClose}
    >
      <div
        className="anim-content mx-auto w-[600px] overflow-hidden border border-pramaan-border-strong bg-pramaan-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Command loop className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-pramaan-text-secondary">
          <div className="flex items-center gap-2 border-b border-pramaan-border px-3 py-3">
            <Search size={16} className="text-pramaan-text-secondary" />
            <Command.Input
              autoFocus
              placeholder="Search cases, entities, documents, and actions…"
              className="w-full bg-transparent text-[12px] text-pramaan-text outline-none placeholder:text-pramaan-text-secondary"
            />
            <kbd className="font-mono text-[9px] text-pramaan-text-secondary">ESC</kbd>
          </div>
          <Command.List className="max-h-[52vh] overflow-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-[11px] text-pramaan-text-secondary">
              No matches. Try a case ID, entity name, or an action.
            </Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group.heading} heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${item.meta} ${item.kind}`}
                      onSelect={onClose}
                      className="flex cursor-pointer items-center gap-3 rounded-[2px] px-3 py-2 text-[12px] text-pramaan-text data-[selected=true]:bg-pramaan-hover"
                    >
                      <Icon size={14} className="text-pramaan-primary" />
                      <span className="flex-1">{item.label}</span>
                      <span className="font-mono text-[9px] text-pramaan-text-secondary">{item.meta}</span>
                      <span className="border border-pramaan-border px-1 font-mono text-[8px] uppercase text-pramaan-text-secondary">{item.kind}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
