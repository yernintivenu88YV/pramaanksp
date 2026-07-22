import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';

export default function EntityGraphView() {
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = [
    { id: '1', type: 'person', label: 'Vikram Singh', risk: 'high', x: 200, y: 150 },
    { id: '2', type: 'org', label: 'Global Exports Ltd', risk: 'medium', x: 400, y: 100 },
    { id: '3', type: 'account', label: 'ACC-8832', risk: 'high', x: 450, y: 250 },
    { id: '4', type: 'location', label: 'Warehouse 4', risk: 'low', x: 150, y: 300 },
    { id: '5', type: 'device', label: 'IP: 192.168.x.x', risk: 'medium', x: 300, y: 350 },
  ];

  const edges = [
    { source: '1', target: '2', label: 'Director' },
    { source: '2', target: '3', label: 'Transfers' },
    { source: '1', target: '4', label: 'Leases' },
    { source: '1', target: '5', label: 'Owns' },
    { source: '3', target: '5', label: 'Accessed By' },
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#E5675C';
      case 'medium': return '#FFB84D';
      case 'low': return '#5FA37E';
      default: return '#9AA0A6';
    }
  };

  return (
    <WorkPanel className="flex h-full bg-pramaan-bg text-pramaan-text relative overflow-hidden">
      <div className="flex-1 relative">
        <svg className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#2A2E35 1px, transparent 0)', backgroundSize: '20px 20px' }}>
          <defs>
            <marker id="arrow" viewBox="0 -5 10 10" refX="20" refY="0" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,-5L10,0L0,5" fill="#9AA0A6" opacity="0.6"/>
            </marker>
          </defs>
          
          {edges.map((e, i) => {
            const source = nodes.find(n => n.id === e.source);
            const target = nodes.find(n => n.id === e.target);
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            
            return (
              <g key={i}>
                <line 
                  x1={source.x} y1={source.y} 
                  x2={target.x} y2={target.y} 
                  stroke="#9AA0A6" strokeWidth="1" strokeOpacity="0.4"
                  markerEnd="url(#arrow)"
                />
                <text x={midX} y={midY - 5} fill="#9AA0A6" fontSize="10" textAnchor="middle">{e.label}</text>
              </g>
            );
          })}

          {nodes.map(n => (
            <g key={n.id} onClick={() => setSelectedNode(n)} className="cursor-pointer" transform={`translate(${n.x}, ${n.y})`}>
              <circle 
                r="16" 
                fill="#1B1F26" 
                stroke={getRiskColor(n.risk)} 
                strokeWidth={selectedNode?.id === n.id ? "3" : "1.5"} 
              />
              <text y="28" fill="#E8EAED" fontSize="12" textAnchor="middle">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {selectedNode && (
        <div className="w-80 bg-pramaan-surface border-l border-pramaan-border p-4 flex flex-col absolute right-0 top-0 bottom-0 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">{selectedNode.label}</h2>
            <button onClick={() => setSelectedNode(null)} className="text-pramaan-text-secondary hover:text-pramaan-text">×</button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-pramaan-text-secondary text-xs">Type</div>
              <div className="capitalize">{selectedNode.type}</div>
            </div>
            <div>
              <div className="text-pramaan-text-secondary text-xs">Risk Level</div>
              <div style={{ color: getRiskColor(selectedNode.risk) }} className="capitalize">{selectedNode.risk}</div>
            </div>
            
            <div className="pt-4 border-t border-pramaan-border">
              <div className="text-pramaan-text-secondary text-xs mb-2">Connections</div>
              <div className="space-y-2">
                {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((e, i) => {
                  const isSource = e.source === selectedNode.id;
                  const otherNode = nodes.find(n => n.id === (isSource ? e.target : e.source));
                  return (
                    <div key={i} className="bg-pramaan-elevated p-2 rounded text-xs flex justify-between">
                      <span className="text-pramaan-text-secondary">{isSource ? 'Out' : 'In'}: {e.label}</span>
                      <span>{otherNode.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkPanel>
  );
}
