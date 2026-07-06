import { useState } from 'react';
import { Search, Command, Bell, ChevronRight, Globe, Shield, LogOut, Sun, Moon, Check, Trash2, X, Plus, LayoutGrid, SlidersHorizontal, Lock, Zap } from 'lucide-react';

const titles = {
  overview: { title: 'Command Overview', sub: 'WATCH FLOOR', titleKn: 'ಕಮಾಂಡ್ ಮೇಲ್ನೋಟ' },
  cases: { title: 'Case Register', sub: 'INVESTIGATE', titleKn: 'ಪ್ರಕರಣಗಳ ನೋಂದಣಿ' },
  alerts: { title: 'Alert Stream', sub: 'WATCH FLOOR', titleKn: 'ಎಚ್ಚರಿಕೆ ವಾಹಿನಿ' },
  map: { title: 'Live Crime Map', sub: 'ANALYZE', titleKn: 'ನೈಜ ಸಮಯದ ಅಪರಾಧ ನಕ್ಷೆ' },
  graph: { title: 'Entity Graph', sub: 'ANALYZE', titleKn: 'ಸಂಬಂಧಿತ ಜಾಲಲಕ್ಷಣ Graph' },
  similar: { title: 'Case Twin Intelligence', sub: 'INVESTIGATE', titleKn: 'ಸಮಾನ ಅಪರಾಧ ಮಾದರಿಗಳು' },
  resolution: { title: 'Identity Resolution', sub: 'INVESTIGATE', titleKn: 'ಗುರುತು ದೃಢೀಕರಣ Resolution' },
  fingerprint: { title: 'Fingerprint Match', sub: 'INVESTIGATE', titleKn: 'ಫಿಂಗರ್‌ಪ್ರಿಂಟ್ ಹೊಂದಾಣಿಕೆ' },
  facerec: { title: 'Facial Forensics & 3D Pose Mesh', sub: 'INVESTIGATE', titleKn: 'ಮುಖ ಗುರುತಿಸುವಿಕೆ ಫೋರೆನ್ಸಿಕ್' },
  history: { title: 'Investigation History', sub: 'INVESTIGATE', titleKn: 'ತನಿಖಾ ಇತಿಹಾಸ' },
  assistant: { title: 'AI Investigation Assistant', sub: 'ANALYZE', titleKn: 'ಎಐ ತನಿಖಾ ಸಹಾಯಕ' },
  docsearch: { title: 'docsearch', sub: 'ANALYZE', titleKn: 'ದಸ್ತಾವೇಜು ಹುಡುಕಾಟ' },
  docupload: { title: 'docupload', sub: 'ANALYZE', titleKn: 'ದಸ್ತಾವೇಜು ಅಪ್‌ಲೋಡ್' },
  audit: { title: 'Audit & Compliance', sub: 'GOVERN', titleKn: 'ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ನಿಯಮಾವಳಿ' },
  helpdesk: { title: 'Public Help Desk', sub: 'PUBLIC PORTAL', titleKn: 'ಸಾರ್ವಜನಿಕ ಸಹಾಯ ಕೇಂದ್ರ' },
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
  language = 'EN',
  onLanguageToggle,
  onOpenCommandPalette
}) {
  const meta = titles[view] || { title: view, sub: 'ANALYZE', titleKn: view };
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const displayTitle = language === 'KN' ? meta.titleKn : meta.title;
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="flex min-h-[60px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#B3E3DE] bg-[#FEFFFF] px-5 py-2.5 relative z-40 text-[#17252A] select-none shadow-xs font-sans">
      
      {/* Left Breadcrumbs & LIVE ENGINE Badge */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="text-[#2B7A78] uppercase text-[10px] font-mono font-extrabold tracking-widest">
          {meta.sub}
        </span>
        <ChevronRight size={14} className="text-[#2B7A78]/50" />
        <span className="truncate text-[#17252A] font-black text-sm sm:text-base tracking-tight">
          {displayTitle}
        </span>
        
        {/* LIVE ENGINE Pill Badge */}
        <span className="ml-2 hidden sm:flex items-center gap-1.5 text-[#2B7A78] text-[10px] font-mono font-bold bg-[#DEF2F1] px-3 py-1 rounded-full border border-[#3AAFA9]/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#3AAFA9] animate-pulse" /> LIVE ENGINE
        </span>
      </div>

      {/* Center Search Input Bar (⌘K Search Trigger) */}
      <div
        onClick={onOpenCommandPalette}
        className="order-3 flex w-full max-w-sm sm:max-w-md items-center gap-2.5 rounded-2xl border border-[#B3E3DE] bg-[#DEF2F1] px-4 py-2 cursor-pointer hover:border-[#3AAFA9] transition-all md:order-none shadow-xs active:scale-[0.99]"
      >
        <Search className="w-4 h-4 text-[#2B7A78] shrink-0" />
        <span className="flex-1 text-xs text-[#2B7A78] font-sans truncate font-semibold">
          {language === 'KN'
            ? 'ಹುಡುಕಿ ಪ್ರಕರಣಗಳು, ಅಪರಾಧಿಗಳು (⌘K)...'
            : 'Search cases, suspects, or jump to view (⌘K)...'}
        </span>
        <span className="hidden items-center gap-1 rounded-lg bg-[#FEFFFF] border border-[#B3E3DE] px-2 py-0.5 text-[10px] font-mono font-bold text-[#17252A] sm:flex">
          <Command size={10} /> K
        </span>
      </div>

      {/* Right Controls Area: All Header Buttons & Controls */}
      <div className="ml-auto flex items-center gap-2 relative flex-wrap">
        
        {/* 1. Notifications Bell Button with Active Count Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#B3E3DE] bg-[#FEFFFF] text-[#2B7A78] hover:text-[#17252A] hover:bg-[#DEF2F1] transition-all cursor-pointer shadow-xs active:scale-95"
            title="Notifications & Stream Alerts"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3AAFA9] text-[10px] font-mono font-bold text-[#17252A] shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-84 sm:w-[420px] max-w-[92vw] rounded-2xl border border-[#B3E3DE] bg-[#FEFFFF] shadow-2xl overflow-hidden z-[3000]">
              <div className="border-b border-[#B3E3DE] p-4 bg-[#DEF2F1] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3AAFA9] text-[#17252A]">
                      <Bell size={14} />
                    </div>
                    <span className="font-bold text-xs text-[#17252A]">Notifications & Stream Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#3AAFA9] text-[#17252A] text-[10px] font-mono font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-lg text-[#2B7A78] hover:text-[#17252A] hover:bg-[#B3E3DE]/40 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#B3E3DE] p-2 bg-[#FEFFFF]">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl hover:bg-[#DEF2F1]/50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#17252A]">{n.title}</span>
                      <span className="text-[10px] font-mono text-[#2B7A78] font-semibold">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#2B7A78] mt-1 font-medium">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Language Toggle Button (🌐 EN / KN) */}
        <button
          onClick={onLanguageToggle}
          className="flex h-9 items-center gap-1.5 rounded-full border border-[#B3E3DE] bg-[#FEFFFF] text-[#2B7A78] hover:bg-[#DEF2F1] px-3 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          title="Toggle Language (English / Kannada)"
        >
          <Globe size={14} className="text-[#3AAFA9]" />
          <span>{language}</span>
        </button>

        {/* 3. Theme Toggle Button (☀️ / 🌙) */}
        <button
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B3E3DE] bg-[#FEFFFF] text-[#2B7A78] hover:bg-[#DEF2F1] transition-all cursor-pointer shadow-xs active:scale-95"
          title="Toggle UI Theme"
        >
          {isDarkTheme ? <Moon size={15} className="text-[#3AAFA9]" /> : <Sun size={15} className="text-[#2B7A78]" />}
        </button>

        {/* 4. Role Selector Dropdown */}
        <div className="flex items-center gap-1 bg-[#DEF2F1] p-1 rounded-full border border-[#B3E3DE] shadow-xs">
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="h-7 rounded-full bg-transparent px-3 text-xs font-mono font-bold text-[#17252A] outline-none cursor-pointer"
            title="Switch Clearance Role"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-[#FEFFFF] text-[#17252A]">
                Role: {r}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Role Access Badge */}
        <span className="hidden xl:flex items-center gap-1 text-[10px] font-mono font-bold text-[#2B7A78] bg-[#DEF2F1] px-2.5 py-1.5 rounded-full border border-[#B3E3DE] shadow-xs">
          <Shield size={12} className="text-[#3AAFA9]" /> Role Access
        </span>

        {/* 6. Lock / Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex h-9 items-center gap-1.5 rounded-full border border-[#B3E3DE] bg-[#FEFFFF] text-[#2B7A78] hover:text-red-600 hover:bg-red-50 px-3 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Lock & Sign Out"
          >
            <Lock size={14} />
            <span className="hidden sm:inline">Lock</span>
          </button>
        )}

        {/* 7. + NEW CASE Primary Dark Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 items-center gap-1.5 rounded-full bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] border border-[#3AAFA9]/40 px-4 text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Plus size={14} className="text-[#3AAFA9]" />
          <span>+ NEW CASE</span>
        </button>

      </div>
    </header>
  );
}
