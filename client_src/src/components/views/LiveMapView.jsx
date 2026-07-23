import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Camera, Layers, LocateFixed, RefreshCw, Route, Shield } from 'lucide-react';
import { api } from '../../api/client';
import { casePoints, cctvCoverage, geoBounds, hotspotPoints, jurisdictionPolygon, patrolTrail } from '../../data/geo';
import { WorkPanel } from '../ui/Layout';
import { type } from '../../design/scale';

const WIDTH = 1000;
const HEIGHT = 620;
const severityClass = {
  Critical: 'fill-pramaan-critical stroke-pramaan-critical',
  High: 'fill-pramaan-warning stroke-pramaan-warning',
  Medium: 'fill-pramaan-primary stroke-pramaan-primary',
  Low: 'fill-pramaan-success stroke-pramaan-success',
};

function project({ lat, lng }) {
  const x = ((lng - geoBounds.minLng) / (geoBounds.maxLng - geoBounds.minLng)) * WIDTH;
  const y = HEIGHT - ((lat - geoBounds.minLat) / (geoBounds.maxLat - geoBounds.minLat)) * HEIGHT;
  return { x, y };
}

function polygonPath(points) {
  return points.map((point) => {
    const { x, y } = project(point);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function linePath(points) {
  return points.map((point) => {
    const { x, y } = project(point);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function normaliseHotspots(payload) {
  const raw = Array.isArray(payload?.hotspots) ? payload.hotspots : [];
  if (!raw.length) return hotspotPoints;
  return raw.slice(0, 8).map((item, index) => {
    const fallback = hotspotPoints[index % hotspotPoints.length];
    const score = Number(item.score ?? item.count ?? item.weight ?? fallback.score);
    return {
      id: item.id || item.location || `HS-LIVE-${index + 1}`,
      name: item.location || item.name || fallback.name,
      lat: Number(item.lat ?? item.latitude ?? fallback.lat),
      lng: Number(item.lng ?? item.lon ?? item.longitude ?? fallback.lng),
      score,
      risk: score >= 85 ? 'Critical' : score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low',
      cases: Number(item.cases ?? item.count ?? fallback.cases),
      signal: item.signal || item.reason || fallback.signal,
    };
  });
}

export default function LiveMapView() {
  const [layers, setLayers] = useState({ hotspots: true, cases: true, cctv: true, trail: true });
  const [selected, setSelected] = useState(hotspotPoints[0]);
  const [hotspots, setHotspots] = useState(hotspotPoints);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('seed');
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const activeCases = casePoints.filter((item) => item.status !== 'Resolved').length;
    const critical = hotspots.filter((item) => item.risk === 'Critical').length;
    const cameras = cctvCoverage.filter((item) => item.health === 'Online').length;
    return { activeCases, critical, cameras, hotspots: hotspots.length };
  }, [hotspots]);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getHotspots();
      const next = normaliseHotspots(data);
      setHotspots(next);
      setSelected(next[0]);
      setSource(Array.isArray(data?.hotspots) && data.hotspots.length ? 'live' : 'seed');
    } catch (err) {
      setHotspots(hotspotPoints);
      setSource('seed');
      setError(err.message || 'Hotspot API unavailable. Showing curated demo seed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);
  const toggleLayer = (key) => setLayers((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        <MapStat icon={AlertTriangle} label="Critical hotspots" value={stats.critical} tone="critical" />
        <MapStat icon={Shield} label="Active cases" value={stats.activeCases} />
        <MapStat icon={Camera} label="Online CCTV" value={stats.cameras} />
        <MapStat icon={Activity} label="Map source" value={source === 'live' ? 'Live' : 'Seed'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <WorkPanel title="Bengaluru live crime map" eyebrow="GEOINT" className="min-h-[560px]" bodyClass="p-0" actions={<button onClick={refresh} disabled={loading} className="flex items-center gap-1 rounded-md border border-pramaan-border px-2 py-1 text-pramaan-text-secondary transition-colors hover:text-pramaan-text disabled:opacity-60" style={type.micro}><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh</button>}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pramaan-border px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <LayerToggle label="Hotspots" active={layers.hotspots} onClick={() => toggleLayer('hotspots')} />
              <LayerToggle label="Cases" active={layers.cases} onClick={() => toggleLayer('cases')} />
              <LayerToggle label="CCTV" active={layers.cctv} onClick={() => toggleLayer('cctv')} />
              <LayerToggle label="Trail" active={layers.trail} onClick={() => toggleLayer('trail')} />
            </div>
            <span className="rounded bg-pramaan-elevated px-2 py-1 text-pramaan-text-secondary" style={type.micro}>{source === 'live' ? 'Graph API /server/graph_fn/hotspots' : 'Fallback seed data'}</span>
          </div>

          {error && <div className="border-b border-pramaan-border bg-pramaan-warning/10 px-3 py-2 text-pramaan-warning" style={type.micro}>{error}</div>}

          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_25%_20%,rgba(74,158,255,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04)_0,transparent_35%)]">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet" className="h-[58vh] min-h-[430px] w-full max-h-[720px]" role="img" aria-label="Live crime geospatial visualization for Bengaluru">
              <defs>
                <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" /></pattern>
                <radialGradient id="heat-critical"><stop offset="0%" stopColor="rgba(229,103,92,0.55)" /><stop offset="70%" stopColor="rgba(229,103,92,0.18)" /><stop offset="100%" stopColor="rgba(229,103,92,0)" /></radialGradient>
                <radialGradient id="heat-high"><stop offset="0%" stopColor="rgba(255,184,77,0.48)" /><stop offset="72%" stopColor="rgba(255,184,77,0.15)" /><stop offset="100%" stopColor="rgba(255,184,77,0)" /></radialGradient>
              </defs>
              <rect width={WIDTH} height={HEIGHT} fill="url(#map-grid)" />
              <polygon points={polygonPath(jurisdictionPolygon)} fill="rgba(74,158,255,0.055)" stroke="rgba(125,184,255,0.38)" strokeWidth="2" />
              <g stroke="rgba(255,255,255,0.08)" strokeWidth="9" strokeLinecap="round" fill="none"><path d="M120 500 C270 430 400 410 560 300 S780 180 910 115" /><path d="M165 145 C330 190 450 258 625 370 S790 465 900 520" /><path d="M250 565 C340 420 415 320 520 230 S700 138 840 70" /></g>
              <g fill="rgba(154,160,166,0.72)" style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}><text x="92" y="505">Mysore Road</text><text x="660" y="154">Whitefield</text><text x="458" y="318">CBD</text><text x="340" y="452">Koramangala</text><text x="190" y="188">Yeshwanthpur</text></g>

              {layers.hotspots && hotspots.map((item) => {
                const { x, y } = project(item);
                const radius = 44 + Math.min(item.score, 100) * 0.55;
                const gradient = item.risk === 'Critical' ? 'url(#heat-critical)' : 'url(#heat-high)';
                return <g key={item.id} onClick={() => setSelected(item)} className="cursor-pointer"><circle cx={x} cy={y} r={radius} fill={gradient} /><circle cx={x} cy={y} r={9} className={severityClass[item.risk] || severityClass.Medium} strokeWidth="2.5" /><circle cx={x} cy={y} r={17} fill="none" className={severityClass[item.risk] || severityClass.Medium} strokeOpacity="0.45" strokeWidth="2" /><text x={x + 18} y={y - 12} fill="var(--pramaan-text)" style={{ fontSize: 13, fontWeight: 600 }}>{item.id}</text><text x={x + 18} y={y + 7} fill="var(--pramaan-text-secondary)" style={{ fontSize: 12 }}>{item.score} risk score</text></g>;
              })}

              {layers.cctv && cctvCoverage.map((item) => { const { x, y } = project(item); return <g key={item.id}><circle cx={x} cy={y} r={item.radius * 3} fill="rgba(74,158,255,0.05)" stroke="rgba(74,158,255,0.26)" strokeDasharray="5 6" /><rect x={x - 7} y={y - 7} width="14" height="14" rx="3" fill={item.health === 'Online' ? 'var(--pramaan-primary)' : 'var(--pramaan-warning)'} /></g>; })}
              {layers.trail && <g><polyline points={linePath(patrolTrail)} fill="none" stroke="var(--pramaan-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 8" />{patrolTrail.map((item, index) => { const { x, y } = project(item); return <circle key={item.label} cx={x} cy={y} r={5 + index} fill="var(--pramaan-secondary)" opacity={0.45 + index * 0.08} />; })}</g>}
              {layers.cases && casePoints.map((item) => { const { x, y } = project(item); return <g key={item.id} onClick={() => setSelected(item)} className="cursor-pointer"><path d={`M ${x} ${y - 15} l 13 26 h -26 z`} fill="var(--pramaan-bg)" stroke={item.status === 'Resolved' ? 'var(--pramaan-success)' : 'var(--pramaan-text)'} strokeWidth="2" /><text x={x + 14} y={y + 25} fill="var(--pramaan-text-secondary)" style={{ fontSize: 11 }}>{item.id}</text></g>; })}
            </svg>
          </div>
        </WorkPanel>

        <div className="flex flex-col gap-4">
          <WorkPanel title="Selected location" eyebrow="INSPECTOR" bodyClass="p-3"><div className="flex flex-col gap-3"><div><div className="text-pramaan-text" style={type.subheading}>{selected?.name || selected?.title}</div><div className="mt-1 text-pramaan-text-secondary" style={type.micro}>{selected?.id} - {selected?.risk || selected?.severity || 'Case marker'}</div></div><div className="grid grid-cols-2 gap-2"><Detail label="Cases" value={selected?.cases ?? selected?.status ?? 'Open'} /><Detail label="Score" value={selected?.score ?? 'Case'} /><Detail label="Latitude" value={Number(selected?.lat).toFixed(4)} /><Detail label="Longitude" value={Number(selected?.lng).toFixed(4)} /></div><div className="rounded-md border border-pramaan-border bg-pramaan-elevated/70 p-3 text-pramaan-text-secondary" style={type.body}>{selected?.signal || 'Case point selected. Use this marker to correlate nearby CCTV, movement trail and open FIR references.'}</div></div></WorkPanel>
          <WorkPanel title="Operational layers" eyebrow="TACTICAL" bodyClass="p-3"><div className="flex flex-col gap-2"><LayerRow icon={Layers} label="Hotspot heat" active={layers.hotspots} /><LayerRow icon={LocateFixed} label="Case markers" active={layers.cases} /><LayerRow icon={Camera} label="CCTV coverage" active={layers.cctv} /><LayerRow icon={Route} label="Movement trail" active={layers.trail} /></div></WorkPanel>
        </div>
      </div>
    </div>
  );
}

function MapStat({ icon: Icon, label, value, tone }) {
  return <div className="rounded-lg border border-pramaan-border bg-pramaan-surface p-3"><div className="flex items-center justify-between"><span className="text-pramaan-text-secondary" style={type.micro}>{label.toUpperCase()}</span><Icon size={15} className={tone === 'critical' ? 'text-pramaan-critical' : 'text-pramaan-primary'} /></div><div className="mt-2 font-mono text-xl font-semibold text-pramaan-text">{value}</div></div>;
}
function LayerToggle({ label, active, onClick }) {
  return <button onClick={onClick} className={`rounded-md border px-2 py-1 transition-colors ${active ? 'border-pramaan-primary bg-pramaan-primary/15 text-pramaan-secondary' : 'border-pramaan-border text-pramaan-text-secondary hover:text-pramaan-text'}`} style={type.micro}>{label}</button>;
}
function Detail({ label, value }) {
  return <div className="rounded-md bg-pramaan-elevated p-2"><div className="text-pramaan-text-secondary" style={type.micro}>{label}</div><div className="mt-1 font-mono text-pramaan-text" style={type.label}>{value}</div></div>;
}
function LayerRow({ icon: Icon, label, active }) {
  return <div className="flex items-center justify-between rounded-md bg-pramaan-elevated px-3 py-2"><span className="flex items-center gap-2 text-pramaan-text-secondary" style={type.label}><Icon size={14} /> {label}</span><span className={active ? 'text-pramaan-success' : 'text-pramaan-text-secondary'} style={type.micro}>{active ? 'Visible' : 'Hidden'}</span></div>;
}
