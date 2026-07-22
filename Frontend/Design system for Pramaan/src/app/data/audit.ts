// Mock audit-log data for Pramaan's compliance dashboard.
// Replace with the append-only audit store when a backend is connected.

export type AuditStatus = "success" | "denied" | "flagged";

export interface AuditEntry {
  id: string;
  seq: number;
  officer: string;
  role: string;
  timestamp: string; // ISO-ish display
  caseId: string;
  reason: string;
  ip: string;
  device: string;
  status: AuditStatus;
  hash: string;
  prevHash: string;
}

export const statusMeta: Record<AuditStatus, { label: string; color: string; dot: string }> = {
  success: { label: "SUCCESS", color: "text-pramaan-success", dot: "bg-pramaan-success" },
  denied: { label: "DENIED", color: "text-pramaan-critical", dot: "bg-pramaan-critical" },
  flagged: { label: "FLAGGED", color: "text-pramaan-warning", dot: "bg-pramaan-warning" },
};

export const officers = [
  "A. Okonkwo",
  "R. Devi",
  "M. Haddad",
  "S. Lindqvist",
  "J. Park",
  "N. Rahman",
];

export const auditEntries: AuditEntry[] = [
  { id: "e1", seq: 100482, officer: "A. Okonkwo", role: "Lead Analyst", timestamp: "2026-07-19 14:24:07", caseId: "PRM-4821", reason: "Viewed financial ledger evidence", ip: "10.14.2.31", device: "WS-4471 · Chrome", status: "success", hash: "9f2a…c17b", prevHash: "3d8e…a904" },
  { id: "e2", seq: 100481, officer: "R. Devi", role: "Field Officer", timestamp: "2026-07-19 14:11:52", caseId: "PRM-4809", reason: "Exported entity graph (PDF)", ip: "10.14.5.08", device: "MBL-2210 · iOS", status: "flagged", hash: "3d8e…a904", prevHash: "b1c0…7f22" },
  { id: "e3", seq: 100480, officer: "M. Haddad", role: "Analyst", timestamp: "2026-07-19 13:58:19", caseId: "PRM-4790", reason: "Attempted access outside jurisdiction", ip: "10.22.9.140", device: "WS-8890 · Firefox", status: "denied", hash: "b1c0…7f22", prevHash: "77aa…0e51" },
  { id: "e4", seq: 100479, officer: "A. Okonkwo", role: "Lead Analyst", timestamp: "2026-07-19 13:40:03", caseId: "PRM-4821", reason: "Added case note", ip: "10.14.2.31", device: "WS-4471 · Chrome", status: "success", hash: "77aa…0e51", prevHash: "2c9d…ff38" },
  { id: "e5", seq: 100478, officer: "S. Lindqvist", role: "Supervisor", timestamp: "2026-07-19 12:22:47", caseId: "PRM-4772", reason: "Approved warrant request", ip: "10.14.1.02", device: "WS-1120 · Edge", status: "success", hash: "2c9d…ff38", prevHash: "5e41…ba7c" },
  { id: "e6", seq: 100477, officer: "J. Park", role: "Analyst", timestamp: "2026-07-19 11:57:31", caseId: "PRM-4758", reason: "Ran identity resolution query", ip: "10.14.6.77", device: "WS-6620 · Chrome", status: "success", hash: "5e41…ba7c", prevHash: "0b73…19dd" },
  { id: "e7", seq: 100476, officer: "R. Devi", role: "Field Officer", timestamp: "2026-07-19 11:30:14", caseId: "PRM-4809", reason: "Bulk record download (240 rows)", ip: "203.0.113.9", device: "MBL-2210 · iOS", status: "flagged", hash: "0b73…19dd", prevHash: "e6f8…4a11" },
  { id: "e8", seq: 100475, officer: "N. Rahman", role: "Analyst", timestamp: "2026-07-19 10:48:59", caseId: "PRM-4702", reason: "Closed case file", ip: "10.14.3.55", device: "WS-3055 · Chrome", status: "success", hash: "e6f8…4a11", prevHash: "aa20…7c63" },
  { id: "e9", seq: 100474, officer: "M. Haddad", role: "Analyst", timestamp: "2026-07-19 10:12:20", caseId: "PRM-4790", reason: "Modified entity link (probabilistic)", ip: "10.14.9.140", device: "WS-8890 · Firefox", status: "success", hash: "aa20…7c63", prevHash: "18cf…9b40" },
  { id: "e10", seq: 100473, officer: "S. Lindqvist", role: "Supervisor", timestamp: "2026-07-19 09:35:41", caseId: "PRM-4772", reason: "Reviewed access logs", ip: "10.14.1.02", device: "WS-1120 · Edge", status: "success", hash: "18cf…9b40", prevHash: "c4d1…2200" },
  { id: "e11", seq: 100472, officer: "J. Park", role: "Analyst", timestamp: "2026-07-19 08:59:03", caseId: "PRM-4758", reason: "Failed login (2FA timeout)", ip: "10.14.6.77", device: "WS-6620 · Chrome", status: "denied", hash: "c4d1…2200", prevHash: "0000…genesis" },
];

export const auditStatuses: AuditStatus[] = ["success", "denied", "flagged"];
export const caseIds = ["PRM-4821", "PRM-4809", "PRM-4790", "PRM-4772", "PRM-4758", "PRM-4702"];
