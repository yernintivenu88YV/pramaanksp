import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, GitCompareArrows, X, Pin, AlertTriangle } from "lucide-react";
import { LANES, DAY_START, DAY_END, events, minutesToLabel, compareEntities, type TEvent } from "../data/timeline";
import { entityMeta, ConfidenceWhy, Skeleton } from "./primitives";

const LANE_LABEL_W = 150;
const LANE_H = 92;

export function TimelineExplorer({ compare, onCompareChange }: { compare: boolean; onCompareChange: (v: boolean) => void }) {
  const [pxPerHour, setPxPerHour] = useState(120);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<TEvent | null>(events[2]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650); // skeleton for >300ms loads
    return () => clearTimeout(t);
  }, []);

  const totalHours = (DAY_END - DAY_START) / 60;
  const trackW = totalHours * pxPerHour;
  const xOf = (minute: number) => ((minute - DAY_START) / 60) * pxPerHour;

  // Scroll to zoom (pinch on trackpad sends ctrlKey); plain scroll pans.
  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setPxPerHour((p) => Math.min(360, Math.max(72, p - e.deltaY)));
    }
  };

  const hours = Array.from({ length: totalHours + 1 }, (_, i) => DAY_START + i * 60);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      {/* Controls */}
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-pramaan-text-secondary">18 Jul 2026 · 08:00—18:00 IST</span>
        <span className="h-4 border-l border-pramaan-border" />
        <button
          onClick={() => onCompareChange(!compare)}
          aria-pressed={compare}
          className={`flex items-center gap-1.5 rounded-[4px] border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary ${
            compare ? "border-pramaan-primary/60 bg-pramaan-primary/10 text-pramaan-secondary" : "border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text"
          }`}
        >
          <GitCompareArrows size={13} /> Compare entities
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setPxPerHour((p) => Math.max(72, p - 36))} className="grid h-8 w-8 place-items-center rounded-[4px] border border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"><ZoomOut size={15} /></button>
          <span className="w-14 text-center font-mono text-[10px] text-pramaan-text-secondary">{Math.round((pxPerHour / 120) * 100)}%</span>
          <button onClick={() => setPxPerHour((p) => Math.min(360, p + 36))} className="grid h-8 w-8 place-items-center rounded-[4px] border border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"><ZoomIn size={15} /></button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-pramaan-border bg-pramaan-surface">
          <div ref={scrollRef} onWheel={onWheel} className="min-h-0 flex-1 overflow-auto">
            <div style={{ width: LANE_LABEL_W + trackW }}>
              {/* Time axis */}
              <div className="sticky top-0 z-20 flex border-b border-pramaan-border bg-pramaan-surface">
                <div className="sticky left-0 z-10 shrink-0 border-r border-pramaan-border bg-pramaan-surface px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-pramaan-text-secondary" style={{ width: LANE_LABEL_W }}>Event channel</div>
                <div className="relative" style={{ width: trackW, height: 32 }}>
                  {hours.map((m) => (
                    <span key={m} className="absolute top-0 flex h-8 items-center border-l border-pramaan-border px-1.5 font-mono text-[9px] text-pramaan-text-secondary" style={{ left: xOf(m) }}>{minutesToLabel(m)}</span>
                  ))}
                </div>
              </div>

              {/* Compare rows — two entities stacked directly above the lanes */}
              {compare && !loading && (
                <div className="anim-content border-b-2 border-pramaan-border-strong bg-pramaan-bg/40">
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <AlertTriangle size={12} className="text-pramaan-signal" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-pramaan-text-secondary">Alibi / overlap check · R. Kumar vs Mohd. Danish</span>
                  </div>
                  {compareEntities.map((ent) => (
                    <div key={ent.id} className="flex items-stretch border-t border-pramaan-border">
                      <div className="shrink-0 border-r border-pramaan-border px-3 py-2" style={{ width: LANE_LABEL_W }}>
                        <span className="flex items-center gap-1.5 text-[11px] text-pramaan-text">
                          <span className="h-2 w-2 rounded-full" style={{ background: entityMeta[ent.type].color }} />
                          {ent.name}
                        </span>
                        <span className="mt-0.5 block font-mono text-[9px] text-pramaan-text-secondary">{ent.events.length} events</span>
                      </div>
                      <div className="relative" style={{ width: trackW, height: 44 }}>
                        <div className="absolute inset-x-0 top-1/2 border-t border-pramaan-border" />
                        {ent.events.map((ev, i) => (
                          <div key={i} className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: xOf(ev.minute) }}>
                            <span className="block h-2.5 w-2.5 rounded-full border-2 bg-pramaan-bg" style={{ borderColor: entityMeta[ent.type].color }} />
                            <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-[4px] border border-pramaan-border bg-pramaan-elevated px-2 py-1 group-hover:block">
                              <span className="block font-mono text-[9px] text-pramaan-text-secondary">{minutesToLabel(ev.minute)} · {ev.lane}</span>
                              <span className="block text-[10px] text-pramaan-text">{ev.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Swim lanes */}
              {loading
                ? LANES.map((lane) => (
                    <div key={lane} className="flex border-b border-pramaan-border" style={{ height: LANE_H }}>
                      <div className="shrink-0 border-r border-pramaan-border px-3 py-3" style={{ width: LANE_LABEL_W }}><Skeleton className="h-3 w-24" /></div>
                      <div className="flex flex-1 items-center gap-8 px-6"><Skeleton className="h-1.5 w-20" /><Skeleton className="h-1.5 w-16" /><Skeleton className="h-1.5 w-24" /></div>
                    </div>
                  ))
                : LANES.map((lane) => {
                    const laneEvents = events.filter((e) => e.lane === lane);
                    return (
                      <div key={lane} className="flex border-b border-pramaan-border last:border-b-0" style={{ height: LANE_H }}>
                        <div className="sticky left-0 z-10 shrink-0 border-r border-pramaan-border bg-pramaan-surface px-3 py-3" style={{ width: LANE_LABEL_W }}>
                          <p className="text-[11px] font-medium text-pramaan-text">{lane}</p>
                          <p className="mt-0.5 font-mono text-[9px] text-pramaan-text-secondary">{laneEvents.length} records</p>
                        </div>
                        <div className="relative" style={{ width: trackW }}>
                          {hours.map((m) => <span key={m} className="absolute inset-y-0 border-l border-pramaan-border/60" style={{ left: xOf(m) }} />)}
                          {laneEvents.map((ev) => (
                            <Tick key={ev.id} event={ev} x={xOf(ev.minute)} active={hover === ev.id || pinned?.id === ev.id} onHover={setHover} onPin={setPinned} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
          <Legend />
        </div>

        {/* Pinned detail rail */}
        {pinned && (
          <aside key={pinned.id} className="anim-panel flex w-[300px] shrink-0 flex-col overflow-auto rounded-[8px] border border-pramaan-border bg-pramaan-surface p-4">
            <div className="flex items-start justify-between">
              {pinned.anomaly ? (
                <span className="flex items-center gap-1 border border-pramaan-signal/40 px-1.5 py-0.5 font-mono text-[9px] uppercase text-pramaan-signal"><AlertTriangle size={11} /> AI anomaly</span>
              ) : (
                <span className="flex items-center gap-1 border border-pramaan-border px-1.5 py-0.5 font-mono text-[9px] uppercase text-pramaan-text-secondary"><Pin size={11} /> Pinned event</span>
              )}
              <button onClick={() => setPinned(null)} aria-label="Close" className="text-pramaan-text-secondary hover:text-pramaan-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"><X size={14} /></button>
            </div>
            <p className="mt-3 text-[13px] font-medium leading-5 text-pramaan-text">{pinned.title}</p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-pramaan-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ background: entityMeta[pinned.entity].color }} />
              {minutesToLabel(pinned.minute)} IST · {pinned.actor} · {entityMeta[pinned.entity].label}
            </p>
            {pinned.anomaly && (
              <div className="mt-4">
                <ConfidenceWhy
                  confidence={pinned.anomaly.confidence}
                  claim={pinned.anomaly.reason}
                  evidence={["Bank statement · Vellum Traders", "Call-detail record · +91 98452 11876", "Device location correlation"]}
                />
              </div>
            )}
            <div className="mt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-pramaan-text-secondary">Linked case entities</p>
              {["R. Kumar · Subject", "Vellum Traders · Organisation", "KA-05-MN-4812 · Vehicle"].map((x) => (
                <button key={x} className="mt-2 flex w-full items-center justify-between text-left text-[11px] text-pramaan-text-secondary hover:text-pramaan-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"><span>{x}</span><span className="font-mono">›</span></button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* A tick: small mark on the lane that expands into a card on hover;
   click pins it. Anomalies render as a hollow amber diamond. */
function Tick({ event, x, active, onHover, onPin }: { event: TEvent; x: number; active: boolean; onHover: (id: string | null) => void; onPin: (e: TEvent) => void }) {
  const color = entityMeta[event.entity].color;
  return (
    <div className="absolute top-1/2 -translate-y-1/2" style={{ left: x }} onMouseEnter={() => onHover(event.id)} onMouseLeave={() => onHover(null)}>
      <button
        onClick={() => onPin(event)}
        aria-label={`${minutesToLabel(event.minute)} ${event.title}`}
        className="relative grid h-6 w-6 -translate-x-1/2 place-items-center focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"
      >
        {event.anomaly ? (
          <span className={`block h-3 w-3 rotate-45 border-2 ${active ? "bg-pramaan-signal/20" : ""}`} style={{ borderColor: "#FFB84D" }} />
        ) : (
          <span className={`block h-2.5 w-2.5 rounded-full border-2 ${active ? "" : "bg-pramaan-bg"}`} style={{ borderColor: color, background: active ? color : undefined }} />
        )}
      </button>
      {active && (
        <div className="anim-content absolute bottom-6 left-0 z-30 w-52 -translate-x-1/2 rounded-[4px] border border-pramaan-border-strong bg-pramaan-elevated p-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-pramaan-text-secondary">{minutesToLabel(event.minute)} IST</span>
            <span className="font-mono text-[9px]" style={{ color }}>{entityMeta[event.entity].label}</span>
          </div>
          <p className="mt-1 text-[11px] font-medium leading-4 text-pramaan-text">{event.title}</p>
          <p className="mt-0.5 font-mono text-[9px] text-pramaan-text-secondary">{event.actor}</p>
          {event.anomaly && (
            <p className="mt-2 flex items-start gap-1 border-t border-pramaan-border pt-2 text-[10px] leading-4 text-pramaan-signal">
              <AlertTriangle size={11} className="mt-0.5 shrink-0" />
              Flagged · {event.anomaly.confidence}% · {event.anomaly.reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 border-t border-pramaan-border bg-pramaan-surface px-4 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-pramaan-text-secondary">
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-pramaan-primary bg-pramaan-bg" /> Event</span>
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 border-2 border-pramaan-signal" /> AI anomaly</span>
      <span className="ml-auto normal-case text-pramaan-text-secondary">Scroll to pan · ⌘/Ctrl + scroll to zoom · click a tick to pin</span>
    </div>
  );
}
