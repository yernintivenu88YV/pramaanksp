import { useState } from "react";
import { Users } from "lucide-react";
import { cases, type CaseStatus, type CaseRecord } from "../../data/mock";
import { SeverityBadge } from "../severity";
import { type } from "../ui/scale";
import { Button, StatusChip, type StatusKind } from "../ui/controls";
import { DataTable, type Column } from "../ui/data-table";

const filters: ("all" | CaseStatus)[] = ["all", "active", "escalated", "review", "closed"];

export function CasesView({ onOpenCase }: { onOpenCase?: () => void }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [density, setDensity] = useState<"dense" | "comfortable">("dense");
  const rows = filter === "all" ? cases : cases.filter((c) => c.status === filter);

  const columns: Column<CaseRecord>[] = [
    { key: "id", header: "Case ID", mono: true, width: "110px" },
    {
      key: "title",
      header: "Title",
      render: (c) => (
        <div className="min-w-0">
          <div className="truncate text-pramaan-text" style={type.bodyStrong}>
            {c.title}
          </div>
          <div className="text-pramaan-text-secondary" style={type.micro}>
            {c.region}
          </div>
        </div>
      ),
    },
    { key: "status", header: "Status", width: "110px", render: (c) => <StatusChip status={c.status as StatusKind} /> },
    { key: "priority", header: "Priority", width: "100px", render: (c) => <SeverityBadge severity={c.priority} /> },
    { key: "lead", header: "Lead", width: "130px" },
    {
      key: "entities",
      header: "Entities",
      align: "right",
      width: "90px",
      render: (c) => (
        <span className="tnum inline-flex items-center justify-end gap-1.5 text-pramaan-text-secondary" style={type.caption}>
          <Users size={12} strokeWidth={1.75} />
          {c.entities}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      align: "right",
      width: "120px",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <span className="h-1 w-16 overflow-hidden rounded-full bg-pramaan-border">
            <span className="block h-full rounded-full bg-pramaan-primary" style={{ width: `${c.progress}%` }} />
          </span>
          <span className="tnum w-8 font-mono text-pramaan-text-secondary" style={type.micro}>
            {c.progress}%
          </span>
        </div>
      ),
    },
    { key: "updated", header: "Updated", align: "right", mono: true, width: "90px" },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-pramaan-text" style={type.title}>
          Case Register
        </h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={density === "dense" ? "primary" : "ghost"} onClick={() => setDensity("dense")}>
            Dense
          </Button>
          <Button size="sm" variant={density === "comfortable" ? "primary" : "ghost"} onClick={() => setDensity("comfortable")}>
            Comfortable
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-pramaan-border bg-pramaan-surface">
        <div className="flex items-center gap-1 border-b border-pramaan-border px-2 py-2">
          {filters.map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "secondary" : "ghost"} onClick={() => setFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
          <span className="tnum ml-auto pr-2 text-pramaan-text-secondary" style={type.micro}>
            {rows.length} cases
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <DataTable columns={columns} rows={rows} getKey={(c) => c.id} density={density} onRowClick={() => onOpenCase?.()} />
        </div>
      </div>
    </div>
  );
}
