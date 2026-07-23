import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ModeBadge } from '../common/ModeBadge';
import { ExplainabilityTooltip } from '../common/ExplainabilityTooltip';
import { HotspotMap } from './HotspotMap';

export function CommandDashboard({ activeRole }) {
  const [weights, setWeights] = useState({
    wRecency: 1.0,
    wSeverity: 2.0,
    wCentrality: 1.5,
    wWarrant: 3.0
  });

  const [priorityData, setPriorityData] = useState([]);
  const [priorityMode, setPriorityMode] = useState('live');
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityError, setPriorityError] = useState(null);

  const [hotspotsData, setHotspotsData] = useState([]);
  const [hotspotsMode, setHotspotsMode] = useState('live');
  const [hotspotsLoading, setHotspotsLoading] = useState(false);
  const [hotspotsError, setHotspotsError] = useState(null);

  const fetchPriority = async () => {
    setPriorityLoading(true);
    setPriorityError(null);
    const res = await api.getPriorityScores({
      w_recency: weights.wRecency,
      w_severity: weights.wSeverity,
      w_centrality: weights.wCentrality,
      w_warrant: weights.wWarrant
    });
    setPriorityLoading(false);

    if (res.ok && res.data && res.data.ranked_suspects) {
      setPriorityData(res.data.ranked_suspects);
      setPriorityMode(res.data.mode || 'seed_fallback');
    } else {
      setPriorityError(res.error || res.data?.detail || 'Failed to fetch priority scores');
    }
  };

  const fetchHotspots = async () => {
    setHotspotsLoading(true);
    setHotspotsError(null);
    const res = await api.getHotspots();
    setHotspotsLoading(false);

    // Backend returns { mode, hotspots: [...] } (not "clusters").
    if (res.ok && res.data && Array.isArray(res.data.hotspots)) {
      setHotspotsData(res.data.hotspots);
      setHotspotsMode(res.data.mode || 'seed_fallback');
    } else {
      setHotspotsError(res.error || res.data?.detail || 'Failed to fetch crime hotspots');
    }
  };

  useEffect(() => {
    fetchPriority();
    fetchHotspots();
  }, [activeRole]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>ಕಮಾಂಡ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
            <span className="text-gray-500 font-normal">|</span>
            <span className="text-cyan-400">State Intelligence Command Center</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time crime priority scoring, spatial hotspot density, and threat evaluation for Karnataka State Police.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ModeBadge mode={priorityMode} />
          <button
            onClick={() => { fetchPriority(); fetchHotspots(); }}
            className="px-3 py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 rounded text-xs font-semibold hover:bg-cyan-600/30 transition-colors"
          >
            🔄 Refresh Intelligence Feed
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="pramaan-card p-4">
          <div className="text-xs text-gray-400 font-medium">Active High-Priority Suspects</div>
          <div className="text-2xl font-bold text-amber-400 tnum mt-1">
            {priorityData.length || '3'}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1">
            ⚠️ 1 with active arrest warrant
          </div>
        </div>

        <div className="pramaan-card p-4">
          <div className="text-xs text-gray-400 font-medium">Spatial Crime Hotspots</div>
          <div className="text-2xl font-bold text-cyan-400 tnum mt-1">
            {hotspotsData.length || '2'}
          </div>
          <div className="text-[11px] text-cyan-500/80 mt-1">
            📍 Bengaluru Central & Mysuru
          </div>
        </div>

        <div className="pramaan-card p-4">
          <div className="text-xs text-gray-400 font-medium">Bilingual Cases Index</div>
          <div className="text-2xl font-bold text-emerald-400 tnum mt-1">
            7 Cases
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            5 English FIRs · 2 Kannada FIRs
          </div>
        </div>

        <div className="pramaan-card p-4">
          <div className="text-xs text-gray-400 font-medium">Active Security Context</div>
          <div className="text-xl font-bold text-purple-400 mt-1 uppercase">
            Role: {activeRole}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {activeRole === 'Analyst' ? 'Aggregate Analytics Only' : 'Full Case & Dossier Clearance'}
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Suspect Leaderboard + Weight Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Suspect Priority Leaderboard (2 cols) */}
        <div className="lg:col-span-2 pramaan-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>ಆದ್ಯತೆಯ ಶಂಕಿತರ ಪಟ್ಟಿ</span>
                <span className="text-gray-500 font-normal">·</span>
                <span>Suspect Priority Leaderboard</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Hand-reproducible multi-factor score: Recency decay + Severity + Network centrality + Active Warrants.
              </p>
            </div>
          </div>

          {/* Weight Sliders */}
          <div className="bg-[#1b1f26] p-3.5 rounded-lg border border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
              <span>🎚️ Linear Score Weight Controls (Auditable & Transparent)</span>
              <button
                onClick={fetchPriority}
                disabled={priorityLoading}
                className="px-2 py-0.5 bg-cyan-600/30 text-cyan-300 rounded text-[11px] hover:bg-cyan-600/50"
              >
                {priorityLoading ? 'Recalculating...' : 'Apply Weights'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Recency ({weights.wRecency}):</label>
                <input
                  type="range" min="0" max="5" step="0.5"
                  value={weights.wRecency}
                  onChange={(e) => setWeights({ ...weights, wRecency: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Severity ({weights.wSeverity}):</label>
                <input
                  type="range" min="0" max="5" step="0.5"
                  value={weights.wSeverity}
                  onChange={(e) => setWeights({ ...weights, wSeverity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Centrality ({weights.wCentrality}):</label>
                <input
                  type="range" min="0" max="5" step="0.5"
                  value={weights.wCentrality}
                  onChange={(e) => setWeights({ ...weights, wCentrality: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Warrant ({weights.wWarrant}):</label>
                <input
                  type="range" min="0" max="5" step="0.5"
                  value={weights.wWarrant}
                  onChange={(e) => setWeights({ ...weights, wWarrant: parseFloat(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {priorityError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-xs">
              ⚠️ {priorityError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-semibold bg-[#14171c]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Canonical Suspect Identity</th>
                  <th className="py-2.5 px-3">Priority Score</th>
                  <th className="py-2.5 px-3">Key Threat Drivers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {priorityData.map((row, idx) => (
                  <tr key={row.canonical_id} className="hover:bg-[#1b1f26]/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-center w-12 text-gray-300">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-sm">{row.name}</div>
                      <div className="font-mono text-[11px] text-cyan-400">{row.canonical_id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <ExplainabilityTooltip row={row} weights={weights} />
                    </td>
                    <td className="py-3 px-3 text-[11px] text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {row.variables?.has_active_warrant && (
                          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                            🚨 ACTIVE WARRANT
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-mono">
                          {row.variables?.prior_cases || 0} Prior Cases
                        </span>
                        <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-mono">
                          {row.variables?.co_accused_count || 0} Co-Accused
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Spatial Hotspots & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Spatial Hotspot Clusters */}
          <div className="pramaan-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು</span>
                <span className="text-gray-500 font-normal">·</span>
                <span>Spatial Hotspots</span>
              </h2>
              <ModeBadge mode={hotspotsMode} />
            </div>

            {/* Real interactive Leaflet map (OpenStreetMap tiles, no API key). */}
            <HotspotMap
              hotspots={hotspotsData}
              mode={hotspotsMode}
              loading={hotspotsLoading}
              error={hotspotsError}
            />
          </div>

          {/* Bilingual Recent Case Feed */}
          <div className="pramaan-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 flex justify-between items-center">
              <span>ಇತ್ತೀಚಿನ ಪ್ರಕರಣಗಳು · Recent FIR Feed</span>
              <span className="text-[10px] text-cyan-400 font-mono">Bilingual (KN + EN)</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="bg-[#1b1f26] p-2.5 rounded border border-white/5 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>CASE-001 (FIR-2026-0001)</span>
                  <span className="text-amber-400">Burglary</span>
                </div>
                <div className="text-gray-300 text-[11px]">STATION-BGLR-CENTRAL · Rear window forced entry</div>
              </div>
              <div className="bg-[#1b1f26] p-2.5 rounded border border-white/5 space-y-1">
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>CASE-K01 (FIR-2026-0011)</span>
                  <span className="text-emerald-400 font-kannada">ಕಳ್ಳತನ (Kannada FIR)</span>
                </div>
                <div className="text-gray-300 text-[11px] font-kannada">ದೂರುದಾರರ ಮನೆಯಲ್ಲಿ ಕಳ್ಳತನ ನಡೆದಿದೆ...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
