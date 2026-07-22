import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { AiAssistantCard } from "@/components/dashboard/AiAssistantCard";

export const Route = createFileRoute("/ai-assistant")({
  component: AiPage,
  head: () => ({
    meta: [
      { title: "AI Assistant — CrimeLensAI" },
      { name: "description", content: "Conversational AI for crime data queries and case analysis." },
    ],
  }),
});

const history = [
  { q: "Show cyber crime cases in Bengaluru last month", t: "2 hours ago" },
  { q: "Which district has highest theft cases?", t: "Yesterday" },
  { q: "Compare solved vs unsolved trend for 2025", t: "2 days ago" },
  { q: "List repeat offenders in Mysuru", t: "3 days ago" },
];

function AiPage() {
  return (
    <AppShell>
      <PageHeader title="AI Assistant" subtitle="Ask CrimeLens anything about Karnataka crime data" />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[560px]"><AiAssistantCard /></div>
        <div className="glass-card p-5">
          <h3 className="text-[15px] font-bold">RECENT QUERIES</h3>
          <ul className="mt-4 space-y-3">
            {history.map((h, i) => (
              <li key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] cursor-pointer transition">
                <div className="text-sm">{h.q}</div>
                <div className="text-[10px] text-[color:var(--color-text-secondary)] mt-1">{h.t}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
