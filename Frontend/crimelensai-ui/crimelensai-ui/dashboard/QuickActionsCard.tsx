import { Building2, FilePlus, FileText, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: Array<{ icon: LucideIcon; label: string; color: string; bg: string }> = [
  { icon: FilePlus, label: "Add New FIR", color: "#2F80ED", bg: "#2F80ED" },
  { icon: FileText, label: "Generate Report", color: "#27AE60", bg: "#27AE60" },
  { icon: Send, label: "Send Alert", color: "#EB5757", bg: "#EB5757" },
  { icon: Building2, label: "View Stations", color: "#9B51E0", bg: "#9B51E0" },
];

export function QuickActionsCard() {
  return (
    <div className="glass-card p-5">
      <h3 className="text-[15px] font-bold">QUICK ACTIONS</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] p-3 hover:bg-white/[0.06] hover:-translate-y-0.5 transition text-left"
          >
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
              style={{ background: `${a.bg}25`, color: a.color }}
            >
              <a.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
