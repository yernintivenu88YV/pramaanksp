// Mock similar-case intelligence data for Pramaan.
// Replace with real case-similarity API responses when a backend is connected.

export interface CaseSummary {
  id: string;
  title: string;
  category: string;
  station: string;
  filed: string;
  status: string;
  officer: string;
  synopsis: string;
  entities: string[];
  tags: string[];
}

export interface DimensionScore {
  label: string;
  value: number; // 0..100
  note: string;
}

export interface TimelineEntry {
  date: string;
  time: string;
  title: string;
  kind: "offence" | "evidence" | "movement" | "financial" | "action";
}

export interface SimilarCase {
  id: string;
  title: string;
  category: string;
  station: string;
  filed: string;
  similarity: number;
  mo: DimensionScore;
  location: DimensionScore;
  time: DimensionScore;
  evidenceOverlap: DimensionScore;
  commonEntities: string[];
  reasoning: string[];
  timeline: TimelineEntry[];
}

export const sourceCase: CaseSummary = {
  id: "FIR-2291",
  title: "Cross-border wire structuring — Aurora Holdings",
  category: "Financial fraud",
  station: "Central PS",
  filed: "02 Jul 2026",
  status: "Under investigation",
  officer: "A. Okonkwo",
  synopsis:
    "Coordinated sub-threshold transfers routed through a shell entity to layer illicit proceeds across three jurisdictions, with cash placement staged near the Port District.",
  entities: ["V. Marchetti", "Aurora Holdings", "Acct •••4821", "Port District"],
  tags: ["structuring", "shell entity", "cross-border", "cash placement"],
};

export const sourceTimeline: TimelineEntry[] = [
  { date: "02 Jul", time: "08:00", title: "FIR registered — financial fraud", kind: "offence" },
  { date: "05 Jul", time: "10:20", title: "Shell entity incorporation identified", kind: "evidence" },
  { date: "11 Jul", time: "14:02", title: "First structured transfer cluster flagged", kind: "financial" },
  { date: "16 Jul", time: "11:47", title: "Device located near Port District", kind: "movement" },
  { date: "17 Jul", time: "16:50", title: "Freeze warrant granted", kind: "action" },
  { date: "19 Jul", time: "14:02", title: "€412k transfer executed", kind: "financial" },
];

export const similarCases: SimilarCase[] = [
  {
    id: "FIR-1990",
    title: "Layered remittance scheme — Vellum LLC",
    category: "Financial fraud",
    station: "East PS",
    filed: "14 Apr 2026",
    similarity: 91,
    mo: { label: "Modus Operandi", value: 94, note: "Sub-threshold structuring via nominee-controlled shell." },
    location: { label: "Location Pattern", value: 88, note: "Cash staging near the same Harbour corridor." },
    time: { label: "Time Pattern", value: 72, note: "Transfer bursts clustered at month-end, similar cadence." },
    evidenceOverlap: { label: "Evidence Overlap", value: 63, note: "Shared correspondent bank and one device fingerprint." },
    commonEntities: ["Port District", "Meridian Bank", "R. Sable"],
    reasoning: [
      "Both cases route funds through a nominee-director shell to obscure beneficial ownership.",
      "Transfer amounts consistently sit €200–€1,100 below the reporting threshold in both files.",
      "R. Sable appears as a signatory in both, and the same correspondent bank clears the wires.",
    ],
    timeline: [
      { date: "14 Apr", time: "09:00", title: "FIR registered — remittance fraud", kind: "offence" },
      { date: "18 Apr", time: "12:10", title: "Vellum LLC nominee director identified", kind: "evidence" },
      { date: "26 Apr", time: "15:30", title: "Month-end transfer burst flagged", kind: "financial" },
      { date: "02 May", time: "10:05", title: "Device seen at Harbour corridor", kind: "movement" },
      { date: "07 May", time: "17:20", title: "Account freeze requested", kind: "action" },
      { date: "12 May", time: "13:40", title: "€380k consolidation transfer", kind: "financial" },
    ],
  },
  {
    id: "FIR-2044",
    title: "Trade mis-invoicing ring — Solace Exports",
    category: "Financial fraud",
    station: "Port PS",
    filed: "22 May 2026",
    similarity: 78,
    mo: { label: "Modus Operandi", value: 74, note: "Value layering via inflated export invoices." },
    location: { label: "Location Pattern", value: 90, note: "Operates from the same Port District warehouses." },
    time: { label: "Time Pattern", value: 55, note: "Quarterly settlement cycle, weaker cadence match." },
    evidenceOverlap: { label: "Evidence Overlap", value: 48, note: "Overlapping freight forwarder records." },
    commonEntities: ["Port District", "L. Fenwick"],
    reasoning: [
      "Shares the Port District operational footprint but uses trade instruments rather than pure wire structuring.",
      "L. Fenwick is a common advisor across both investigations.",
      "Time cadence is quarterly rather than the source case's month-end bursts, lowering the temporal match.",
    ],
    timeline: [
      { date: "22 May", time: "08:30", title: "FIR registered — trade fraud", kind: "offence" },
      { date: "29 May", time: "11:00", title: "Inflated invoice batch seized", kind: "evidence" },
      { date: "10 Jun", time: "14:15", title: "Warehouse 12 inspection", kind: "movement" },
      { date: "20 Jun", time: "16:40", title: "Quarterly settlement flagged", kind: "financial" },
      { date: "28 Jun", time: "09:50", title: "Freight records subpoenaed", kind: "action" },
    ],
  },
  {
    id: "FIR-1877",
    title: "Digital wallet smurfing — Kestrel network",
    category: "Cyber-financial",
    station: "Cyber PS",
    filed: "03 Mar 2026",
    similarity: 66,
    mo: { label: "Modus Operandi", value: 71, note: "Micro-transfers across many wallets (smurfing)." },
    location: { label: "Location Pattern", value: 41, note: "Primarily online; limited physical overlap." },
    time: { label: "Time Pattern", value: 68, note: "High-frequency bursts, similar automation signature." },
    evidenceOverlap: { label: "Evidence Overlap", value: 52, note: "Shared IP range and one reused phone number." },
    commonEntities: ["+91 98•••210"],
    reasoning: [
      "Same underlying goal of breaking large sums into undetectable fragments.",
      "A phone number tied to the source suspect was reused to register wallets here.",
      "Location match is weak because activity is predominantly online.",
    ],
    timeline: [
      { date: "03 Mar", time: "07:45", title: "FIR registered — cyber fraud", kind: "offence" },
      { date: "09 Mar", time: "13:00", title: "Wallet cluster mapped", kind: "evidence" },
      { date: "15 Mar", time: "22:10", title: "Automated burst detected", kind: "financial" },
      { date: "21 Mar", time: "10:30", title: "IP range correlated to source", kind: "evidence" },
      { date: "27 Mar", time: "18:00", title: "Takedown request filed", kind: "action" },
    ],
  },
];
