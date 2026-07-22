// Mock intelligence data for the Pramaan platform.
// Replace with real API responses when a backend is connected.

export type Severity = "critical" | "warning" | "info" | "success";
export type CaseStatus = "active" | "review" | "closed" | "escalated";

export interface CaseRecord {
  id: string;
  title: string;
  status: CaseStatus;
  priority: Severity;
  lead: string;
  entities: number;
  updated: string;
  progress: number;
  region: string;
}

export interface Alert {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  source: string;
  time: string;
  caseId?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "person" | "org" | "location" | "device" | "account";
  x: number;
  y: number;
  risk: Severity;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  date: string;
  title: string;
  detail: string;
  severity: Severity;
  actor: string;
}

export const cases: CaseRecord[] = [
  { id: "PRM-4821", title: "Cross-border wire structuring ring", status: "escalated", priority: "critical", lead: "A. Okonkwo", entities: 47, updated: "12m ago", progress: 68, region: "Sector 4 / North" },
  { id: "PRM-4809", title: "Encrypted device network — Op. Vellum", status: "active", priority: "critical", lead: "R. Devi", entities: 33, updated: "38m ago", progress: 41, region: "Metro Central" },
  { id: "PRM-4790", title: "Shell company layering scheme", status: "active", priority: "warning", lead: "M. Haddad", entities: 21, updated: "1h ago", progress: 55, region: "Sector 2 / East" },
  { id: "PRM-4772", title: "Counterfeit credential distribution", status: "review", priority: "warning", lead: "S. Lindqvist", entities: 18, updated: "3h ago", progress: 82, region: "Port District" },
  { id: "PRM-4758", title: "Illicit marketplace vendor cluster", status: "active", priority: "info", lead: "J. Park", entities: 29, updated: "5h ago", progress: 34, region: "Sector 7 / West" },
  { id: "PRM-4731", title: "Vehicle theft fencing operation", status: "review", priority: "info", lead: "T. Alvarez", entities: 14, updated: "9h ago", progress: 90, region: "Industrial Belt" },
  { id: "PRM-4702", title: "Phishing infrastructure takedown", status: "closed", priority: "success", lead: "N. Rahman", entities: 52, updated: "2d ago", progress: 100, region: "Metro Central" },
];

export const alerts: Alert[] = [
  { id: "AL-9921", title: "New high-value transaction detected", detail: "€412,000 transfer between two flagged accounts in PRM-4821.", severity: "critical", source: "Financial Feed", time: "2m ago", caseId: "PRM-4821" },
  { id: "AL-9918", title: "Device re-appeared on network", detail: "IMEI matching watchlist reconnected near Metro Central tower cluster.", severity: "critical", source: "Signals", time: "9m ago", caseId: "PRM-4809" },
  { id: "AL-9914", title: "Entity linked to secondary case", detail: "Person node 'V. Marchetti' now appears in both PRM-4790 and PRM-4758.", severity: "warning", source: "Link Engine", time: "24m ago", caseId: "PRM-4790" },
  { id: "AL-9902", title: "Document ingestion complete", detail: "1,204 pages processed and indexed for PRM-4772.", severity: "info", source: "Ingest", time: "1h ago", caseId: "PRM-4772" },
  { id: "AL-9887", title: "Warrant approval received", detail: "Judicial approval logged for search action in PRM-4758.", severity: "success", source: "Case Ops", time: "2h ago", caseId: "PRM-4758" },
  { id: "AL-9871", title: "Anomalous login pattern", detail: "Account cluster shows coordinated access from 6 jurisdictions.", severity: "warning", source: "Behavior", time: "4h ago" },
];

export const graphNodes: GraphNode[] = [
  { id: "n1", label: "V. Marchetti", type: "person", x: 300, y: 220, risk: "critical" },
  { id: "n2", label: "Aurora Holdings", type: "org", x: 500, y: 140, risk: "warning" },
  { id: "n3", label: "Port District", type: "location", x: 520, y: 320, risk: "info" },
  { id: "n4", label: "Acct •••4821", type: "account", x: 140, y: 150, risk: "critical" },
  { id: "n5", label: "IMEI 35•••90", type: "device", x: 160, y: 320, risk: "warning" },
  { id: "n6", label: "L. Fenwick", type: "person", x: 680, y: 220, risk: "info" },
  { id: "n7", label: "Vellum LLC", type: "org", x: 400, y: 400, risk: "warning" },
];

export const graphEdges: GraphEdge[] = [
  { from: "n1", to: "n2", label: "director" },
  { from: "n1", to: "n4", label: "owns" },
  { from: "n1", to: "n5", label: "uses" },
  { from: "n2", to: "n3", label: "registered" },
  { from: "n2", to: "n6", label: "co-signer" },
  { from: "n1", to: "n7", label: "controls" },
  { from: "n7", to: "n3", label: "operates" },
  { from: "n6", to: "n7", label: "advisor" },
];

export const timeline: TimelineEvent[] = [
  { id: "t1", date: "19 Jul", time: "14:02", title: "High-value transfer executed", detail: "€412,000 routed through Aurora Holdings account.", severity: "critical", actor: "V. Marchetti" },
  { id: "t2", date: "19 Jul", time: "11:47", title: "Device reconnected to network", detail: "Watchlisted IMEI active near Port District.", severity: "warning", actor: "Signals Feed" },
  { id: "t3", date: "18 Jul", time: "22:15", title: "Meeting logged", detail: "Two flagged entities co-located for 40 minutes.", severity: "info", actor: "Surveillance" },
  { id: "t4", date: "18 Jul", time: "09:30", title: "Shell entity incorporated", detail: "Vellum LLC registered with nominee director.", severity: "warning", actor: "Registry Feed" },
  { id: "t5", date: "17 Jul", time: "16:50", title: "Warrant approved", detail: "Judicial approval for account freeze granted.", severity: "success", actor: "Case Ops" },
];

export const activitySeries = [
  { day: "Mon", alerts: 12, resolved: 8 },
  { day: "Tue", alerts: 19, resolved: 11 },
  { day: "Wed", alerts: 15, resolved: 14 },
  { day: "Thu", alerts: 27, resolved: 18 },
  { day: "Fri", alerts: 22, resolved: 20 },
  { day: "Sat", alerts: 9, resolved: 7 },
  { day: "Sun", alerts: 14, resolved: 10 },
];

export const caseTypeBreakdown = [
  { type: "Financial", count: 34 },
  { type: "Cyber", count: 22 },
  { type: "Trafficking", count: 17 },
  { type: "Fraud", count: 28 },
  { type: "Organized", count: 13 },
];
