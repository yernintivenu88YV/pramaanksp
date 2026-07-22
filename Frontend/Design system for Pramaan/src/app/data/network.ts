// Mock network graph data for the Pramaan explorer.
// Replace with real graph API responses when a backend is connected.

export type EntityType = "person" | "vehicle" | "phone" | "account" | "location" | "fir";

export type RelationType =
  | "Relative"
  | "Owner"
  | "Accomplice"
  | "Witness"
  | "Communication"
  | "Financial"
  | "Vehicle Ownership";

export interface NetNode {
  id: string;
  label: string;
  type: EntityType;
  risk: "critical" | "warning" | "info";
  addedAt: number; // step index for timeline growth (0..T)
  meta: { line: string; value: string }[];
  evidence: string;
}

export interface NetEdge {
  from: string;
  to: string;
  relation: RelationType;
  deterministic: boolean;
  confidence: number; // 0..100
  addedAt: number;
}

export const entityTypeMeta: Record<EntityType, { label: string; plural: string }> = {
  person: { label: "Person", plural: "Persons" },
  vehicle: { label: "Vehicle", plural: "Vehicles" },
  phone: { label: "Phone", plural: "Phones" },
  account: { label: "Financial Account", plural: "Accounts" },
  location: { label: "Location", plural: "Locations" },
  fir: { label: "FIR", plural: "FIRs" },
};

export const relationTypes: RelationType[] = [
  "Relative",
  "Owner",
  "Accomplice",
  "Witness",
  "Communication",
  "Financial",
  "Vehicle Ownership",
];

export const riskHex: Record<NetNode["risk"], string> = {
  critical: "#E05353",
  warning: "#F4B740",
  info: "#5D9CFF",
};

export const nodes: NetNode[] = [
  { id: "p1", label: "V. Marchetti", type: "person", risk: "critical", addedAt: 0, evidence: "Assessed controller of Aurora Holdings. 41 structured transfers.", meta: [{ line: "ID", value: "IDN-0092-4471" }, { line: "Status", value: "Active suspect" }, { line: "FIRs", value: "2 linked" }] },
  { id: "p2", label: "R. Sable", type: "person", risk: "warning", addedAt: 2, evidence: "Financial intermediary; co-signatory on account •••4821.", meta: [{ line: "ID", value: "IDN-0088-1120" }, { line: "Status", value: "Person of interest" }] },
  { id: "p3", label: "L. Fenwick", type: "person", risk: "info", addedAt: 4, evidence: "Advisor; association provisional on single field report.", meta: [{ line: "ID", value: "IDN-0071-8830" }, { line: "Status", value: "Witness" }] },
  { id: "a1", label: "Acct •••4821", type: "account", risk: "critical", addedAt: 1, evidence: "Primary layering account. €512k throughput.", meta: [{ line: "Bank", value: "Meridian" }, { line: "Signatories", value: "2" }] },
  { id: "o1", label: "Aurora Holdings", type: "account", risk: "warning", addedAt: 1, evidence: "Shell entity with nominee director.", meta: [{ line: "Reg", value: "REG-4471" }, { line: "Type", value: "Corporate" }] },
  { id: "ph1", label: "+91 98•••210", type: "phone", risk: "warning", addedAt: 2, evidence: "Primary device. 14 months activity near transfers.", meta: [{ line: "IMEI", value: "35•••90" }, { line: "Carrier", value: "Airtel" }] },
  { id: "ph2", label: "+91 99•••001", type: "phone", risk: "info", addedAt: 3, evidence: "Secondary device linked to R. Sable.", meta: [{ line: "Carrier", value: "Vi" }] },
  { id: "v1", label: "KJ-44-71", type: "vehicle", risk: "info", addedAt: 3, evidence: "Grey Toyota Innova. Seen at Port District.", meta: [{ line: "Model", value: "Toyota Innova" }, { line: "Owner", value: "V. Marchetti" }] },
  { id: "l1", label: "Port District", type: "location", risk: "warning", addedAt: 2, evidence: "Cash placement hub. 3 device pings during transfers.", meta: [{ line: "Zone", value: "Harbour" }] },
  { id: "l2", label: "Aurora Court 4B", type: "location", risk: "info", addedAt: 4, evidence: "Registered residence of V. Marchetti.", meta: [{ line: "Sector", value: "4" }] },
  { id: "f1", label: "FIR-2291", type: "fir", risk: "critical", addedAt: 0, evidence: "Financial fraud — wire structuring. Under investigation.", meta: [{ line: "Station", value: "Central PS" }, { line: "Date", value: "02 Jul 2026" }] },
  { id: "f2", label: "FIR-1884", type: "fir", risk: "warning", addedAt: 5, evidence: "Forgery of documents. Chargesheet filed.", meta: [{ line: "Station", value: "East PS" }] },
];

export const edges: NetEdge[] = [
  { from: "p1", to: "o1", relation: "Owner", deterministic: false, confidence: 94, addedAt: 1 },
  { from: "p1", to: "a1", relation: "Financial", deterministic: true, confidence: 100, addedAt: 1 },
  { from: "p1", to: "ph1", relation: "Communication", deterministic: true, confidence: 100, addedAt: 2 },
  { from: "p1", to: "v1", relation: "Vehicle Ownership", deterministic: true, confidence: 100, addedAt: 3 },
  { from: "p1", to: "l2", relation: "Owner", deterministic: true, confidence: 90, addedAt: 4 },
  { from: "p1", to: "p2", relation: "Accomplice", deterministic: false, confidence: 72, addedAt: 2 },
  { from: "p2", to: "a1", relation: "Financial", deterministic: true, confidence: 100, addedAt: 1 },
  { from: "p2", to: "ph2", relation: "Communication", deterministic: true, confidence: 100, addedAt: 3 },
  { from: "o1", to: "l1", relation: "Financial", deterministic: false, confidence: 66, addedAt: 2 },
  { from: "ph1", to: "l1", relation: "Communication", deterministic: false, confidence: 81, addedAt: 2 },
  { from: "v1", to: "l1", relation: "Vehicle Ownership", deterministic: false, confidence: 58, addedAt: 3 },
  { from: "p3", to: "p1", relation: "Witness", deterministic: false, confidence: 55, addedAt: 4 },
  { from: "p3", to: "l1", relation: "Witness", deterministic: false, confidence: 60, addedAt: 4 },
  { from: "p1", to: "f1", relation: "Accomplice", deterministic: true, confidence: 100, addedAt: 0 },
  { from: "p1", to: "f2", relation: "Accomplice", deterministic: true, confidence: 100, addedAt: 5 },
  { from: "p2", to: "f1", relation: "Accomplice", deterministic: false, confidence: 70, addedAt: 5 },
];

export const timelineSteps = ["02 Jul", "05 Jul", "09 Jul", "12 Jul", "16 Jul", "19 Jul"];
