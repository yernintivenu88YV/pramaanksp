// Mock identity-resolution data for Pramaan.
// Replace with real entity-resolution API responses when a backend is connected.

export type MatchStrength = "strong" | "moderate" | "weak";

export interface MatchSignal {
  id: string;
  label: string;
  method: "deterministic" | "probabilistic";
  score?: number; // for probabilistic
  strength: MatchStrength;
  detail: string;
}

export interface Profile {
  id: string;
  name: string;
  aliases: string[];
  confidence: number;
  primaryId: string;
  location: string;
  status: "Active suspect" | "Person of interest" | "Cleared" | "Witness";
  matchedVia: MatchSignal[];
  phones: { number: string; carrier: string; lastSeen: string; verified: boolean }[];
  vehicles: { plate: string; model: string; color: string }[];
  addresses: { line: string; type: string; since: string }[];
  firs: { id: string; title: string; station: string; date: string; status: string }[];
  associates: { name: string; relation: string; risk: MatchStrength }[];
  timeline: { date: string; time: string; event: string }[];
  evidence: { id: string; title: string; kind: string; date: string }[];
}

export const searchTypes = [
  "Person",
  "Phone",
  "Vehicle",
  "Bank Account",
  "Address",
  "Device",
  "Passport",
  "Aadhaar",
] as const;

export const profiles: Profile[] = [
  {
    id: "pr1",
    name: "Vikram Marchetti",
    aliases: ["V. Marchetti", "Vik Marchetti", "V.M."],
    confidence: 94,
    primaryId: "IDN-0092-4471",
    location: "Metro Central · Sector 4",
    status: "Active suspect",
    matchedVia: [
      { id: "m1", label: "Same phone number", method: "deterministic", strength: "strong", detail: "Number +91 98••• 210 appears on both records with matching SIM registration and 14 months of overlapping activity." },
      { id: "m2", label: "Shared address", method: "probabilistic", score: 82, strength: "moderate", detail: "Address 'Aurora Court, Unit 4B' matches on 3 of 4 fields; unit number inferred from utility records." },
      { id: "m3", label: "Biometric similarity", method: "probabilistic", score: 71, strength: "moderate", detail: "Facial embedding distance within threshold across two source images captured 9 months apart." },
    ],
    phones: [
      { number: "+91 98••• 210", carrier: "Airtel", lastSeen: "19 Jul 2026", verified: true },
      { number: "+91 90••• 774", carrier: "Jio", lastSeen: "02 Jun 2026", verified: false },
    ],
    vehicles: [
      { plate: "KJ-44-71", model: "Toyota Innova", color: "Grey" },
      { plate: "TC-99-20", model: "Honda City", color: "White" },
    ],
    addresses: [
      { line: "Aurora Court, Unit 4B, Sector 4", type: "Residence", since: "2023" },
      { line: "Port District Warehouse 12", type: "Business", since: "2024" },
    ],
    firs: [
      { id: "FIR-2291", title: "Financial fraud — wire structuring", station: "Central PS", date: "02 Jul 2026", status: "Under investigation" },
      { id: "FIR-1884", title: "Forgery of documents", station: "East PS", date: "14 Mar 2026", status: "Chargesheet filed" },
    ],
    associates: [
      { name: "L. Fenwick", relation: "Co-signer / advisor", risk: "moderate" },
      { name: "R. Sable", relation: "Financial intermediary", risk: "strong" },
      { name: "Aurora Holdings", relation: "Controlled entity", risk: "strong" },
    ],
    timeline: [
      { date: "19 Jul", time: "14:02", event: "High-value transfer executed via Aurora Holdings." },
      { date: "17 Jul", time: "16:50", event: "Named in freeze warrant W-4821-A." },
      { date: "14 Mar", time: "09:10", event: "Chargesheet filed under FIR-1884." },
    ],
    evidence: [
      { id: "EV-441", title: "Wire transfer ledger", kind: "Financial", date: "18 Jul" },
      { id: "EV-390", title: "Cell-site trace IMEI 35•••90", kind: "Signals", date: "19 Jul" },
    ],
  },
  {
    id: "pr2",
    name: "Rhea Sable",
    aliases: ["R. Sable", "Rhea S."],
    confidence: 78,
    primaryId: "IDN-0088-1120",
    location: "Metro Central · Sector 2",
    status: "Person of interest",
    matchedVia: [
      { id: "m4", label: "Shared bank account", method: "deterministic", strength: "strong", detail: "Account •••4821 lists both identities as authorised signatories." },
      { id: "m5", label: "Co-travel pattern", method: "probabilistic", score: 64, strength: "weak", detail: "Devices co-located across 5 of 40 observed windows — weak but non-random." },
    ],
    phones: [{ number: "+91 99••• 001", carrier: "Vi", lastSeen: "11 Jul 2026", verified: true }],
    vehicles: [{ plate: "MM-20-14", model: "Hyundai Creta", color: "Black" }],
    addresses: [{ line: "Lakeview Residency, Sector 2", type: "Residence", since: "2022" }],
    firs: [{ id: "FIR-2291", title: "Financial fraud — wire structuring", station: "Central PS", date: "02 Jul 2026", status: "Under investigation" }],
    associates: [
      { name: "V. Marchetti", relation: "Business partner", risk: "strong" },
      { name: "Aurora Holdings", relation: "Signatory", risk: "moderate" },
    ],
    timeline: [
      { date: "11 Jul", time: "10:20", event: "Flagged in transaction monitoring alert." },
      { date: "02 Jul", time: "08:00", event: "Added as person of interest to PRM-4821." },
    ],
    evidence: [{ id: "EV-441", title: "Wire transfer ledger", kind: "Financial", date: "18 Jul" }],
  },
  {
    id: "pr3",
    name: "Liam Fenwick",
    aliases: ["L. Fenwick", "Liam F."],
    confidence: 61,
    primaryId: "IDN-0071-8830",
    location: "Port District",
    status: "Witness",
    matchedVia: [
      { id: "m6", label: "Shared address", method: "probabilistic", score: 58, strength: "weak", detail: "Historic address overlap only; no current-period corroboration." },
      { id: "m7", label: "Same device fingerprint", method: "deterministic", strength: "moderate", detail: "Browser + hardware fingerprint match on two sessions." },
    ],
    phones: [{ number: "+91 91••• 555", carrier: "Airtel", lastSeen: "28 Jun 2026", verified: false }],
    vehicles: [],
    addresses: [{ line: "Harbour Lane 7, Port District", type: "Residence", since: "2021" }],
    firs: [],
    associates: [{ name: "V. Marchetti", relation: "Advisor", risk: "moderate" }],
    timeline: [{ date: "28 Jun", time: "13:40", event: "Interviewed as witness in PRM-4821." }],
    evidence: [{ id: "EV-402", title: "Surveillance report SR-1192", kind: "Field", date: "17 Jul" }],
  },
];
