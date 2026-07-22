import { useState, type ReactNode } from "react";
import { Info, FileText, ChevronDown } from "lucide-react";
import { type } from "./scale";

/* ------------------------------------------------------------------ *
 * AI output contract for Pramaan.
 * Rule: every AI-generated claim renders a confidence score (0–100)
 * AND a "why" affordance that opens the supporting evidence.
 * Use <AiClaim> to wrap any AI statement, or <Confidence> inline.
 * ------------------------------------------------------------------ */

export interface Evidence {
  id: string;
  label: string;
  detail: string;
}

// Neutral-first: confidence uses a gray track; the fill is the single accent.
export function Confidence({ score, label = "CONF" }: { score: number; label?: string }) {
  return (
    <span className="tnum inline-flex items-center gap-1.5" title={`Confidence ${score}%`}>
      <span className="text-pramaan-text-secondary/70" style={type.micro}>
        {label}
      </span>
      <span className="h-1 w-10 overflow-hidden rounded-full bg-pramaan-border">
        <span
          className={`block h-full rounded-full ${score >= 66 ? "bg-pramaan-primary" : "bg-pramaan-text-secondary"}`}
          style={{ width: `${score}%` }}
        />
      </span>
      <span className="text-pramaan-text" style={{ ...type.micro, fontWeight: 600 }}>
        {score}%
      </span>
    </span>
  );
}

/** An AI statement + confidence + expandable evidence ("why"). */
export function AiClaim({
  children,
  score,
  evidence,
}: {
  children: ReactNode;
  score: number;
  evidence: Evidence[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded border border-pramaan-border bg-pramaan-elevated/40 p-3">
      <div className="text-pramaan-text-secondary" style={type.body}>
        {children}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <Confidence score={score} />
        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto flex items-center gap-1 text-pramaan-secondary transition-colors hover:text-pramaan-primary"
          style={type.micro}
        >
          <Info size={12} strokeWidth={2} /> Why
          <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-pramaan-border pt-2">
          <div className="text-pramaan-text-secondary/60 uppercase" style={type.eyebrow}>
            Supporting evidence · {evidence.length}
          </div>
          {evidence.map((e) => (
            <div key={e.id} className="flex items-start gap-2 rounded px-1.5 py-1 hover:bg-pramaan-elevated">
              <FileText size={13} className="mt-0.5 shrink-0 text-pramaan-text-secondary" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="tnum font-mono text-pramaan-secondary" style={type.micro}>
                    {e.id}
                  </span>
                  <span className="text-pramaan-text" style={type.caption}>
                    {e.label}
                  </span>
                </div>
                <div className="text-pramaan-text-secondary" style={type.micro}>
                  {e.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
