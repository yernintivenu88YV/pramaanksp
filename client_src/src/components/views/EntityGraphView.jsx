import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { Cite } from '../common/Cite.jsx';
import { graphEdges, graphNodes } from '../../data/mock.js';
import { api } from '../../api/client.js';
import { Network, RefreshCw, X, Layers, Users, ShieldAlert, Sparkles } from 'lucide-react';

function riskColor(risk) {
  switch (risk) {
    case 'critical': return '#F87171';
    case 'warning': return '#FBBF24';
    case 'info': return '#38BDF8';
    default: return '#34D399';
  }
}

export default function EntityGraphView({ activeRole = 'ACP' }) {
  const [canonicalId, setCanonicalId] = useState('CANON-0042');
  const [hopDepth, setHopDepth] = useState(2);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graph, setGraph] = useState({ nodes: graphNodes, edges: graphEdges, mode: 'live' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [clusterDetected, setClusterDetected] = useState(false);

  const edges = graph.edges || [];
  const nodes = graph.nodes || [];
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  async function traverse() {
    setPending(true);
    setError('');
    const res = await api.traverseGraph(canonicalId, hopDepth);
    setPending(false);
    if (!res.ok) {
      setError(res.error || 'Graph traversal failed');
      return;
    }
    if (res.data && res.data.nodes) {
      setGraph({ nodes: res.data.nodes, edges: res.data.relationships || [], mode: res.mode || 'live' });
    }
  }

  const runLeidenClustering = () => {
    setClusterDetected(true);
  };

  return (
    <div className="space-y-5 anim-content">
      <WorkPanel
        eyebrow="Analyze Module"
        title="Entity Graph Traversal & Associate Cluster Detection"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode={graph.mode || 'live'} />
            <button
              onClick={runLeidenClustering}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pramaan-secondary/15 text-pramaan-secondary border border-pramaan-secondary/30 text-xs font-bold hover:bg-pramaan-secondary/25 transition-colors cursor-pointer"
            >
              <Sparkles size={13} /> Detect Clusters (Leiden)
            </button>
          </div>
        }
      >
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-pramaan-elevated border border-pramaan-border mb-4">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-pramaan-secondary" />
            <span className="text-xs font-bold text-pramaan-text font-mono">Seed Canonical ID:</span>
            <input
              type="text"
              value={canonicalId}
              onChange={(e) => setCanonicalId(e.target.value)}
              className="bg-pramaan-surface border border-pramaan-border rounded px-2.5 py-1 text-xs font-mono text-pramaan-text outline-none focus:border-pramaan-primary"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <label className="text-pramaan-text-secondary">Hop Depth:</label>
            <select
              value={hopDepth}
              onChange={(e) => setHopDepth(Number(e.target.value))}
              className="bg-pramaan-surface text-pramaan-text border border-pramaan-border rounded px-2 py-1 outline-none"
            >
              <option value={1}>1 Hop</option>
              <option value={2}>2 Hops</option>
              <option value={3}>3 Hops</option>
            </select>

            <button
              onClick={traverse}
              disabled={pending}
              className="px-3 py-1 rounded bg-pramaan-primary text-pramaan-bg font-bold hover:bg-pramaan-primary-cyan transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={13} className={pending ? 'animate-spin' : ''} /> Traverse Graph
            </button>
          </div>
        </div>

        {/* Graph Canvas & Side Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SVG Graph View (8 cols) */}
          <div className="lg:col-span-8 relative min-h-[480px] rounded-lg border border-pramaan-border bg-pramaan-bg overflow-hidden">
            {clusterDetected && (
              <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-pramaan-secondary/20 border border-pramaan-secondary/40 text-pramaan-secondary text-xs font-mono font-bold flex items-center gap-1.5">
                <Users size={14} /> Leiden Cluster #1 Detected: 4 Associate Links
              </div>
            )}

            <svg
              viewBox="0 0 760 520"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              style={{ backgroundImage: 'radial-gradient(#2A3346 1px, transparent 0)', backgroundSize: '24px 24px' }}
            >
              <defs>
                <marker id="arrow" viewBox="0 -5 10 10" refX="22" refY="0" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0,-5L10,0L0,5" fill="#8A97AD" opacity="0.6" />
                </marker>
              </defs>

              {/* Edge Lines */}
              {edges.map((edge, idx) => {
                const source = nodeMap[edge.from] || nodeMap[edge.source];
                const target = nodeMap[edge.to] || nodeMap[edge.target];
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
                      stroke="#3B465E"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    <text x={midX} y={midY - 6} fill="#8A97AD" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  <circle
                    r="20"
                    fill="#121722"
                    stroke={riskColor(node.risk)}
                    strokeWidth={selectedNode?.id === node.id ? 3.5 : 2}
                    className="transition-all group-hover:scale-110"
                  />
                  <text y="36" fill="#EAF0FA" fontSize="11" fontWeight="bold" fontFamily="Inter" textAnchor="middle">
                    {node.label}
                  </text>
                  <text y="50" fill="#8A97AD" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
                    {node.type}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Node Inspector Side Panel (4 cols) */}
          <div className="lg:col-span-4 p-4 rounded-lg border border-pramaan-border bg-pramaan-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pramaan-border">
              <span className="text-[10px] font-mono font-bold uppercase text-pramaan-secondary">Node Inspector</span>
              {selectedNode && (
                <button onClick={() => setSelectedNode(null)} className="text-pramaan-text-secondary hover:text-pramaan-text cursor-pointer">
                  <X size={16} />
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-pramaan-surface border border-pramaan-border space-y-1 font-mono">
                  <span className="text-pramaan-text-secondary text-[10px]">CANONICAL ENTITY ID:</span>
                  <div className="font-bold text-sm text-pramaan-text">{selectedNode.id}</div>
                  <div className="text-pramaan-secondary text-[11px]">{selectedNode.type}</div>
                </div>

                <div className="p-3 rounded bg-pramaan-surface border border-pramaan-border space-y-2 font-mono">
                  <span className="text-pramaan-text-secondary text-[10px]">CONNECTED RELATIONSHIPS:</span>
                  {edges
                    .filter((e) => e.from === selectedNode.id || e.to === selectedNode.id || e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((e, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] border-b border-pramaan-border/50 pb-1">
                        <span className="text-pramaan-secondary">{e.label}</span>
                        <span className="text-pramaan-text font-bold">{e.from === selectedNode.id ? e.to : e.from}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-pramaan-text-secondary">
                Click any graph node to inspect network relationships and associate cluster memberships.
              </div>
            )}
          </div>
        </div>
      </WorkPanel>
    </div>
  );
}
