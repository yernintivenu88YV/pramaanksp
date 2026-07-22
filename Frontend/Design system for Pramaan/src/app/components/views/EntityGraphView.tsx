import { useState } from "react";
import { User, Building2, MapPin, Smartphone, CreditCard } from "lucide-react";
import { graphNodes, graphEdges, type GraphNode } from "../../data/mock";
import { severityConfig } from "../severity";

const typeMeta: Record<GraphNode["type"], { icon: typeof User; label: string }> = {
  person: { icon: User, label: "Person" },
  org: { icon: Building2, label: "Organization" },
  location: { icon: MapPin, label: "Location" },
  device: { icon: Smartphone, label: "Device" },
  account: { icon: CreditCard, label: "Account" },
};

const riskHex: Record<string, string> = {
  critical: "#E05353",
  warning: "#F4B740",
  info: "#5D9CFF",
  success: "#2FBF71",
};

export function EntityGraphView() {
  const [selected, setSelected] = useState<string>("n1");
  const node = graphNodes.find((n) => n.id === selected)!;
  const connections = graphEdges.filter((e) => e.from === selected || e.to === selected);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div className="relative overflow-hidden rounded-xl border border-pramaan-border bg-pramaan-surface">
        <div className="flex items-center justify-between border-b border-pramaan-border px-4 py-3">
          <div>
            <h3 className="text-pramaan-text" style={{ fontSize: 14, fontWeight: 600 }}>
              Link Analysis · PRM-4821
            </h3>
            <p className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
              {graphNodes.length} entities · {graphEdges.length} relationships
            </p>
          </div>
          <div className="flex items-center gap-3" style={{ fontSize: 11 }}>
            {Object.entries(typeMeta).map(([k, v]) => (
              <span key={k} className="hidden items-center gap-1.5 text-pramaan-text-secondary xl:flex">
                <v.icon size={12} strokeWidth={1.75} />
                {v.label}
              </span>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 820 480" className="h-[460px] w-full">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="#1C2538" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="820" height="480" fill="url(#grid)" />

          {graphEdges.map((e, i) => {
            const from = graphNodes.find((n) => n.id === e.from)!;
            const to = graphNodes.find((n) => n.id === e.to)!;
            const active = e.from === selected || e.to === selected;
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={active ? "#3F7DF7" : "#31405E"}
                  strokeWidth={active ? 2 : 1.25}
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 4}
                  fill={active ? "#AAB6CF" : "#5b6b8a"}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {graphNodes.map((n) => {
            const meta = typeMeta[n.type];
            const isSel = n.id === selected;
            const color = riskHex[n.risk];
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onClick={() => setSelected(n.id)}
                style={{ cursor: "pointer" }}
              >
                {isSel && <circle r={28} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />}
                <circle r={20} fill="#1C2538" stroke={color} strokeWidth={isSel ? 2.5 : 1.75} />
                <foreignObject x={-9} y={-9} width={18} height={18}>
                  <div className="flex items-center justify-center" style={{ color }}>
                    <meta.icon size={16} strokeWidth={1.75} />
                  </div>
                </foreignObject>
                <text x={0} y={36} fill="#F8FAFC" fontSize={11} textAnchor="middle" fontWeight={500}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-xl border border-pramaan-border bg-pramaan-surface p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: `${riskHex[node.risk]}22`, color: riskHex[node.risk] }}
          >
            {(() => {
              const Icon = typeMeta[node.type].icon;
              return <Icon size={20} strokeWidth={1.75} />;
            })()}
          </div>
          <div>
            <div className="text-pramaan-text" style={{ fontSize: 15, fontWeight: 600 }}>
              {node.label}
            </div>
            <div className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
              {typeMeta[node.type].label}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-pramaan-elevated px-3 py-2.5">
          <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
            Risk level
          </span>
          <span className={severityConfig[node.risk].color} style={{ fontSize: 12, fontWeight: 600 }}>
            {severityConfig[node.risk].label}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-pramaan-text-secondary" style={{ fontSize: 11, letterSpacing: "0.04em" }}>
            RELATIONSHIPS ({connections.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {connections.map((e, i) => {
              const otherId = e.from === selected ? e.to : e.from;
              const other = graphNodes.find((n) => n.id === otherId)!;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(otherId)}
                  className="flex items-center justify-between rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3 py-2 text-left transition-colors hover:border-pramaan-primary/50"
                >
                  <span className="text-pramaan-text" style={{ fontSize: 12 }}>
                    {other.label}
                  </span>
                  <span className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>
                    {e.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
