import { useState } from 'react';
import {
  LayoutDashboard, FolderKanban, BellRing, Share2,
  MapPinned, Fingerprint, CopyCheck, ScrollText,
  ShieldCheck, Sparkles, Lock, HelpCircle,
  Search, Upload, ScanFace, Shield, FileSearch, FileUp
} from 'lucide-react';
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
      { key: 'facerec', labelKey: 'navFaceRec', icon: ScanFace, customLabel: 'Face Recognition' },
      { key: 'fingerprint', labelKey: 'navFingerprint', icon: Fingerprint, customLabel: 'Fingerprint Match' },
    ],
  },
  {
    headingKey: 'analyze',
    items: [
      { key: 'map', labelKey: 'navMap', icon: MapPinned },
      { key: 'graph', labelKey: 'navGraph', icon: Share2 },
      { key: 'assistant', labelKey: 'navAssistant', icon: Sparkles },
      { key: 'docsearch', labelKey: 'navDocSearch', icon: FileSearch, customLabel: 'docsearch' },
      { key: 'docupload', labelKey: 'navDocUpload', icon: FileUp, customLabel: 'docupload' },
    ],
  },
  {
    headingKey: 'govern',
    items: [
      { key: 'audit', labelKey: 'navAudit', icon: ScrollText },
      { key: 'helpdesk', labelKey: 'navHelpDesk', icon: HelpCircle },
    ],
  },
];

export function Sidebar({ active, onChange, activeRole = 'ACP', language = 'EN' }) {
  const [collapsed, setCollapsed] = useState(false);
  const w = collapsed ? 'w-16' : 'w-16 md:w-64';
  const t = translations[language] || translations.EN;

  return (
    <aside className={`flex h-full self-stretch min-h-full ${w} shrink-0 flex-col bg-[#17252A] text-white transition-[width] duration-200 select-none z-20 shadow-xl font-sans`}>
      
      {/* Top Header Branding (Clean PRAMAAN branding) */}
      <div className="p-4 sm:p-5 border-b border-[#2B7A78]/30 bg-[#121E22]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 leading-tight">
            <div className="truncate text-white font-black font-mono tracking-wider text-lg">PRAMAAN</div>
            <div className="truncate text-[#DEF2F1]/80 text-[10px] font-semibold">KSP Crime Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-4 px-3">
        {groupsConfig.map((g, idx) => (
          <div key={`${g.headingKey}-${idx}`} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#3AAFA9] hidden md:block mb-1.5">
                {t[g.headingKey] || g.headingKey}
              </div>
            )}
            <div className="space-y-1">
              {g.items.map((item, itemIdx) => {
                const isAllowed = canAccessView(activeRole, item.key);
                const isActive = active === item.key;
                const Icon = item.icon;
                const displayLabel = item.customLabel || t[item.labelKey] || item.key;

                return (
                  <button
                    key={`${item.key}-${itemIdx}`}
                    onClick={() => onChange(item.key)}
                    className={`group relative flex w-full items-center gap-3 rounded-full px-4 py-2 text-left transition-all cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-[#2B7A78] text-white border border-[#3AAFA9] font-extrabold shadow-md ring-1 ring-[#3AAFA9]/50 scale-[1.02]'
                        : isAllowed
                        ? 'text-[#DEF2F1]/80 hover:bg-[#2B7A78]/30 hover:text-white font-medium'
                        : 'text-slate-500/50 hover:bg-[#2B7A78]/10'
                    }`}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.25 : 1.75} className={`shrink-0 ${isActive ? 'text-[#3AAFA9]' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate text-xs hidden md:inline">{displayLabel}</span>}

                    {/* Badge Pill */}
                    {item.badge && !collapsed && (
                      <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono font-bold shadow-xs ${
                        isActive ? 'bg-[#3AAFA9] text-[#17252A]' : 'bg-[#2B7A78] text-white'
                      }`}>
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

      {/* Footer Role Badge Info */}
      <div className="p-3 border-t border-[#2B7A78]/30 bg-[#121E22] text-xs">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-[#17252A] border border-[#2B7A78]">
          <Shield size={14} className="text-[#3AAFA9]" />
          {!collapsed && (
            <div className="min-w-0 flex-1 hidden md:block">
              <div className="text-[10px] font-mono text-[#DEF2F1] truncate font-bold">CLEARANCE LEVEL</div>
              <div className="text-xs font-bold text-white truncate">{ROLE_LABELS[activeRole] || activeRole}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
