import { useState } from "react";
import { ChevronUp, GitCompareArrows, MapPin, Phone, Car, FileText, Users, Clock, ShieldAlert, Fingerprint, ScrollText } from "lucide-react";
import type { Profile } from "../../../data/resolution";
import { StrengthDot, strengthMeta, confidenceTone } from "./strength";

const tabs = [
  "Aliases",
  "Known Phones",
  "Vehicles",
  "Addresses",
  "Associated FIRs",
  "Known Associates",
  "Timeline",
  "Evidence",
  "Investigation Status",
] as const;

export function ExpandedProfile({
  profile,
  onCollapse,
  onExplain,
}: {
  profile: Profile;
  onCollapse: () => void;
  onExplain: () => void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Aliases");
  const tone = confidenceTone(profile.confidence);

  return (
    <div className="overflow-hidden rounded-xl border border-pramaan-primary/40 bg-pramaan-surface">
      {/* header */}
      <div className="flex items-start gap-4 border-b border-pramaan-border p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pramaan-primary/15 text-pramaan-secondary" style={{ fontSize: 16, fontWeight: 600 }}>
          {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-pramaan-text" style={{ fontSize: 17, fontWeight: 600 }}>
              {profile.name}
            </h3>
            <span className={`rounded-md px-2 py-0.5 ${tone.bg} ${tone.color}`} style={{ fontSize: 11, fontWeight: 600 }}>
              {profile.confidence}% match
            </span>
          </div>
          <div className="mt-0.5 text-pramaan-text-secondary" style={{ fontSize: 12 }}>
            aka {profile.aliases.join(", ")}
          </div>
          <div className="mt-1 flex items-center gap-3 text-pramaan-text-secondary" style={{ fontSize: 11 }}>
            <span className="font-mono">{profile.primaryId}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={11} /> {profile.location}</span>
            <span className="rounded bg-pramaan-panel px-1.5 py-0.5">{profile.status}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onExplain}
            className="flex items-center gap-1.5 rounded-lg bg-pramaan-primary px-3 py-2 text-pramaan-text transition-colors hover:bg-pramaan-secondary"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            <GitCompareArrows size={14} strokeWidth={1.75} />
            Explain Match
          </button>
          <button
            onClick={onCollapse}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-pramaan-border text-pramaan-text-secondary transition-colors hover:text-pramaan-text"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-pramaan-border px-3">
        {tabs.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative shrink-0 px-3 py-2.5 transition-colors ${
                active ? "text-pramaan-text" : "text-pramaan-text-secondary hover:text-pramaan-text"
              }`}
              style={{ fontSize: 12.5, fontWeight: active ? 500 : 400 }}
            >
              {t}
              {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-pramaan-primary" />}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        <TabContent tab={tab} profile={profile} />
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3.5 py-2.5">
      {children}
    </div>
  );
}

function Empty({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-8 text-pramaan-text-secondary">
      <Icon size={20} strokeWidth={1.5} />
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}

function TabContent({ tab, profile }: { tab: string; profile: Profile }) {
  switch (tab) {
    case "Aliases":
      return (
        <div className="flex flex-wrap gap-2">
          {profile.aliases.map((a) => (
            <span key={a} className="rounded-lg border border-pramaan-border bg-pramaan-elevated px-3 py-1.5 text-pramaan-text" style={{ fontSize: 13 }}>
              {a}
            </span>
          ))}
        </div>
      );
    case "Known Phones":
      return profile.phones.length ? (
        <div className="flex flex-col gap-2">
          {profile.phones.map((p) => (
            <Row key={p.number}>
              <Phone size={15} className="text-pramaan-secondary" strokeWidth={1.75} />
              <span className="font-mono text-pramaan-text" style={{ fontSize: 13 }}>{p.number}</span>
              <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>{p.carrier}</span>
              <span className="ml-auto text-pramaan-text-secondary" style={{ fontSize: 11 }}>seen {p.lastSeen}</span>
              <span className={`rounded px-1.5 py-0.5 ${p.verified ? "bg-pramaan-success/12 text-pramaan-success" : "bg-pramaan-panel text-pramaan-text-secondary"}`} style={{ fontSize: 10.5, fontWeight: 500 }}>
                {p.verified ? "verified" : "unverified"}
              </span>
            </Row>
          ))}
        </div>
      ) : (
        <Empty icon={Phone} label="No known phones on record." />
      );
    case "Vehicles":
      return profile.vehicles.length ? (
        <div className="flex flex-col gap-2">
          {profile.vehicles.map((v) => (
            <Row key={v.plate}>
              <Car size={15} className="text-pramaan-secondary" strokeWidth={1.75} />
              <span className="font-mono text-pramaan-text" style={{ fontSize: 13 }}>{v.plate}</span>
              <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>{v.color} {v.model}</span>
            </Row>
          ))}
        </div>
      ) : (
        <Empty icon={Car} label="No vehicles linked." />
      );
    case "Addresses":
      return (
        <div className="flex flex-col gap-2">
          {profile.addresses.map((a) => (
            <Row key={a.line}>
              <MapPin size={15} className="text-pramaan-secondary" strokeWidth={1.75} />
              <span className="text-pramaan-text" style={{ fontSize: 13 }}>{a.line}</span>
              <span className="ml-auto text-pramaan-text-secondary" style={{ fontSize: 11 }}>{a.type} · since {a.since}</span>
            </Row>
          ))}
        </div>
      );
    case "Associated FIRs":
      return profile.firs.length ? (
        <div className="flex flex-col gap-2">
          {profile.firs.map((f) => (
            <Row key={f.id}>
              <ScrollText size={15} className="text-pramaan-secondary" strokeWidth={1.75} />
              <div className="min-w-0">
                <div className="text-pramaan-text" style={{ fontSize: 13 }}>{f.title}</div>
                <div className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>
                  <span className="font-mono">{f.id}</span> · {f.station} · {f.date}
                </div>
              </div>
              <span className="ml-auto rounded bg-pramaan-panel px-1.5 py-0.5 text-pramaan-text-secondary" style={{ fontSize: 10.5 }}>{f.status}</span>
            </Row>
          ))}
        </div>
      ) : (
        <Empty icon={ScrollText} label="No associated FIRs." />
      );
    case "Known Associates":
      return (
        <div className="flex flex-col gap-2">
          {profile.associates.map((a) => (
            <Row key={a.name}>
              <Users size={15} className="text-pramaan-secondary" strokeWidth={1.75} />
              <span className="text-pramaan-text" style={{ fontSize: 13 }}>{a.name}</span>
              <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>{a.relation}</span>
              <span className="ml-auto inline-flex items-center gap-1.5">
                <StrengthDot strength={a.risk} />
                <span className={strengthMeta[a.risk].color} style={{ fontSize: 11 }}>{strengthMeta[a.risk].label}</span>
              </span>
            </Row>
          ))}
        </div>
      );
    case "Timeline":
      return (
        <div className="relative pl-5">
          <div className="absolute bottom-1 left-[5px] top-1 w-px bg-pramaan-border" />
          {profile.timeline.map((t, i) => (
            <div key={i} className="relative pb-4 last:pb-0">
              <span className="absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full border-2 border-pramaan-surface bg-pramaan-primary" />
              <div className="font-mono text-pramaan-text-secondary" style={{ fontSize: 11 }}>{t.date} · {t.time}</div>
              <div className="text-pramaan-text" style={{ fontSize: 13 }}>{t.event}</div>
            </div>
          ))}
        </div>
      );
    case "Evidence":
      return (
        <div className="flex flex-col gap-2">
          {profile.evidence.map((e) => (
            <Row key={e.id}>
              <FileText size={15} className="text-pramaan-secondary" strokeWidth={1.75} />
              <span className="text-pramaan-text" style={{ fontSize: 13 }}>{e.title}</span>
              <span className="ml-auto text-pramaan-text-secondary" style={{ fontSize: 11 }}>{e.kind} · {e.date}</span>
            </Row>
          ))}
        </div>
      );
    case "Investigation Status":
      return (
        <div className="flex items-start gap-3 rounded-xl border border-pramaan-border bg-pramaan-elevated p-4">
          <ShieldAlert size={18} className="mt-0.5 text-pramaan-warning" strokeWidth={1.75} />
          <div>
            <div className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 500 }}>{profile.status}</div>
            <p className="mt-1 text-pramaan-text-secondary" style={{ fontSize: 12, lineHeight: 1.6 }}>
              Linked to {profile.firs.length} FIR(s) and {profile.associates.length} associate(s). Identity resolved
              with {profile.confidence}% composite confidence via {profile.matchedVia.length} corroborating signals.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-pramaan-secondary" style={{ fontSize: 11 }}>
              <Fingerprint size={13} /> Primary reference {profile.primaryId}
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
