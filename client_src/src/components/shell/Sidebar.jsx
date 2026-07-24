import { useState } from 'react';
import {
  LayoutDashboard, FolderKanban, BellRing, Share2,
  MapPinned, Fingerprint, CopyCheck, ScrollText,
  Settings, ShieldCheck, ChevronsLeft, Sparkles, Lock,
} from 'lucide-react';
import { type } from '../../design/scale';
import { canAccessView, ROLE_LABELS, requiredPermissionFor } from '../../access';

const groups = [
  {
    heading: 'Watch Floor',
    items: [
      { key: 'overview', label: 'Command Overview', icon: LayoutDashboard },
      { key: 'alerts', label: 'Alert Stream', icon: BellRing, badge: 6 },
    ],
  },
  {
    heading: 'Investigate',
    items: [
      { key: 'cases', label: 'Case Register', icon: FolderKanban, badge: 7 },
      { key: 'resolution', label: 'Identity Resolution', icon: Fingerprint },
      { key: 'similar', label: 'Case Twins', icon: CopyCheck },
    ],
  },
  {
    heading: 'Analyze',
    items: [
      { key: 'map', label: 'Live Crime Map', icon: MapPinned },
      { key: 'graph', label: 'Entity Graph', icon: Share2 },
      { key: 'assistant', label: 'AI Assistant', icon: Sparkles },
    ],
  },
  {
    heading: 'Govern',
    items: [{ key: 'audit', label: 'Audit & Compliance', icon: ScrollText }],
  },
];

export function Sidebar({ active, onChange, activeRole = 'SI' }) {
  const [collapsed, setCollapsed] = useState(false);
  const w = collapsed ? 'w-16' : 'w-16 md:w-60';

  return (
    <aside className={`flex h-full ${w} shrink-0 flex-col border-r border-pramaan-border bg-sidebar transition-[width] duration-200`}>
      <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-pramaan-border px-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pramaan-primary/15 text-pramaan-primary">
          <ShieldCheck size={18} strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-pramaan-text" style={{ ...type.subheading, letterSpacing: '0.06em' }}>PRAMAAN</div>
            <div className="truncate text-pramaan-text-secondary" style={type.micro}>KSP Crime Intelligence</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {groups.map((g) => (
          <div key={g.heading} className="mb-4 px-2.5 last:mb-0">
            {!collapsed && <div className="px-2 pb-1.5 text-pramaan-text-secondary/50 uppercase" style={type.eyebrow}>{g.heading}</div>}
            <div className="flex flex-col gap-0.5">
              {g.items.map(({ key, label, icon: Icon, badge }) => {
                const on = active === key;
                // Role gating: locked modules stay visible (so the capability
                // is discoverable and the governance boundary is explicit),
                // but are not navigable for roles lacking the permission.
                const allowed = canAccessView(activeRole, key);
                const lockTitle = allowed
                  ? (collapsed ? label : undefined)
                  : `${label} — requires ${requiredPermissionFor(key)} (your role: ${activeRole} · ${ROLE_LABELS[activeRole] || ''})`;
                return (
                  <button
                    key={key}
                    onClick={() => onChange(key)}
                    disabled={!allowed}
                    aria-disabled={!allowed}
                    title={lockTitle}
                    className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors ${
                      !allowed
                        ? 'cursor-not-allowed text-pramaan-text-secondary/35'
                        : on
                          ? 'bg-pramaan-primary/12 text-pramaan-text'
                          : 'text-pramaan-text-secondary hover:bg-pramaan-elevated hover:text-pramaan-text'
                    }`}
                    style={type.label}
                  >
                    {on && allowed && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-pramaan-primary" />}
                    <Icon size={16} strokeWidth={1.75} className={`shrink-0 ${on && allowed ? 'text-pramaan-primary' : ''}`} />
                    {!collapsed && <span className="flex-1 truncate">{label}</span>}
                    {!collapsed && !allowed && <Lock size={12} className="shrink-0 text-pramaan-text-secondary/45" />}
                    {!collapsed && allowed && badge != null && <span className="tnum rounded bg-pramaan-panel px-1.5 text-pramaan-text-secondary" style={type.micro}>{badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-pramaan-border p-2.5">
        <div className={`flex items-center gap-2.5 rounded-md px-1 py-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pramaan-primary/20 text-pramaan-secondary" style={type.label}>AO</div>
          {!collapsed && <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-pramaan-text" style={type.label}>KSP Demo Officer</div><div className="truncate text-pramaan-text-secondary" style={type.micro}>SI role simulation</div></div>}
          {!collapsed && <button className="text-pramaan-text-secondary transition-colors hover:text-pramaan-text"><Settings size={15} strokeWidth={1.75} /></button>}
        </div>
        <button onClick={() => setCollapsed((c) => !c)} className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md py-1 text-pramaan-text-secondary/70 transition-colors hover:bg-pramaan-elevated hover:text-pramaan-text" style={type.micro}>
          <ChevronsLeft size={14} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
