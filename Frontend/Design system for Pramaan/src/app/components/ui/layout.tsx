import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { type } from "./scale";

/* ------------------------------------------------------------------ *
 * Pramaan layout primitives
 * Enforce the three-zone information architecture and 8px rhythm:
 *   PageStack   → vertical rhythm between major sections (24px)
 *   ZoneGrid    → primary focus (span 2) + supporting rail (span 1)
 *   SectionHeader → eyebrow + title + description + actions
 *   Panel       → surface with tone/priority + optional collapse
 *   StatTile    → numeric emphasis
 * ------------------------------------------------------------------ */

export function PageStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

/** Primary focus area (2fr) beside a supporting-evidence rail (1fr). */
export function ZoneGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">{children}</div>;
}

export function PrimaryZone({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6 xl:col-span-2">{children}</div>;
}

export function SupportZone({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-pramaan-text-secondary/70 uppercase" style={type.eyebrow}>
            {eyebrow}
          </div>
        )}
        <h2 className="truncate text-pramaan-text" style={type.heading}>
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-pramaan-text-secondary" style={type.caption}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

type Tone = "default" | "focus" | "muted";

const toneCls: Record<Tone, string> = {
  default: "border-pramaan-border bg-pramaan-surface",
  // Primary focus area — stronger hairline, no glow/decoration.
  focus: "border-pramaan-border-strong bg-pramaan-surface",
  muted: "border-pramaan-border/60 bg-pramaan-bg/40",
};

export function Panel({
  children,
  tone = "default",
  className = "",
  pad = "p-4",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  pad?: string;
}) {
  return (
    <div className={`rounded-lg border ${toneCls[tone]} ${pad} ${className}`}>{children}</div>
  );
}

/** Dense panel with a chrome header bar — the OS workspace building block. */
export function WorkPanel({
  eyebrow,
  title,
  actions,
  children,
  className = "",
  bodyClass = "p-4",
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-pramaan-border bg-pramaan-surface ${className}`}>
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-pramaan-border bg-pramaan-elevated/40 px-3">
        {eyebrow && (
          <span className="text-pramaan-text-secondary/60 uppercase" style={type.eyebrow}>
            {eyebrow}
          </span>
        )}
        <span className="truncate text-pramaan-text-secondary" style={type.sectionHeader}>
          {title}
        </span>
        {actions && <div className="ml-auto flex items-center gap-1.5">{actions}</div>}
      </div>
      <div className={`min-h-0 flex-1 overflow-auto ${bodyClass}`}>{children}</div>
    </div>
  );
}

/** Progressive disclosure — a titled panel that collapses to its header. */
export function CollapsiblePanel({
  eyebrow,
  title,
  description,
  actions,
  defaultOpen = true,
  tone = "default",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  defaultOpen?: boolean;
  tone?: Tone;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`overflow-hidden rounded-lg border ${toneCls[tone]}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-pramaan-elevated/40"
      >
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="mb-0.5 text-pramaan-text-secondary/70 uppercase" style={type.eyebrow}>
              {eyebrow}
            </div>
          )}
          <div className="truncate text-pramaan-text" style={type.heading}>
            {title}
          </div>
          {description && (
            <div className="mt-0.5 text-pramaan-text-secondary" style={type.caption}>
              {description}
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>{actions}</div>}
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className={`shrink-0 text-pramaan-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-pramaan-border px-5 py-4">{children}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  delta,
  up,
  icon: Icon,
  emphasis = false,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  icon: typeof ChevronDown;
  emphasis?: boolean;
}) {
  return (
    <Panel tone={emphasis ? "focus" : "default"} pad="p-5">
      <div className="flex items-center justify-between">
        <span className="text-pramaan-text-secondary" style={type.label}>
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pramaan-elevated text-pramaan-secondary">
          <Icon size={16} strokeWidth={1.75} />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <span className="text-pramaan-text" style={type.metric}>
          {value}
        </span>
        {delta && (
          <span
            className={`flex items-center gap-1 ${up ? "text-pramaan-success" : "text-pramaan-critical"}`}
            style={type.label}
          >
            {delta}
          </span>
        )}
      </div>
    </Panel>
  );
}

/** Sticky in-page section navigation for long investigation screens. */
export function SectionNav({
  items,
  active,
  onSelect,
}: {
  items: { id: string; label: string; count?: number }[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="sticky top-0 z-10 -mx-6 mb-2 flex items-center gap-1 overflow-x-auto border-b border-pramaan-border bg-pramaan-bg/85 px-6 py-2.5 backdrop-blur">
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
              on
                ? "bg-pramaan-primary/12 text-pramaan-text"
                : "text-pramaan-text-secondary hover:bg-pramaan-elevated hover:text-pramaan-text"
            }`}
            style={type.label}
          >
            {it.label}
            {it.count != null && (
              <span
                className={`rounded-md px-1.5 ${on ? "bg-pramaan-primary/20 text-pramaan-secondary" : "bg-pramaan-panel text-pramaan-text-secondary"}`}
                style={type.micro}
              >
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
