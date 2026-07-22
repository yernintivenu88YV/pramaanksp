import { useState, type ReactNode } from "react";
import { HelpCircle, Sparkles, Phone, Banknote, MapPin, FileText, Shield, Gavel, type LucideIcon } from "lucide-react";

/* ── Entity type system ─────────────────────────────────────────
   Every actor/marker belongs to one entity type. The type drives the
   ring colour on maps and the accent on cards. Icons are monochrome
   line icons — the colour lives in the ring, never a filled pin. */
export type EntityType = "person" | "vehicle" | "organisation" | "location" | "officer" | "legal";

export const entityMeta: Record<EntityType, { label: string; color: string; icon: LucideIcon }> = {
  person:       { label: "Person",       color: "#4A9EFF", icon: Phone },
  vehicle:      { label: "Vehicle",      color: "#7DB8FF", icon: MapPin },
  organisation: { label: "Organisation", color: "#5FA37E", icon: Banknote },
  location:     { label: "Location",     color: "#9AA0A6", icon: MapPin },
  officer:      { label: "Officer",      color: "#C6D4E8", icon: Shield },
  legal:        { label: "Legal / court", color: "#FFB84D", icon: Gavel },
};

/* Skeleton block — matches the shape of the content it replaces. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-[2px] ${className}`} />;
}

/* AI "thinking" indicator — three static dots, subtle opacity pulse. */
export function ThinkingDots({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-pramaan-text-secondary">
      <Sparkles size={12} className="text-pramaan-primary" />
      {label ?? "Analysing"}
      <span className="inline-flex gap-0.5">
        <span className="thinking-dot h-1 w-1 rounded-full bg-pramaan-primary" />
        <span className="thinking-dot h-1 w-1 rounded-full bg-pramaan-primary" />
        <span className="thinking-dot h-1 w-1 rounded-full bg-pramaan-primary" />
      </span>
    </span>
  );
}

/* Confidence score + expandable "Why" — the core trust affordance.
   Clicking WHY reveals the supporting evidence inline (content fade). */
export function ConfidenceWhy({
  confidence,
  claim,
  evidence,
}: {
  confidence: number;
  claim: string;
  evidence: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-pramaan-border bg-pramaan-surface p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.09em] text-pramaan-text-secondary">AI assessment</span>
        <Sparkles size={13} className="text-pramaan-primary" />
      </div>
      <p className="mt-2 text-[11px] leading-5 text-pramaan-text">{claim}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 flex-1 bg-pramaan-elevated">
          <div className="h-full bg-pramaan-primary" style={{ width: `${confidence}%` }} />
        </div>
        <span className="font-mono text-[10px] text-pramaan-secondary">{confidence}%</span>
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 flex items-center gap-1 font-mono text-[10px] text-pramaan-primary hover:text-pramaan-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"
      >
        <HelpCircle size={12} />
        {open ? "HIDE REASONING" : "WHY"}
      </button>
      {open && (
        <div className="anim-content mt-3 border-t border-pramaan-border pt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-pramaan-text-secondary">Supporting evidence</p>
          {evidence.map((item) => (
            <div key={item} className="mt-2 flex items-start gap-2 text-[11px] text-pramaan-text-secondary">
              <FileText size={12} className="mt-0.5 shrink-0 text-pramaan-primary" />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Small labelled section header used across rails. */
export function RailLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-pramaan-text-secondary">{children}</p>;
}
