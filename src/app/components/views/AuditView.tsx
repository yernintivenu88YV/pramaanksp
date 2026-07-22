import { useMemo, useState } from "react";
import {
  Download,
  Search,
  Table2,
  ListTree,
  Lock,
  ShieldCheck,
  Link2,
  Filter,
} from "lucide-react";
import {
  auditEntries,
  statusMeta,
  officers,
  caseIds,
  auditStatuses,
  type AuditStatus,
} from "../../data/audit";

type Tab = "table" | "ledger";

export function AuditView() {
  const [tab, setTab] = useState<Tab>("table");
  const [officer, setOfficer] = useState("all");
  const [caseId, setCaseId] = useState("all");
  const [status, setStatus] = useState<"all" | AuditStatus>("all");
  const [from, setFrom] = useState("2026-07-19");
  const [to, setTo] = useState("2026-07-19");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      auditEntries.filter(
        (e) =>
          (officer === "all" || e.officer === officer) &&
          (caseId === "all" || e.caseId === caseId) &&
          (status === "all" || e.status === status) &&
          (q === "" ||
            `${e.officer} ${e.reason} ${e.ip} ${e.device} ${e.caseId}`
              .toLowerCase()
              .includes(q.toLowerCase()))
      ),
    [officer, caseId, status, q]
  );

  const selectCls =
    "rounded-md border border-pramaan-border bg-pramaan-elevated px-2.5 py-1.5 text-pramaan-text outline-none focus:border-pramaan-primary";

  return (
    <div className="flex flex-col gap-3">
      {/* Integrity banner */}
      <div className="flex items-center gap-2.5 rounded-lg border border-pramaan-border bg-pramaan-surface px-4 py-2.5">
        <ShieldCheck size={16} strokeWidth={1.75} className="text-pramaan-success" />
        <span className="text-pramaan-text" style={{ fontSize: 12.5, fontWeight: 500 }}>
          Append-only audit store
        </span>
        <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
          · Chain verified through seq 100482 · last integrity check 14:25:00 UTC
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-pramaan-success" style={{ fontSize: 11.5, fontWeight: 500 }}>
          <Lock size={13} strokeWidth={1.75} /> Tamper-evident
        </span>
      </div>

      {/* Tabs + filter bar */}
      <div className="rounded-xl border border-pramaan-border bg-pramaan-surface">
        <div className="flex items-center gap-1 border-b border-pramaan-border px-2">
          <TabButton icon={Table2} label="Access Log Table" active={tab === "table"} onClick={() => setTab("table")} />
          <TabButton icon={ListTree} label="Immutable Audit Timeline" active={tab === "ledger"} onClick={() => setTab("ledger")} />
          <span className="ml-auto pr-2 text-pramaan-text-secondary" style={{ fontSize: 11 }}>
            {rows.length} of {auditEntries.length} events
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-b border-pramaan-border p-3" style={{ fontSize: 12 }}>
          <Field label="From">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls} />
          </Field>
          <Field label="To">
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectCls} />
          </Field>
          <Field label="Officer">
            <select value={officer} onChange={(e) => setOfficer(e.target.value)} className={selectCls}>
              <option value="all">All officers</option>
              {officers.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Case ID">
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className={selectCls}>
              <option value="all">All cases</option>
              {caseIds.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as "all" | AuditStatus)} className={selectCls}>
              <option value="all">All statuses</option>
              {auditStatuses.map((s) => (
                <option key={s} value={s}>{statusMeta[s].label}</option>
              ))}
            </select>
          </Field>
          <Field label="Search">
            <div className="flex items-center gap-1.5 rounded-md border border-pramaan-border bg-pramaan-elevated px-2 py-1.5">
              <Search size={13} className="text-pramaan-text-secondary" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="officer, IP, reason…"
                className="w-40 bg-transparent text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/60"
              />
            </div>
          </Field>

          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-md border border-pramaan-border px-2.5 py-1.5 text-pramaan-text-secondary transition-colors hover:text-pramaan-text" style={{ fontSize: 12 }}>
              <Filter size={13} strokeWidth={1.75} /> More
            </button>
            <button className="flex items-center gap-1.5 rounded-md bg-pramaan-primary px-3 py-1.5 text-pramaan-text transition-colors hover:bg-pramaan-secondary" style={{ fontSize: 12, fontWeight: 500 }}>
              <Download size={13} strokeWidth={1.75} /> Export CSV
            </button>
          </div>
        </div>

        {tab === "table" ? <AuditTable rows={rows} /> : <AuditLedger rows={rows} />}
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: typeof Table2; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-3 transition-colors ${
        active ? "text-pramaan-text" : "text-pramaan-text-secondary hover:text-pramaan-text"
      }`}
      style={{ fontSize: 12.5, fontWeight: active ? 500 : 400 }}
    >
      <Icon size={14} strokeWidth={1.75} className={active ? "text-pramaan-secondary" : ""} />
      {label}
      {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-pramaan-primary" />}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-pramaan-text-secondary/70" style={{ fontSize: 10, letterSpacing: "0.05em" }}>{label.toUpperCase()}</span>
      {children}
    </label>
  );
}

function AuditTable({ rows }: { rows: typeof auditEntries }) {
  const headers = ["Seq", "Officer", "Role", "Timestamp", "Case", "Reason", "IP", "Device", "Status"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ fontFamily: "var(--font-mono)" }}>
        <thead>
          <tr className="border-b border-pramaan-border text-left text-pramaan-text-secondary" style={{ fontSize: 10.5, letterSpacing: "0.04em" }}>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2" style={{ fontWeight: 500 }}>{h.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const s = statusMeta[e.status];
            return (
              <tr key={e.id} className="border-b border-pramaan-border/50 transition-colors hover:bg-pramaan-elevated/50" style={{ fontSize: 11.5 }}>
                <td className="px-3 py-2 text-pramaan-text-secondary">{e.seq}</td>
                <td className="px-3 py-2 text-pramaan-text" style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>{e.officer}</td>
                <td className="px-3 py-2 text-pramaan-text-secondary" style={{ fontFamily: "var(--font-sans)" }}>{e.role}</td>
                <td className="px-3 py-2 text-pramaan-text-secondary">{e.timestamp}</td>
                <td className="px-3 py-2 text-pramaan-secondary">{e.caseId}</td>
                <td className="px-3 py-2 text-pramaan-text" style={{ fontFamily: "var(--font-sans)" }}>{e.reason}</td>
                <td className="px-3 py-2 text-pramaan-text-secondary">{e.ip}</td>
                <td className="px-3 py-2 text-pramaan-text-secondary">{e.device}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1.5 ${s.color}`} style={{ fontSize: 10.5, fontWeight: 600 }}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-3 py-10 text-center text-pramaan-text-secondary" style={{ fontFamily: "var(--font-sans)", fontSize: 12 }}>
                No audit events match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AuditLedger({ rows }: { rows: typeof auditEntries }) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-pramaan-border/60 bg-pramaan-elevated px-3 py-2 text-pramaan-text-secondary" style={{ fontSize: 11.5 }}>
        <Lock size={13} strokeWidth={1.75} className="text-pramaan-success" />
        Entries are append-only and cryptographically chained. Each record references the hash of the preceding entry; any edit breaks the chain.
      </div>

      <div className="relative pl-6">
        <div className="absolute bottom-2 left-[9px] top-2 w-px bg-pramaan-border" />
        {rows.map((e) => {
          const s = statusMeta[e.status];
          return (
            <div key={e.id} className="relative pb-3 last:pb-0">
              <span className="absolute -left-[19px] top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-pramaan-surface bg-pramaan-panel">
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              </span>
              <div className="rounded-lg border border-pramaan-border bg-pramaan-elevated p-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-pramaan-text-secondary" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
                    #{e.seq}
                  </span>
                  <span className="text-pramaan-text" style={{ fontSize: 12.5, fontWeight: 500 }}>{e.officer}</span>
                  <span className="text-pramaan-text-secondary" style={{ fontSize: 11 }}>{e.role}</span>
                  <span className="text-pramaan-secondary" style={{ fontSize: 11.5 }}>{e.caseId}</span>
                  <span className="text-pramaan-text-secondary" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{e.timestamp}</span>
                  <span className={`ml-auto inline-flex items-center gap-1.5 ${s.color}`} style={{ fontSize: 10, fontWeight: 600 }}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
                  </span>
                </div>
                <div className="mt-1 text-pramaan-text" style={{ fontSize: 12 }}>{e.reason}</div>
                <div className="mt-1 text-pramaan-text-secondary" style={{ fontSize: 10.5 }}>
                  {e.ip} · {e.device}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-pramaan-border/60 pt-2" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                  <span className="flex items-center gap-1.5 text-pramaan-success">
                    <ShieldCheck size={11} /> hash <span className="text-pramaan-text">{e.hash}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-pramaan-text-secondary">
                    <Link2 size={11} /> prev <span>{e.prevHash}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="py-10 text-center text-pramaan-text-secondary" style={{ fontSize: 12 }}>
            No ledger entries match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
