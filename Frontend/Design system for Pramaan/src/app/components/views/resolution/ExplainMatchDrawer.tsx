import { X, GitCompareArrows } from "lucide-react";
import type { Profile } from "../../../data/resolution";
import { strengthMeta } from "./strength";

export function ExplainMatchDrawer({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex h-full w-[400px] flex-col border-l border-pramaan-border bg-pramaan-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-pramaan-border px-4 py-3.5">
          <div className="flex items-center gap-2 text-pramaan-secondary" style={{ fontSize: 13, fontWeight: 600 }}>
            <GitCompareArrows size={16} strokeWidth={1.75} />
            Explain Match
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-pramaan-text-secondary transition-colors hover:bg-pramaan-elevated hover:text-pramaan-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-pramaan-border px-4 py-3">
          <div className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>
            Resolved identity
          </div>
          <div className="text-pramaan-text" style={{ fontSize: 15, fontWeight: 600 }}>
            {profile.name}
          </div>
          <div className="font-mono text-pramaan-text-secondary" style={{ fontSize: 11 }}>
            {profile.primaryId}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 text-pramaan-text-secondary" style={{ fontSize: 11, letterSpacing: "0.05em" }}>
            SIGNAL BREAKDOWN ({profile.matchedVia.length})
          </div>
          <div className="flex flex-col gap-3">
            {profile.matchedVia.map((s) => {
              const meta = strengthMeta[s.strength];
              return (
                <div key={s.id} className="rounded-xl border border-pramaan-border bg-pramaan-elevated p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                      <span className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 500 }}>
                        {s.label}
                      </span>
                    </div>
                    <span className={`shrink-0 ${meta.color}`} style={{ fontSize: 11, fontWeight: 500 }}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="rounded-md bg-pramaan-panel px-2 py-0.5 capitalize text-pramaan-text-secondary"
                      style={{ fontSize: 10.5, fontWeight: 500 }}
                    >
                      {s.method}
                    </span>
                    {s.method === "probabilistic" && s.score != null && (
                      <span className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>
                        Match probability {s.score}%
                      </span>
                    )}
                  </div>

                  {s.method === "probabilistic" && s.score != null && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-pramaan-panel">
                      <div className={`h-full rounded-full ${meta.dot}`} style={{ width: `${s.score}%` }} />
                    </div>
                  )}

                  <p className="mt-2.5 text-pramaan-text-secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>
                    {s.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-pramaan-border bg-pramaan-elevated p-3.5">
            <div className="text-pramaan-text" style={{ fontSize: 12, fontWeight: 600 }}>
              How this score is computed
            </div>
            <p className="mt-1.5 text-pramaan-text-secondary" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
              Deterministic signals contribute full weight when field values match exactly. Probabilistic signals
              are weighted by their match probability and down-weighted when corroborating evidence is sparse.
              The composite confidence is capped by the weakest deterministic link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
