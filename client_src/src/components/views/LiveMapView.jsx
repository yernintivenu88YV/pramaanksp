import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Layers, MapPin, RefreshCw, Shield, Search, Eye, Radio, Camera, Car, Compass, Crosshair, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { HotspotMap } from '../dashboard/HotspotMap';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';

const ALL_HOTSPOTS = [
  { cluster_id: 'HOTSPOT-1', latitude: 12.9579, longitude: 77.6251, density: 14, primary_crime: 'Burglary', case_ids: ['CASE-001', 'CASE-002', 'CASE-008', 'CASE-012'] },
  { cluster_id: 'HOTSPOT-2', latitude: 13.0285, longitude: 77.5896, density: 8, primary_crime: 'Vehicle theft', case_ids: ['CASE-005'] },
  { cluster_id: 'HOTSPOT-3', latitude: 12.9258, longitude: 77.6394, density: 6, primary_crime: 'Burglary', case_ids: ['CASE-003'] },
  { cluster_id: 'HOTSPOT-4', latitude: 12.9716, longitude: 77.5946, density: 9, primary_crime: 'Chain snatching', case_ids: ['CASE-004'] },
  { cluster_id: 'HOTSPOT-5', latitude: 12.9352, longitude: 77.6245, density: 11, primary_crime: 'Burglary', case_ids: ['CASE-009'] },
  { cluster_id: 'HOTSPOT-6', latitude: 15.3647, longitude: 75.1240, density: 7, primary_crime: 'Extortion', case_ids: ['CASE-006'] },
  { cluster_id: 'HOTSPOT-7', latitude: 12.2958, longitude: 76.6394, density: 5, primary_crime: 'Vehicle theft', case_ids: ['CASE-007'] },
  { cluster_id: 'HOTSPOT-8', latitude: 15.8497, longitude: 74.4977, density: 6, primary_crime: 'Robbery', case_ids: ['CASE-011'] },
  { cluster_id: 'HOTSPOT-9', latitude: 13.3409, longitude: 77.1010, density: 4, primary_crime: 'Burglary', case_ids: ['CASE-013'] },
  { cluster_id: 'HOTSPOT-10', latitude: 12.9141, longitude: 74.8560, density: 5, primary_crime: 'Extortion', case_ids: ['CASE-014'] },
  { cluster_id: 'HOTSPOT-11', latitude: 13.0827, longitude: 80.2707, density: 7, primary_crime: 'Robbery', case_ids: ['CASE-015'] },
  { cluster_id: 'HOTSPOT-12', latitude: 12.9784, longitude: 77.5726, density: 5, primary_crime: 'Cyber', case_ids: ['CASE-016'] },
  { cluster_id: 'HOTSPOT-13', latitude: 12.7842, longitude: 77.7214, density: 8, primary_crime: 'Interstate Gang', case_ids: ['CASE-017'] },
  { cluster_id: 'HOTSPOT-14', latitude: 12.9812, longitude: 77.6189, density: 6, primary_crime: 'Narcotics', case_ids: ['CASE-018'] },
  { cluster_id: 'HOTSPOT-15', latitude: 12.9642, longitude: 77.6012, density: 5, primary_crime: 'Chain snatching', case_ids: ['CASE-019'] },
];

export default function LiveMapView({ activeRole = 'ACP' }) {
  const [hotspots, setHotspots] = useState(ALL_HOTSPOTS);
  const [mode, setMode] = useState('live');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('HOTSPOT-1');
  const [satMode, setSatMode] = useState('Google Satellite (Hybrid / Labeled)');
  const [searchTarget, setSearchTarget] = useState('');
  const [crimeFilter, setCrimeFilter] = useState('All Crimes (15 Clusters)');
  const [dispatchMsg, setDispatchMsg] = useState(null);

  // Layers Toggles
  const [layers, setLayers] = useState({
    hotspots: true,
    mobilePings: true,
    btsTowers: true,
    patrols: true,
    cctv: true,
    trails: true
  });

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selected = hotspots.find((h) => h.cluster_id === selectedId) || hotspots[0];

  const handleDispatch = () => {
    setDispatchMsg(`Tactical Unit PATROL-04 dispatched to ${selected.cluster_id} (ETA: 4 mins). Command logged.`);
    setTimeout(() => setDispatchMsg(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="GEOINT · /server/graph_fn/hotspots"
        title="Karnataka crime hotspot map"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <RefreshCw size={13} className={`text-[#3AAFA9] ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        }
      >
        
        {/* ========================================================================= */}
        {/* FIRST IMAGE SECTION (STACKED FIRST): 6 Stat Cards + Satellite Controls Bar */}
        {/* ========================================================================= */}
        <div className="space-y-5 mb-6">
          
          {/* Top 6 Stat Cards Row (From Image 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-3.5 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#2B7A78] uppercase">
                <span>HOTSPOTS</span><MapPin size={14} className="text-[#3AAFA9]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17252A] mt-1">15</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#2B7A78] uppercase">
                <span>TOTAL INCIDENTS</span><AlertTriangle size={14} className="text-amber-600" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17252A] mt-1">106</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#2B7A78] uppercase">
                <span>MOBILE TARGETS</span><Radio size={14} className="text-[#3AAFA9]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17252A] mt-1">6</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#2B7A78] uppercase">
                <span>ACTIVE PATROLS</span><Compass size={14} className="text-[#2B7A78]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17252A] mt-1">5</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#B3E3DE] bg-[#DEF2F1]/50 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#2B7A78] uppercase">
                <span>CCTV GRID</span><Camera size={14} className="text-[#2B7A78]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#17252A] mt-1">5</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#3AAFA9] bg-[#2B7A78] text-white shadow-xs">
              <div className="text-[10px] font-mono font-bold text-[#3AAFA9] uppercase">SATELLITE MODE</div>
              <div className="text-xs font-black font-mono text-white mt-1 truncate">Google Hybrid</div>
            </div>
          </div>

          {/* Satellite Map Mode Controls Card (From Image 1) */}
          <div className="p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] space-y-4 shadow-xs">
            
            {/* Mode Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-[#17252A] flex items-center gap-1 shrink-0">
                <Layers size={14} className="text-[#3AAFA9]" /> Satellite Map Mode:
              </span>
              {['Google Satellite (Hybrid / Labeled)', 'Google Satellite (Pure)', 'Esri Satellite Real-Time', 'Dark Command Vector', 'OpenStreetMap'].map((m) => {
                const isSelected = satMode === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSatMode(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#2B7A78] text-white border border-[#3AAFA9] shadow-xs scale-[1.02]'
                        : 'bg-[#DEF2F1] text-[#2B7A78] hover:bg-[#2B7A78] hover:text-white border border-[#B3E3DE]'
                    }`}
                  >
                    {m === 'Google Satellite (Hybrid / Labeled)' ? 'Google Satellite (Hybrid) HYBRID' : m}
                  </button>
                );
              })}
            </div>

            {/* City/Target/IMEI Search Input */}
            <div className="flex items-center gap-2 max-w-md">
              <div className="flex items-center gap-2 flex-1 bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl px-3 py-1.5">
                <Search size={14} className="text-[#2B7A78]" />
                <input
                  type="text"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  placeholder="Search city, target, IMEI..."
                  className="w-full bg-transparent text-xs text-[#17252A] outline-none font-mono font-semibold placeholder-[#2B7A78]/60"
                />
              </div>
              <button className="px-4 py-1.5 rounded-xl bg-[#17252A] hover:bg-[#2B7A78] text-white text-xs font-mono font-bold cursor-pointer border border-[#3AAFA9]">
                Find
              </button>
            </div>

            {/* Grid Layers Toggles & Crime Filter */}
            <div className="pt-2 border-t border-[#B3E3DE] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                <span className="text-[#17252A] text-xs">Grid Layers:</span>
                <button onClick={() => toggleLayer('hotspots')} className={`px-3 py-1 rounded-full border text-[11px] cursor-pointer ${layers.hotspots ? 'bg-amber-500 text-white border-amber-600' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'}`}>
                  🔥 Hotspots (15)
                </button>
                <button onClick={() => toggleLayer('mobilePings')} className={`px-3 py-1 rounded-full border text-[11px] cursor-pointer ${layers.mobilePings ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'}`}>
                  📱 Mobile Target Pings (6)
                </button>
                <button onClick={() => toggleLayer('btsTowers')} className={`px-3 py-1 rounded-full border text-[11px] cursor-pointer ${layers.btsTowers ? 'bg-blue-600 text-white border-blue-700' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'}`}>
                  📡 BTS Cell Towers (6)
                </button>
                <button onClick={() => toggleLayer('patrols')} className={`px-3 py-1 rounded-full border text-[11px] cursor-pointer ${layers.patrols ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'}`}>
                  🚓 Police Patrols (5)
                </button>
                <button onClick={() => toggleLayer('cctv')} className={`px-3 py-1 rounded-full border text-[11px] cursor-pointer ${layers.cctv ? 'bg-rose-600 text-white border-rose-700' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'}`}>
                  📷 CCTV Grid (5)
                </button>
                <button onClick={() => toggleLayer('trails')} className={`px-3 py-1 rounded-full border text-[11px] cursor-pointer ${layers.trails ? 'bg-purple-600 text-white border-purple-700' : 'bg-[#DEF2F1] text-[#2B7A78] border-[#B3E3DE]'}`}>
                  🛣️ Target Trails
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#17252A]">Crime Filter:</span>
                <select
                  value={crimeFilter}
                  onChange={(e) => setCrimeFilter(e.target.value)}
                  className="bg-[#DEF2F1] border border-[#B3E3DE] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#17252A] outline-none cursor-pointer"
                >
                  <option>All Crimes (15 Clusters)</option>
                  <option>Burglary (5 Clusters)</option>
                  <option>Vehicle Theft (2 Clusters)</option>
                  <option>Extortion (2 Clusters)</option>
                  <option>Chain Snatching (2 Clusters)</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECOND IMAGE SECTION (STACKED SECOND BELOW CONTROLS): Map Canvas & Clusters List */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
          
          {/* Leaflet Hotspot Map Canvas (8.5 cols) */}
          <div className="xl:col-span-8 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] p-2 shadow-xs overflow-hidden">
            <HotspotMap hotspots={hotspots} mode={mode} loading={loading} height={520} />
          </div>

          {/* SPATIAL Clusters List (3.5 cols) */}
          <div className="xl:col-span-4 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-2">
              <span className="text-xs font-mono font-extrabold uppercase text-[#17252A]">SPATIAL Clusters</span>
              <span className="text-[10px] font-mono text-[#2B7A78] font-bold">15 Active Areas</span>
            </div>

            <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1">
              {hotspots.map((h) => {
                const isSelected = h.cluster_id === selectedId;
                return (
                  <button
                    key={h.cluster_id}
                    onClick={() => setSelectedId(h.cluster_id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#DEF2F1] border-[#3AAFA9] ring-1 ring-[#3AAFA9]/50 font-bold'
                        : 'bg-[#FEFFFF] border-[#B3E3DE] hover:bg-[#DEF2F1]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-[#17252A]">📍 {h.cluster_id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#2B7A78] text-white text-[10px] font-mono font-bold">
                        {h.density} incidents
                      </span>
                    </div>
                    <div className="text-[11px] text-[#2B7A78] font-semibold mt-1">{h.primary_crime}</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* THIRD IMAGE SECTION (STACKED THIRD BELOW MAP): Map Legend & Cluster Inspector */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Map Legend Box (Bottom Left - 7 cols) */}
          <div className="xl:col-span-7 p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#B3E3DE] pb-2">
              <Compass size={16} className="text-[#3AAFA9]" />
              <span className="text-xs font-mono font-extrabold uppercase text-[#17252A]">📍 Map Legend:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-bold">
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">● Burglary</span>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300">● Vehicle theft</span>
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-900 border border-red-300">● Chain snatching</span>
              <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-900 border border-pink-300">● Extortion</span>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300">● Robbery</span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300">● Cyber</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-900 text-white border border-amber-950">● Interstate Gang</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">● Narcotics</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-black">🟢 Mobile Target Ping</span>
              <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black">⭕ BTS Cell Tower</span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-black">🚓 Police Patrol</span>
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black">📷 CCTV Camera</span>
            </div>
          </div>

          {/* Selected Cluster Inspector Card (Bottom Right - 5 cols) */}
          <div className="xl:col-span-5 p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-2">
              <span className="text-[10px] font-mono font-extrabold uppercase text-[#2B7A78]">INSPECTOR Selected cluster</span>
              <span className="font-mono text-xs font-black text-[#17252A]">{selected.cluster_id}</span>
            </div>

            {dispatchMsg && (
              <div className="p-3 rounded-xl bg-[#DEF2F1] border border-[#3AAFA9] text-xs font-mono font-bold text-[#17252A] flex items-center gap-2">
                <Shield size={16} className="text-[#3AAFA9]" />
                {dispatchMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold text-[#2B7A78]">
              <div className="p-2.5 rounded-xl bg-[#DEF2F1]/50 border border-[#B3E3DE]">
                <div className="text-[10px] text-[#2B7A78] uppercase">Density</div>
                <div className="text-base font-black text-[#17252A] mt-0.5">{selected.density}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#DEF2F1]/50 border border-[#B3E3DE]">
                <div className="text-[10px] text-[#2B7A78] uppercase">Primary crime</div>
                <div className="text-base font-black text-[#17252A] mt-0.5">{selected.primary_crime}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#DEF2F1]/50 border border-[#B3E3DE]">
                <div className="text-[10px] text-[#2B7A78] uppercase">Latitude</div>
                <div className="text-xs font-black text-[#17252A] mt-0.5">{Number(selected.latitude).toFixed(4)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#DEF2F1]/50 border border-[#B3E3DE]">
                <div className="text-[10px] text-[#2B7A78] uppercase">Longitude</div>
                <div className="text-xs font-black text-[#17252A] mt-0.5">{Number(selected.longitude).toFixed(4)}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#DEF2F1] border border-[#B3E3DE] space-y-1">
              <span className="text-[10px] font-mono text-[#2B7A78] font-bold uppercase block">Cases in cluster</span>
              <div className="font-mono text-xs font-black text-[#17252A]">
                {(selected.case_ids || []).join(', ') || 'CASE-001, CASE-002, CASE-008, CASE-012'}
              </div>
            </div>

            <button
              onClick={handleDispatch}
              className="w-full py-2.5 px-4 bg-[#17252A] hover:bg-[#2B7A78] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2 border border-[#3AAFA9]/40"
            >
              <Shield size={14} className="text-[#3AAFA9]" /> Dispatch Patrol Unit to {selected.cluster_id}
            </button>
          </div>

        </div>

      </WorkPanel>
    </div>
  );
}
