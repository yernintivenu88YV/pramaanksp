// Mock case-file content for the Investigation Workspace.
// Replace with real API data when a backend is connected.

export type Confidence = "high" | "medium" | "low";

export interface Citation {
  id: number;
  source: string;
  ref: string;
}

export interface ReportSection {
  id: string;
  heading: string;
  confidence: Confidence;
  paragraphs: { text: string; cites: number[] }[];
}

export interface NavItem {
  key: string;
  label: string;
  count: number;
}

export interface EvidenceSource {
  id: string;
  title: string;
  kind: string;
  date: string;
  excerpt: string;
  reliability: Confidence;
}

export interface NextStep {
  id: string;
  label: string;
  owner: string;
  done: boolean;
}

export const caseMeta = {
  id: "PRM-4821",
  title: "Cross-border wire structuring ring",
  status: "Escalated",
  classification: "Restricted · Clearance 4",
  opened: "02 Jul 2026",
  lead: "A. Okonkwo",
  overallConfidence: 82,
};

export const navItems: NavItem[] = [
  { key: "timeline", label: "Investigation Timeline", count: 24 },
  { key: "evidence", label: "Evidence Navigator", count: 61 },
  { key: "files", label: "Case Files", count: 12 },
  { key: "witnesses", label: "Witnesses", count: 5 },
  { key: "documents", label: "Documents", count: 38 },
];

export const centerTabs = [
  "Case Summary",
  "AI Investigation Report",
  "Interactive Network Graph",
  "Timeline",
  "Map",
  "Entity Resolution",
  "Case Similarity",
  "Evidence",
] as const;

export const citations: Citation[] = [
  { id: 1, source: "Financial Feed", ref: "TXN-88214 / wire ledger" },
  { id: 2, source: "Registry Feed", ref: "Aurora Holdings filing" },
  { id: 3, source: "Signals", ref: "IMEI 35•••90 cell trace" },
  { id: 4, source: "Surveillance", ref: "Report SR-1192" },
  { id: 5, source: "Court Record", ref: "Warrant W-4821-A" },
  { id: 6, source: "Link Engine", ref: "Entity cluster analysis" },
];

export const reportSections: ReportSection[] = [
  {
    id: "s1",
    heading: "Executive Summary",
    confidence: "high",
    paragraphs: [
      {
        text: "The investigation identifies a coordinated wire-structuring network moving illicit proceeds across three jurisdictions through a layer of shell entities.",
        cites: [1, 2],
      },
      {
        text: "V. Marchetti is assessed with high confidence to be the central controller, directing fund flows and holding beneficial control over the primary corporate vehicle.",
        cites: [2, 6],
      },
    ],
  },
  {
    id: "s2",
    heading: "Financial Analysis",
    confidence: "high",
    paragraphs: [
      {
        text: "Between March and July 2026, forty-one transfers each below the €15,000 reporting threshold were routed through Aurora Holdings, totalling approximately €512,000.",
        cites: [1],
      },
      {
        text: "The transaction cadence and amounts are consistent with deliberate structuring to evade automated reporting controls.",
        cites: [1, 6],
      },
    ],
  },
  {
    id: "s3",
    heading: "Network & Movement",
    confidence: "medium",
    paragraphs: [
      {
        text: "Signals data places a watchlisted device near the Port District during three of the largest transfer windows, suggesting physical coordination of cash placement.",
        cites: [3, 4],
      },
      {
        text: "The link between L. Fenwick and the shell entity Vellum LLC is corroborated by a single surveillance report and remains provisional pending document review.",
        cites: [4],
      },
    ],
  },
  {
    id: "s4",
    heading: "Legal Posture & Recommendation",
    confidence: "medium",
    paragraphs: [
      {
        text: "A judicial warrant authorising account freezes has been granted, providing a lawful basis for asset preservation while the wider network is mapped.",
        cites: [5],
      },
      {
        text: "Analysts recommend escalation to a joint task force given the cross-border exposure and the emerging overlap with case PRM-4790.",
        cites: [6],
      },
    ],
  },
];

export const evidenceSources: EvidenceSource[] = [
  { id: "e1", title: "Wire transfer ledger", kind: "Financial", date: "18 Jul", excerpt: "41 sub-threshold transfers to Aurora Holdings accounts.", reliability: "high" },
  { id: "e2", title: "Aurora Holdings incorporation filing", kind: "Registry", date: "12 Jul", excerpt: "Nominee director; beneficial owner obscured via trust.", reliability: "high" },
  { id: "e3", title: "Cell-site trace — IMEI 35•••90", kind: "Signals", date: "19 Jul", excerpt: "Device active near Port District, 3 windows.", reliability: "medium" },
  { id: "e4", title: "Surveillance report SR-1192", kind: "Field", date: "17 Jul", excerpt: "Two subjects co-located for 40 minutes.", reliability: "medium" },
  { id: "e5", title: "Warrant W-4821-A", kind: "Court", date: "17 Jul", excerpt: "Account-freeze authorisation granted.", reliability: "high" },
];

export const nextSteps: NextStep[] = [
  { id: "ns1", label: "Serve freeze order on Aurora Holdings accounts", owner: "Legal", done: true },
  { id: "ns2", label: "Subpoena correspondent-bank records (2 jurisdictions)", owner: "Financial", done: false },
  { id: "ns3", label: "Corroborate Fenwick–Vellum link via document review", owner: "Analysis", done: false },
  { id: "ns4", label: "Request joint task-force referral", owner: "Case Ops", done: false },
  { id: "ns5", label: "Interview registry agent for nominee director", owner: "Field", done: false },
];

export const relatedCases = [
  { id: "PRM-4790", label: "Shell company layering" },
  { id: "PRM-4758", label: "Marketplace vendor cluster" },
];

export const linkedPersons = [
  { id: "p1", label: "V. Marchetti" },
  { id: "p2", label: "L. Fenwick" },
  { id: "p3", label: "R. Sable" },
];

export const linkedVehicles = [
  { id: "v1", label: "Van · KJ-4471" },
  { id: "v2", label: "Sedan · TC-9920" },
];
