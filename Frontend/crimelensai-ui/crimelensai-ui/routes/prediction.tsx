import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { LiveAlertsCard } from "@/components/dashboard/LiveAlertsCard";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = Array.from({ length: 30 }, (_, i) => ({
  d: `D${i + 1}`,
  v: 240 + Math.round(Math.sin(i / 3) * 30 + i * 2),
}));

export const Route = createFileRoute("/prediction")({
  component: PredictionPage,
  head: () => ({
    meta: [
      { title: "AI Prediction — CrimeLensAI" },
      { name: "description", content: "30-day AI-driven crime forecasts by district and crime type." },
    ],
  }),
});

function PredictionPage() {
  return (
    <AppShell>
      <PageHeader title="AI Prediction" subtitle="Machine-learning forecasts for the next 30 days" />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4"><PredictionCard /></div>
        <div className="lg:col-span-8 glass-card p-5">
          <h3 className="text-[15px] font-bold">30-DAY FORECAST — Theft, Bengaluru Urban</h3>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9B51E0" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#9B51E0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="d" stroke="#7A8BA0" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7A8BA0" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0D2747", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="v" stroke="#9B51E0" strokeWidth={2.5} fill="url(#pf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LiveAlertsCard />
        <div className="glass-card p-5">
          <h3 className="text-[15px] font-bold">MODEL INSIGHTS</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between border-b border-white/5 pb-2"><span className="text-[color:var(--color-text-secondary)]">Model</span><span className="font-semibold">CrimeLens-Transformer v3.2</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span className="text-[color:var(--color-text-secondary)]">Training data</span><span className="font-semibold">2015 – 2025</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span className="text-[color:var(--color-text-secondary)]">Accuracy</span><span className="font-semibold text-[#27AE60]">91.4%</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span className="text-[color:var(--color-text-secondary)]">Last retrained</span><span className="font-semibold">2 days ago</span></li>
            <li className="flex justify-between"><span className="text-[color:var(--color-text-secondary)]">Features</span><span className="font-semibold">148</span></li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
