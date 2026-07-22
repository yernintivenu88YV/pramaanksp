import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChevronRight, RefreshCw, Info } from "lucide-react";
import { activitySeries, alerts, cases } from "../../data/mock";
import { SeverityBadge } from "../severity";
import { type } from "../ui/scale";
import { WorkPanel } from "../ui/layout";
import { AiClaim, Confidence, type Evidence } from "../ui/ai";

const tooltipStyle = {
  background: "#1B1F26",
  border: "1px solid #23272E",
  borderRadius: 4,
  fontSize: 11,
  color: "#E8EAED",
} as const;

// Compact, neutral counters — no big-number cards, no up/down arrows.
const counters = [
  { label: "Active cases", value: "63" },
  { label: "Open alerts", value: "128" },
  { label: "Critical", value: "9" },
  { label: "Entities", value: "3,412" },
  { label: "Warrants pending", value: "5" },
  { label: "Sources online", value: "14" },
];

interface Finding {
  id: string;
  score: number;
  text: string;
  evidence: Evidence[];
}

const findings: Finding[] = [
  {
    id: "F-01",
    score: 92,
    text: "Wire-structuring activity in PRM-4821 escalated overnight — €412,000 moved through Aurora Holdings across four sub-threshold transfers consistent with layering.",
    evidence: [
      { id: "TXN-8841", label: "Transaction cluster", detail: "4 transfers, 22:04–23:51, all €98K–€110K" },
      { id: "ACC-4821", label: "Account ledger", detail: "Aurora Holdings · flagged 2026-07-14" },
    ],
  },
  {
    id: "F-02",
    score: 78,
    text: "A watchlisted device re-appeared near Metro Central, re-establishing a probable communication link between PRM-4809 and its suspected handler.",
    evidence: [
      { id: "IMEI-3590", label: "Device signal", detail: "Tower cluster MC-07 · 11:47 IST" },
      { id: "SIG-2231", label: "Signals feed", detail: "Prior co-location with node n1 (3×)" },
    ],
  },
  {
    id: "F-03",
    score: 64,
    text: "Entity “V. Marchetti” now bridges three open cases and is the most probable central coordinator across the financial and cyber clusters.",
    evidence: [
      { id: "LNK-1140", label: "Link engine", detail: "Appears in PRM-4821, PRM-4790, PRM-4758" },
      { id: "GRPH-77", label: "Graph centrality", detail: "Betweenness 0.41 (top 1%)" },
    ],
  },
];

// AI-scored alerts — each carries confidence + evidence.
const alertScores: Record<string, { score: number; evidence: Evidence[] }> = {
  "AL-9921": { score: 89, evidence: [{ id: "TXN-8841", label: "Transaction", detail: "€412K flagged pair" }] },
  "AL-9918": { score: 73, evidence: [{ id: "IMEI-3590", label: "Device", detail: "Watchlist re-connect" }] },
  "AL-9914": { score: 68, evidence: [{ id: "LNK-1140", label: "Link engine", detail: "Shared node across cases" }] },
  "AL-9902": { score: 97, evidence: [{ id: "ING-204", label: "Ingest", detail: "1,204 pages OCR complete" }] },
  "AL-9887": { score: 99, evidence: [{ id: "WRT-58", label: "Case ops", detail: "Judicial approval logged" }] },
  "AL-9871": { score: 55, evidence: [{ id: "BEH-11", label: "Behavior", detail: "6-jurisdiction login burst" }] },
};

export function OverviewView({ onOpenCase }: { onOpenCase?: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Briefing header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-pramaan-text" style={type.title}>
              Intelligence Briefing
            </h1>
            <span className="rounded bg-pramaan-elevated px-1.5 py-0.5 text-pramaan-secondary" style={type.micro}>
              AI-GENERATED
            </span>
          </div>
          <p className="tnum mt-0.5 font-mono text-pramaan-text-secondary" style={type.micro}>
            Generated 2026-07-19 08:14:22 IST · window 24h · model pramaan-analyst-3
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Confidence score={81} label="OVERALL" />
          <button className="flex items-center gap-1.5 rounded border border-pramaan-border bg-pramaan-surface px-2.5 py-1.5 text-pramaan-text-secondary transition-colors hover:border-pramaan-border-strong hover:text-pramaan-text" style={type.label}>
            <RefreshCw size={13} /> Regenerate
          </button>
        </div>
      </div>

      {/* Neutral counter strip */}
      <div className="tnum flex flex-wrap overflow-hidden rounded-lg border border-pramaan-border bg-pramaan-surface">
        {counters.map((c, i) => (
          <div key={c.label} className={`flex flex-1 items-baseline gap-2 px-4 py-2 ${i > 0 ? "border-l border-pramaan-border" : ""}`}>
            <span className="font-mono text-pramaan-text" style={{ fontSize: 15, fontWeight: 600 }}>
              {c.value}
            </span>
            <span className="text-pramaan-text-secondary/80 uppercase" style={type.eyebrow}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* Watch-floor grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Key findings — AI, evidence-first */}
        <div className="min-h-0 xl:col-span-5">
          <WorkPanel eyebrow="AI" title="Key Findings" className="h-full min-h-[320px]">
            <div className="flex flex-col gap-2.5">
              {findings.map((f) => (
                <AiClaim key={f.id} score={f.score} evidence={f.evidence}>
                  <span className="tnum mr-1.5 font-mono text-pramaan-text-secondary/70" style={type.micro}>
                    {f.id}
                  </span>
                  {f.text}
                </AiClaim>
              ))}
            </div>
          </WorkPanel>
        </div>

        {/* Priority queue + activity */}
        <div className="flex min-h-0 flex-col gap-4 xl:col-span-4">
          <WorkPanel
            eyebrow="Triage"
            title="Priority Queue"
            bodyClass="p-0"
            className="min-h-[200px] flex-1"
            actions={
              <button className="flex items-center gap-1 text-pramaan-secondary hover:text-pramaan-primary" style={type.micro}>
                All <ChevronRight size={12} />
              </button>
            }
          >
            {cases.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={onOpenCase}
                className="flex w-full items-center gap-2.5 border-b border-pramaan-border/60 px-3 py-2 text-left transition-colors last:border-0 hover:bg-pramaan-hover"
              >
                <SeverityBadge severity={c.priority} dotOnly />
                <div className="min-w-0 flex-1">
                  <span className="truncate text-pramaan-text" style={type.bodyStrong}>
                    {c.title}
                  </span>
                  <div className="tnum flex items-center gap-1.5 font-mono text-pramaan-text-secondary" style={type.micro}>
                    <span>{c.id}</span>
                    <span>·</span>
                    <span>{c.entities} ent</span>
                    <span>·</span>
                    <span>{c.updated}</span>
                  </div>
                </div>
                <span className="tnum w-8 text-right font-mono text-pramaan-text-secondary" style={type.micro}>
                  {c.progress}%
                </span>
              </button>
            ))}
          </WorkPanel>

          <WorkPanel eyebrow="Signal" title="Threat Activity · 7d" className="min-h-[160px] flex-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={130}>
              <AreaChart data={activitySeries} margin={{ left: -24, right: 4, top: 4, bottom: 0 }}>
                <CartesianGrid key="grid" strokeDasharray="2 4" stroke="#23272E" vertical={false} />
                <XAxis key="x" dataKey="day" stroke="#9AA0A6" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis key="y" stroke="#9AA0A6" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip key="tooltip" contentStyle={tooltipStyle} cursor={{ stroke: "#23272E" }} />
                <Area key="a1" type="monotone" dataKey="alerts" stroke="#4A9EFF" strokeWidth={1.5} fill="#4A9EFF" fillOpacity={0.1} isAnimationActive={false} />
                <Area key="a2" type="monotone" dataKey="resolved" stroke="#9AA0A6" strokeWidth={1.5} fill="#9AA0A6" fillOpacity={0.06} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </WorkPanel>
        </div>

        {/* Live alert stream — AI-scored */}
        <div className="min-h-0 xl:col-span-3">
          <WorkPanel eyebrow="Feed" title="Alert Stream" bodyClass="p-0" className="h-full min-h-[320px]">
            {alerts.map((a) => {
              const meta = alertScores[a.id] ?? { score: 60, evidence: [] };
              const open = expanded === a.id;
              return (
                <div key={a.id} className="border-b border-pramaan-border/60 last:border-0">
                  <div className="flex items-start gap-2.5 px-3 py-2">
                    <span className="mt-1"><SeverityBadge severity={a.severity} dotOnly /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-pramaan-text" style={type.body}>
                        {a.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Confidence score={meta.score} />
                        <button
                          onClick={() => setExpanded(open ? null : a.id)}
                          className="ml-auto flex items-center gap-1 text-pramaan-secondary hover:text-pramaan-primary"
                          style={type.micro}
                        >
                          <Info size={11} strokeWidth={2} /> Why
                        </button>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div className="border-t border-pramaan-border bg-pramaan-elevated/30 px-3 py-2">
                      <p className="text-pramaan-text-secondary" style={type.caption}>
                        {a.detail}
                      </p>
                      {meta.evidence.map((e) => (
                        <div key={e.id} className="tnum mt-1 flex items-center gap-2 font-mono text-pramaan-text-secondary" style={type.micro}>
                          <span className="text-pramaan-secondary">{e.id}</span>
                          <span>{e.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </WorkPanel>
        </div>
      </div>
    </div>
  );
}
