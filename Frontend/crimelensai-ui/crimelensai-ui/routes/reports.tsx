import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { WeeklyReportCard } from "@/components/dashboard/WeeklyReportCard";
import { Download, FileText } from "lucide-react";

const reports = [
  { name: "Monthly State Crime Summary — May 2026", size: "2.4 MB", type: "PDF" },
  { name: "Cyber Crime Deep Dive — Q1 2026", size: "3.1 MB", type: "PDF" },
  { name: "District Comparison Report", size: "1.8 MB", type: "XLSX" },
  { name: "Repeat Offender Analytics", size: "980 KB", type: "PDF" },
  { name: "Annual Crime Statistics — 2025", size: "5.6 MB", type: "PDF" },
  { name: "Weekly Ops Brief — Week 20", size: "620 KB", type: "PDF" },
];

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Reports — CrimeLensAI" },
      { name: "description", content: "Auto-generated crime intelligence reports for Karnataka SCRB." },
    ],
  }),
});

function ReportsPage() {
  return (
    <AppShell>
      <PageHeader title="Reports" subtitle="Auto-generated summaries and analytical briefs" />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-[15px] font-bold">GENERATED REPORTS</h3>
          <ul className="mt-4 divide-y divide-white/5">
            {reports.map((r) => (
              <li key={r.name} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#2F80ED]/15 text-[#2F80ED]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{r.name}</div>
                  <div className="text-[11px] text-[color:var(--color-text-secondary)]">{r.type} · {r.size}</div>
                </div>
                <button className="flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </li>
            ))}
          </ul>
        </div>
        <WeeklyReportCard />
      </section>
    </AppShell>
  );
}
