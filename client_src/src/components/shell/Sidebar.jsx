import { useState } from 'react';
import {
  LayoutDashboard, FolderKanban, BellRing, Share2,
  MapPinned, Fingerprint, CopyCheck, ScrollText,
  ShieldCheck, Sparkles, Lock,
} from 'lucide-react';
import { type } from '../../design/scale';
import { canAccessView, ROLE_LABELS, requiredPermissionFor } from '../../access';
import { translations } from '../../data/translations';

const groupsConfig = [
  {
    headingKey: 'watchFloor',
    items: [
      { key: 'overview', labelKey: 'navOverview', icon: LayoutDashboard },
      { key: 'alerts', labelKey: 'navAlerts', icon: BellRing, badge: 6 },
    ],
  },
  {
    headingKey: 'investigate',
    items: [
      { key: 'cases', labelKey: 'navCases', icon: FolderKanban, badge: 7 },
      { key: 'resolution', labelKey: 'navResolution', icon: Fingerprint },
      { key: 'similar', labelKey: 'navSimilar', icon: CopyCheck },
    ],
  },
  {
    headingKey: 'analyze',
    items: [
      { key: 'map', labelKey: 'navMap', icon: MapPinned },
      { key: 'graph', labelKey: 'navGraph', icon: Share2 },
      { key: 'assistant', labelKey: 'navAssistant', icon: Sparkles },
    ],
  },
  {
    headingKey: 'govern',
    items: [{ key: 'audit', labelKey: 'navAudit', icon: ScrollText }],
  },
];

export function Sidebar({ active, onChange, activeRole = 'SI', language = 'EN' }) {
  const [collapsed, setCollapsed] = useState(false);
  const w = collapsed ? 'w-16' : 'w-16 md:w-60';
  const t = translations[language] || translations.EN;

  return (
    <aside className={`flex h-full ${w} shrink-0 flex-col border-r border-pramaan-border bg-sidebar transition-[width] duration-200`}>
      <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-pramaan-border px-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-pramaan-primary/15 text-pramaan-primary">
          <ShieldCheck size={18} strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight hidden md:block">
            <div className="truncate text-pramaan-text" style={{ ...type.subheading, letterSpacing: '0.06em' }}>{t.brandTitle}</div>
            <div className="truncate text-pramaan-text-secondary" style={type.micro}>{t.brandSubtitle}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {groupsConfig.map((g) => (
          <div key={g.headingKey} className="mb-4 px-2.5 last:mb-0">
            {!collapsed && (
              <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-pramaan-text-secondary/70 hidden md:block">
                {t[g.headingKey] || g.headingKey}
              </div>
            )}
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const isAllowed = canAccessView(activeRole, item.key);
                const isActive = active === item.key;
                const Icon = item.icon;
                const displayLabel = t[item.labelKey] || item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => onChange(item.key)}
                    className={`group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors ${
                      isActive
                        ? 'bg-pramaan-primary/15 text-pramaan-primary font-bold'
                        : isAllowed
                        ? 'text-pramaan-text-secondary hover:bg-pramaan-elevated hover:text-pramaan-text'
                        : 'text-pramaan-text-secondary/40 hover:bg-pramaan-elevated/40'
                    }`}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.25 : 1.75} className="shrink-0" />
                    {!collapsed && <span className="truncate text-xs hidden md:inline">{displayLabel}</span>}

                    {!isAllowed && !collapsed && (
                      <Lock size={12} className="ml-auto shrink-0 text-pramaan-text-secondary/40 hidden md:block" title={`Requires ${requiredPermissionFor(item.key)}`} />
                    )}

                    {item.badge && !collapsed && isAllowed && (
                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-pramaan-primary/20 px-1 text-[10px] font-mono font-bold text-pramaan-primary hidden md:flex">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-pramaan-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-pramaan-elevated p-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-pramaan-primary/20 text-xs font-bold text-pramaan-primary">
            {activeRole}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 hidden md:block">
              <div className="truncate text-[11px] font-bold text-pramaan-text">{ROLE_LABELS[activeRole]}</div>
              <div className="truncate text-[10px] text-pramaan-text-secondary font-mono">Clearance Granted</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
