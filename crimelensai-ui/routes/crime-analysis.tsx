import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import {
  CrimeDistributionCard,
  CrimeTrendCard,
  TopDistrictsCard,
} from "@/components/dashboard/Charts";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const yearly = [
  { y: "2019", solved: 120, pending: 40 },
  { y: "2020", solved: 145, pending: 55 },
  { y: "2021", solved: 165, pending: 48 },
  { y: "2022", solved: 172, pending: 60 },
  { y: "2023", solved: 195, pending: 52 },
  { y: "2024", solved: 210, pending: 45 },
  { y: "2025", solved: 224, pending: 38 },
];

export const Route = createFileRoute("/crime-analysis")({
  component: CrimeAnalysis,
  head: () => ({
    meta: [
      { title: "Crime Analysis — CrimeLensAI" },
      { name: "description", content: "Detailed crime analytics, trends and category distribution across Karnataka." },
    ],
  }),
});

function CrimeAnalysis() {
  return (
    <AppShell>
      <PageHeader title="Crime Analysis" subtitle="Multi-year trends, categories and district comparisons" />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7"><CrimeTrendCard /></div>
        <div className="lg:col-span-5"><CrimeDistributionCard /></div>
      </section>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 glass-card p-5">
          <h3 className="text-[15px] font-bold">SOLVED vs PENDING (Yearly, ×1000)</h3>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearly}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="y" stroke="#7A8BA0" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7A8BA0" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0D2747", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="solved" fill="#27AE60" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" fill="#F2994A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-4"><TopDistrictsCard /></div>
      </section>
    </AppShell>
  );
}
