import { useEffect, useState } from "react";
import { Bell, Search, SlidersHorizontal, ListFilter, Download, Database, Video, Image as ImageIcon, FileText, CheckCircle2, Link2 } from "lucide-react";
import { LeftRail, type ViewKey } from "./components/LeftRail";
import { StatusBar } from "./components/StatusBar";
import { CommandPalette } from "./components/CommandPalette";
import { TimelineExplorer } from "./components/TimelineExplorer";
import { GeoWorkspace } from "./components/GeoWorkspace";
import { ConfidenceWhy, Skeleton } from "./components/primitives";

const TITLES: Record<ViewKey, { title: string; sub: string }> = {
  timeline: { title: "Timeline Explorer", sub: "Correlated event sequence · 18 Jul 2026" },
  network: { title: "Network Explorer", sub: "Entity relationship graph · PRM-4821" },
  geo: { title: "Geospatial Intelligence", sub: "Whitefield operational area" },
  evidence: { title: "Evidence Vault", sub: "Immutable case evidence · PRM-4821" },
};

export default function App() {
  const [view, setView] = useState<ViewKey>("timeline");
  const [palette, setPalette] = useState(false);
  const [compare, setCompare] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((o) => !o);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Occasional background sync, reflected quietly in the status bar.
  useEffect(() => {
    const t = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1400);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const meta = TITLES[view];

  return (
    <div className="flex h-screen min-w-[1080px] flex-col overflow-hidden bg-pramaan-bg font-sans text-pramaan-text">
      <div className="flex min-h-0 flex-1">
        <LeftRail view={view} onView={setView} onSearch={() => setPalette(true)} notifications={6} />

        <main className="flex min-w-0 flex-1 flex-col">
          {view !== "geo" && (
            <header className="flex h-14 shrink-0 items-center border-b border-pramaan-border px-5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[15px] font-semibold tracking-[-0.01em]">{meta.title}</h1>
                  <span className="rounded-[2px] border border-pramaan-border px-1.5 py-0.5 font-mono text-[9px] text-pramaan-text-secondary">PRM-4821</span>
                </div>
                <p className="mt-0.5 text-[11px] text-pramaan-text-secondary">{meta.sub}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setPalette(true)} className="flex h-8 w-56 items-center gap-2 rounded-[4px] border border-pramaan-border bg-pramaan-surface px-2.5 text-left text-[11px] text-pramaan-text-secondary hover:border-pramaan-border-strong focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary">
                  <Search size={14} /><span className="flex-1">Search investigations</span><kbd className="font-mono text-[9px]">⌘K</kbd>
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-[4px] border border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text"><SlidersHorizontal size={15} /></button>
                <button className="relative grid h-8 w-8 place-items-center rounded-[4px] border border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text">
                  <Bell size={15} />
                  <span className="absolute -right-1 -top-1 rounded-[2px] bg-pramaan-primary px-1 font-mono text-[8px] leading-3 text-pramaan-bg">6</span>
                </button>
              </div>
            </header>
          )}

          {view === "timeline" && <TimelineExplorer compare={compare} onCompareChange={setCompare} />}
          {view === "geo" && <GeoWorkspace />}
          {view === "evidence" && <EvidenceVault />}
          {view === "network" && <NetworkPlaceholder />}
        </main>
      </div>

      <StatusBar syncing={syncing} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

/* ── Evidence Vault ─────────────────────────────────────────────── */
const EVIDENCE = [
  { id: "EV-00841", title: "CCTV extraction · Whitefield Toll", type: "Video", status: "Verified", time: "10:37" },
  { id: "EV-00836", title: "UPI transaction statement", type: "Document", status: "Verified", time: "10:42" },
  { id: "EV-00829", title: "Call detail record · 98452 11876", type: "Data", status: "Correlated", time: "11:05" },
  { id: "EV-00811", title: "Witness statement · S. Rao", type: "Document", status: "Pending", time: "12:14" },
  { id: "EV-00798", title: "Vehicle plate frame sequence", type: "Image", status: "Verified", time: "13:03" },
];

function statusStyle(status: string) {
  if (status === "Verified") return "border-pramaan-success/40 text-pramaan-success";
  if (status === "Pending") return "border-pramaan-signal/40 text-pramaan-signal";
  return "border-pramaan-primary/40 text-pramaan-secondary";
}

function EvidenceVault() {
  const [selected, setSelected] = useState(EVIDENCE[0]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-pramaan-border bg-pramaan-surface px-5">
        <button className="flex items-center gap-2 rounded-[4px] border border-pramaan-border px-3 py-1.5 text-[11px] text-pramaan-text-secondary hover:text-pramaan-text"><ListFilter size={14} />Filter</button>
        <div className="flex h-8 w-64 items-center gap-2 rounded-[4px] border border-pramaan-border bg-pramaan-bg px-2 text-[11px] text-pramaan-text-secondary"><Search size={14} />Search evidence</div>
        <span className="ml-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-pramaan-text-secondary"><Database size={13} />Chain of custody intact</span>
        <button className="ml-auto flex items-center gap-2 rounded-[4px] border border-pramaan-primary/60 bg-pramaan-primary/10 px-3 py-1.5 text-[11px] text-pramaan-secondary hover:bg-pramaan-primary/15"><Download size={14} />Export manifest</button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px]">
        <section className="min-w-0 overflow-auto p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-pramaan-text-secondary">74 items · 12.4 GB</div>
          <div className="overflow-hidden rounded-[8px] border border-pramaan-border">
            <div className="grid grid-cols-[112px_1fr_100px_100px_80px] border-b border-pramaan-border bg-pramaan-surface px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-pramaan-text-secondary">
              <span>Evidence ID</span><span>Artifact</span><span>Type</span><span>Status</span><span>Added</span>
            </div>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[112px_1fr_100px_100px_80px] items-center gap-2 border-b border-pramaan-border px-3 py-3 last:border-b-0">
                    <Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-48" /><Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-10" />
                  </div>
                ))
              : EVIDENCE.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={`grid w-full grid-cols-[112px_1fr_100px_100px_80px] items-center border-b border-pramaan-border px-3 py-3 text-left last:border-b-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary ${selected.id === e.id ? "bg-pramaan-primary/10" : "hover:bg-pramaan-hover"}`}
                  >
                    <span className="font-mono text-[10px] text-pramaan-secondary">{e.id}</span>
                    <span className="flex items-center gap-2 text-[11px]">
                      <span className="text-pramaan-text-secondary">{e.type === "Video" ? <Video size={14} /> : e.type === "Image" ? <ImageIcon size={14} /> : <FileText size={14} />}</span>
                      {e.title}
                    </span>
                    <span className="font-mono text-[9px] text-pramaan-text-secondary">{e.type.toUpperCase()}</span>
                    <span className={`w-fit rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] ${statusStyle(e.status)}`}>{e.status.toUpperCase()}</span>
                    <span className="font-mono text-[10px] text-pramaan-text-secondary">{e.time}</span>
                  </button>
                ))}
          </div>
        </section>

        <aside key={selected.id} className="anim-panel overflow-auto border-l border-pramaan-border bg-pramaan-surface p-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-pramaan-text-secondary">Evidence detail</span>
          <p className="mt-3 text-[13px] font-medium">{selected.title}</p>
          <p className="mt-1 font-mono text-[10px] text-pramaan-text-secondary">{selected.id} · SHA-256 VERIFIED</p>
          <div className="relative mt-4 grid h-40 place-items-center rounded-[4px] border border-pramaan-border bg-pramaan-elevated">
            {selected.type === "Video" ? <Video size={28} className="text-pramaan-text-secondary" /> : selected.type === "Image" ? <ImageIcon size={28} className="text-pramaan-text-secondary" /> : <FileText size={28} className="text-pramaan-text-secondary" />}
            <span className="absolute bottom-2 left-2 font-mono text-[9px] text-pramaan-text-secondary">{selected.time}:14 · {selected.id}</span>
          </div>
          <div className="mt-4">
            <ConfidenceWhy
              confidence={91}
              claim="Plate sequence is consistent with KA-05-MN-4812 across 9 contiguous frames."
              evidence={["Frame 10:37:11–10:37:19", "ANPR match · KA-05-MN-4812", "Vehicle registry cross-check"]}
            />
          </div>
          <div className="mt-4 border-t border-pramaan-border pt-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-pramaan-text-secondary">Custody log</p>
            {["Ingested · CCTV-42 gateway", "Hash verified · Evidence service", "Reviewed · PSI Anjali R."].map((x) => (
              <div key={x} className="mt-2 flex gap-2 text-[10px] text-pramaan-text-secondary"><CheckCircle2 size={12} className="shrink-0 text-pramaan-success" />{x}</div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

function NetworkPlaceholder() {
  return (
    <div className="grid flex-1 place-items-center p-5">
      <div className="anim-content flex flex-col items-center gap-3 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-[8px] border border-pramaan-border text-pramaan-text-secondary"><Link2 size={22} /></div>
        <p className="text-[13px] font-medium">Network Explorer</p>
        <p className="max-w-xs text-[11px] leading-5 text-pramaan-text-secondary">Entity relationship graph for PRM-4821 — link analysis across persons, organisations, vehicles, and communications.</p>
      </div>
    </div>
  );
}
