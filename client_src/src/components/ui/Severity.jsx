export const severityConfig = {
  critical: { label: "Critical", color: "text-pramaan-critical", bg: "bg-pramaan-critical/12", dot: "bg-pramaan-critical", border: "border-pramaan-critical/40" },
  warning:  { label: "Warning",  color: "text-pramaan-warning",  bg: "bg-pramaan-warning/12",  dot: "bg-pramaan-warning",  border: "border-pramaan-warning/40" },
  info:     { label: "Info",     color: "text-pramaan-primary",  bg: "bg-pramaan-primary/12",  dot: "bg-pramaan-primary",  border: "border-pramaan-primary/40" },
  success:  { label: "Resolved", color: "text-pramaan-success",  bg: "bg-pramaan-success/12",  dot: "bg-pramaan-success",  border: "border-pramaan-success/40" },
};

export function SeverityBadge({ severity, dotOnly = false }) {
  const c = severityConfig[severity];
  if (!c) return null;
  if (dotOnly) return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${c.dot}`} />;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 ${c.bg} ${c.color}`} style={{ fontSize: 11, fontWeight: 600 }}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
