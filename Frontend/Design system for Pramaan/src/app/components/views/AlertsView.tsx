import { AlertTriangle, Radio, Link2, FileText, CheckCircle2, Activity } from "lucide-react";
import { alerts, type Severity } from "../../data/mock";
import { severityConfig } from "../severity";

const sourceIcon: Record<string, typeof Radio> = {
  "Financial Feed": Activity,
  Signals: Radio,
  "Link Engine": Link2,
  Ingest: FileText,
  "Case Ops": CheckCircle2,
  Behavior: AlertTriangle,
};

function summary(severity: Severity, count: number) {
  const c = severityConfig[severity];
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-pramaan-border bg-pramaan-surface px-4 py-3">
      <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
      <span className="text-pramaan-text" style={{ fontSize: 20, fontWeight: 600 }}>
        {count}
      </span>
      <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
        {c.label}
      </span>
    </div>
  );
}

export function AlertsView() {
  const counts = alerts.reduce<Record<string, number>>((acc, a) => {
    acc[a.severity] = (acc[a.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary("critical", counts.critical ?? 0)}
        {summary("warning", counts.warning ?? 0)}
        {summary("info", counts.info ?? 0)}
        {summary("success", counts.success ?? 0)}
      </div>

      <div className="rounded-xl border border-pramaan-border bg-pramaan-surface">
        {alerts.map((a, i) => {
          const c = severityConfig[a.severity];
          const Icon = sourceIcon[a.source] ?? Radio;
          return (
            <div
              key={a.id}
              className={`flex items-start gap-4 px-4 py-3.5 transition-colors hover:bg-pramaan-elevated/50 ${
                i !== 0 ? "border-t border-pramaan-border/60" : ""
              }`}
            >
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.color}`}>
                <Icon size={17} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 500 }}>
                    {a.title}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                </div>
                <p className="mt-0.5 text-pramaan-text-secondary" style={{ fontSize: 12 }}>
                  {a.detail}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-pramaan-text-secondary/80" style={{ fontSize: 11 }}>
                  <span className="font-mono">{a.id}</span>
                  <span>·</span>
                  <span>{a.source}</span>
                  {a.caseId && (
                    <>
                      <span>·</span>
                      <span className="text-pramaan-secondary">{a.caseId}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-pramaan-text-secondary" style={{ fontSize: 11 }}>
                {a.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
