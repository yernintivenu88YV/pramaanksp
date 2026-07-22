import type { Severity } from "../data/mock";

// Maps a severity level to its Pramaan token color + label.
export const severityConfig: Record<
  Severity,
  { color: string; bg: string; label: string; dot: string }
> = {
  critical: { color: "text-pramaan-critical", bg: "bg-pramaan-critical/12", label: "Critical", dot: "bg-pramaan-critical" },
  warning: { color: "text-pramaan-warning", bg: "bg-pramaan-warning/12", label: "Warning", dot: "bg-pramaan-warning" },
  info: { color: "text-pramaan-secondary", bg: "bg-pramaan-secondary/12", label: "Info", dot: "bg-pramaan-secondary" },
  success: { color: "text-pramaan-success", bg: "bg-pramaan-success/12", label: "Resolved", dot: "bg-pramaan-success" },
};

export function SeverityBadge({
  severity,
  text,
  dotOnly,
}: {
  severity: Severity;
  text?: string;
  dotOnly?: boolean;
}) {
  const c = severityConfig[severity];
  if (dotOnly) {
    return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${c.dot}`} title={c.label} />;
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 ${c.bg} ${c.color}`}
      style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em" }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {text ?? c.label.toUpperCase()}
    </span>
  );
}
