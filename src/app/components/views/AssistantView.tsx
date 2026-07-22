import { useState } from "react";
import {
  Sparkles,
  FileDown,
  Copy,
  CornerDownLeft,
  FileText,
  ScrollText,
  Users,
  Clock,
  Share2,
  Compass,
  Gauge,
  Check,
} from "lucide-react";
import {
  sampleQuery,
  sources,
  executiveSummary,
  evidenceItems,
  relatedFIRs,
  relatedPersons,
  timelineEvents,
  graphLinks,
  nextSteps,
  overallConfidence,
  type Sentence,
  type Conf,
  type Source,
} from "../../data/assistant";

const confMeta: Record<Conf, { label: string; color: string; bg: string; dot: string }> = {
  high: { label: "High", color: "text-pramaan-success", bg: "bg-pramaan-success/12", dot: "bg-pramaan-success" },
  medium: { label: "Medium", color: "text-pramaan-warning", bg: "bg-pramaan-warning/12", dot: "bg-pramaan-warning" },
  low: { label: "Low", color: "text-pramaan-critical", bg: "bg-pramaan-critical/12", dot: "bg-pramaan-critical" },
};

// Numbered citation marker that expands to reveal the source record.
function Cite({ n, open, onToggle }: { n: number; open: boolean; onToggle: () => void }) {
  const src = sources.find((s) => s.id === n);
  return (
    <span className="relative">
      <sup>
        <button
          onClick={onToggle}
          className={`mx-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded px-1 align-super transition-colors ${
            open ? "bg-pramaan-primary text-pramaan-text" : "bg-pramaan-primary/15 text-pramaan-secondary hover:bg-pramaan-primary/30"
          }`}
          style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}
        >
          {n}
        </button>
      </sup>
      {open && src && (
        <span className="absolute left-0 top-5 z-20 block w-72 rounded-lg border border-pramaan-border bg-pramaan-elevated p-3 text-left shadow-lg">
          <span className="flex items-center gap-2">
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded bg-pramaan-primary/15 px-1 text-pramaan-secondary" style={{ fontSize: 9, fontWeight: 600 }}>
              {src.id}
            </span>
            <span className="text-pramaan-text" style={{ fontSize: 12, fontWeight: 600 }}>
              {src.label}
            </span>
          </span>
          <span className="mt-1 block text-pramaan-text-secondary" style={{ fontSize: 10.5 }}>
            {src.kind} · <span className="font-mono">{src.ref}</span> · {src.date}
          </span>
          <span className="mt-1.5 block text-pramaan-text-secondary" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            {src.excerpt}
          </span>
        </span>
      )}
    </span>
  );
}

function Fact({
  s,
  openCite,
  setOpenCite,
}: {
  s: Sentence;
  openCite: string | null;
  setOpenCite: (k: string | null) => void;
}) {
  return (
    <span>
      <span className="text-pramaan-text/90">{s.text}</span>
      {s.cites.map((c, i) => {
        const key = `${s.text.slice(0, 8)}-${c}-${i}`;
        return (
          <Cite key={key} n={c} open={openCite === key} onToggle={() => setOpenCite(openCite === key ? null : key)} />
        );
      })}
    </span>
  );
}

function SectionHeader({ icon: Icon, n, title }: { icon: typeof FileText; n: number; title: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-pramaan-elevated text-pramaan-secondary">
        <Icon size={14} strokeWidth={1.75} />
      </div>
      <h3 className="text-pramaan-text" style={{ fontSize: 14, fontWeight: 600 }}>
        {n}. {title}
      </h3>
    </div>
  );
}

function ConfPill({ level }: { level: Conf }) {
  const c = confMeta[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 ${c.bg} ${c.color}`} style={{ fontSize: 11, fontWeight: 500 }}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function AssistantView() {
  const [query, setQuery] = useState(sampleQuery);
  const [submitted, setSubmitted] = useState(sampleQuery);
  const [openCite, setOpenCite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fp = { openCite, setOpenCite };

  const copyCitation = () => {
    const text = sources.map((s) => `[${s.id}] ${s.label} — ${s.kind}, ${s.ref} (${s.date})`).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5" onClick={() => setOpenCite(null)}>
      {/* Command input */}
      <div
        className="rounded-xl border border-pramaan-border bg-pramaan-surface p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2.5">
          <Sparkles size={18} strokeWidth={1.75} className="mt-2 shrink-0 text-pramaan-secondary" />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setSubmitted(query);
              }
            }}
            rows={2}
            placeholder="Ask an investigative question in natural language…"
            className="flex-1 resize-none bg-transparent py-1.5 text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/60"
            style={{ fontSize: 14, lineHeight: 1.5 }}
          />
          <button
            onClick={() => setSubmitted(query)}
            className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-pramaan-primary px-3.5 py-2 text-pramaan-text transition-colors hover:bg-pramaan-secondary"
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            Analyze
            <CornerDownLeft size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Report card */}
      <div className="rounded-xl border border-pramaan-border bg-pramaan-surface" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-pramaan-border p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-pramaan-secondary" style={{ fontSize: 12, fontWeight: 500 }}>
              <Sparkles size={14} strokeWidth={1.75} />
              AI Investigation Report
            </div>
            <p className="mt-1.5 text-pramaan-text" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>
              {submitted}
            </p>
            <div className="mt-1.5 text-pramaan-text-secondary" style={{ fontSize: 12 }}>
              Synthesized from {sources.length} source records · 19 Jul 2026, 14:24 · Assessment confidence {overallConfidence}%
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-pramaan-border px-3 py-2 text-pramaan-text-secondary transition-colors hover:text-pramaan-text" style={{ fontSize: 12, fontWeight: 500 }}>
              <FileDown size={14} strokeWidth={1.75} />
              Export PDF
            </button>
            <button
              onClick={copyCitation}
              className="flex items-center gap-1.5 rounded-lg border border-pramaan-border px-3 py-2 text-pramaan-text-secondary transition-colors hover:text-pramaan-text"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              {copied ? <Check size={14} strokeWidth={2} className="text-pramaan-success" /> : <Copy size={14} strokeWidth={1.75} />}
              {copied ? "Copied" : "Copy Citation"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-7 p-5">
          {/* 1. Executive Summary */}
          <section>
            <SectionHeader icon={FileText} n={1} title="Executive Summary" />
            <div className="flex flex-col gap-2" style={{ fontSize: 13.5, lineHeight: 1.75 }}>
              {executiveSummary.map((s, i) => (
                <p key={i}>
                  <Fact s={s} {...fp} />
                </p>
              ))}
            </div>
          </section>

          {/* 2. Evidence */}
          <section>
            <SectionHeader icon={ScrollText} n={2} title="Evidence" />
            <div className="flex flex-col gap-2">
              {evidenceItems.map((e) => (
                <div key={e.title} className="rounded-lg border border-pramaan-border/60 bg-pramaan-elevated p-3.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 500 }}>
                      {e.title}
                    </span>
                    <ConfPill level={e.strength} />
                  </div>
                  <p className="text-pramaan-text-secondary" style={{ fontSize: 13, lineHeight: 1.7 }}>
                    <Fact s={e.detail} {...fp} />
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Confidence */}
          <section>
            <SectionHeader icon={Gauge} n={3} title="Confidence" />
            <div className="rounded-lg border border-pramaan-border/60 bg-pramaan-elevated p-4">
              <div className="flex items-end gap-2">
                <span className="text-pramaan-text" style={{ fontSize: 26, fontWeight: 600 }}>
                  {overallConfidence}%
                </span>
                <span className="mb-1.5 text-pramaan-success" style={{ fontSize: 12, fontWeight: 500 }}>
                  High confidence
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-pramaan-panel">
                <div className="h-full rounded-full bg-pramaan-success" style={{ width: `${overallConfidence}%` }} />
              </div>
              <p className="mt-3 text-pramaan-text-secondary" style={{ fontSize: 12.5, lineHeight: 1.65 }}>
                Financial and registry evidence is deterministic and strongly corroborated. The primary residual
                uncertainty is the beneficial-control link, currently probabilistic at 94%, and the provisional
                Fenwick association resting on a single field report.
              </p>
            </div>
          </section>

          {/* 4. Related FIRs */}
          <section>
            <SectionHeader icon={ScrollText} n={4} title="Related FIRs" />
            <div className="flex flex-col gap-2">
              {relatedFIRs.map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3.5 py-2.5">
                  <span className="font-mono text-pramaan-secondary" style={{ fontSize: 12 }}>{f.id}</span>
                  <span className="text-pramaan-text" style={{ fontSize: 13 }}>
                    {f.title}
                    {f.cites.map((c, i) => (
                      <Cite key={i} n={c} open={openCite === `fir-${f.id}-${c}`} onToggle={() => setOpenCite(openCite === `fir-${f.id}-${c}` ? null : `fir-${f.id}-${c}`)} />
                    ))}
                  </span>
                  <span className="ml-auto text-pramaan-text-secondary" style={{ fontSize: 11 }}>{f.station}</span>
                  <span className="rounded bg-pramaan-panel px-1.5 py-0.5 text-pramaan-text-secondary" style={{ fontSize: 10.5 }}>{f.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Related Persons */}
          <section>
            <SectionHeader icon={Users} n={5} title="Related Persons" />
            <div className="flex flex-col gap-2">
              {relatedPersons.map((p) => (
                <div key={p.name} className="flex items-center gap-3 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3.5 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pramaan-primary/12 text-pramaan-secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                    {p.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-pramaan-text" style={{ fontSize: 13 }}>
                    {p.name}
                    {p.cites.map((c, i) => (
                      <Cite key={i} n={c} open={openCite === `p-${p.name}-${c}`} onToggle={() => setOpenCite(openCite === `p-${p.name}-${c}` ? null : `p-${p.name}-${c}`)} />
                    ))}
                  </span>
                  <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>{p.role}</span>
                  <span className="ml-auto"><ConfPill level={p.conf} /></span>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Timeline */}
          <section>
            <SectionHeader icon={Clock} n={6} title="Timeline" />
            <div className="relative pl-5">
              <div className="absolute bottom-1 left-[5px] top-1 w-px bg-pramaan-border" />
              {timelineEvents.map((t, i) => (
                <div key={i} className="relative pb-4 last:pb-0">
                  <span className="absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full border-2 border-pramaan-surface bg-pramaan-primary" />
                  <div className="font-mono text-pramaan-text-secondary" style={{ fontSize: 11 }}>{t.date} · {t.time}</div>
                  <div className="text-pramaan-text" style={{ fontSize: 13 }}>
                    {t.text}
                    {t.cites.map((c, j) => (
                      <Cite key={j} n={c} open={openCite === `tl-${i}-${c}`} onToggle={() => setOpenCite(openCite === `tl-${i}-${c}` ? null : `tl-${i}-${c}`)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Graph Links */}
          <section>
            <SectionHeader icon={Share2} n={7} title="Graph Links" />
            <div className="flex flex-col gap-2">
              {graphLinks.map((g, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3.5 py-2.5" style={{ fontSize: 13 }}>
                  <span className="rounded-md bg-pramaan-panel px-2 py-0.5 text-pramaan-text">{g.from}</span>
                  <span className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>— {g.rel} →</span>
                  <span className="rounded-md bg-pramaan-panel px-2 py-0.5 text-pramaan-text">{g.to}</span>
                  <span className="ml-auto">
                    {g.cites.map((c, j) => (
                      <Cite key={j} n={c} open={openCite === `gl-${i}-${c}`} onToggle={() => setOpenCite(openCite === `gl-${i}-${c}` ? null : `gl-${i}-${c}`)} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Suggested Next Investigation */}
          <section>
            <SectionHeader icon={Compass} n={8} title="Suggested Next Investigation" />
            <div className="flex flex-col gap-2">
              {nextSteps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3.5 py-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pramaan-primary/15 text-pramaan-secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-pramaan-text" style={{ fontSize: 13, lineHeight: 1.6 }}>
                    {s.text}
                  </span>
                  <ConfPill level={s.priority} />
                </div>
              ))}
            </div>
          </section>

          {/* Sources footnote */}
          <div className="border-t border-pramaan-border pt-5">
            <div className="mb-2 text-pramaan-text-secondary/70" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
              SOURCE RECORDS
            </div>
            <ol className="flex flex-col gap-1.5">
              {sources.map((s: Source) => (
                <li key={s.id} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 min-w-[16px] items-center justify-center rounded bg-pramaan-primary/15 px-1 text-pramaan-secondary" style={{ fontSize: 9, fontWeight: 600 }}>
                    {s.id}
                  </span>
                  <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
                    <span className="text-pramaan-text">{s.label}</span> — {s.kind}, <span className="font-mono">{s.ref}</span> ({s.date})
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
