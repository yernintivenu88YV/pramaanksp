import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { AlertTriangle, Flame, MapPin, ShieldAlert, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Sev = "critical" | "high" | "medium" | "low";
const sevColor: Record<Sev, string> = {
  critical: "#EB5757",
  high: "#F2994A",
  medium: "#F2C94C",
  low: "#27AE60",
};

const alerts: Array<{ icon: LucideIcon; sev: Sev; title: string; loc: string; time: string }> = [
  { icon: ShieldAlert, sev: "critical", title: "Cyber Crime spike detected", loc: "Bengaluru City +28%", time: "10 minutes ago" },
  { icon: AlertTriangle, sev: "high", title: "Theft cases increased", loc: "Mysuru +14%", time: "25 minutes ago" },
  { icon: MapPin, sev: "medium", title: "New hotspot detected", loc: "Hubballi Dharwad", time: "1 hour ago" },
  { icon: Flame, sev: "high", title: "Fraud cases reported", loc: "Belagavi", time: "2 hours ago" },
  { icon: Bell, sev: "low", title: "Weekly report ready", loc: "State-wide", time: "5 hours ago" },
  { icon: ShieldAlert, sev: "critical", title: "Armed robbery reported", loc: "Kalaburagi", time: "6 hours ago" },
  { icon: AlertTriangle, sev: "medium", title: "Suspicious activity", loc: "Shivamogga", time: "8 hours ago" },
];

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({
    meta: [
      { title: "Alerts — CrimeLensAI" },
      { name: "description", content: "Real-time crime alerts and notifications for Karnataka." },
    ],
  }),
});

function AlertsPage() {
  return (
    <AppShell>
      <PageHeader title="Live Alerts" subtitle="Real-time incidents flagged by the intelligence engine" />
      <div className="glass-card p-5">
        <ul className="space-y-3">
          {alerts.map((a, i) => (
            <li key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: `${sevColor[a.sev]}25`, color: sevColor[a.sev] }}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-[color:var(--color-text-secondary)]">{a.loc}</div>
              </div>
              <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${sevColor[a.sev]}25`, color: sevColor[a.sev] }}>{a.sev}</span>
              <span className="text-xs text-[color:var(--color-text-secondary)] whitespace-nowrap">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
