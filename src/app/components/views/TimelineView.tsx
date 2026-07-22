import { timeline } from "../../data/mock";
import { severityConfig } from "../severity";

export function TimelineView() {
  return (
    <div className="rounded-xl border border-pramaan-border bg-pramaan-surface p-5">
      <div className="mb-4">
        <h3 className="text-pramaan-text" style={{ fontSize: 14, fontWeight: 600 }}>
          Reconstructed Event Timeline · PRM-4821
        </h3>
        <p className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
          Chronological sequence of correlated activity
        </p>
      </div>

      <div className="relative pl-6">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-pramaan-border" />
        {timeline.map((ev) => {
          const c = severityConfig[ev.severity];
          return (
            <div key={ev.id} className="relative pb-6 last:pb-0">
              <span className={`absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-pramaan-surface ${c.dot}`} />
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-pramaan-text-secondary" style={{ fontSize: 11 }}>
                  {ev.date} · {ev.time}
                </span>
                <span className={`rounded px-1.5 ${c.bg} ${c.color}`} style={{ fontSize: 10, fontWeight: 500 }}>
                  {c.label}
                </span>
              </div>
              <div className="mt-1 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3.5 py-2.5">
                <div className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 500 }}>
                  {ev.title}
                </div>
                <p className="mt-0.5 text-pramaan-text-secondary" style={{ fontSize: 12 }}>
                  {ev.detail}
                </p>
                <div className="mt-1.5 text-pramaan-text-secondary/80" style={{ fontSize: 11 }}>
                  Actor · {ev.actor}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
