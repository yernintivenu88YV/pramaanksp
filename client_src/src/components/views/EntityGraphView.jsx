import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { Network, RefreshCw, X, Layers, Users, ShieldAlert, Sparkles, Phone, MapPin, Car, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { api } from '../../api/client.js';

const INITIAL_NODES = [
  { id: 'CANON-0042', label: 'Mohammed Rafi', type: 'person', risk: 'critical', x: 260, y: 240, phone: '98450 12345', address: '14th Main, Indiranagar, Bengaluru', vehicle: 'KA-02-MB-1234' },
  { id: 'CASE-001', label: 'CASE-001', type: 'case', risk: 'critical', x: 120, y: 140, details: 'Indiranagar Burglary' },
  { id: 'CASE-005', label: 'CASE-005', type: 'case', risk: 'warning', x: 420, y: 320, details: 'Vehicle Theft' },
  { id: 'KA-02-MB-1234', label: 'KA-02-MB-1234', type: 'vehicle', risk: 'info', x: 150, y: 380, details: 'Registered Getaway Motorcycle' },
  { id: 'CASE-002', label: 'CASE-002', type: 'case', risk: 'warning', x: 460, y: 140, details: 'Hebbal Night Break-in' },
  { id: 'S. Praveen Kumar', label: 'S. Praveen Kumar', type: 'person', risk: 'warning', x: 580, y: 220, details: 'Co-Accused Suspect' },
  { id: 'CASE-006', label: 'CASE-006', type: 'case', risk: 'info', x: 280, y: 440, details: 'Hubballi Commercial Burglary' },
  { id: 'ICICI-Hawala-8819', label: 'ICICI-Hawala-8819', type: 'account', risk: 'critical', x: 420, y: 460, details: 'Hawala Money Transfer Account' },
  { id: 'Rashid Khan', label: 'Rashid Khan', type: 'person', risk: 'info', x: 200, y: 460, details: 'Money Mule Associate' }
];

const INITIAL_EDGES = [
  { from: 'CANON-0042', to: 'CASE-001', label: 'accused in', reason: 'Accused in Indiranagar burglary; matched via NAFIS fingerprint match FP-KSP-04218 and crowbar MO.' },
  { from: 'CANON-0042', to: 'CASE-005', label: 'accused in', reason: 'Vehicle theft linkage — getaway motorcycle KA-02-MB-1234 registered to suspect.' },
  { from: 'CANON-0042', to: 'KA-02-MB-1234', label: 'uses vehicle', reason: 'Registered owner of vehicle KA-02-MB-1234 flagged at crime scene via ANPR camera.' },
  { from: 'S. Praveen Kumar', to: 'CASE-002', label: 'accused in', reason: 'Co-accused identified in CCTV footage at Hebbal villa entry.' },
  { from: 'CASE-001', to: 'CASE-002', label: '82% MO Match', reason: 'Vector similarity signature match on rear crowbar leverage.' },
  { from: 'CASE-006', to: 'ICICI-Hawala-8819', label: 'transfers to', reason: 'Stolen loot liquidation wire trace.' }
];

export default function EntityGraphView({ activeRole = 'ACP' }) {
  const [canonicalId, setCanonicalId] = useState('CANON-0042');
  const [hopDepth, setHopDepth] = useState(2);
  const [selectedNode, setSelectedNode] = useState(INITIAL_NODES[0]);
  const [pending, setPending] = useState(false);
  const [clusterDetected, setClusterDetected] = useState(false);

  const nodeMap = useMemo(() => Object.fromEntries(INITIAL_NODES.map((n) => [n.id, n])), []);

  const connectedRelationships = useMemo(() => {
    if (!selectedNode) return [];
    return INITIAL_EDGES.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id);
  }, [selectedNode]);

  const handleTraverse = async () => {
    setPending(true);
    setTimeout(() => {
      setPending(false);
    }, 800);
  };

  const handleDetectClusters = () => {
    setClusterDetected(true);
  };

  return (
    <div className="space-y-6 font-sans select-none relative">
      
      {/* Header Banner */}
      <WorkPanel
        eyebrow="ANALYZE MODULE"
        title="Entity Graph Traversal & Associate Cluster Detection"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <button
              onClick={handleDetectClusters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 border border-[#3AAFA9]/40"
            >
              <Sparkles size={14} className="text-[#3AAFA9]" /> Detect Clusters (Leiden)
            </button>
          </div>
        }
      >
        <p className="text-xs text-[#2B7A78] font-medium mb-5">
          Multi-hop graph traversal engine mapping network relationships across suspects, case files, vehicles, and hawala financial accounts.
        </p>

        {/* Top Controls Bar (From Screenshots) */}
        <div className="p-4 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1]/40 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xs">
          
          {/* Seed Canonical ID Input */}
          <div className="flex items-center gap-2.5">
            <Network size={16} className="text-[#3AAFA9]" />
            <span className="text-xs font-mono font-extrabold uppercase text-[#17252A]">Seed Canonical ID:</span>
            <input
              type="text"
              value={canonicalId}
              onChange={(e) => setCanonicalId(e.target.value)}
              className="bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#17252A] outline-none focus:border-[#3AAFA9] w-36"
            />
          </div>

          {/* Hop Depth & Traverse Graph Button */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#2B7A78]">Hop Depth:</span>
            <select
              value={hopDepth}
              onChange={(e) => setHopDepth(Number(e.target.value))}
              className="bg-[#FEFFFF] border border-[#B3E3DE] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#17252A] outline-none cursor-pointer focus:border-[#3AAFA9]"
            >
              <option value={1}>1 Hop</option>
              <option value={2}>2 Hops</option>
              <option value={3}>3 Hops</option>
              <option value={4}>4 Hops</option>
            </select>

            <button
              onClick={handleTraverse}
              disabled={pending}
              className="px-4 py-2 rounded-xl bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 border border-[#3AAFA9]/40"
            >
              <RefreshCw size={14} className={`text-[#3AAFA9] ${pending ? 'animate-spin' : ''}`} /> Traverse Graph
            </button>
          </div>

        </div>

        {/* Combined 2 Images Layout: Interactive Graph Canvas (7 cols) + Connected Matches Inspector (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Graph Canvas (7 cols) */}
          <div className="lg:col-span-7 relative min-h-[500px] rounded-2xl border border-[#B3E3DE] bg-[#17252A] shadow-md overflow-hidden p-2">
            {clusterDetected && (
              <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-[#DEF2F1] border border-[#3AAFA9] text-[#17252A] text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                <Users size={14} className="text-[#3AAFA9]" /> Leiden Cluster #1 Detected: 4 Associate Links
              </div>
            )}

            <svg
              viewBox="0 0 700 500"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              style={{ backgroundImage: 'radial-gradient(#3AAFA9 1px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.95 }}
            >
              <defs>
                <marker id="arrowHead" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,-5L10,0L0,5" fill="#3AAFA9" />
                </marker>
              </defs>

              {/* Relationship Edge Lines */}
              {INITIAL_EDGES.map((edge, idx) => {
                const source = nodeMap[edge.from];
                const target = nodeMap[edge.to];
                if (!source || !target) return null;
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;
                return (
                  <g key={`${edge.from}-${edge.to}-${idx}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="#2B7A78"
                      strokeWidth="2"
                      markerEnd="url(#arrowHead)"
                    />
                    <rect x={midX - 35} y={midY - 10} width="70" height="16" rx="4" fill="#121E22" stroke="#3AAFA9" strokeWidth="0.5" />
                    <text x={midX} y={midY + 2} fill="#3AAFA9" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Entity Nodes */}
              {INITIAL_NODES.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isPerson = node.type === 'person';
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    <circle
                      r={isPerson ? 24 : 18}
                      fill={isPerson ? '#2B7A78' : '#121E22'}
                      stroke={isSelected ? '#3AAFA9' : isPerson ? '#3AAFA9' : '#B3E3DE'}
                      strokeWidth={isSelected ? 4 : 2}
                      className="transition-all group-hover:scale-110"
                    />
                    <text y="38" fill="#FEFFFF" fontSize="11" fontWeight="bold" fontFamily="Inter" textAnchor="middle">
                      {node.label}
                    </text>
                    <text y="52" fill="#3AAFA9" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
                      {node.type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right Column: ENTITY & CONNECTED MATCHES INSPECTOR (5 cols - From Combined Images) */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-xs space-y-4">
            
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-3">
              <span className="text-xs font-mono font-extrabold uppercase text-[#17252A] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#3AAFA9]" /> ENTITY & CONNECTED MATCHES INSPECTOR
              </span>
              {selectedNode && (
                <button onClick={() => setSelectedNode(null)} className="p-1 text-[#2B7A78] hover:text-[#17252A] cursor-pointer">
                  <X size={16} />
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                
                {/* Target Profile Info Card */}
                <div className="p-4 rounded-xl bg-[#DEF2F1] border border-[#3AAFA9]/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#B3E3DE] pb-2">
                    <span className="font-mono text-xs font-bold text-[#2B7A78]">{selectedNode.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-mono font-bold">
                      CRITICAL RISK
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#17252A]">{selectedNode.label}</h3>
                    <span className="text-[10px] font-mono text-[#2B7A78] uppercase font-bold">{selectedNode.type}</span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono font-bold text-[#2B7A78] pt-1">
                    {selectedNode.phone && <div className="flex items-center gap-2"><Phone size={13} className="text-[#3AAFA9]" /> {selectedNode.phone}</div>}
                    {selectedNode.address && <div className="flex items-center gap-2"><MapPin size={13} className="text-[#3AAFA9]" /> {selectedNode.address}</div>}
                    {selectedNode.vehicle && <div className="flex items-center gap-2"><Car size={13} className="text-[#3AAFA9]" /> {selectedNode.vehicle}</div>}
                  </div>
                </div>

                {/* CONNECTED RELATIONSHIPS & MATCH REASONS */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-extrabold uppercase text-[#17252A] block">
                    CONNECTED RELATIONSHIPS & MATCH REASONS ({connectedRelationships.length}):
                  </span>

                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {connectedRelationships.map((rel, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#DEF2F1]/40 border border-[#B3E3DE] space-y-2 shadow-xs">
                        <div className="flex items-center justify-between font-mono text-xs font-bold">
                          <span className="text-[#17252A] flex items-center gap-1.5">
                            <ArrowRightLeft size={13} className="text-[#3AAFA9]" />
                            {rel.from === selectedNode.id ? rel.to : rel.from}
                          </span>
                          <span className="text-[#2B7A78] text-[10px] uppercase font-extrabold">{rel.label}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE] text-[11px] text-[#17252A] font-semibold flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-[#3AAFA9] shrink-0 mt-0.5" />
                          <span>{rel.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspector Bottom Footer */}
                <div className="pt-3 border-t border-[#B3E3DE] flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-[#2B7A78]">{connectedRelationships.length} direct links identified</span>
                  <button
                    onClick={() => setSelectedNode(INITIAL_NODES[0])}
                    className="text-[#2B7A78] hover:text-[#17252A] font-extrabold underline cursor-pointer"
                  >
                    Re-Center Graph on CANON-0042
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[#2B7A78] bg-[#DEF2F1]/30 rounded-xl border border-[#B3E3DE]">
                Click any graph node to inspect network relationships and associate cluster memberships.
              </div>
            )}

          </div>

        </div>

      </WorkPanel>
    </div>
  );
}
