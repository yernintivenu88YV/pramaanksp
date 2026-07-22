/* ------------------------------------------------------------------ *
 * Elevation — exactly three levels, no more.
 * Rule: never a visible drop shadow AND a border on the same element.
 *   base   → surface fill, hairline border (no shadow)
 *   raised → elevated fill, lightened border +1px (no shadow)
 *   modal  → elevated fill, 8px shadow rgba(0,0,0,0.4) (no border)
 * ------------------------------------------------------------------ */
export const elevation = {
  base: "bg-pramaan-surface border border-pramaan-border",
  raised: "bg-pramaan-elevated border border-pramaan-border-strong",
  modal: "bg-pramaan-elevated shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
} as const;

export type Elevation = keyof typeof elevation;
