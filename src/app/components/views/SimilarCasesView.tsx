import { useState } from "react";
import {
  Pin,
  ChevronDown,
  ScrollText,
  MapPin,
  Clock,
  GitCompareArrows,
  Fingerprint,
  ArrowRightLeft,
  Building2,
  FileSignature,
  Banknote,
  Footprints,
  Gavel,
} from "lucide-react";
import {
  sourceCase,
  sourceTimeline,
  similarCases,
  type SimilarCase,
  type DimensionScore,
  type TimelineEntry,
} from "../../data/similarCases";

function simTone(v: number) {
  if (v >= 85) return { color: "text-pramaan-success", bg: "bg-pramaan-success/12", bar: "bg-pramaan-success" };
  if (v >= 70) return { color: "text-pramaan-secondary", bg: "bg-pramaan-primary/12", bar: "bg-pramaan-primary" };
  if (v >= 55) return { color: "text-pramaan-warning", bg: "bg-pramaan-warning/12", bar: "bg-pramaan-warning" };
  return { color: "text-pramaan-critical", bg: "bg-pramaan-critical/12", bar: "bg-pramaan-critical" };
}

const kindMeta: Record<TimelineEntry["kind"], { icon: typeof ScrollText; color: string }> = {
  offence: { icon: Gavel, color: "#E05353" },
  evidence: { icon: FileSignature, color: "#5D9CFF" },
  movement: { icon: Footprints, color: "#F4B740" },
  financial: { icon: Banknote, color: "#2FBF71" },
  action: { icon: ScrollText, color: "#AAB6CF" },
};

export function SimilarCasesView() {
  const [selectedId, setSelectedId] = useState(similarCases[0].id);
  const [compareMode, setCompareMode] = useState(false);
  const selected = similarCases.find((c) => c.id === selectedId)!;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_360px]">
      {/* LEFT — pinned source FIR */}
      <div className="lg:sticky lg:top-0 lg:self-start">
        <div className="rounded-xl border border-pramaan-primary/40 bg-pramaan-surface p-4">
          <div className="mb-2 flex items-center gap-1.5 text-pramaan-secondary" style={{ fontSize: 11, fontWeight: 500 }}>
            <Pin size={13} strokeWidth={1.75} /> SOURCE FIR
          </div>
          <div className="font-mono text-pramaan-secondary" style={{ fontSize: 12 }}>{sourceCase.id}</div>
          <h3 className="mt-0.5 text-pramaan-text" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
            {sourceCase.title}
          </h3>

          <div className="mt-3 flex flex-col gap-1.5">
            {[
              ["Category", sourceCase.category],
              ["Station", sourceCase.station],
              ["Filed", sourceCase.filed],
              ["Status", sourceCase.status],
              ["Officer", sourceCase.officer],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg bg-pramaan-elevated px-3 py-1.5">
                <span className="text-pramaan-text-secondary" style={{ fontSize: 11.5 }}>{k}</span>
                <span className="text-pramaan-text" style={{ fontSize: 11.5, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <div className="mb-1 text-pramaan-text-secondary/70" style={{ fontSize: 10.5, letterSpacing: "0.05em" }}>SYNOPSIS</div>
            <p className="text-pramaan-text-secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>{sourceCase.synopsis}</p>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 text-pramaan-text-secondary/70" style={{ fontSize: 10.5, letterSpacing: "0.05em" }}>KEY ENTITIES</div>
            <div className="flex flex-wrap gap-1.5">
              {sourceCase.entities.map((e) => (
                <span key={e} className="rounded-md border border-pramaan-border bg-pramaan-elevated px-2 py-0.5 text-pramaan-text" style={{ fontSize: 11 }}>{e}</span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {sourceCase.tags.map((t) => (
              <span key={t} className="rounded-md bg-pramaan-primary/10 px-2 py-0.5 text-pramaan-secondary" style={{ fontSize: 10.5 }}>#{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER — ranked similarity list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
            {similarCases.length} similar cases · ranked by composite similarity
          </span>
        </div>
        {similarCases.map((c) => (
          <SimilarityCard
            key={c.id}
            data={c}
            selected={c.id === selectedId}
            onSelect={() => setSelectedId(c.id)}
          />
        ))}
      </div>

      {/* RIGHT — evidence comparison */}
      <div className="lg:sticky lg:top-0 lg:self-start">
        <ComparisonPanel
          compareMode={compareMode}
          onToggle={() => setCompareMode((v) => !v)}
          selected={selected}
        />
      </div>
    </div>
  );
}

function Dimension({ icon: Icon, d }: { icon: typeof MapPin; d: DimensionScore }) {
  const tone = simTone(d.value);
  return (
    <div className="rounded-lg border border-pramaan-border/60 bg-pramaan-elevated p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon size={13} strokeWidth={1.75} className="text-pramaan-text-secondary" />
        <span className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>{d.label}</span>
        <span className={`ml-auto ${tone.color}`} style={{ fontSize: 11.5, fontWeight: 600 }}>{d.value}%</span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-pramaan-panel">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${d.value}%` }} />
      </div>
      <p className="mt-1.5 text-pramaan-text-secondary/80" style={{ fontSize: 10.5, lineHeight: 1.45 }}>{d.note}</p>
    </div>
  );
}

function SimilarityCard({ data, selected, onSelect }: { data: SimilarCase; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const tone = simTone(data.similarity);
  return (
    <div className={`rounded-xl border bg-pramaan-surface transition-colors ${selected ? "border-pramaan-primary/50" : "border-pramaan-border"}`}>
      <div className="cursor-pointer p-4" onClick={onSelect}>
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${tone.bg}`}>
            <span className={tone.color} style={{ fontSize: 15, fontWeight: 700 }}>{data.similarity}</span>
            <span className={tone.color} style={{ fontSize: 8 }}>MATCH</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-pramaan-secondary" style={{ fontSize: 11 }}>{data.id}</span>
              <span className="rounded bg-pramaan-panel px-1.5 py-0.5 text-pramaan-text-secondary" style={{ fontSize: 10 }}>{data.category}</span>
              {selected && (
                <span className="ml-auto rounded-md bg-pramaan-primary/12 px-2 py-0.5 text-pramaan-secondary" style={{ fontSize: 10, fontWeight: 500 }}>
                  In comparison
                </span>
              )}
            </div>
            <h4 className="mt-0.5 text-pramaan-text" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{data.title}</h4>
            <div className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>{data.station} · filed {data.filed}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Dimension icon={GitCompareArrows} d={data.mo} />
          <Dimension icon={MapPin} d={data.location} />
          <Dimension icon={Clock} d={data.time} />
          <Dimension icon={Fingerprint} d={data.evidenceOverlap} />
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-pramaan-text-secondary/70" style={{ fontSize: 10.5, letterSpacing: "0.05em" }}>
            <Building2 size={12} strokeWidth={1.75} /> COMMON ENTITIES
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.commonEntities.map((e) => (
              <span key={e} className="rounded-md border border-pramaan-primary/30 bg-pramaan-primary/10 px-2 py-0.5 text-pramaan-secondary" style={{ fontSize: 11 }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* reasoning accordion */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 border-t border-pramaan-border px-4 py-2.5 text-pramaan-text-secondary transition-colors hover:text-pramaan-text"
        style={{ fontSize: 12 }}
      >
        <span className="flex-1 text-left">Why these cases match</span>
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-pramaan-border/60 px-4 py-3">
          <ul className="flex flex-col gap-2">
            {data.reasoning.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-pramaan-text-secondary" style={{ fontSize: 12, lineHeight: 1.55 }}>
                <span className="mt-0.5 flex h-4 min-w-[16px] items-center justify-center rounded bg-pramaan-elevated text-pramaan-secondary" style={{ fontSize: 9, fontWeight: 600 }}>{i + 1}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TimelineColumn({ title, meta, entries }: { title: string; meta: string; entries: TimelineEntry[] }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 border-b border-pramaan-border pb-2">
        <div className="truncate text-pramaan-text" style={{ fontSize: 12.5, fontWeight: 600 }}>{title}</div>
        <div className="text-pramaan-text-secondary" style={{ fontSize: 10.5 }}>{meta}</div>
      </div>
      <div className="relative pl-4">
        <div className="absolute bottom-1 left-[3px] top-1 w-px bg-pramaan-border" />
        {entries.map((e, i) => {
          const k = kindMeta[e.kind];
          const Icon = k.icon;
          return (
            <div key={i} className="relative pb-3.5 last:pb-0">
              <span className="absolute -left-[15px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-pramaan-surface" style={{ background: k.color }} />
              <div className="flex items-center gap-1.5 font-mono text-pramaan-text-secondary" style={{ fontSize: 10 }}>
                <Icon size={11} strokeWidth={1.75} style={{ color: k.color }} /> {e.date} · {e.time}
              </div>
              <div className="mt-0.5 text-pramaan-text" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{e.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonPanel({
  compareMode,
  onToggle,
  selected,
}: {
  compareMode: boolean;
  onToggle: () => void;
  selected: SimilarCase;
}) {
  return (
    <div className="rounded-xl border border-pramaan-border bg-pramaan-surface">
      <div className="flex items-center justify-between border-b border-pramaan-border p-3.5">
        <span className="flex items-center gap-1.5 text-pramaan-text" style={{ fontSize: 13, fontWeight: 600 }}>
          <ArrowRightLeft size={15} strokeWidth={1.75} className="text-pramaan-secondary" />
          Evidence Comparison
        </span>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors ${
            compareMode
              ? "border-pramaan-primary bg-pramaan-primary/12 text-pramaan-secondary"
              : "border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text"
          }`}
          style={{ fontSize: 11.5, fontWeight: 500 }}
        >
          <span className={`h-3.5 w-6 rounded-full p-0.5 transition-colors ${compareMode ? "bg-pramaan-primary" : "bg-pramaan-panel"}`}>
            <span className={`block h-2.5 w-2.5 rounded-full bg-white transition-transform ${compareMode ? "translate-x-2.5" : ""}`} />
          </span>
          Compare Mode
        </button>
      </div>

      <div className="p-4">
        {compareMode ? (
          <>
            <div className="mb-3 rounded-lg bg-pramaan-elevated px-3 py-2 text-pramaan-text-secondary" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Synchronized timelines — source case on the left, <span className="text-pramaan-secondary">{selected.id}</span> on the right.
            </div>
            <div className="flex gap-4">
              <TimelineColumn title={sourceCase.id} meta={sourceCase.category} entries={sourceTimeline} />
              <div className="w-px shrink-0 bg-pramaan-border" />
              <TimelineColumn title={selected.id} meta={selected.category} entries={selected.timeline} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pramaan-elevated text-pramaan-secondary">
              <ArrowRightLeft size={18} strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 500 }}>Compare Mode is off</div>
              <p className="mt-1 text-pramaan-text-secondary" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                Turn it on to split this panel into two synchronized timelines comparing <span className="text-pramaan-secondary">{sourceCase.id}</span> against the selected case, <span className="text-pramaan-secondary">{selected.id}</span>.
              </p>
            </div>
            <button
              onClick={onToggle}
              className="rounded-lg bg-pramaan-primary px-4 py-2 text-pramaan-text transition-colors hover:bg-pramaan-secondary"
              style={{ fontSize: 12.5, fontWeight: 500 }}
            >
              Enable Compare Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
