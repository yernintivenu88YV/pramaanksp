// Mock criminal-network graph for the canvas explorer.
// Generated deterministically so the view can be stress-tested at scale.
// Replace with real link-analysis output when a backend is connected.

export interface GCategory {
  key: string;
  label: string;
  color: string; // border/ring only — node fill is always neutral gray
}

// Fixed palette — max 6 categories, muted (never neon).
export const categories: GCategory[] = [
  { key: "financial", label: "Financial", color: "#4A9EFF" },
  { key: "cyber", label: "Cyber", color: "#5FA37E" },
  { key: "narcotics", label: "Narcotics", color: "#E5675C" },
  { key: "trafficking", label: "Trafficking", color: "#FFB84D" },
  { key: "organized", label: "Organized", color: "#A98BD0" },
  { key: "fraud", label: "Fraud", color: "#7FB3C9" },
];

export interface GNode {
  id: string;
  label: string;
  category: string;
  kind: "person" | "org" | "account" | "device" | "location";
}

export interface GEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  confidence: number; // 0..1 — edge thickness
  confirmed: boolean; // solid vs dashed
  evidence: string; // 2–3 sentence citation for "Explain this link"
}

const relations = ["Owner", "Relative", "Accomplice", "Communication", "Financial", "Vehicle", "Advisor", "Witness"];
const kinds: GNode["kind"][] = ["person", "org", "account", "device", "location"];
const firstNames = ["V.", "L.", "A.", "R.", "M.", "S.", "N.", "J.", "T.", "K.", "P.", "D."];
const lastNames = ["Marchetti", "Fenwick", "Okoro", "Reddy", "Haddad", "Lindqvist", "Rahman", "Park", "Alvarez", "Nair", "Bose", "Iyer"];
const orgNames = ["Aurora Holdings", "Vellum LLC", "Meridian Trust", "Kaveri Exports", "Nandi Logistics", "Silk Route Cap"];

// tiny seeded PRNG for reproducible data
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function build(count: number): { nodes: GNode[]; edges: GEdge[] } {
  const r = rng(42);
  const nodes: GNode[] = [];
  for (let i = 0; i < count; i++) {
    const cat = categories[Math.floor(r() * categories.length)].key;
    const kind = kinds[Math.floor(r() * kinds.length)];
    let label: string;
    if (kind === "org") label = orgNames[Math.floor(r() * orgNames.length)];
    else if (kind === "account") label = `Acct •••${1000 + Math.floor(r() * 8999)}`;
    else if (kind === "device") label = `IMEI ${10 + Math.floor(r() * 89)}•••${10 + Math.floor(r() * 89)}`;
    else if (kind === "location") label = `Sector ${1 + Math.floor(r() * 9)} node`;
    else label = `${firstNames[Math.floor(r() * firstNames.length)]} ${lastNames[Math.floor(r() * lastNames.length)]}`;
    nodes.push({ id: `e${i}`, label, category: cat, kind });
  }

  const edges: GEdge[] = [];
  let eid = 0;
  // preferential-ish attachment: each node links to 1–3 earlier nodes
  for (let i = 1; i < count; i++) {
    const links = 1 + Math.floor(r() * 3);
    const seen = new Set<number>();
    for (let k = 0; k < links; k++) {
      const target = Math.floor(r() * i * (r() < 0.5 ? 0.2 : 1)); // bias toward hubs
      if (target === i || seen.has(target)) continue;
      seen.add(target);
      const conf = Math.round((0.35 + r() * 0.6) * 100) / 100;
      const confirmed = r() > 0.4;
      const rel = relations[Math.floor(r() * relations.length)];
      edges.push({
        id: `L${eid++}`,
        from: `e${i}`,
        to: `e${target}`,
        relation: rel,
        confidence: conf,
        confirmed,
        evidence: confirmed
          ? `${rel} link corroborated by seized records and a matching transaction reference. Two independent sources place both entities in contact within a 48-hour window.`
          : `AI-inferred ${rel.toLowerCase()} link from co-occurrence patterns; not yet corroborated by a primary source. Confidence reflects overlap in device and location signals only.`,
      });
    }
  }
  return { nodes, edges };
}

// 520 nodes → exercises the canvas performance path (>500).
export const graph = build(520);
