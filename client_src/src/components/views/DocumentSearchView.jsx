import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Search, FileText } from 'lucide-react';
import { Button } from '../ui/Controls.jsx';
import { CitationPanel } from '../ui/CitationPanel.jsx';
import { api } from '../../api/client.js';

export default function DocumentSearchView() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function search() {
    setPending(true);
    setError('');
    const res = await api.ragSearch(query);
    setPending(false);
    if (!res.ok) {
      setError(res.error || 'Document search failed');
      return;
    }
    setResult(res.data);
  }

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><Search size={20} /> Semantic Document Search</h1>
        <p className="text-sm text-pramaan-text-secondary">Search across FIRs, manuals, SOPs, and investigation notes.</p>
      </div>

      <div className="mb-6 flex gap-3">
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="e.g. Protocol for cyber financial frauds" 
          className="flex-1 rounded-md border border-pramaan-border bg-pramaan-surface p-2 text-sm text-pramaan-text outline-none focus:border-pramaan-accent"
        />
        <Button onClick={search} disabled={pending}>{pending ? 'Searching...' : 'Search'}</Button>
      </div>

      {error && <div className="mb-4 rounded border border-pramaan-critical/30 bg-pramaan-critical/10 p-3 text-sm text-pramaan-critical">{error}</div>}

      {result && (
        <div className="space-y-6">
          <div className="rounded border border-pramaan-border bg-pramaan-surface p-4">
            <h2 className="text-sm font-semibold text-pramaan-primary mb-2">AI Summary</h2>
            <p className="text-sm text-pramaan-text leading-relaxed">{result.answer}</p>
          </div>
          
          <div className="rounded border border-pramaan-border bg-pramaan-surface p-4">
            <h2 className="text-sm font-semibold text-pramaan-primary mb-2">Retrieved Documents</h2>
            {result.evidence && result.evidence.length > 0 ? (
              <div className="space-y-4">
                {result.evidence.map((doc, idx) => (
                  <div key={idx} className="bg-pramaan-bg border border-pramaan-border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-pramaan-accent" />
                      <span className="font-semibold text-sm">{doc.title || doc.document_id || doc.case_id}</span>
                      <span className="text-xs bg-pramaan-surface px-2 py-0.5 rounded border border-pramaan-border">Match: {Math.round((1 - (doc.distance || 0)) * 100)}%</span>
                    </div>
                    <p className="text-xs text-pramaan-text-secondary leading-relaxed line-clamp-3">
                      {doc.chunk_text || JSON.stringify(doc)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-pramaan-text-secondary">No documents found matching the criteria.</p>
            )}
          </div>
        </div>
      )}
    </WorkPanel>
  );
}
