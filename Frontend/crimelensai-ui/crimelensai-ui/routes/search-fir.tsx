import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { Search } from "lucide-react";

const firs = [
  { id: "FIR-2026-45892", type: "Theft", district: "Bengaluru City", status: "Open", date: "18 May 2026" },
  { id: "FIR-2026-45884", type: "Cyber Fraud", district: "Mysuru", status: "Investigating", date: "18 May 2026" },
  { id: "FIR-2026-45871", type: "Assault", district: "Belagavi", status: "Solved", date: "17 May 2026" },
  { id: "FIR-2026-45862", type: "Robbery", district: "Hubballi Dharwad", status: "Open", date: "17 May 2026" },
  { id: "FIR-2026-45855", type: "Burglary", district: "Shivamogga", status: "Investigating", date: "16 May 2026" },
];

const statusColor: Record<string, string> = { Open: "#EB5757", Investigating: "#F2994A", Solved: "#27AE60" };

export const Route = createFileRoute("/search-fir")({
  component: SearchFir,
  head: () => ({
    meta: [
      { title: "Search FIR — CrimeLensAI" },
      { name: "description", content: "Search and filter First Information Reports across Karnataka." },
    ],
  }),
});

function SearchFir() {
  return (
    <AppShell>
      <PageHeader title="Search FIR" subtitle="Full-text search across 2.15L reports" />
      <div className="glass-card p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-secondary)]" />
          <input placeholder="Search by FIR number, name, district, crime type..." className="h-12 w-full rounded-xl bg-white/[0.04] border border-white/10 pl-11 pr-4 text-sm placeholder:text-[color:var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/60" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["All", "Theft", "Cyber Crime", "Assault", "Robbery", "Fraud"].map((t, i) => (
            <button key={t} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${i === 0 ? "bg-[#2F80ED] text-white" : "bg-white/5 text-[color:var(--color-text-secondary)] hover:bg-white/10"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="glass-card p-5">
        <h3 className="text-[15px] font-bold">RECENT FIRs</h3>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--color-text-secondary)]">
              <th className="pb-3">FIR No.</th><th className="pb-3">Type</th><th className="pb-3">District</th><th className="pb-3">Date</th><th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {firs.map((f) => (
              <tr key={f.id} className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer">
                <td className="py-3 font-mono text-xs">{f.id}</td>
                <td className="py-3">{f.type}</td>
                <td className="py-3">{f.district}</td>
                <td className="py-3 text-[color:var(--color-text-secondary)]">{f.date}</td>
                <td className="py-3">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: `${statusColor[f.status]}25`, color: statusColor[f.status] }}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
