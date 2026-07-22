import { motion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BarChart3,
  Map,
  Sparkles,
  Bot,
  Bell,
  FileText,
  UserX,
  Search,
  Building2,
  Users,
  Settings,
  LogOut,
  Shield,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { formatDate, formatTime, useLiveClock } from "@/lib/use-clock";

type NavItem = { icon: LucideIcon; label: string; to: string };

const nav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: BarChart3, label: "Crime Analysis", to: "/crime-analysis" },
  { icon: Map, label: "Crime Heatmap", to: "/heatmap" },
  { icon: Sparkles, label: "Prediction", to: "/prediction" },
  { icon: Bot, label: "AI Assistant", to: "/ai-assistant" },
  { icon: Bell, label: "Alerts", to: "/alerts" },
  { icon: FileText, label: "Reports", to: "/reports" },
  { icon: UserX, label: "Repeat Offenders", to: "/repeat-offenders" },
  { icon: Search, label: "Search FIR", to: "/search-fir" },
  { icon: Building2, label: "Police Stations", to: "/police-stations" },
  { icon: Users, label: "Users", to: "/users" },
  { icon: Settings, label: "Settings", to: "/settings" },
  { icon: LogOut, label: "Logout", to: "/logout" },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const now = useLiveClock();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-[color:var(--color-sidebar)] border-r border-[color:var(--color-border)] px-4 py-5 sticky top-0">
      <Link to="/" className="flex items-center gap-3 px-2 mb-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#F2C94C] to-[#F2994A] shadow-lg">
          <Shield className="h-6 w-6 text-[#3a1f00]" />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold tracking-wide truncate">SCRB KARNATAKA</div>
          <div className="text-[11px] text-[color:var(--color-text-secondary)] truncate">
            State Crime Records Bureau
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin -mx-1 px-1">
        {nav.map(({ icon: Icon, label, to }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={label}
              to={to}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#2F80ED] text-white shadow-[0_6px_20px_rgba(47,128,237,0.35)]"
                  : "text-[color:var(--color-text-secondary)] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex items-center gap-3 p-3"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#2F80ED]/15 text-[#2F80ED]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-extrabold leading-tight">1100+</div>
            <div className="text-[11px] text-[color:var(--color-text-secondary)] leading-tight">
              Police Stations
              <br />
              Connected
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card flex items-center gap-3 p-3"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#27AE60]/15 text-[#27AE60]">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-extrabold leading-tight tabular-nums" suppressHydrationWarning>
              {now ? formatTime(now) : "--:-- --"}
            </div>
            <div className="text-[11px] text-[color:var(--color-text-secondary)] leading-tight" suppressHydrationWarning>
              {now ? formatDate(now) : "\u00a0"}
            </div>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
