import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { HeatmapCard } from "@/components/dashboard/HeatmapCard";
import { TopDistrictsCard } from "@/components/dashboard/Charts";

export const Route = createFileRoute("/heatmap")({
  component: HeatmapPage,
  head: () => ({
    meta: [
      { title: "Crime Heatmap — CrimeLensAI" },
      { name: "description", content: "Karnataka statewide crime heatmap by district and risk score." },
    ],
  }),
});

function HeatmapPage() {
  return (
    <AppShell>
      <PageHeader title="Crime Heatmap" subtitle="Statewide risk visualisation across 31 districts" />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8"><HeatmapCard /></div>
        <div className="lg:col-span-4"><TopDistrictsCard /></div>
      </section>
    </AppShell>
  );
}
