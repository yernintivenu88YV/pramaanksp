import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/dashboard/AppShell";
import { KpiRow } from "@/components/dashboard/KpiRow";
import {
  CrimeDistributionCard,
  CrimeTrendCard,
  TopDistrictsCard,
} from "@/components/dashboard/Charts";
import { HeatmapCard } from "@/components/dashboard/HeatmapCard";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { LiveAlertsCard } from "@/components/dashboard/LiveAlertsCard";
import { AiAssistantCard } from "@/components/dashboard/AiAssistantCard";
import { WeeklyReportCard } from "@/components/dashboard/WeeklyReportCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "CrimeLensAI — SCRB Karnataka Crime Intelligence" },
      {
        name: "description",
        content:
          "CrimeLensAI: AI-powered crime intelligence dashboard for the Karnataka State Crime Records Bureau. Real-time FIR analytics, heatmaps, predictions and alerts.",
      },
      { property: "og:title", content: "CrimeLensAI — SCRB Karnataka" },
      {
        property: "og:description",
        content:
          "Enterprise AI crime intelligence platform for Karnataka police — analytics, heatmaps, predictions and live alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Dashboard() {
  return (
    <AppShell>
      <KpiRow />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5"><CrimeTrendCard /></div>
        <div className="lg:col-span-4"><CrimeDistributionCard /></div>
        <div className="lg:col-span-3"><TopDistrictsCard /></div>
      </section>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5"><HeatmapCard /></div>
        <div className="lg:col-span-4"><PredictionCard /></div>
        <div className="lg:col-span-3"><LiveAlertsCard /></div>
      </section>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5"><AiAssistantCard /></div>
        <div className="lg:col-span-4"><WeeklyReportCard /></div>
        <div className="lg:col-span-3"><QuickActionsCard /></div>
      </section>
    </AppShell>
  );
}
