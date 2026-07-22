// Mock AI Investigation Assistant report for Pramaan.
// Replace with real model-synthesis output when a backend is connected.

export type Conf = "high" | "medium" | "low";

export interface Source {
  id: number;
  label: string;
  kind: string;
  ref: string;
  date: string;
  excerpt: string;
}

export interface Sentence {
  text: string;
  cites: number[];
}

export const sampleQuery =
  "What is the strength of evidence linking V. Marchetti to the Aurora Holdings wire structuring, and what should we investigate next?";

export const sources: Source[] = [
  { id: 1, label: "Wire transfer ledger", kind: "Financial", ref: "TXN-88214", date: "18 Jul 2026", excerpt: "41 transfers, each €12k–€14.8k, routed to Aurora Holdings between Mar–Jul 2026." },
  { id: 2, label: "Aurora Holdings filing", kind: "Registry", ref: "REG-4471", date: "12 Jul 2026", excerpt: "Nominee director listed; beneficial owner obscured behind a discretionary trust." },
  { id: 3, label: "Cell-site trace", kind: "Signals", ref: "IMEI 35•••90", date: "19 Jul 2026", excerpt: "Device active within 400m of Port District during 3 of 4 largest transfer windows." },
  { id: 4, label: "Surveillance report", kind: "Field", ref: "SR-1192", date: "17 Jul 2026", excerpt: "Two subjects co-located at Harbour Lane cafe for 41 minutes." },
  { id: 5, label: "Freeze warrant", kind: "Court", ref: "W-4821-A", date: "17 Jul 2026", excerpt: "Judicial authorisation to freeze Aurora Holdings accounts granted." },
  { id: 6, label: "Entity cluster analysis", kind: "Link Engine", ref: "LNK-0092", date: "19 Jul 2026", excerpt: "Marchetti node shares 4 attributes with the Aurora controller node (p=0.94)." },
];

export const executiveSummary: Sentence[] = [
  { text: "The evidence linking V. Marchetti to the Aurora Holdings wire-structuring scheme is assessed as strong overall, anchored by deterministic financial and registry records.", cites: [1, 2] },
  { text: "Marchetti is the most probable beneficial controller of the corporate vehicle used to layer funds across three jurisdictions.", cites: [2, 6] },
];

export const evidenceItems: { title: string; detail: Sentence; strength: Conf }[] = [
  { title: "Financial pattern", detail: { text: "Forty-one sub-threshold transfers totalling ~€512,000 were routed through Aurora Holdings, consistent with deliberate structuring to evade reporting controls.", cites: [1] }, strength: "high" },
  { title: "Corporate control", detail: { text: "Registry records place beneficial control with a discretionary trust whose attributes match Marchetti with 94% probability.", cites: [2, 6] }, strength: "high" },
  { title: "Physical coordination", detail: { text: "Signals data places a watchlisted device near the Port District during the largest transfer windows, suggesting physical coordination of cash placement.", cites: [3, 4] }, strength: "medium" },
];

export const relatedFIRs = [
  { id: "FIR-2291", title: "Financial fraud — wire structuring", station: "Central PS", status: "Under investigation", cites: [1] },
  { id: "FIR-1884", title: "Forgery of documents", station: "East PS", status: "Chargesheet filed", cites: [2] },
];

export const relatedPersons = [
  { name: "V. Marchetti", role: "Assessed controller", conf: "high" as Conf, cites: [2, 6] },
  { name: "R. Sable", role: "Financial intermediary", conf: "medium" as Conf, cites: [1] },
  { name: "L. Fenwick", role: "Advisor (provisional)", conf: "low" as Conf, cites: [4] },
];

export const timelineEvents: { date: string; time: string; text: string; cites: number[] }[] = [
  { date: "19 Jul", time: "14:02", text: "€412,000 transfer executed through Aurora Holdings.", cites: [1] },
  { date: "19 Jul", time: "11:47", text: "Watchlisted device reconnected near Port District.", cites: [3] },
  { date: "17 Jul", time: "16:50", text: "Freeze warrant W-4821-A granted.", cites: [5] },
  { date: "12 Jul", time: "09:30", text: "Aurora Holdings incorporation filing indexed.", cites: [2] },
];

export const graphLinks = [
  { from: "V. Marchetti", to: "Aurora Holdings", rel: "controls", cites: [2, 6] },
  { from: "Aurora Holdings", to: "Port District", rel: "operates near", cites: [3] },
  { from: "V. Marchetti", to: "R. Sable", rel: "co-signatory", cites: [1] },
];

export const nextSteps: { text: string; priority: Conf }[] = [
  { text: "Subpoena correspondent-bank records across the two foreign jurisdictions to trace onward layering.", priority: "high" },
  { text: "Compel trust deed disclosure to convert the 94% probabilistic control link into a deterministic one.", priority: "high" },
  { text: "Corroborate the Fenwick–Vellum association with document review before relying on the surveillance report.", priority: "medium" },
];

export const overallConfidence = 84;
