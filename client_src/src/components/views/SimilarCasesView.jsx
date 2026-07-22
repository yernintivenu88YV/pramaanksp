import React from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';
import { FileText, Map, Clock, Users, BarChart2 } from 'lucide-react';
import { similarCases } from '../../data/similarCases.js';

export default function SimilarCasesView() {
  const sourceCase = {
    id: 'FIR-2023-089',
    title: 'Smuggling Intercept at Checkpoint 4',
    date: '2023-10-15',
    location: 'Sector 4 Border',
    modus: 'Concealed compartment in commercial vehicle'
  };

  const matches = similarCases || [
    { id: 'FIR-2022-112', title: 'Vehicle Contraband', similarity: 88, dimensions: { modus: 95, location: 40, entities: 60, time: 20 } },
    { id: 'FIR-2023-045', title: 'Checkpoint Evasion', similarity: 74, dimensions: { modus: 60, location: 85, entities: 30, time: 90 } }
  ];

  return (
    <WorkPanel className="flex h-full bg-pramaan-bg text-pramaan-text">
      {/* Left: Source Case */}
      <div className="w-1/4 border-r border-pramaan-border p-4 bg-pramaan-surface flex flex-col">
        <h2 className="text-sm font-semibold mb-4 text-pramaan-text-secondary uppercase">Source Reference</h2>
        <div className="bg-pramaan-elevated border border-pramaan-primary/50 p-4 rounded-lg flex-1">
          <div className="flex items-center gap-2 mb-3 text-pramaan-primary font-mono text-sm">
            <FileText size={16} /> {sourceCase.id}
          </div>
          <h3 className="font-bold mb-4">{sourceCase.title}</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-pramaan-text-secondary text-xs mb-1 flex items-center gap-1"><Clock size={12}/> Date</div>
              <div>{sourceCase.date}</div>
            </div>
            <div>
              <div className="text-pramaan-text-secondary text-xs mb-1 flex items-center gap-1"><Map size={12}/> Location</div>
              <div>{sourceCase.location}</div>
            </div>
            <div>
              <div className="text-pramaan-text-secondary text-xs mb-1 flex items-center gap-1"><Users size={12}/> Modus Operandi</div>
              <div>{sourceCase.modus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Ranked Matches */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold mb-4 text-pramaan-text-secondary uppercase">AI Ranked Matches</h2>
        <div className="space-y-4">
          {matches.map((m, i) => (
            <div key={m.id} className="bg-pramaan-surface border border-pramaan-border p-4 rounded-lg hover:border-pramaan-text-secondary cursor-pointer transition-all flex gap-6 items-center">
              <div className="w-12 h-12 rounded-full border-4 border-pramaan-elevated flex items-center justify-center font-bold text-sm"
                   style={{ borderColor: `rgba(74, 158, 255, ${m.similarity / 100})` }}>
                {m.similarity}%
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-pramaan-text-secondary">{m.id}</span>
                  <span className="text-xs bg-pramaan-elevated px-2 py-0.5 rounded text-pramaan-text-secondary">Rank #{i+1}</span>
                </div>
                <h3 className="font-semibold mb-3">{m.title}</h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(m.dimensions).map(([key, val]) => (
                    <div key={key}>
                      <div className="text-[10px] text-pramaan-text-secondary uppercase mb-1">{key}</div>
                      <div className="h-1.5 w-full bg-pramaan-elevated rounded overflow-hidden">
                        <div className="h-full bg-pramaan-primary" style={{ width: `${val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right: Comparison Panel */}
      <div className="w-1/4 border-l border-pramaan-border p-4 bg-pramaan-surface hidden lg:block">
        <h2 className="text-sm font-semibold mb-4 text-pramaan-text-secondary uppercase flex items-center gap-2">
          <BarChart2 size={16} /> Dimension Analysis
        </h2>
        <p className="text-sm text-pramaan-text-secondary mb-4">
          Select a case to view detailed entity overlap and modus operandi comparison matrices.
        </p>
        <div className="bg-pramaan-elevated h-64 rounded border border-pramaan-border flex items-center justify-center text-xs text-pramaan-text-secondary">
          No case selected
        </div>
      </div>
    </WorkPanel>
  );
}
