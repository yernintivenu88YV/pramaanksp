import React from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Cite } from '../ui/AI.jsx';
import { assistantData } from '../../data/assistant.js';
import { Sparkles, Download, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Controls.jsx';

export default function AssistantView() {
  const data = assistantData || {}; 

  return (
    <WorkPanel className="flex flex-col h-full bg-pramaan-bg text-pramaan-text p-6">
      <div className="flex items-center gap-3 mb-6 bg-pramaan-surface border border-pramaan-border p-3 rounded-lg">
        <Sparkles className="text-pramaan-primary" size={20} />
        <input 
          type="text" 
          placeholder="Ask Pramaan Assistant to analyze evidence or query databases..." 
          className="bg-transparent border-none outline-none flex-1 text-sm text-pramaan-text placeholder:text-pramaan-text-secondary"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">AI Investigation Report</h1>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex items-center gap-2 text-xs">
            <Copy size={14} /> Copy Citation
          </Button>
          <Button className="flex items-center gap-2 text-xs">
            <Download size={14} /> Export PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 pb-10">
        <section>
          <h2 className="text-sm font-semibold mb-2 text-pramaan-primary border-b border-pramaan-border pb-1">Executive Summary</h2>
          <p className="text-sm leading-relaxed text-pramaan-text-secondary">
            Analysis of recent communication intercepts indicates a high probability (87%) of coordinated smuggling activity along the northern border. 
            Key individuals <Cite id="1" /> have been observed communicating with known syndicate members <Cite id="2" /> using encrypted channels.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-2 text-pramaan-primary border-b border-pramaan-border pb-1">Evidence & Confidence</h2>
          <div className="bg-pramaan-surface p-4 rounded border border-pramaan-border space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Voice Intercept Analysis</span>
              <span className="text-pramaan-success font-medium">92% Match</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Financial Ledger Anomalies</span>
              <span className="text-pramaan-warning font-medium">78% Match</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Vehicle Plate Recognition (ANPR)</span>
              <span className="text-pramaan-success font-medium">99% Match</span>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-sm font-semibold mb-2 text-pramaan-primary border-b border-pramaan-border pb-1">Next Steps</h2>
          <ul className="list-disc list-inside text-sm text-pramaan-text-secondary space-y-1">
            <li>Subpoena financial records for shell company holding ACC-8832.</li>
            <li>Deploy surveillance on Warehouse 4.</li>
            <li>Cross-reference new aliases with international databases.</li>
          </ul>
        </section>
      </div>
    </WorkPanel>
  );
}
