import { useState } from "react";
import {
  PanelRightClose,
  PanelRightOpen,
  Users,
  Sparkles,
  FolderKanban,
  ChevronRight,
} from "lucide-react";
import { type } from "./ui/scale";
import { Confidence } from "./ui/ai";

/* ------------------------------------------------------------------ *
 * Context rail — zone 3 of the standard 3-zone layout.
 * Right side · 300px expanded · 56px icon-only collapsed.
 * Holds related entities, AI suggestions, linked cases — never the
 * primary content. Present on every screen via App.
 * ------------------------------------------------------------------ */

interface EntityField {
  label: string;
  value: string;
}
interface Entity {
  id: string;
  name: string;
  kind: string;
  fields: EntityField[];
}

const relatedEntities: Entity[] = [
  {
    id: "n1",
    name: "V. Marchetti",
    kind: "Person",
    fields: [
      { label: "Role", value: "Suspected coordinator" },
      { label: "DOB", value: "1979-03-11" },
      { label: "Cases", value: "PRM-4821, 4790, 4758" },
      { label: "Phones", value: "3 linked" },
      { label: "Accounts", value: "•••4821, •••9930" },
      { label: "Last seen", value: "Metro Central · 11:47" },
      { label: "Vehicles", value: "KA-01-M?-4482" },
      { label: "Aliases", value: "“Marco”, V.M." },
      { label: "Passport", value: "Z••••41" },
      { label: "Risk", value: "High" },
    ],
  },
  {
    id: "n2",
    name: "Aurora Holdings",
    kind: "Organisation",
    fields: [
      { label: "Type", value: "Shell — nominee dir." },
      { label: "Reg", value: "2026-07-14" },
      { label: "Jurisdiction", value: "Port District" },
      { label: "Accounts", value: "2 flagged" },
      { label: "Directors", value: "V. Marchetti +1" },
      { label: "Inflows 24h", value: "€412,000" },
      { label: "Status", value: "Under freeze review" },
    ],
  },
];

export function ContextRail() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-l border-pramaan-border bg-pramaan-bg py-3">
        <RailIcon icon={PanelRightOpen} onClick={() => setOpen(true)} label="Expand context" />
        <div className="my-1 h-px w-6 bg-pramaan-border" />
        <RailIcon icon={Users} onClick={() => setOpen(true)} label="Related entities" />
        <RailIcon icon={Sparkles} onClick={() => setOpen(true)} label="AI suggestions" accent />
        <RailIcon icon={FolderKanban} onClick={() => setOpen(true)} label="Linked cases" />
      </aside>
    );
  }

  return (
    <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden border-l border-pramaan-border bg-pramaan-bg">
      <div className="flex h-9 shrink-0 items-center border-b border-pramaan-border px-3">
        <span className="text-pramaan-text-secondary" style={type.sectionHeader}>
          Context
        </span>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto text-pramaan-text-secondary transition-colors hover:text-pramaan-text"
          title="Collapse"
        >
          <PanelRightClose size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <RailSection icon={Users} title="Related Entities" count={relatedEntities.length}>
          <div className="flex flex-col gap-2">
            {relatedEntities.map((e) => (
              <EntityCard key={e.id} entity={e} />
            ))}
          </div>
        </RailSection>

        <RailSection icon={Sparkles} title="AI Suggestions" accent>
          <div className="flex flex-col gap-2">
            <Suggestion
              score={84}
              text="Request account freeze on Aurora Holdings before next transfer window (est. 22:00)."
            />
            <Suggestion
              score={71}
              text="Correlate IMEI 35•••90 against tower logs to confirm handler co-location."
            />
          </div>
        </RailSection>

        <RailSection icon={FolderKanban} title="Linked Cases" count={3}>
          <div className="flex flex-col">
            {[
              { id: "PRM-4790", t: "Shell company layering", s: 0.82 },
              { id: "PRM-4758", t: "Marketplace vendor cluster", s: 0.64 },
              { id: "PRM-4809", t: "Encrypted device network", s: 0.58 },
            ].map((c) => (
              <button
                key={c.id}
                className="group flex items-center gap-2 rounded px-1.5 py-1.5 text-left transition-colors hover:bg-pramaan-hover"
              >
                <span className="tnum font-mono text-pramaan-secondary" style={type.micro}>
                  {c.id}
                </span>
                <span className="min-w-0 flex-1 truncate text-pramaan-text" style={type.caption}>
                  {c.t}
                </span>
                <span className="tnum text-pramaan-text-secondary" style={type.micro}>
                  {Math.round(c.s * 100)}%
                </span>
                <ChevronRight size={12} className="text-pramaan-text-secondary/50 group-hover:text-pramaan-text-secondary" />
              </button>
            ))}
          </div>
        </RailSection>
      </div>
    </aside>
  );
}

function EntityCard({ entity }: { entity: Entity }) {
  const [expanded, setExpanded] = useState(false);
  const DEFAULT = 5;
  const shown = expanded ? entity.fields : entity.fields.slice(0, DEFAULT);
  const hidden = entity.fields.length - DEFAULT;

  return (
    <div className="rounded border border-pramaan-border bg-pramaan-surface p-2.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="truncate text-pramaan-text" style={type.bodyStrong}>
          {entity.name}
        </span>
        <span className="ml-auto shrink-0 rounded bg-pramaan-elevated px-1.5 py-0.5 text-pramaan-text-secondary" style={type.micro}>
          {entity.kind}
        </span>
      </div>
      <dl className="flex flex-col gap-1">
        {shown.map((f) => (
          <div key={f.label} className="flex items-baseline gap-2">
            <dt className="w-16 shrink-0 text-pramaan-text-secondary/70 uppercase" style={type.eyebrow}>
              {f.label}
            </dt>
            <dd className="tnum min-w-0 flex-1 truncate text-pramaan-text" style={type.caption}>
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
      {hidden > 0 && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="mt-2 text-pramaan-secondary transition-colors hover:text-pramaan-primary"
          style={type.micro}
        >
          {expanded ? "Show less" : `+${hidden} more`}
        </button>
      )}
    </div>
  );
}

function Suggestion({ score, text }: { score: number; text: string }) {
  return (
    <div className="rounded border border-pramaan-border bg-pramaan-surface p-2.5">
      <p className="text-pramaan-text-secondary" style={type.caption}>
        {text}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <Confidence score={score} />
        <button className="text-pramaan-secondary hover:text-pramaan-primary" style={type.micro}>
          Act →
        </button>
      </div>
    </div>
  );
}

function RailSection({
  icon: Icon,
  title,
  count,
  accent,
  children,
}: {
  icon: typeof Users;
  title: string;
  count?: number;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-pramaan-border p-3 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={13} strokeWidth={2} className={accent ? "text-pramaan-secondary" : "text-pramaan-text-secondary"} />
        <span className="text-pramaan-text-secondary" style={type.sectionHeader}>
          {title}
        </span>
        {count != null && (
          <span className="tnum ml-auto text-pramaan-text-secondary/60" style={type.micro}>
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function RailIcon({
  icon: Icon,
  onClick,
  label,
  accent,
}: {
  icon: typeof Users;
  onClick: () => void;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded transition-colors hover:bg-pramaan-hover ${
        accent ? "text-pramaan-secondary" : "text-pramaan-text-secondary hover:text-pramaan-text"
      }`}
    >
      <Icon size={17} strokeWidth={1.75} />
    </button>
  );
}
