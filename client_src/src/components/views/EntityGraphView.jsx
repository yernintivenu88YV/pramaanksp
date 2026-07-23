import React, { useMemo, useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';
import { graphEdges, graphNodes } from '../../data/mock.js';
import { api } from '../../api/client.js';
import { Network, RefreshCw, X } from 'lucide-react';

function riskColor(risk) {
  switch (risk) {
    case 'critical': return '#E5675C';
    case 'warning': return '#FFB84D';
    case 'info': return '#4A9EFF';
    default: return '#5FA37E';
  }
}

function mapApiGraph(data) {
  if (!data?.nodes?.length) return null;
  const center = { id: data.canonical_id, label: data.canonical_id, type: 'person', risk: 'critical', x: 360, y: 240 };
  const nodes = data.nodes.map((node, idx) => {
    const angle = (idx / Math.max(data.nodes.length, 1)) * Math.PI * 2;
    return {
      id: node.id,
      label: node.id,
      type: String(node.label || 'node').toLowerCase(),
      risk: node.label === 'Case' ? 'warning' : node.label === 'Vehicle' ? 'info' : 'success',
      x: 360 + 220 * Math.cos(angle),
      y: 240 + 160 * Math.sin(angle),
      properties: node.properties || {},
    };
  });
  const edges = (data.relationships || []).map((rel) => ({ from: rel.source, to: rel.target, label: rel.type }));
  return { nodes: [center, ...nodes], edges, mode: data.mode || 'live' };
}

export default function EntityGraphView() {
  const [canonicalId, setCanonicalId] = useState('CANON-0042');
  const [selectedNode, setSelectedNode] = useState(null);
  const [graph, setGraph] = useState({ nodes: graphNodes, edges: graphEdges, mode: 'seed_preview' });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const edges = graph.edges || [];
  const nodes = graph.nodes || [];
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  async function traverse() {
    setPending(true);
    setError('');
    const res = await api.traverseGraph(canonicalId);
    setPending(false);
    if (!res.ok) {
      setError(res.error || 'Graph traversal failed');
      return;
    }
    const mapped = mapApiGraph(res.data);
    if (!mapped) {
      setGraph({ nodes: graphNodes, edges: graphEdges, mode: res.data?.mode || 'empty' });
      setError('No graph neighbors returned for this canonical ID. Showing seed preview.');
      return;
    }
    setGraph(mapped);
    setSelectedNode(null);
  }

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-0 overflow-hidden">
      <div className="flex h-full min-h-[700px] flex-col lg:flex-row">
        <section className="relative min-h-[460px] flex-1 overflow-hidden">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-pramaan-border bg-pramaan-surface/95 p-2 shadow-lg">
            <Network size={16} className="text-pramaan-primary" />
            <input value={canonicalId} onChange={(e) => setCanonicalId(e.target.value)} className="w-36 rounded border border-pramaan-border bg-pramaan-elevated px-2 py-1 text-xs outline-none focus:border-pramaan-primary" />
            <Button onClick={traverse} disabled={pending} size="sm"><RefreshCw size={13} className={pending ? 'animate-spin' : ''} /> Traverse</Button>
            <span className="rounded bg-pramaan-primary/15 px-2 py-1 text-[10px] font-semibold text-pramaan-primary">{graph.mode}</span>
          </div>
          {error && <div className="absolute bottom-4 left-4 z-10 max-w-md rounded border border-pramaan-warning/30 bg-pramaan-warning/10 p-3 text-xs text-pramaan-warning">{error}</div>}
          <svg viewBox="0 0 760 520" className="h-full w-full" preserveAspectRatio="xMidYMid meet" style={{ backgroundImage: 'radial-gradient(#2A2E35 1px, transparent 0)', backgroundSize: '20px 20px' }}>
            <defs>
              <marker id="arrow" viewBox="0 -5 10 10" refX="20" refY="0" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,-5L10,0L0,5" fill="#9AA0A6" opacity="0.65" /></marker>
            </defs>
            {edges.map((edge, idx) => {
              const source = nodeMap[edge.from] || nodeMap[edge.source];
              const target = nodeMap[edge.to] || nodeMap[edge.target];
              if (!source || !target) return null;
              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2;
              return <g key={`${edge.from}-${edge.to}-${idx}`}><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#9AA0A6" strokeWidth="1.4" strokeOpacity="0.42" markerEnd="url(#arrow)" /><text x={midX} y={midY - 6} fill="#9AA0A6" fontSize="10" textAnchor="middle">{edge.label}</text></g>;
            })}
            {nodes.map((node) => <g key={node.id} onClick={() => setSelectedNode(node)} className="cursor-pointer" transform={`translate(${node.x}, ${node.y})`}><circle r="18" fill="#1B1F26" stroke={riskColor(node.risk)} strokeWidth={selectedNode?.id === node.id ? 3 : 1.6} /><text y="34" fill="#E8EAED" fontSize="11" textAnchor="middle">{node.label}</text><text y="48" fill="#9AA0A6" fontSize="9" textAnchor="middle">{node.type}</text></g>)}
          </svg>
        </section>

        <aside className="w-full border-t border-pramaan-border bg-pramaan-surface p-4 lg:w-80 lg:border-l lg:border-t-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Node Inspector</h2>
            {selectedNode && <button onClick={() => setSelectedNode(null)} className="text-pramaan-text-secondary hover:text-pramaan-text"><X size={16} /></button>}
          </div>
          {selectedNode ? <div className="space-y-4 text-sm"><Field label="ID" value={selectedNode.id} /><Field label="Type" value={selectedNode.type} /><Field label="Risk" value={selectedNode.risk} color={riskColor(selectedNode.risk)} /><div className="border-t border-pramaan-border pt-4"><div className="mb-2 text-xs uppercase text-pramaan-text-secondary">Connections</div>{edges.filter((edge) => edge.from === selectedNode.id || edge.to === selectedNode.id || edge.source === selectedNode.id || edge.target === selectedNode.id).map((edge, idx) => <div key={idx} className="mb-2 rounded bg-pramaan-elevated p-2 text-xs"><span className="text-pramaan-text-secondary">{edge.label}</span><span className="float-right">{edge.from === selectedNode.id ? edge.to : edge.from}</span></div>)}</div></div> : <p className="text-sm text-pramaan-text-secondary">Select a node to inspect relationships, evidence, and API traversal context.</p>}
        </aside>
      </div>
    </WorkPanel>
  );
}

function Field({ label, value, color }) {
  return <div><div className="text-xs text-pramaan-text-secondary">{label}</div><div className="capitalize" style={color ? { color } : undefined}>{value}</div></div>;
}
