import {
  LayoutDashboard,
  FolderKanban,
  BellRing,
  Share2,
  Waypoints,
  Clock,
  Fingerprint,
  CopyCheck,
  ScrollText,
  Settings,
  ShieldCheck,
  ChevronsLeft,
} from "lucide-react";
import { useState } from "react";
import { type } from "./ui/scale";

export type ViewKey =
  | "overview"
  | "cases"
  | "alerts"
  | "graph"
  | "network"
  | "timeline"
  | "resolution"
  | "similar"
  | "audit";

type NavItem = { key: ViewKey; label: string; icon: typeof LayoutDashboard; badge?: number };

const groups: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Watch Floor",
    items: [
      { key: "overview", label: "Command Overview", icon: LayoutDashboard },
      { key: "alerts", label: "Alert Stream", icon: BellRing, badge: 6 },
    ],
  },
  {
    heading: "Investigate",
    items: [
      { key: "cases", label: "Case Register", icon: FolderKanban, badge: 7 },
      { key: "resolution", label: "Identity Resolution", icon: Fingerprint },
      { key: "similar", label: "Similar Cases", icon: CopyCheck },
    ],
  },
  {
    heading: "Analyze",
    items: [
      { key: "graph", label: "Entity Graph", icon: Share2 },
      { key: "network", label: "Network Explorer", icon: Waypoints },
      { key: "timeline", label: "Event Timeline", icon: Clock },
    ],
  },
  {
    heading: "Govern",
    items: [{ key: "audit", label: "Audit & Compliance", icon: ScrollText }],
  },
];

export function Sidebar({ active, onChange }: { active: ViewKey; onChange: (v: ViewKey) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const w = collapsed ? "w-16" : "w-60";

  return (
    <aside className={`flex h-full ${w} shrink-0 flex-col border-r border-pramaan-border bg-sidebar transition-[width] duration-200`}>
      {/* Identity */}
      <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-pramaan-border px-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pramaan-primary/15 text-pramaan-primary">
          <ShieldCheck size={18} strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-pramaan-text" style={{ ...type.subheading, letterSpacing: "0.06em" }}>
              PRAMAAN
            </div>
            <div className="truncate text-pramaan-text-secondary" style={type.micro}>
              Investigation OS · v3.1
            </div>
          </div>
        )}
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto py-3">
        {groups.map((g) => (
          <div key={g.heading} className="mb-4 px-2.5 last:mb-0">
            {!collapsed && (
              <div className="px-2 pb-1.5 text-pramaan-text-secondary/50 uppercase" style={type.eyebrow}>
                {g.heading}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {g.items.map(({ key, label, icon: Icon, badge }) => {
                const on = active === key;
                return (
                  <button
                    key={key}
                    onClick={() => onChange(key)}
                    title={collapsed ? label : undefined}
                    className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
                      on
                        ? "bg-pramaan-primary/12 text-pramaan-text"
                        : "text-pramaan-text-secondary hover:bg-pramaan-elevated hover:text-pramaan-text"
                    }`}
                    style={type.label}
                  >
                    {on && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-pramaan-primary" />}
                    <Icon size={16} strokeWidth={1.75} className={`shrink-0 ${on ? "text-pramaan-primary" : ""}`} />
                    {!collapsed && <span className="flex-1 truncate">{label}</span>}
                    {!collapsed && badge != null && (
                      <span className="tnum rounded bg-pramaan-panel px-1.5 text-pramaan-text-secondary" style={type.micro}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Operator + controls */}
      <div className="shrink-0 border-t border-pramaan-border p-2.5">
        <div className={`flex items-center gap-2.5 rounded-md px-1 py-1 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pramaan-primary/20 text-pramaan-secondary" style={type.label}>
            AO
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-pramaan-text" style={type.label}>
                A. Okonkwo
              </div>
              <div className="truncate text-pramaan-text-secondary" style={type.micro}>
                Lead Analyst · Clearance 4
              </div>
            </div>
          )}
          {!collapsed && (
            <button className="text-pramaan-text-secondary transition-colors hover:text-pramaan-text">
              <Settings size={15} strokeWidth={1.75} />
            </button>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md py-1 text-pramaan-text-secondary/70 transition-colors hover:bg-pramaan-elevated hover:text-pramaan-text"
          style={type.micro}
        >
          <ChevronsLeft size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
