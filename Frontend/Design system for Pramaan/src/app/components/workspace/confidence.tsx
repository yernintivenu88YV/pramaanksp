import type { Confidence } from "../../data/caseFile";

export const confidenceMeta: Record<Confidence, { label: string; color: string; bg: string; dot: string }> = {
  high: { label: "High confidence", color: "text-pramaan-success", bg: "bg-pramaan-success/12", dot: "bg-pramaan-success" },
  medium: { label: "Medium confidence", color: "text-pramaan-warning", bg: "bg-pramaan-warning/12", dot: "bg-pramaan-warning" },
  low: { label: "Low confidence", color: "text-pramaan-critical", bg: "bg-pramaan-critical/12", dot: "bg-pramaan-critical" },
};

export function ConfidenceBadge({ level, short }: { level: Confidence; short?: boolean }) {
  const c = confidenceMeta[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 ${c.bg} ${c.color}`}
      style={{ fontSize: 11, fontWeight: 500 }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {short ? c.label.replace(" confidence", "") : c.label}
    </span>
  );
}

// Small numbered citation chip rendered inline next to factual sentences.
export function CiteChip({ n }: { n: number }) {
  return (
    <sup>
      <button
        title={`Source ${n}`}
        className="mx-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded bg-pramaan-primary/15 px-1 align-super text-pramaan-secondary transition-colors hover:bg-pramaan-primary/30"
        style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}
      >
        {n}
      </button>
    </sup>
  );
}
