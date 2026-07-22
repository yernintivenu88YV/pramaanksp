import { Search, FolderOpen, Bookmark, Bell, Clock3, MapPin, Link2, Archive, ChevronsUpDown, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ViewKey = "timeline" | "network" | "geo" | "evidence";

/* Persistent left navigation. Top: workspace-level items (Search, active-case
   switcher, Bookmarks, Notifications). Notifications shows a badge count only
   when > 0 — never a red dot for everything. Below: the analysis workspaces. */
export function LeftRail({
  view,
  onView,
  onSearch,
  notifications,
}: {
  view: ViewKey;
  onView: (v: ViewKey) => void;
  onSearch: () => void;
  notifications: number;
}) {
  const analysis: { key: ViewKey; label: string; icon: LucideIcon }[] = [
    { key: "timeline", label: "Timeline Explorer", icon: Clock3 },
    { key: "network", label: "Network Explorer", icon: Link2 },
    { key: "geo", label: "Geospatial Intelligence", icon: MapPin },
    { key: "evidence", label: "Evidence Vault", icon: Archive },
  ];

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-pramaan-border bg-pramaan-bg">
      <div className="flex h-14 items-center gap-3 border-b border-pramaan-border px-4">
        <div className="grid h-7 w-7 place-items-center rounded border border-pramaan-primary/40 bg-pramaan-primary/10 text-pramaan-primary">
          <ShieldCheck size={16} />
        </div>
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em]">PRAMAAN</p>
          <p className="font-mono text-[9px] text-pramaan-text-secondary">INVESTIGATION OS</p>
        </div>
      </div>

      {/* Active case switcher */}
      <button className="mx-3 mt-3 flex items-center justify-between rounded-[4px] border border-pramaan-border bg-pramaan-surface px-3 py-2 text-left hover:border-pramaan-border-strong focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary">
        <span>
          <span className="block font-mono text-[9px] uppercase text-pramaan-text-secondary">Active case</span>
          <span className="mt-0.5 block text-[11px] font-medium">PRM-4821 · Op. Vellum</span>
        </span>
        <ChevronsUpDown size={14} className="text-pramaan-text-secondary" />
      </button>

      <nav className="mt-3 px-3">
        <RailButton icon={Search} label="Search" onClick={onSearch} trailing={<kbd className="font-mono text-[9px] text-pramaan-text-secondary">⌘K</kbd>} />
        <RailButton icon={FolderOpen} label="Case workspace" />
        <RailButton icon={Bookmark} label="Bookmarks" />
        <RailButton
          icon={Bell}
          label="Notifications"
          trailing={notifications > 0 ? (
            <span className="rounded-[2px] bg-pramaan-primary px-1 font-mono text-[9px] leading-4 text-pramaan-bg">{notifications}</span>
          ) : undefined}
        />

        <div className="my-4 border-t border-pramaan-border" />
        <p className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.13em] text-pramaan-text-secondary">Analysis</p>
        {analysis.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => onView(key)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 border-l-2 px-2 py-2 text-[12px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary ${
                active ? "border-pramaan-primary bg-pramaan-primary/10 text-pramaan-text" : "border-transparent text-pramaan-text-secondary hover:bg-pramaan-hover hover:text-pramaan-text"
              }`}
            >
              <Icon size={16} className={active ? "text-pramaan-primary" : ""} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function RailButton({
  icon: Icon,
  label,
  onClick,
  trailing,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="mb-0.5 flex w-full items-center gap-3 rounded-[2px] px-2 py-2 text-left text-[12px] text-pramaan-text-secondary hover:bg-pramaan-hover hover:text-pramaan-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-pramaan-primary"
    >
      <Icon size={16} />
      <span className="flex-1">{label}</span>
      {trailing}
    </button>
  );
}
