import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Check,
  FileText,
  Briefcase,
  User,
  Car,
  Sparkles,
} from "lucide-react";
import {
  caseMeta,
  evidenceSources,
  nextSteps as initialSteps,
  relatedCases,
  linkedPersons,
  linkedVehicles,
} from "../../data/caseFile";
import { confidenceMeta } from "./confidence";

export function RightPanel() {
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [steps, setSteps] = useState(initialSteps);
  const [openSource, setOpenSource] = useState<string | null>("e1");

  const toggleStep = (id: string) =>
    setSteps((s) => s.map((step) => (step.id === id ? { ...step, done: !step.done } : step)));

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-pramaan-border bg-sidebar">
      <div className="flex items-center gap-2 border-b border-pramaan-border px-4 py-3.5">
        <Sparkles size={16} strokeWidth={1.75} className="text-pramaan-secondary" />
        <span className="text-pramaan-text" style={{ fontSize: 13, fontWeight: 600 }}>
          AI Intelligence Panel
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Confidence summary */}
        <div className="rounded-xl border border-pramaan-border bg-pramaan-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
              Overall assessment confidence
            </span>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-pramaan-text" style={{ fontSize: 28, fontWeight: 600 }}>
              {caseMeta.overallConfidence}%
            </span>
            <span className="mb-1.5 text-pramaan-success" style={{ fontSize: 12, fontWeight: 500 }}>
              High
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-pramaan-panel">
            <div className="h-full rounded-full bg-pramaan-success" style={{ width: `${caseMeta.overallConfidence}%` }} />
          </div>
          <p className="mt-3 text-pramaan-text-secondary" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
            Financial evidence is strong and corroborated; network attribution carries moderate uncertainty pending document review.
          </p>
        </div>

        {/* Evidence sources (expandable) */}
        <Section
          title="Evidence Sources"
          count={evidenceSources.length}
          open={evidenceOpen}
          onToggle={() => setEvidenceOpen((o) => !o)}
        >
          <div className="flex flex-col gap-1.5">
            {evidenceSources.map((s) => {
              const c = confidenceMeta[s.reliability];
              const isOpen = openSource === s.id;
              return (
                <div key={s.id} className="overflow-hidden rounded-lg border border-pramaan-border/60 bg-pramaan-elevated">
                  <button
                    onClick={() => setOpenSource(isOpen ? null : s.id)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left"
                  >
                    <FileText size={14} strokeWidth={1.75} className="shrink-0 text-pramaan-text-secondary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-pramaan-text" style={{ fontSize: 12, fontWeight: 500 }}>
                        {s.title}
                      </div>
                      <div className="text-pramaan-text-secondary" style={{ fontSize: 10.5 }}>
                        {s.kind} · {s.date}
                      </div>
                    </div>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                    {isOpen ? (
                      <ChevronDown size={14} className="shrink-0 text-pramaan-text-secondary" />
                    ) : (
                      <ChevronRight size={14} className="shrink-0 text-pramaan-text-secondary" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-pramaan-border/60 px-3 py-2">
                      <p className="text-pramaan-text-secondary" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
                        {s.excerpt}
                      </p>
                      <div className={`mt-1.5 ${c.color}`} style={{ fontSize: 11, fontWeight: 500 }}>
                        {c.label}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Recommended next steps */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-pramaan-text" style={{ fontSize: 12, fontWeight: 600 }}>
              Recommended Next Steps
            </span>
            <span className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>
              {doneCount}/{steps.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className="flex items-start gap-2.5 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3 py-2 text-left transition-colors hover:border-pramaan-primary/40"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    step.done
                      ? "border-pramaan-primary bg-pramaan-primary text-pramaan-text"
                      : "border-pramaan-border"
                  }`}
                >
                  {step.done && <Check size={11} strokeWidth={3} />}
                </span>
                <div className="min-w-0">
                  <div
                    className={step.done ? "text-pramaan-text-secondary line-through" : "text-pramaan-text"}
                    style={{ fontSize: 12, lineHeight: 1.4 }}
                  >
                    {step.label}
                  </div>
                  <div className="text-pramaan-text-secondary/70" style={{ fontSize: 10.5 }}>
                    {step.owner}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Linked chips */}
        <ChipGroup icon={Briefcase} title="Related Cases" items={relatedCases.map((r) => `${r.id}`)} tone="secondary" />
        <ChipGroup icon={User} title="Linked Persons" items={linkedPersons.map((p) => p.label)} tone="panel" />
        <ChipGroup icon={Car} title="Linked Vehicles" items={linkedVehicles.map((v) => v.label)} tone="panel" />
      </div>
    </aside>
  );
}

function Section({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <button onClick={onToggle} className="mb-2 flex w-full items-center gap-1.5">
        {open ? (
          <ChevronDown size={14} className="text-pramaan-text-secondary" />
        ) : (
          <ChevronRight size={14} className="text-pramaan-text-secondary" />
        )}
        <span className="text-pramaan-text" style={{ fontSize: 12, fontWeight: 600 }}>
          {title}
        </span>
        <span className="rounded-md bg-pramaan-panel px-1.5 text-pramaan-text-secondary" style={{ fontSize: 10, fontWeight: 500 }}>
          {count}
        </span>
      </button>
      {open && children}
    </div>
  );
}

function ChipGroup({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: typeof User;
  title: string;
  items: string[];
  tone: "secondary" | "panel";
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-1.5 text-pramaan-text-secondary" style={{ fontSize: 11, letterSpacing: "0.04em" }}>
        <Icon size={13} strokeWidth={1.75} />
        {title.toUpperCase()}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((label) => (
          <span
            key={label}
            className={`cursor-pointer rounded-md border px-2 py-1 transition-colors ${
              tone === "secondary"
                ? "border-pramaan-primary/30 bg-pramaan-primary/10 text-pramaan-secondary hover:bg-pramaan-primary/20"
                : "border-pramaan-border bg-pramaan-elevated text-pramaan-text hover:border-pramaan-primary/40"
            }`}
            style={{ fontSize: 11.5, fontWeight: 500 }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
