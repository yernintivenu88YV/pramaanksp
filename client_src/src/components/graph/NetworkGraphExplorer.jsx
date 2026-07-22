import React, { useState } from 'react';
import { api } from '../../api/client';
import { ModeBadge } from '../common/ModeBadge';

export function NetworkGraphExplorer({ activeRole }) {
  const [graphCanonId, setGraphCanonId] = useState('CANON-0042');
  const [graphData, setGraphData] = useState(null);
  const [graphMode, setGraphMode] = useState('live');
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState(null);

  const [communityData, setCommunityData] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(false);

  const handleTraverse = async () => {
    setGraphLoading(true);
    setGraphError(null);
    const res = await api.traverseGraph(graphCanonId);
    setGraphLoading(false);

    if (res.ok && res.data) {
      setGraphData(res.data);
      setGraphMode(res.data.mode || 'seed_fallback');
    } else {
      setGraphError(res.error || res.data?.detail || 'Traversal failed');
    }
  };

  const handleLeiden = async () => {
    setCommunityLoading(true);
    const res = await api.getCommunities();
    setCommunityLoading(false);

    if (res.ok && res.data && res.data.communities) {
      setCommunityData(res.data.communities);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>ಅಪರಾಧ ಜಾಲದ ಅನ್ವೇಷಕ</span>
          <span className="text-gray-500 font-normal">|</span>
          <span className="text-cyan-400">GDS Criminal Network Explorer</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Interactive relationship topology connecting canonical suspects, cases, getaway vehicles, and Leiden syndicate clusters.
        </p>
      </div>

      {/* Control Panel */}
      <div className="pramaan-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-300 font-bold">Canonical Suspect ID:</label>
          <input
            type="text"
            value={graphCanonId}
            onChange={(e) => setGraphCanonId(e.target.value)}
            className="w-36 bg-[#1b1f26] border border-white/10 text-white text-xs px-2 py-1 rounded font-mono"
          />
          <button
            onClick={handleTraverse}
            disabled={graphLoading || activeRole === 'Analyst'}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeRole === 'Analyst'
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-600/50'
            }`}
          >
            {graphLoading ? 'Traversing...' : 'Traverse Suspect Network'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLeiden}
            disabled={communityLoading}
            className="px-3 py-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 rounded text-xs font-bold hover:bg-emerald-600/50 transition-colors"
          >
            {communityLoading ? 'Running Leiden...' : 'Run Leiden Associate Clustering'}
          </button>
          <ModeBadge mode={graphMode} />
        </div>
      </div>

      {graphError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-xs">
          ⚠️ {graphError}
        </div>
      )}

      {/* Interactive Network Graph SVG & Communities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Node-Link SVG Topology (2 cols) */}
        <div className="lg:col-span-2 pramaan-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-2">
            Visual Relationship Topology
          </h2>

          <div className="w-full h-80 bg-[#0b0d10] border border-white/10 rounded-lg flex items-center justify-center relative overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 500 300">
              {/* Central Canonical Node */}
              <g transform="translate(250, 150)">
                <circle r="26" fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="2" className="animate-pulse" />
                <circle r="18" fill="#06b6d4" />
                <text textAnchor="middle" dy="4" fill="#0b0d10" fontSize="10" fontWeight="bold">SUSPECT</text>
                <text textAnchor="middle" dy="38" fill="#e8eaed" fontSize="11" fontWeight="bold">{graphCanonId}</text>
              </g>

              {/* Edge Links */}
              <line x1="250" y1="150" x2="100" y2="80" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="250" y1="150" x2="400" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="250" y1="150" x2="250" y2="250" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Connected Nodes */}
              <g transform="translate(100, 80)">
                <circle r="14" fill="#3b82f6" />
                <text textAnchor="middle" dy="4" fill="white" fontSize="9" fontWeight="bold">CASE</text>
                <text textAnchor="middle" dy="24" fill="#9aa0a6" fontSize="10">CASE-001</text>
              </g>

              <g transform="translate(400, 80)">
                <circle r="14" fill="#ef4444" />
                <text textAnchor="middle" dy="4" fill="white" fontSize="9" fontWeight="bold">VEH</text>
                <text textAnchor="middle" dy="24" fill="#9aa0a6" fontSize="10">KA-02-MB-1234</text>
              </g>

              <g transform="translate(250, 250)">
                <circle r="14" fill="#10b981" />
                <text textAnchor="middle" dy="4" fill="white" fontSize="9" fontWeight="bold">CASE</text>
                <text textAnchor="middle" dy="24" fill="#9aa0a6" fontSize="10">CASE-005</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Leiden Community Clusters */}
        <div className="pramaan-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-emerald-400 border-b border-white/10 pb-2">
            Leiden Associate Clusters
          </h2>

          {communityData ? (
            <div className="space-y-2 text-xs">
              {communityData.map((row, idx) => (
                <div key={idx} className="bg-[#1b1f26] p-2.5 rounded border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{row.name}</div>
                    <div className="font-mono text-[11px] text-gray-400">{row.canonical_id}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-bold">
                    Cluster #{row.communityId}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Click &quot;Run Leiden Associate Clustering&quot; to inspect community syndicate partitions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
