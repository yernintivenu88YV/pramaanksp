import { useState } from 'react';
import { Search, Sparkles, Command, Bell, SlidersHorizontal, Plus, ChevronRight, CircleDot, Globe, Shield, LogOut } from 'lucide-react';
import { type } from '../../design/scale';

const titles = {
  overview: { title: 'Command Overview', sub: 'Watch floor', titleKn: 'ಕಮಾಂಡ್ ಮೇಲ್ನೋಟ' },
  cases: { title: 'Case Register', sub: 'Investigate', titleKn: 'ಪ್ರಕರಣಗಳ ನೋಂದಣಿ' },
  alerts: { title: 'Alert Stream', sub: 'Watch floor', titleKn: 'ಎಚ್ಚರಿಕೆ ವಾಹಿನಿ' },
  map: { title: 'Live Crime Map', sub: 'Analyze', titleKn: 'ನೈಜ ಸಮಯದ ಅಪರಾಧ ನಕ್ಷೆ' },
  graph: { title: 'Entity Graph', sub: 'Analyze', titleKn: 'ಸಂಬಂಧಿತ ಜಾಲಲಕ್ಷಣ Graph' },
  similar: { title: 'Case Twin Intelligence', sub: 'Investigate', titleKn: 'ಸಮಾನ ಅಪರಾಧ ಮಾದರಿಗಳು' },
  resolution: { title: 'Identity Resolution', sub: 'Investigate', titleKn: 'ಗುರುತು ದೃಢೀಕರಣ Resolution' },
  assistant: { title: 'AI Investigation Assistant', sub: 'Analyze', titleKn: 'ಎಐ ತನಿಖಾ ಸಹಾಯಕ' },
  audit: { title: 'Audit & Compliance', sub: 'Govern', titleKn: 'ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ನಿಯಮಾವಳಿ' },
};

const roles = ['SI', 'IO', 'ACP', 'Analyst', 'Policy'];

export function TopBar({ view, activeRole, onRoleChange, onOpenLoginModal, language, onLanguageToggle }) {
  const meta = titles[view] || titles.overview;
  const [mode, setMode] = useState('search');

  const displayTitle = language === 'KN' ? meta.titleKn : meta.title;

  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-3 border-b border-pramaan-border bg-pramaan-bg px-3 py-2 lg:h-12 lg:flex-nowrap lg:px-4 lg:py-0">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-pramaan-text-secondary/70" style={type.eyebrow}>{meta.sub.toUpperCase()}</span>
        <ChevronRight size={13} className="text-pramaan-text-secondary/40" />
        <span className="truncate text-pramaan-text font-bold" style={type.subheading}>{displayTitle}</span>
        <span className="ml-2 hidden items-center gap-1 text-pramaan-success md:flex" style={type.micro}>
          <CircleDot size={10} strokeWidth={2.5} className="animate-pulse" /> APP SAIL READY
        </span>
      </div>

      <div className="order-3 flex w-full items-center gap-1 rounded-md border border-pramaan-border bg-pramaan-surface px-1 py-1 md:order-none md:mx-auto md:max-w-xl">
        <div className="flex overflow-hidden rounded bg-pramaan-elevated">
          <ModeBtn on={mode === 'search'} onClick={() => setMode('search')} icon={Search} label={language === 'KN' ? 'ಹುಡುಕು' : 'Find'} />
          <ModeBtn on={mode === 'ask'} onClick={() => setMode('ask')} icon={Sparkles} label={language === 'KN' ? 'ಎಐ ಕೇಳಿ' : 'Ask AI'} />
        </div>
        <input
          placeholder={
            language === 'KN'
              ? 'ಪ್ರಕರಣಗಳು, ಅನುಮಾನಾಸ್ಪದ ವ್ಯಕ್ತಿಗಳು, ಫೋನ್ ನಂಬರ್‌ಗಳನ್ನು ಹುಡುಕಿ...'
              : mode === 'search'
              ? 'Search cases, suspects, phones, vehicles...'
              : 'Ask: Find similar burglary cases to CASE-001'
          }
          className="min-w-0 flex-1 bg-transparent px-2 text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/50"
          style={type.body}
        />
        <span className="mr-1 hidden items-center gap-0.5 rounded border border-pramaan-border px-1 text-pramaan-text-secondary/60 sm:flex" style={type.micro}>
          <Command size={10} /> K
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Bilingual Language Switcher */}
        <button
          onClick={onLanguageToggle}
          className="flex h-8 items-center gap-1.5 rounded-md border border-pramaan-border bg-pramaan-surface px-2.5 text-xs font-semibold text-pramaan-text hover:border-pramaan-primary transition-colors"
          title="Switch Language (English / ಕನ್ನಡ)"
        >
          <Globe size={13} className="text-pramaan-primary" />
          <span>{language === 'KN' ? 'KN - ಕನ್ನಡ' : 'EN'}</span>
        </button>

        {/* Role & Login Modal Trigger */}
        <div className="flex items-center gap-1 rounded-md border border-pramaan-border bg-pramaan-surface p-0.5">
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="h-7 rounded bg-transparent px-1.5 text-xs font-bold text-pramaan-primary outline-none"
            title="Switch Clearance Role"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-pramaan-surface text-pramaan-text">
                Role: {r}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenLoginModal}
            className="flex h-7 items-center gap-1 rounded bg-pramaan-primary/10 px-2 text-[11px] font-semibold text-pramaan-primary hover:bg-pramaan-primary/20 transition-colors"
            title="Open Security Login Portal"
          >
            <Shield size={12} />
            <span className="hidden sm:inline">Switch Role</span>
          </button>
        </div>

        <IconBtn icon={Bell} dot />
        <button className="hidden items-center gap-1.5 rounded-md bg-pramaan-primary px-3 py-1.5 text-pramaan-bg transition-colors hover:bg-pramaan-secondary sm:flex" style={type.label}>
          <Plus size={15} strokeWidth={2.25} /> New Case
        </button>
      </div>
    </header>
  );
}

function ModeBtn({ on, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
        on ? 'bg-pramaan-primary/20 text-pramaan-secondary' : 'text-pramaan-text-secondary hover:text-pramaan-text'
      }`}
      style={type.label}
    >
      <Icon size={13} strokeWidth={2} /> {label}
    </button>
  );
}

function IconBtn({ icon: Icon, dot }) {
  return (
    <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-pramaan-border bg-pramaan-surface text-pramaan-text-secondary transition-colors hover:border-pramaan-border-strong hover:text-pramaan-text">
      <Icon size={15} strokeWidth={1.75} />
      {dot && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-pramaan-critical" />}
    </button>
  );
}
