import React from 'react';

export function CitationPanel({ citations, evidence, confidenceScore }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 rounded-md border border-pramaan-border bg-pramaan-bg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-pramaan-text">Sources & Citations</h4>
        {confidenceScore && (
          <span className="text-xs px-2 py-1 bg-green-900 text-green-100 rounded-full">
            {Math.round(confidenceScore * 100)}% Confidence
          </span>
        )}
      </div>
      <ul className="space-y-2 text-sm text-pramaan-text/80">
        {citations.map((citation, index) => (
          <li key={index} className="flex items-start">
            <span className="text-pramaan-accent mr-2">[{index + 1}]</span>
            <span>{citation}</span>
          </li>
        ))}
      </ul>
      {evidence && evidence.length > 0 && (
        <div className="mt-4 pt-3 border-t border-pramaan-border/50">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-pramaan-text/90 hover:text-pramaan-accent transition-colors">
              View Retrieved Evidence
            </summary>
            <div className="mt-2 pl-4 max-h-48 overflow-y-auto space-y-2 border-l-2 border-pramaan-accent/30 text-xs">
              {evidence.map((item, idx) => (
                <div key={idx} className="bg-pramaan-surface p-2 rounded">
                  {item.chunk_text || JSON.stringify(item)}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
