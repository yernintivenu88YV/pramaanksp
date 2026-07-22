import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { profiles, searchTypes, type Profile } from "../../data/resolution";
import { StrengthDot, confidenceTone } from "./resolution/strength";
import { ExpandedProfile } from "./resolution/ExpandedProfile";
import { ExplainMatchDrawer } from "./resolution/ExplainMatchDrawer";

export function ResolutionView() {
  const [type, setType] = useState<(typeof searchTypes)[number]>("Person");
  const [query, setQuery] = useState("Marchetti");
  // Profile pr1 is shown expanded by default per the design.
  const [expanded, setExpanded] = useState<string | null>("pr1");
  const [explain, setExplain] = useState<string | null>(null);

  const explainProfile = profiles.find((p) => p.id === explain) ?? null;

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="rounded-xl border border-pramaan-border bg-pramaan-surface p-4">
        <div className="flex items-center gap-2 rounded-lg border border-pramaan-border bg-pramaan-elevated px-3.5 py-2.5">
          <Search size={17} strokeWidth={1.75} className="text-pramaan-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search by ${type.toLowerCase()}…`}
            className="flex-1 bg-transparent text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/60"
            style={{ fontSize: 14 }}
          />
          <button
            className="rounded-lg bg-pramaan-primary px-4 py-1.5 text-pramaan-text transition-colors hover:bg-pramaan-secondary"
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            Resolve
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {searchTypes.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full border px-3 py-1.5 transition-colors ${
                  active
                    ? "border-pramaan-primary bg-pramaan-primary/12 text-pramaan-secondary"
                    : "border-pramaan-border bg-pramaan-elevated text-pramaan-text-secondary hover:text-pramaan-text"
                }`}
                style={{ fontSize: 12.5, fontWeight: active ? 500 : 400 }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
          {profiles.length} investigation profiles matched
        </span>
        <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
          Sorted by confidence
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {profiles.map((p) =>
          expanded === p.id ? (
            <ExpandedProfile
              key={p.id}
              profile={p}
              onCollapse={() => setExpanded(null)}
              onExplain={() => setExplain(p.id)}
            />
          ) : (
            <CollapsedCard key={p.id} profile={p} onOpen={() => setExpanded(p.id)} />
          )
        )}
      </div>

      {explainProfile && <ExplainMatchDrawer profile={explainProfile} onClose={() => setExplain(null)} />}
    </div>
  );
}

function CollapsedCard({ profile, onOpen }: { profile: Profile; onOpen: () => void }) {
  const tone = confidenceTone(profile.confidence);
  return (
    <button
      onClick={onOpen}
      className="w-full rounded-xl border border-pramaan-border bg-pramaan-surface p-4 text-left transition-colors hover:border-pramaan-primary/50"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pramaan-primary/12 text-pramaan-secondary" style={{ fontSize: 15, fontWeight: 600 }}>
          {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-pramaan-text" style={{ fontSize: 15, fontWeight: 600 }}>
              {profile.name}
            </span>
            <span className={`rounded-md px-2 py-0.5 ${tone.bg} ${tone.color}`} style={{ fontSize: 11, fontWeight: 600 }}>
              {profile.confidence}% match
            </span>
            <span className="ml-auto text-pramaan-text-secondary" style={{ fontSize: 11 }}>
              {profile.status}
            </span>
            <ChevronDown size={16} className="text-pramaan-text-secondary" />
          </div>
          <div className="mt-0.5 text-pramaan-text-secondary" style={{ fontSize: 12 }}>
            aka {profile.aliases.join(", ")}
          </div>

          {/* matched via strip */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-pramaan-text-secondary/70" style={{ fontSize: 11 }}>
              matched via
            </span>
            {profile.matchedVia.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-md border border-pramaan-border/60 bg-pramaan-elevated px-2 py-1 text-pramaan-text-secondary"
                style={{ fontSize: 11 }}
              >
                <StrengthDot strength={s.strength} />
                <span className="text-pramaan-text">{s.label}</span>
                <span className="text-pramaan-text-secondary/80">
                  ({s.method}
                  {s.method === "probabilistic" && s.score != null ? `, ${s.score}%` : ""})
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
