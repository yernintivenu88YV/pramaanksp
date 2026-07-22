import type { EntityType } from "../../data/network";

// Renders a distinct SVG shape per entity type, centred at (0,0).
export function NodeShape({
  type,
  color,
  selected,
  r = 15,
}: {
  type: EntityType;
  color: string;
  selected?: boolean;
  r?: number;
}) {
  const fill = "#141C2F";
  const sw = selected ? 2.75 : 1.75;
  const common = { fill, stroke: color, strokeWidth: sw } as const;

  switch (type) {
    case "person":
      return <circle r={r} {...common} />;
    case "vehicle":
      return <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={3} {...common} />;
    case "phone":
      return <polygon points={hexagon(r)} {...common} />;
    case "account":
      return <polygon points={`0,${-r * 1.25} ${r},0 0,${r * 1.25} ${-r},0`} {...common} />;
    case "location":
      return <path d={pinPath(r)} {...common} />;
    case "fir":
      return <path d={docPath(r)} {...common} />;
    default:
      return <circle r={r} {...common} />;
  }
}

function hexagon(r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// Teardrop map-pin, tip pointing down, centred.
function pinPath(r: number) {
  const w = r * 1.1;
  return `M0,${r * 1.35} C${-w},${r * 0.2} ${-w},${-r} 0,${-r} C${w},${-r} ${w},${r * 0.2} 0,${r * 1.35} Z`;
}

// Document with a folded corner.
function docPath(r: number) {
  const w = r * 0.85;
  const h = r * 1.15;
  const fold = r * 0.55;
  return `M${-w},${-h} L${w - fold},${-h} L${w},${-h + fold} L${w},${h} L${-w},${h} Z`;
}
