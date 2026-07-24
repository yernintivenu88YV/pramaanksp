import { useState } from 'react';
import { Search, Command, Bell, ChevronRight, CircleDot, Globe, Shield, LogOut, Sun, Moon, Check, Trash2, X, AlertTriangle, AlertCircle } from 'lucide-react';

const titles = {
  overview: { title: 'Command Overview', sub: 'Watch floor', titleKn: 'ಕಮಾಂಡ್ ಮೇಲ್ನೋಟ' },
  cases: { title: 'Case Register', sub: 'Investigate', titleKn: 'ಪ್ರಕರಣಗಳ ನೋಂದಣಿ' },
  alerts: { title: 'Alert Stream', sub: 'Watch floor', titleKn: 'ಎಚ್ಚರಿಕೆ ವಾಹಿನಿ' },
  map: { title: 'Live Crime Map', sub: 'Analyze', titleKn: 'ನೈಜ ಸಮಯದ ಅಪರಾಧ ನಕ್ಷೆ' },
  graph: { title: 'Entity Graph', sub: 'Analyze', titleKn: 'ಸಂಬಂಧಿತ ಜಾಲಲಕ್ಷಣ Graph' },
  similar: { title: 'Case Twin Intelligence', sub: 'Investigate', titleKn: 'ಸಮಾನ ಅಪರಾಧ ಮಾದರಿಗಳು' },
  resolution: { title: 'Identity Resolution', sub: 'Investigate', titleKn: 'ಗುರುತು ದೃಢೀಕರಣ Resolution' },
  history: { title: 'Investigation History', sub: 'Investigate', titleKn: 'ತನಿಖಾ ಇತಿಹಾಸ' },
  assistant: { title: 'AI Investigation Assistant', sub: 'Analyze', titleKn: 'ಎಐ ತನಿಖಾ ಸಹಾಯಕ' },
  audit: { title: 'Audit & Compliance', sub: 'Govern', titleKn: 'ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ನಿಯಮಾವಳಿ' },
  helpdesk: { title: 'Public Help Desk', sub: 'Public', titleKn: 'ಸಾರ್ವಜನಿಕ ಸಹಾಯ ಕೇಂದ್ರ' },
};

const roles = ['SI', 'ACP', 'Analyst', 'Policy'];

const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'Critical Alert: Burglary Cluster', time: '10 mins ago', unread: true, severity: 'critical', desc: 'Indiranagar reported 3 window-forced burglaries.' },
  { id: '2', title: 'Warrant Issued: CANON-0042', time: '1 hour ago', unread: true, severity: 'warning', desc: '1st ACMM Court issued active theft warrant for Mohammed Rafi.' },
  { id: '3', title: 'Identity Merged: AUTO_MERGE', time: '2 hours ago', unread: false, severity: 'info', desc: 'Fellegi-Sunter matched P-101 and P-102 based on phone number.' }
];

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const displayTitle = language === 'KN' ? meta.titleKn : meta.title;
  const unreadCount = notifications.filter((n) => n.unread).length;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-pramaan-border bg-pramaan-bg px-4 py-2 relative z-50">
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
      <div className="ml-auto flex items-center gap-2 relative">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-pramaan-border bg-pramaan-surface text-pramaan-text-secondary hover:text-pramaan-text transition-colors cursor-pointer"
            title="Notifications & Alerts"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pramaan-critical text-[10px] font-mono font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-pramaan-border bg-pramaan-surface shadow-2xl overflow-hidden z-[100]">
              <div className="flex items-center justify-between border-b border-pramaan-border p-3 bg-pramaan-elevated">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-pramaan-primary" />
                  <span className="font-bold text-xs text-pramaan-text">Notifications & Stream Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-pramaan-critical/20 text-pramaan-critical text-[10px] font-mono font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-[10px] text-pramaan-primary hover:underline font-semibold" title="Mark all as read">
                    Mark Read
                  </button>
                  <button onClick={clearAll} className="text-[10px] text-pramaan-critical hover:underline font-semibold" title="Clear notifications">
                    Clear
                  </button>
                  <button onClick={() => setShowNotifications(false)} className="text-pramaan-text-secondary hover:text-pramaan-text ml-1">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-pramaan-border p-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-pramaan-text-secondary">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 transition-colors ${n.unread ? 'bg-pramaan-primary/10' : 'hover:bg-pramaan-elevated/40'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-pramaan-text">{n.title}</span>
                        <span className="text-[10px] font-mono text-pramaan-text-secondary shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-pramaan-text-secondary mt-1 leading-snug">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
