import { useState } from 'react';
import { Search, Sparkles, Command, Bell, Plus, ChevronRight, CircleDot, Globe, Shield, LogOut, Sun, Moon } from 'lucide-react';
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
  helpdesk: { title: 'Public Help Desk', sub: 'Public', titleKn: 'ಸಾರ್ವಜನಿಕ ಸಹಾಯ ಕೇಂದ್ರ' },
};

const roles = ['SI', 'ACP', 'Analyst', 'Policy'];

export function TopBar({
  view,
  activeRole,
  onRoleChange,
  onOpenLoginModal,
  onLogout,
  language,
  onLanguageToggle,
  onOpenCommandPalette
}) {
  const meta = titles[view] || titles.overview;
  const [theme, setTheme] = useState('dark');

  const displayTitle = language === 'KN' ? meta.titleKn : meta.title;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-pramaan-border bg-pramaan-bg px-4 py-2">
      {/* Breadcrumb & Title */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-pramaan-text-secondary/70 uppercase text-[10px] font-semibold tracking-widest font-mono">
          {meta.sub}
        </span>
        <ChevronRight size={14} className="text-pramaan-text-secondary/40" />
        <span className="truncate text-pramaan-text font-bold text-sm sm:text-base">
          {displayTitle}
        </span>
        <span className="ml-2 hidden items-center gap-1.5 text-pramaan-success text-[11px] font-mono font-medium md:flex bg-pramaan-success/10 px-2 py-0.5 rounded border border-pramaan-success/20">
          <CircleDot size={10} className="animate-pulse" /> LIVE ENGINE
        </span>
      </div>

      {/* Omni-search trigger button */}
      <div
        onClick={onOpenCommandPalette}
        className="order-3 flex w-full max-w-md items-center gap-2 rounded-lg border border-pramaan-border bg-pramaan-surface px-3 py-1.5 cursor-pointer hover:border-pramaan-secondary/40 transition-colors md:order-none"
      >
        <Search className="w-4 h-4 text-pramaan-text-secondary shrink-0" />
        <span className="flex-1 text-xs text-pramaan-text-secondary font-sans truncate">
          {language === 'KN'
            ? 'ಹುಡುಕಿ ಪ್ರಕರಣಗಳು, ಅಪರಾಧಿಗಳು (⌘K)...'
            : 'Search cases, suspects, or jump to view (⌘K)...'}
        </span>
        <span className="hidden items-center gap-1 rounded bg-pramaan-elevated border border-pramaan-border px-1.5 py-0.5 text-[10px] font-mono text-pramaan-text-secondary sm:flex">
          <Command size={10} /> K
        </span>
      </div>

      {/* Control Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Bilingual Language Switcher */}
        <button
          onClick={onLanguageToggle}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-pramaan-border bg-pramaan-surface px-2.5 text-xs font-semibold text-pramaan-text hover:border-pramaan-primary transition-colors cursor-pointer"
          title="Switch Language (English / ಕನ್ನಡ)"
        >
          <Globe size={14} className="text-pramaan-secondary" />
          <span>{language === 'KN' ? 'ಕನ್ನಡ' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-pramaan-border bg-pramaan-surface text-pramaan-text-secondary hover:text-pramaan-text transition-colors cursor-pointer"
          title="Toggle Day/Night Station Theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Role & Login Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-pramaan-border bg-pramaan-surface p-0.5">
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="h-7 rounded bg-transparent px-2 text-xs font-mono font-bold text-pramaan-secondary outline-none cursor-pointer"
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
            className="flex h-7 items-center gap-1 rounded bg-pramaan-primary/15 px-2.5 text-[11px] font-semibold text-pramaan-primary hover:bg-pramaan-primary/25 transition-colors cursor-pointer"
            title="Open Security Login Portal"
          >
            <Shield size={13} />
            <span className="hidden sm:inline">Role Access</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex h-7 items-center gap-1 rounded bg-pramaan-critical/15 px-2 text-[11px] font-semibold text-pramaan-critical hover:bg-pramaan-critical/25 transition-colors cursor-pointer"
              title="Lock System & Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Lock</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
