import React from 'react';

/**
 * Evidence citation chip component for inline record ID references.
 * e.g., <Cite id="CASE-001"> or <Cite id="1" />
 */
export function Cite({ id, recordId, children }) {
  const displayId = id || recordId || children || '1';
  return (
    <sup
      title={`Source Evidence Record: ${displayId}`}
      className="ml-0.5 inline-flex h-4 min-w-4 cursor-pointer items-center justify-center rounded-full bg-pramaan-primary/20 px-1 text-[10px] font-mono font-bold text-pramaan-primary hover:bg-pramaan-primary hover:text-pramaan-bg transition-colors"
    >
      {displayId}
    </sup>
  );
}

export default Cite;
