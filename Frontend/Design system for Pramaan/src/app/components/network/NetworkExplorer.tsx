import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Search, Plus, Crosshair, Info } from "lucide-react";
import { type } from "../ui/scale";
import { Button, IconButton, ConfidenceTier } from "../ui/controls";
import { graph, categories, type GNode, type GEdge } from "../../data/graph";

const catColor = new Map(categories.map((c) => [c.key, c.color]));
const NODE_FILL = "#20242B"; // neutral gray — always

interface Pos { x: number; y: number; vx: number; vy: number }

export function NetworkExplorer({ onBack }: { onBack: () => void }) {
  // Adjacency + degree over the full graph
  const { adj, degree, nodeById } = useMemo(() => {
    const adj = new Map<string, { edge: GEdge; other: string }[]>();
    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
    graph.nodes.forEach((n) => adj.set(n.id, []));
    graph.edges.forEach((e) => {
      adj.get(e.from)?.push({ edge: e, other: e.to });
      adj.get(e.to)?.push({ edge: e, other: e.from });
    });
    const degree = new Map<string, number>();
    graph.nodes.forEach((n) => degree.set(n.id, adj.get(n.id)!.length));
    return { adj, degree, nodeById };
  }, []);

  // default root = highest-degree node
  const defaultRoot = useMemo(
    () => [...degree.entries()].sort((a, b) => b[1] - a[1])[0][0],
    [degree],
  );

  const [root, setRoot] = useState(defaultRoot);
  const [depth, setDepth] = useState(2);
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());
  const [selNode, setSelNode] = useState<GNode | null>(() => nodeById.get(defaultRoot) ?? null);
  const [selEdge, setSelEdge] = useState<GEdge | null>(null);
  const [query, setQuery] = useState("");

  // BFS to `depth` degrees, respecting category filter
  const visible = useMemo(() => {
    const nodes = new Set<string>();
    const q: [string, number][] = [[root, 0]];
    nodes.add(root);
    while (q.length) {
      const [id, d] = q.shift()!;
      if (d >= depth) continue;
      for (const { other } of adj.get(id) ?? []) {
        const n = nodeById.get(other)!;
        if (hiddenCats.has(n.category)) continue;
        if (!nodes.has(other)) {
          nodes.add(other);
          q.push([other, d + 1]);
        }
      }
    }
    const edges = graph.edges.filter((e) => nodes.has(e.from) && nodes.has(e.to));
    return { nodeIds: nodes, edges };
  }, [root, depth, hiddenCats, adj, nodeById]);

  // ---- refs shared with the render loop ----
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<Map<string, Pos>>(new Map());
  const camRef = useRef({ x: 0, y: 0, scale: 1 });
  const alphaRef = useRef(1);
  const sizeRef = useRef({ w: 800, h: 600 });
  const stateRef = useRef({ visible, selNodeId: selNode?.id ?? null, selEdgeId: selEdge?.id ?? null });

  useEffect(() => {
    stateRef.current = { visible, selNodeId: selNode?.id ?? null, selEdgeId: selEdge?.id ?? null };
    // seed positions for newly-visible nodes near center
    const { w, h } = sizeRef.current;
    visible.nodeIds.forEach((id) => {
      if (!posRef.current.has(id)) {
        const a = Math.random() * Math.PI * 2;
        const rad = 40 + Math.random() * 160;
        posRef.current.set(id, { x: w / 2 + Math.cos(a) * rad, y: h / 2 + Math.sin(a) * rad, vx: 0, vy: 0 });
      }
    });
    alphaRef.current = 1; // reheat
  }, [visible, selNode, selEdge]);

  // ---- sizing ----
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
      const dpr = window.devicePixelRatio || 1;
      const cv = canvasRef.current;
      if (cv) {
        cv.width = r.width * dpr;
        cv.height = r.height * dpr;
        cv.style.width = `${r.width}px`;
        cv.style.height = `${r.height}px`;
      }
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // ---- simulation + render loop ----
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const { visible, selNodeId, selEdgeId } = stateRef.current;
      const ids = [...visible.nodeIds];
      const pos = posRef.current;
      const alpha = alphaRef.current;
      const { w, h } = sizeRef.current;
      const cx = w / 2, cy = h / 2;
      const many = ids.length > 320;

      if (alpha > 0.02) {
        // centering
        for (const id of ids) {
          const p = pos.get(id)!;
          p.vx += (cx - p.x) * 0.0015 * alpha;
          p.vy += (cy - p.y) * 0.0015 * alpha;
        }
        // repulsion (skip for very large sets to keep frame budget)
        if (!many) {
          for (let i = 0; i < ids.length; i++) {
            const a = pos.get(ids[i])!;
            for (let j = i + 1; j < ids.length; j++) {
              const b = pos.get(ids[j])!;
              let dx = a.x - b.x, dy = a.y - b.y;
              let d2 = dx * dx + dy * dy || 1;
              if (d2 > 60000) continue;
              const f = (2400 / d2) * alpha;
              const d = Math.sqrt(d2);
              const ux = dx / d, uy = dy / d;
              a.vx += ux * f; a.vy += uy * f;
              b.vx -= ux * f; b.vy -= uy * f;
            }
          }
        }
        // springs
        for (const e of visible.edges) {
          const a = pos.get(e.from)!, b = pos.get(e.to)!;
          if (!a || !b) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const target = 78;
          const f = ((d - target) / d) * 0.04 * alpha;
          a.vx += dx * f; a.vy += dy * f;
          b.vx -= dx * f; b.vy -= dy * f;
        }
        for (const id of ids) {
          const p = pos.get(id)!;
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.82; p.vy *= 0.82;
        }
        alphaRef.current *= 0.985;
      }

      draw(canvasRef.current, miniRef.current, ids, visible.edges, pos, camRef.current, sizeRef.current, selNodeId, selEdgeId, degree, nodeById);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [degree, nodeById]);

  // ---- interaction ----
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const screenToWorld = (sx: number, sy: number) => {
    const cam = camRef.current;
    return { x: (sx - cam.x) / cam.scale, y: (sy - cam.y) / cam.scale };
  };

  const onDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    drag.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, moved: false };
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drag.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const dx = x - drag.current.x, dy = y - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) {
      drag.current.moved = true;
      camRef.current.x += dx; camRef.current.y += dy;
      drag.current.x = x; drag.current.y = y;
    }
  };
  const onUp = (e: React.MouseEvent) => {
    const d = drag.current; drag.current = null;
    if (!d || d.moved) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const w = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const pos = posRef.current;
    // hit node
    let hitNode: string | null = null;
    for (const id of stateRef.current.visible.nodeIds) {
      const p = pos.get(id)!;
      const r = radiusFor(degree.get(id) ?? 1);
      if ((w.x - p.x) ** 2 + (w.y - p.y) ** 2 <= (r + 3) ** 2) { hitNode = id; break; }
    }
    if (hitNode) {
      setSelNode(nodeById.get(hitNode)!); setSelEdge(null);
      return;
    }
    // hit edge
    for (const e2 of stateRef.current.visible.edges) {
      const a = pos.get(e2.from)!, b = pos.get(e2.to)!;
      if (distToSeg(w.x, w.y, a.x, a.y, b.x, b.y) < 5) { setSelEdge(e2); setSelNode(null); return; }
    }
    setSelNode(null); setSelEdge(null);
  };
  const onWheel = (e: React.WheelEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const cam = camRef.current;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const ns = Math.min(3, Math.max(0.2, cam.scale * factor));
    // zoom around cursor
    cam.x = sx - ((sx - cam.x) / cam.scale) * ns;
    cam.y = sy - ((sy - cam.y) / cam.scale) * ns;
    cam.scale = ns;
  };

  const onMiniClick = (e: React.MouseEvent) => {
    const rect = miniRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    const b = worldBounds(stateRef.current.visible.nodeIds, posRef.current);
    const wx = b.minX + mx * (b.maxX - b.minX);
    const wy = b.minY + my * (b.maxY - b.minY);
    const cam = camRef.current;
    const { w, h } = sizeRef.current;
    cam.x = w / 2 - wx * cam.scale;
    cam.y = h / 2 - wy * cam.scale;
  };

  const focus = (id: string) => { setRoot(id); setDepth(2); setSelNode(nodeById.get(id)!); setSelEdge(null); };

  const searchResults = query
    ? graph.nodes.filter((n) => n.label.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-pramaan-bg text-pramaan-text">
      {/* header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-pramaan-border px-3">
        <IconButton icon={ArrowLeft} variant="ghost" onClick={onBack} />
        <span className="text-pramaan-text" style={type.subheading}>Criminal Network Explorer</span>
        <span className="tnum text-pramaan-text-secondary/60" style={type.micro}>
          {graph.nodes.length} entities · {visible.nodeIds.size} in view · canvas
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <div className="flex items-center gap-2 rounded border border-pramaan-border bg-pramaan-surface px-2">
              <Search size={13} className="text-pramaan-text-secondary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to entity…"
                className="h-8 w-52 bg-transparent text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/50"
                style={type.body}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded border border-pramaan-border bg-pramaan-elevated shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                {searchResults.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { focus(n.id); setQuery(""); }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left hover:bg-pramaan-hover"
                  >
                    <span className="h-2 w-2 rounded-full border-2" style={{ borderColor: catColor.get(n.category), background: NODE_FILL }} />
                    <span className="flex-1 truncate text-pramaan-text" style={type.caption}>{n.label}</span>
                    <span className="tnum text-pramaan-text-secondary/60" style={type.micro}>{degree.get(n.id)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* left controls */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-pramaan-border">
          <div className="border-b border-pramaan-border p-3">
            <div className="mb-2 text-pramaan-text-secondary" style={type.sectionHeader}>View Scope</div>
            <div className="tnum mb-2 flex items-center justify-between rounded border border-pramaan-border bg-pramaan-surface px-2.5 py-1.5">
              <span className="text-pramaan-text-secondary" style={type.caption}>Degrees from focus</span>
              <span className="font-mono text-pramaan-text" style={type.bodyStrong}>{depth}°</span>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" icon={Plus} className="flex-1" onClick={() => setDepth((d) => Math.min(d + 1, 5))}>
                Expand +1°
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDepth(2)}>Reset</Button>
            </div>
            <p className="mt-2 text-pramaan-text-secondary/60" style={type.micro}>
              Default capped at 2°. Expansion is explicit.
            </p>
          </div>

          <div className="p-3">
            <div className="mb-2 text-pramaan-text-secondary" style={type.sectionHeader}>Categories</div>
            <div className="flex flex-col gap-0.5">
              {categories.map((c) => {
                const off = hiddenCats.has(c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() =>
                      setHiddenCats((s) => {
                        const n = new Set(s);
                        n.has(c.key) ? n.delete(c.key) : n.add(c.key);
                        return n;
                      })
                    }
                    className={`flex items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-pramaan-hover ${off ? "opacity-35" : ""}`}
                  >
                    <span className="h-3 w-3 rounded-full border-2" style={{ borderColor: c.color, background: NODE_FILL }} />
                    <span className="flex-1 text-left text-pramaan-text" style={type.caption}>{c.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 mb-2 text-pramaan-text-secondary" style={type.sectionHeader}>Edge Legend</div>
            <div className="flex flex-col gap-1.5 text-pramaan-text-secondary" style={type.micro}>
              <span className="flex items-center gap-2"><span className="h-px w-8 bg-pramaan-text-secondary" /> Confirmed (solid)</span>
              <span className="flex items-center gap-2"><span className="h-px w-8 border-t border-dashed border-pramaan-text-secondary" /> AI-suggested (dashed)</span>
              <span className="flex items-center gap-2"><span className="h-[3px] w-8 rounded bg-pramaan-text-secondary" /> Thicker = higher confidence</span>
            </div>
          </div>
        </aside>

        {/* canvas */}
        <div ref={wrapRef} className="relative min-w-0 flex-1 bg-pramaan-bg">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={() => (drag.current = null)}
            onWheel={onWheel}
          />
          {/* mini-map */}
          <div className="absolute bottom-3 right-3 overflow-hidden rounded border border-pramaan-border bg-pramaan-surface/90">
            <div className="px-2 py-0.5 text-pramaan-text-secondary/70" style={type.micro}>MINI-MAP</div>
            <canvas
              ref={miniRef}
              width={160}
              height={120}
              onClick={onMiniClick}
              className="block cursor-pointer"
              style={{ width: 160, height: 120 }}
            />
          </div>
          {/* zoom hint */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded border border-pramaan-border bg-pramaan-surface/90 px-2 py-1 text-pramaan-text-secondary/70" style={type.micro}>
            <Crosshair size={11} /> scroll to zoom · drag to pan
          </div>
        </div>

        {/* right detail panel (non-blocking) */}
        <aside className="flex w-80 shrink-0 flex-col border-l border-pramaan-border">
          {selEdge ? (
            <EdgePanel edge={selEdge} nodeById={nodeById} />
          ) : selNode ? (
            <NodePanel
              node={selNode}
              degree={degree.get(selNode.id) ?? 0}
              adj={adj.get(selNode.id) ?? []}
              nodeById={nodeById}
              onExplain={(e) => setSelEdge(e)}
              onFocus={focus}
              isRoot={selNode.id === root}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-pramaan-text-secondary/60" style={type.caption}>
              Select a node or edge to inspect.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ---------------- panels ---------------- */

function NodePanel({
  node, degree, adj, nodeById, onExplain, onFocus, isRoot,
}: {
  node: GNode;
  degree: number;
  adj: { edge: GEdge; other: string }[];
  nodeById: Map<string, GNode>;
  onExplain: (e: GEdge) => void;
  onFocus: (id: string) => void;
  isRoot: boolean;
}) {
  const cat = categories.find((c) => c.key === node.category);
  return (
    <>
      <div className="flex h-9 items-center border-b border-pramaan-border px-3 text-pramaan-text-secondary" style={type.sectionHeader}>
        Entity Detail
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3 flex items-start gap-2">
          <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: cat?.color, background: NODE_FILL }} />
          <div className="min-w-0">
            <div className="text-pramaan-text" style={type.subheading}>{node.label}</div>
            <div className="tnum font-mono text-pramaan-text-secondary" style={type.micro}>{node.id} · {node.kind}</div>
          </div>
        </div>
        <dl className="mb-3 grid grid-cols-2 gap-2">
          <Field k="Category" v={cat?.label ?? "—"} />
          <Field k="Connections" v={String(degree)} />
        </dl>
        {!isRoot && (
          <Button size="sm" variant="secondary" icon={Crosshair} className="mb-3 w-full" onClick={() => onFocus(node.id)}>
            Focus & expand from here
          </Button>
        )}
        <div className="mb-1.5 text-pramaan-text-secondary" style={type.eyebrow}>LINKS · {adj.length}</div>
        <div className="flex flex-col gap-1.5">
          {adj.slice(0, 12).map(({ edge, other }) => {
            const o = nodeById.get(other)!;
            return (
              <div key={edge.id} className="rounded border border-pramaan-border bg-pramaan-surface p-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full border-2" style={{ borderColor: catColor.get(o.category), background: NODE_FILL }} />
                  <span className="min-w-0 flex-1 truncate text-pramaan-text" style={type.caption}>{o.label}</span>
                  <span className="text-pramaan-text-secondary" style={type.micro}>{edge.relation}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-pramaan-text-secondary" style={type.micro}>
                    <span className={edge.confirmed ? "text-pramaan-text-secondary" : "text-pramaan-signal"}>
                      {edge.confirmed ? "confirmed" : "AI-suggested"}
                    </span>
                    · {Math.round(edge.confidence * 100)}%
                  </span>
                  <button onClick={() => onExplain(edge)} className="flex items-center gap-1 text-pramaan-secondary hover:text-pramaan-primary" style={type.micro}>
                    <Info size={11} /> Explain link
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function EdgePanel({ edge, nodeById }: { edge: GEdge; nodeById: Map<string, GNode> }) {
  const a = nodeById.get(edge.from)!, b = nodeById.get(edge.to)!;
  return (
    <>
      <div className="flex h-9 items-center gap-2 border-b border-pramaan-border px-3 text-pramaan-text-secondary" style={type.sectionHeader}>
        Explain This Link
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3 flex items-center gap-2 rounded border border-pramaan-border bg-pramaan-surface p-2.5">
          <EndDot n={a} /><span className="truncate text-pramaan-text" style={type.caption}>{a.label}</span>
          <span className="mx-1 text-pramaan-text-secondary" style={type.micro}>{edge.relation}</span>
          <EndDot n={b} /><span className="truncate text-pramaan-text" style={type.caption}>{b.label}</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <ConfidenceTier score={Math.round(edge.confidence * 100)} />
          <span className={`tnum ${edge.confirmed ? "text-pramaan-text-secondary" : "text-pramaan-signal"}`} style={type.micro}>
            {edge.confirmed ? "CONFIRMED" : "AI-SUGGESTED"}
          </span>
        </div>
        <p className="text-pramaan-text-secondary" style={type.body}>{edge.evidence}</p>
      </div>
    </>
  );
}

function EndDot({ n }: { n: GNode }) {
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2" style={{ borderColor: catColor.get(n.category), background: NODE_FILL }} />;
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-pramaan-text-secondary/70 uppercase" style={type.eyebrow}>{k}</dt>
      <dd className="tnum text-pramaan-text" style={type.caption}>{v}</dd>
    </div>
  );
}

/* ---------------- drawing + geometry ---------------- */

function radiusFor(deg: number) {
  return Math.min(26, 5 + Math.sqrt(deg) * 2.4);
}

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function worldBounds(ids: Set<string>, pos: Map<string, Pos>) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  ids.forEach((id) => {
    const p = pos.get(id);
    if (!p) return;
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  });
  if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  const padX = (maxX - minX) * 0.1 + 20, padY = (maxY - minY) * 0.1 + 20;
  return { minX: minX - padX, minY: minY - padY, maxX: maxX + padX, maxY: maxY + padY };
}

function draw(
  cv: HTMLCanvasElement | null,
  mini: HTMLCanvasElement | null,
  ids: string[],
  edges: GEdge[],
  pos: Map<string, Pos>,
  cam: { x: number; y: number; scale: number },
  size: { w: number; h: number },
  selNodeId: string | null,
  selEdgeId: string | null,
  degree: Map<string, number>,
  nodeById: Map<string, GNode>,
) {
  if (!cv) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size.w, size.h);

  const wx = (x: number) => x * cam.scale + cam.x;
  const wy = (y: number) => y * cam.scale + cam.y;

  // edges
  for (const e of edges) {
    const a = pos.get(e.from), b = pos.get(e.to);
    if (!a || !b) continue;
    const sel = e.id === selEdgeId;
    ctx.beginPath();
    ctx.moveTo(wx(a.x), wy(a.y));
    ctx.lineTo(wx(b.x), wy(b.y));
    ctx.lineWidth = 0.5 + e.confidence * 3;
    ctx.setLineDash(e.confirmed ? [] : [4, 3]);
    ctx.strokeStyle = sel ? "#4A9EFF" : e.confirmed ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.10)";
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // nodes
  const showLabels = cam.scale > 0.75 && ids.length < 160;
  for (const id of ids) {
    const p = pos.get(id);
    if (!p) continue;
    const n = nodeById.get(id)!;
    const r = radiusFor(degree.get(id) ?? 1) * cam.scale;
    const sx = wx(p.x), sy = wy(p.y);
    const sel = id === selNodeId;
    // fill neutral
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = NODE_FILL;
    ctx.fill();
    // category border/ring
    ctx.lineWidth = sel ? 3 : 2;
    ctx.strokeStyle = catColor.get(n.category) ?? "#9AA0A6";
    ctx.stroke();
    if (sel) {
      ctx.beginPath();
      ctx.arc(sx, sy, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(74,158,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (showLabels && (degree.get(id) ?? 0) > 1) {
      ctx.fillStyle = "#9AA0A6";
      ctx.font = "10px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.label.length > 18 ? n.label.slice(0, 17) + "…" : n.label, sx, sy + r + 11);
    }
  }

  // mini-map
  if (mini) {
    const mc = mini.getContext("2d");
    if (mc) {
      const mw = 160, mh = 120;
      mc.clearRect(0, 0, mw, mh);
      mc.fillStyle = "#14171C";
      mc.fillRect(0, 0, mw, mh);
      const b = worldBounds(new Set(ids), pos);
      const sx = mw / (b.maxX - b.minX || 1);
      const sy = mh / (b.maxY - b.minY || 1);
      const s = Math.min(sx, sy);
      const mapX = (x: number) => (x - b.minX) * s;
      const mapY = (y: number) => (y - b.minY) * s;
      for (const e of edges) {
        const a = pos.get(e.from), bb = pos.get(e.to);
        if (!a || !bb) continue;
        mc.beginPath();
        mc.moveTo(mapX(a.x), mapY(a.y));
        mc.lineTo(mapX(bb.x), mapY(bb.y));
        mc.strokeStyle = "rgba(255,255,255,0.08)";
        mc.lineWidth = 0.5;
        mc.stroke();
      }
      for (const id of ids) {
        const p = pos.get(id); if (!p) continue;
        mc.beginPath();
        mc.arc(mapX(p.x), mapY(p.y), 1.4, 0, Math.PI * 2);
        mc.fillStyle = catColor.get(nodeById.get(id)!.category) ?? "#9AA0A6";
        mc.fill();
      }
      // viewport rectangle
      const vx0 = (-cam.x) / cam.scale, vy0 = (-cam.y) / cam.scale;
      const vx1 = (size.w - cam.x) / cam.scale, vy1 = (size.h - cam.y) / cam.scale;
      mc.strokeStyle = "rgba(74,158,255,0.8)";
      mc.lineWidth = 1;
      mc.strokeRect(mapX(vx0), mapY(vy0), (vx1 - vx0) * s, (vy1 - vy0) * s);
    }
  }
}
