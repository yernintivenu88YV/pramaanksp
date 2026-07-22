import { useEffect, useRef, useState } from "react";

export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
}

export interface SimLink {
  from: string;
  to: string;
}

// Lightweight force-directed layout (repulsion + spring + centering).
// Runs a decaying simulation and exposes live positions. No external deps.
export function useForceSimulation(
  nodeIds: string[],
  links: SimLink[],
  width: number,
  height: number
) {
  const posRef = useRef<Map<string, SimNode>>(new Map());
  const [, force] = useState(0);
  const rafRef = useRef<number>();
  const alphaRef = useRef(1);
  const dragRef = useRef<string | null>(null);

  // Seed positions for any new nodes near the centre.
  useEffect(() => {
    const map = posRef.current;
    nodeIds.forEach((id, i) => {
      if (!map.has(id)) {
        const angle = (i / Math.max(nodeIds.length, 1)) * Math.PI * 2;
        map.set(id, {
          id,
          x: width / 2 + Math.cos(angle) * 120 + (Math.random() - 0.5) * 40,
          y: height / 2 + Math.sin(angle) * 120 + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0,
        });
      }
    });
    // Drop removed nodes.
    Array.from(map.keys()).forEach((id) => {
      if (!nodeIds.includes(id)) map.delete(id);
    });
    alphaRef.current = 0.9;
  }, [nodeIds, width, height]);

  useEffect(() => {
    const map = posRef.current;

    const tick = () => {
      const nodes = Array.from(map.values());
      const alpha = alphaRef.current;

      // Repulsion between all pairs.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dist2 = dx * dx + dy * dy;
          if (dist2 < 0.01) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            dist2 = 1;
          }
          const dist = Math.sqrt(dist2);
          const rep = (9000 / dist2) * alpha;
          const fx = (dx / dist) * rep;
          const fy = (dy / dist) * rep;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // Spring attraction along links.
      const target = 130;
      links.forEach((l) => {
        const a = map.get(l.from);
        const b = map.get(l.to);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const spring = (dist - target) * 0.02 * alpha;
        const fx = (dx / dist) * spring;
        const fy = (dy / dist) * spring;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      // Centring + integrate.
      nodes.forEach((n) => {
        n.vx += (width / 2 - n.x) * 0.002 * alpha;
        n.vy += (height / 2 - n.y) * 0.002 * alpha;
        if (n.id === dragRef.current) {
          n.vx = 0;
          n.vy = 0;
          return;
        }
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(40, Math.min(width - 40, n.x));
        n.y = Math.max(40, Math.min(height - 40, n.y));
      });

      alphaRef.current = Math.max(0.02, alpha * 0.99);
      force((v) => v + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [links, width, height]);

  const reheat = () => {
    alphaRef.current = 0.8;
  };

  const setDrag = (id: string | null) => {
    dragRef.current = id;
    if (id) alphaRef.current = Math.max(alphaRef.current, 0.3);
  };

  const setPos = (id: string, x: number, y: number) => {
    const n = posRef.current.get(id);
    if (n) {
      n.x = x;
      n.y = y;
      n.vx = 0;
      n.vy = 0;
    }
  };

  return { positions: posRef.current, reheat, setDrag, setPos };
}
