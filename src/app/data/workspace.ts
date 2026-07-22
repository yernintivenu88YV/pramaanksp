// Mock case-file + AI-analysis data for the Investigation Workspace.
// Replace with real API responses when a backend is connected.

export type EvidenceKind = "document" | "statement" | "physical" | "digital";

export interface FileNode {
  id: string;
  name: string;
  kind: EvidenceKind;
  meta: string; // secondary line — added-by / size / date
  viewer: "transcript" | "image" | "pdf";
}

export const fileTree: FileNode[] = [
  { id: "DOC-1042", name: "FIR — PRM-4821.pdf", kind: "document", meta: "PDF · 4 pp · 14 Jul", viewer: "pdf" },
  { id: "DOC-1048", name: "Bank statement — Aurora.pdf", kind: "document", meta: "PDF · 22 pp · 15 Jul", viewer: "pdf" },
  { id: "STM-2201", name: "Statement — Witness A", kind: "statement", meta: "Transcript · 18 Jul", viewer: "transcript" },
  { id: "STM-2202", name: "Statement — Witness B", kind: "statement", meta: "Transcript · 18 Jul", viewer: "transcript" },
  { id: "STM-2205", name: "Statement — V. Marchetti", kind: "statement", meta: "Transcript · 19 Jul", viewer: "transcript" },
  { id: "PHY-3310", name: "Seized ledger (photo)", kind: "physical", meta: "Image · exhibit A-7", viewer: "image" },
  { id: "PHY-3312", name: "Vehicle KA-01-M?-4482", kind: "physical", meta: "Image · impound lot 3", viewer: "image" },
  { id: "DIG-4407", name: "Device dump — IMEI 35•••90", kind: "digital", meta: "Extract · 1.2 GB", viewer: "pdf" },
  { id: "DIG-4409", name: "CDR export — 3 numbers", kind: "digital", meta: "CSV · 8,412 rows", viewer: "pdf" },
];

export const kindLabel: Record<EvidenceKind, string> = {
  document: "Documents",
  statement: "Statements",
  physical: "Physical Evidence",
  digital: "Digital Evidence",
};

// Selected transcript (Witness A) — lines are addressable for annotation.
export interface TranscriptLine {
  n: number;
  speaker: string;
  text: string;
  flagged?: boolean; // has an annotation
}

export const transcript: TranscriptLine[] = [
  { n: 1, speaker: "OFFICER", text: "State your name and where you were on the night of 14 July." },
  { n: 2, speaker: "WITNESS A", text: "I was at the Port District warehouse until around 9 PM." },
  { n: 3, speaker: "OFFICER", text: "Did you see the accused, V. Marchetti, at that location?" },
  { n: 4, speaker: "WITNESS A", text: "Yes. Marchetti arrived near 8:30 PM and left in a dark sedan.", flagged: true },
  { n: 5, speaker: "OFFICER", text: "Was anyone else present?" },
  { n: 6, speaker: "WITNESS A", text: "Two men I did not recognise, and the driver of the sedan." },
  { n: 7, speaker: "OFFICER", text: "How certain are you about the time?" },
  { n: 8, speaker: "WITNESS A", text: "Very certain. I checked my phone; it was 8:30 when he arrived." },
];

export interface SimilarCase {
  id: string;
  title: string;
  score: number;
  reason: string;
}
export const similarCases: SimilarCase[] = [
  { id: "PRM-3990", title: "Port warehouse layering ring (2024)", score: 88, reason: "Same MO: sub-threshold transfers via shell org." },
  { id: "PRM-4102", title: "Sedan-courier cash movement", score: 72, reason: "Shared vehicle-handoff pattern at night." },
  { id: "PRM-3771", title: "Nominee-director fraud", score: 61, reason: "Aurora-style nominee director structure." },
];

export interface MissingFlag {
  id: string;
  flag: string;
  score: number;
  reason: string;
}
export const missingEvidence: MissingFlag[] = [
  { id: "M1", flag: "No CCTV footage logged for 14 Jul, 20:00–21:00", score: 91, reason: "Witness places accused on-site; no video exhibit exists." },
  { id: "M2", flag: "Sedan number plate not captured", score: 78, reason: "Vehicle referenced 3× across statements, never identified." },
];

export interface Contradiction {
  id: string;
  score: number;
  reason: string;
  a: { source: string; line: string };
  b: { source: string; line: string };
}
export const contradictions: Contradiction[] = [
  {
    id: "C1",
    score: 84,
    reason: "Arrival time conflicts by ~90 minutes between two witnesses.",
    a: { source: "STM-2201 · Witness A · L4", line: "Marchetti arrived near 8:30 PM and left in a dark sedan." },
    b: { source: "STM-2202 · Witness B · L6", line: "He got to the warehouse around 10 PM, alone, on foot." },
  },
];

export interface NoteEntry {
  id: string;
  author: string;
  time: string;
  text: string;
  replies?: { id: string; author: string; time: string; text: string }[];
}
export const officerNotes: NoteEntry[] = [
  {
    id: "N1",
    author: "A. Okonkwo",
    time: "19 Jul 08:22",
    text: "Requested CCTV pull from Port District ops — gap flagged by AI confirmed with control room.",
    replies: [
      { id: "N1r1", author: "R. Devi", time: "19 Jul 09:05", text: "Control room says drive was overwritten. Chasing backup." },
    ],
  },
  {
    id: "N2",
    author: "M. Haddad",
    time: "19 Jul 10:41",
    text: "Witness A and B timelines don't reconcile. Scheduling re-interview for both.",
  },
];
