import type { MatchStrength } from "../../../data/resolution";

export const strengthMeta: Record<MatchStrength, { color: string; dot: string; label: string }> = {
  strong: { color: "text-pramaan-success", dot: "bg-pramaan-success", label: "Strong" },
  moderate: { color: "text-pramaan-warning", dot: "bg-pramaan-warning", label: "Moderate" },
  weak: { color: "text-pramaan-critical", dot: "bg-pramaan-critical", label: "Weak" },
};

export function StrengthDot({ strength }: { strength: MatchStrength }) {
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${strengthMeta[strength].dot}`} />;
}

export function confidenceTone(score: number) {
  if (score >= 85) return { color: "text-pramaan-success", bg: "bg-pramaan-success/12", ring: "#2FBF71" };
  if (score >= 70) return { color: "text-pramaan-warning", bg: "bg-pramaan-warning/12", ring: "#F4B740" };
  return { color: "text-pramaan-critical", bg: "bg-pramaan-critical/12", ring: "#E05353" };
}
