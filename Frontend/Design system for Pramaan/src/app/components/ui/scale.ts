// Single source of truth for Pramaan's typography scale and spacing rhythm.
// Font size / weight / letter-spacing are applied inline (per project convention),
// so every screen pulls from these tokens instead of ad-hoc numbers.

export const type = {
  // Page-level identity
  display: { fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 },
  title: { fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 },
  // Section + panel headers
  heading: { fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em" },
  subheading: { fontSize: 13, fontWeight: 600 },
  // Body copy
  body: { fontSize: 13, fontWeight: 400, lineHeight: 1.55 },
  bodyStrong: { fontSize: 13, fontWeight: 500 },
  // Metadata + supporting
  label: { fontSize: 12, fontWeight: 500 },
  caption: { fontSize: 11.5, fontWeight: 400 },
  micro: { fontSize: 10.5, fontWeight: 400 },
  // Overline / eyebrow
  eyebrow: { fontSize: 10.5, fontWeight: 600, letterSpacing: "0.09em" },
  // Canonical section header — 13px uppercase, 0.05em, secondary. Never > body.
  sectionHeader: { fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const },
  // Numeric emphasis (stat tiles)
  metric: { fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 },
} as const;

// 8px spacing rhythm — reference these Tailwind classes so gaps stay on-grid.
// section stack: gap-6 (24) · card grids: gap-4 (16) · in-card lists: gap-2/gap-3 (8/12)
// panel padding: p-5 (20) for supporting, p-6 (24) for primary focus.
