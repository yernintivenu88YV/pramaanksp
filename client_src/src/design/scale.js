// Typography scale — ported from src/app/components/ui/scale.ts
// Each key returns a plain style object suitable for inline `style` props.

export const type = {
  display:    { fontSize: 28,   fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.02em' },
  headline:   { fontSize: 22,   fontWeight: 600, lineHeight: 1.3 },
  title:      { fontSize: 17,   fontWeight: 600, lineHeight: 1.35 },
  subheading: { fontSize: 12.5, fontWeight: 600, lineHeight: 1.4,  letterSpacing: '0.04em' },
  bodyStrong: { fontSize: 13,   fontWeight: 500, lineHeight: 1.5 },
  body:       { fontSize: 13,   fontWeight: 400, lineHeight: 1.5 },
  caption:    { fontSize: 12,   fontWeight: 400, lineHeight: 1.5 },
  label:      { fontSize: 12,   fontWeight: 500, lineHeight: 1.4 },
  eyebrow:    { fontSize: 10.5, fontWeight: 600, lineHeight: 1.3,  letterSpacing: '0.08em' },
  micro:      { fontSize: 10.5, fontWeight: 500, lineHeight: 1.3 },
  mono:       { fontSize: 11,   fontWeight: 400, lineHeight: 1.5,  fontFamily: 'var(--font-mono)' },
  monoSmall:  { fontSize: 10,   fontWeight: 400, lineHeight: 1.4,  fontFamily: 'var(--font-mono)' },
};
