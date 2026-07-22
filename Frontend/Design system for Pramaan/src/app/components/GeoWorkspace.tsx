import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Layers3, Plus, Minus, Search, SlidersHorizontal } from "lucide-react";
import { RangeScrubber } from "./RangeScrubber";
import { entityMeta, ConfidenceWhy, Skeleton } from "./primitives";
import { WHITEFIELD, trails, evidencePoints, cctv, jurisdiction, densityPoints } from "../data/geo";
import { DAY_START, DAY_END, minutesToLabel } from "../data/timeline";

type LayerKey = "jurisdiction" | "density" | "trails" | "evidence" | "cctv";

const LAYER_ITEMS: { key: LayerKey; label: string; note: string }[] = [
  { key: "jurisdiction", label: "Jurisdiction boundaries", note: "Whitefield division" },
  { key: "density", label: "Crime density", note: "Related incidents · 30 days" },
  { key: "trails", label: "Movement trails", note: "Vehicle + device correlations" },
  { key: "evidence", label: "Evidence locations", note: `${evidencePoints.length} verified points` },
  { key: "cctv", label: "CCTV coverage", note: "Registered camera radii" },
];

/* Monochrome line icon inside a colour-coded ring — never a filled pin. */
const ICON_SVG: Record<string, string> = {
  video: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
};

function ringIcon(color: string, svgKey: string) {
  return L.divIcon({
    className: "pramaan-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="width:30px;height:30px;border-radius:50%;border:2px solid ${color};background:#0B0D10;display:grid;place-items:center;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_SVG[svgKey]}</svg>
    </div>`,
  });
}

export function GeoWorkspace() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlaysRef = useRef<L.LayerGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    jurisdiction: true, density: false, trails: true, evidence: true, cctv: false,
  });
  const [range, setRange] = useState<[number, number]>([DAY_START, DAY_END]);

  const activeCount = Object.values(layers).filter(Boolean).length;
  const toggle = (k: LayerKey) => setLayers((p) => ({ ...p, [k]: !p[k] }));

  // Init map once with CARTO dark-matter tiles.
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { center: WHITEFIELD, zoom: 15, zoomControl: false, attributionControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 20,
      attribution: "© OpenStreetMap · © CARTO",
    }).addTo(map);
    overlaysRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const t = setTimeout(() => { map.invalidateSize(); setLoading(false); }, 500);
    return () => { clearTimeout(t); map.remove(); mapRef.current = null; };
  }, []);

  // Redraw overlays whenever layers or the time range change (live update).
  useEffect(() => {
    const g = overlaysRef.current;
    if (!g) return;
    g.clearLayers();
    const [rs, re] = range;
    const inRange = (m: number) => m >= rs && m <= re;

    if (layers.jurisdiction) {
      L.polygon(jurisdiction, { color: "#4A9EFF", weight: 1.5, opacity: 0.7, fill: true, fillColor: "#4A9EFF", fillOpacity: 0.04, dashArray: "4 4" })
        .bindTooltip("Whitefield division · BBMP", { direction: "top" }).addTo(g);
    }

    if (layers.density) {
      const pts = densityPoints.map(([lat, lng, i]) => [lat, lng, i] as [number, number, number]);
      // Single-hue (blue) heatmap gradient.
      (L as any).heatLayer(pts, {
        radius: 34, blur: 26, maxZoom: 17, minOpacity: 0.25,
        gradient: { 0.2: "#12324f", 0.5: "#1e5a99", 0.8: "#3a86e0", 1.0: "#4A9EFF" },
      }).addTo(g);
    }

    if (layers.cctv) {
      cctv.forEach((c) => {
        L.circle([c.lat, c.lng], { radius: c.radius, color: "#7DB8FF", weight: 1, opacity: 0.5, fillColor: "#7DB8FF", fillOpacity: 0.06 })
          .bindTooltip(`${c.id} · ${c.label}`, { direction: "top" }).addTo(g);
      });
    }

    if (layers.trails) {
      trails.forEach((tr) => {
        const seg = tr.points.filter((p) => inRange(p.minute));
        if (seg.length >= 2) {
          L.polyline(seg.map((p) => [p.lat, p.lng]), {
            color: entityMeta[tr.type].color, weight: 2, opacity: 0.9, className: "trail-dash",
          }).bindTooltip(tr.label, { sticky: true }).addTo(g);
        }
        seg.forEach((p) =>
          L.circleMarker([p.lat, p.lng], { radius: 3, color: entityMeta[tr.type].color, fillColor: "#0B0D10", fillOpacity: 1, weight: 2 }).addTo(g),
        );
      });
    }

    if (layers.evidence) {
      evidencePoints.filter((e) => inRange(e.minute)).forEach((e) => {
        L.marker([e.lat, e.lng], { icon: ringIcon(entityMeta[e.type].color, e.kind) })
          .bindTooltip(`${e.id} · ${e.label} · ${minutesToLabel(e.minute)}`, { direction: "top", offset: [0, -12] }).addTo(g);
      });
    }
  }, [layers, range]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-pramaan-border px-5">
        <div>
          <h1 className="text-[15px] font-semibold tracking-[-0.01em]">Geospatial Intelligence</h1>
          <p className="mt-0.5 text-[11px] text-pramaan-text-secondary">PRM-4821 · Whitefield operational area</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-[4px] border border-pramaan-border bg-pramaan-surface px-3 py-1.5 text-[11px] text-pramaan-text-secondary hover:text-pramaan-text"><Search size={14} />Find location</button>
          <button className="grid h-8 w-8 place-items-center rounded-[4px] border border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text"><SlidersHorizontal size={15} /></button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Layer control */}
        <section className="flex w-[286px] shrink-0 flex-col border-r border-pramaan-border bg-pramaan-surface">
          <div className="flex items-center justify-between border-b border-pramaan-border px-4 py-3">
            <div>
              <p className="text-[12px] font-medium">Analytic layers</p>
              <p className="mt-0.5 font-mono text-[9px] text-pramaan-text-secondary">{activeCount} OF {LAYER_ITEMS.length} ACTIVE</p>
            </div>
            <Layers3 size={16} className="text-pramaan-text-secondary" />
          </div>
          <div className="p-2">
            {LAYER_ITEMS.map(({ key, label, note }) => (
              <button key={key} onClick={() => toggle(key)} aria-pressed={layers[key]} className="flex w-full items-center gap-3 rounded-[2px] px-2 py-2.5 text-left hover:bg-pramaan-hover focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary">
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-[2px] border ${layers[key] ? "border-pramaan-primary bg-pramaan-primary" : "border-pramaan-border-strong"}`}>
                  {layers[key] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0B0D10" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                </span>
                <span>
                  <span className="block text-[11px] text-pramaan-text">{label}</span>
                  <span className="mt-0.5 block font-mono text-[9px] text-pramaan-text-secondary">{note}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mx-4 mt-2 border-t border-pramaan-border pt-3">
            <ConfidenceWhy
              confidence={83}
              claim="Vehicle and device trails converge within 130m of the reported exchange location during the 10:30–10:45 window."
              evidence={["Vehicle trail · KA-05-MN-4812", "Device trail · +91 98452 11876", "CCTV-42 dwell time · Whitefield Toll"]}
            />
          </div>
        </section>

        {/* Map */}
        <section className="relative min-w-0 flex-1">
          {loading && (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-pramaan-bg">
              <div className="w-64 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          )}
          <div ref={mapEl} className="absolute inset-0" />
          <div className="pointer-events-none absolute bottom-3 left-3 z-[400] border border-pramaan-border bg-pramaan-surface/90 p-2 font-mono text-[9px] text-pramaan-text-secondary">
            12.9698° N · 77.7500° E<br />WHITEFIELD · BENGALURU
          </div>
          <div className="absolute right-3 top-3 z-[400] flex flex-col overflow-hidden rounded-[4px] border border-pramaan-border bg-pramaan-surface">
            <button onClick={() => mapRef.current?.zoomIn()} className="grid h-8 w-8 place-items-center text-pramaan-text-secondary hover:bg-pramaan-hover hover:text-pramaan-text"><Plus size={15} /></button>
            <button onClick={() => mapRef.current?.zoomOut()} className="grid h-8 w-8 place-items-center border-t border-pramaan-border text-pramaan-text-secondary hover:bg-pramaan-hover hover:text-pramaan-text"><Minus size={15} /></button>
          </div>
        </section>
      </div>

      <RangeScrubber min={DAY_START} max={DAY_END} start={range[0]} end={range[1]} onChange={(s, e) => setRange([s, e])} format={minutesToLabel} />
    </div>
  );
}
