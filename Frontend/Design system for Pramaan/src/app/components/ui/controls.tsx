import type { ButtonHTMLAttributes, ReactNode } from "react";
import { type } from "./scale";

/* ------------------------------------------------------------------ *
 * Buttons — three variants, no gradients. 4px radius, 36px default height.
 *   primary   → solid accent
 *   secondary → 1px border, transparent fill
 *   ghost     → no border, text only
 * ------------------------------------------------------------------ */

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const variantCls: Record<Variant, string> = {
  primary: "bg-pramaan-primary text-[#0B0D10] hover:bg-pramaan-secondary",
  secondary:
    "border border-pramaan-border-strong bg-transparent text-pramaan-text hover:bg-pramaan-hover",
  ghost: "bg-transparent text-pramaan-text-secondary hover:bg-pramaan-hover hover:text-pramaan-text",
};

// 36px default (md) · 28px compact (sm) — Linear-style density.
const sizeCls: Record<Size, string> = {
  md: "h-9 px-3 gap-2",
  sm: "h-7 px-2.5 gap-1.5",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  children,
  className = "",
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  icon?: typeof import("lucide-react").Search;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded transition-colors disabled:opacity-40 ${variantCls[variant]} ${sizeCls[size]} ${className}`}
      style={type.label}
      {...rest}
    >
      {Icon && <Icon size={size === "sm" ? 13 : 15} strokeWidth={2} />}
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  variant = "secondary",
  className = "",
  ...rest
}: {
  icon: typeof import("lucide-react").Search;
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded transition-colors ${variantCls[variant]} ${className}`}
      {...rest}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Badges & chips — 20px height (h-5), 4px radius.
 * ------------------------------------------------------------------ */

const chipBase =
  "inline-flex h-5 items-center gap-1 rounded px-1.5 whitespace-nowrap";

export type StatusKind = "active" | "escalated" | "review" | "closed" | "pending";

const statusCls: Record<StatusKind, string> = {
  active: "bg-pramaan-primary/12 text-pramaan-secondary",
  escalated: "bg-pramaan-critical/12 text-pramaan-critical",
  review: "bg-pramaan-signal/12 text-pramaan-signal",
  pending: "bg-pramaan-signal/12 text-pramaan-signal",
  closed: "bg-pramaan-elevated text-pramaan-text-secondary",
};

export function StatusChip({ status }: { status: StatusKind }) {
  return (
    <span className={`${chipBase} ${statusCls[status]}`} style={{ ...type.micro, fontWeight: 600, letterSpacing: "0.03em" }}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status.toUpperCase()}
    </span>
  );
}

/** Confidence tier — gray → amber → red only (not rainbow). */
export function ConfidenceTier({ score }: { score: number }) {
  const tier = score >= 75 ? "high" : score >= 50 ? "medium" : "low";
  const cls =
    tier === "high"
      ? "bg-pramaan-text-secondary/15 text-pramaan-text"
      : tier === "medium"
        ? "bg-pramaan-signal/12 text-pramaan-signal"
        : "bg-pramaan-critical/12 text-pramaan-critical";
  return (
    <span className={`${chipBase} tnum ${cls}`} style={{ ...type.micro, fontWeight: 600 }}>
      {tier.toUpperCase()} · {score}%
    </span>
  );
}

/** Neutral case/entity tag — the only pill-shaped chip. */
export function Tag({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className={`${chipBase} rounded-full border border-pramaan-border bg-pramaan-elevated text-pramaan-text-secondary`} style={type.micro}>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 text-pramaan-text-secondary/60 hover:text-pramaan-text">
          ×
        </button>
      )}
    </span>
  );
}
