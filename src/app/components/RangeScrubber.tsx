import { useCallback, useRef } from "react";

/* Full-width draggable time-range scrubber. Two handles define a window;
   the filled bar between them can be dragged to move the whole window.
   Emits minute values so map layers can update live. */
export function RangeScrubber({
  min,
  max,
  start,
  end,
  onChange,
  format,
}: {
  min: number;
  max: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
  format: (m: number) => string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = max - min;
  const pct = (v: number) => ((v - min) / span) * 100;

  const minuteAt = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return min;
      const r = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      return Math.round(min + ratio * span);
    },
    [min, span],
  );

  const dragHandle = (which: "start" | "end") => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const m = minuteAt(ev.clientX);
      if (which === "start") onChange(Math.min(m, end - 15), end);
      else onChange(start, Math.max(m, start + 15));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const dragWindow = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const s0 = start;
    const e0 = end;
    const width = e0 - s0;
    const move = (ev: PointerEvent) => {
      const r = trackRef.current!.getBoundingClientRect();
      const deltaMin = ((ev.clientX - startX) / r.width) * span;
      let ns = Math.round(s0 + deltaMin);
      ns = Math.min(Math.max(min, ns), max - width);
      onChange(ns, ns + width);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="flex h-14 shrink-0 items-center gap-4 border-t border-pramaan-border bg-pramaan-surface px-5">
      <span className="font-mono text-[9px] text-pramaan-text-secondary">{format(min)}</span>
      <div ref={trackRef} className="relative h-6 flex-1">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-pramaan-elevated" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 cursor-grab bg-pramaan-primary/60 active:cursor-grabbing"
          style={{ left: `${pct(start)}%`, right: `${100 - pct(end)}%` }}
          onPointerDown={dragWindow}
        />
        <Handle left={pct(start)} onPointerDown={dragHandle("start")} label={format(start)} />
        <Handle left={pct(end)} onPointerDown={dragHandle("end")} label={format(end)} />
      </div>
      <span className="font-mono text-[9px] text-pramaan-text-secondary">{format(max)}</span>
      <span className="border-l border-pramaan-border pl-3 font-mono text-[9px] text-pramaan-primary">{format(start)}–{format(end)}</span>
    </div>
  );
}

function Handle({ left, onPointerDown, label }: { left: number; onPointerDown: (e: React.PointerEvent) => void; label: string }) {
  return (
    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%` }}>
      <div
        role="slider"
        aria-valuetext={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        className="h-4 w-2 cursor-ew-resize bg-pramaan-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"
      />
    </div>
  );
}
