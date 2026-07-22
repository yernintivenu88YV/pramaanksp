import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { UserX } from "lucide-react";

const offenders = [
  { id: "RO-2841", name: "Suspect A. K.", district: "Bengaluru City", crimes: 14, last: "3 days ago", risk: "Extreme" },
  { id: "RO-2839", name: "Suspect R. M.", district: "Mysuru", crimes: 11, last: "1 week ago", risk: "High" },
  { id: "RO-2837", name: "Suspect P. S.", district: "Hubballi Dharwad", crimes: 9, last: "2 weeks ago", risk: "High" },
  { id: "RO-2834", name: "Suspect V. N.", district: "Belagavi", crimes: 8, last: "3 weeks ago", risk: "Medium" },
  { id: "RO-2830", name: "Suspect S. B.", district: "Shivamogga", crimes: 7, last: "1 month ago", risk: "Medium" },
  { id: "RO-2828", name: "Suspect H. G.", district: "Kalaburagi", crimes: 6, last: "1 month ago", risk: "Medium" },
];

const riskColor: Record<string, string> = { Extreme: "#EB5757", High: "#F2994A", Medium: "#F2C94C" };

export const Route = createFileRoute("/repeat-offenders")({
  component: RepeatOffenders,
  head: () => ({
    meta: [
      { title: "Repeat Offenders — CrimeLensAI" },
      { name: "description", content: "Track repeat offenders across Karnataka with risk scoring." },
    ],
  }),
});

function RepeatOffenders() {
  return (
    <AppShell>
      <PageHeader title="Repeat Offenders" subtitle="Individuals flagged by pattern-recognition models" />
      <div className="glass-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--color-text-secondary)]">
                <th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">District</th>
                <th className="pb-3">Total Crimes</th><th className="pb-3">Last Offence</th><th className="pb-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {offenders.map((o) => (
                <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="py-3 font-mono text-xs">{o.id}</td>
                  <td className="py-3 flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#EB5757]/15 text-[#EB5757]"><UserX className="h-4 w-4" /></div>
                    <span className="font-semibold">{o.name}</span>
                  </td>
                  <td className="py-3">{o.district}</td>
                  <td className="py-3 font-semibold tabular-nums">{o.crimes}</td>
                  <td className="py-3 text-[color:var(--color-text-secondary)]">{o.last}</td>
                  <td className="py-3">
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: `${riskColor[o.risk]}25`, color: riskColor[o.risk] }}>{o.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
