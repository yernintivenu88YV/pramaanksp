import { AlertTriangle, Flame, MapPin, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const alerts: Array<{
  icon: LucideIcon;
  color: string;
  title: string;
  location: string;
  time: string;
}> = [
  {
    icon: ShieldAlert,
    color: "#EB5757",
    title: "Cyber Crime cases increased",
    location: "by 28% in Bengaluru City",
    time: "10 minutes ago",
  },
  {
    icon: AlertTriangle,
    color: "#F2994A",
    title: "Theft cases increased",
    location: "by 14% in Mysuru",
    time: "25 minutes ago",
  },
  {
    icon: MapPin,
    color: "#F2C94C",
    title: "New Crime Hotspot detected",
    location: "in Hubballi Dharwad",
    time: "1 hour ago",
  },
  {
    icon: Flame,
    color: "#9B51E0",
    title: "Fraud cases reported",
    location: "in Belagavi increased",
    time: "2 hours ago",
  },
];

export function LiveAlertsCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">LIVE ALERTS</h3>
        <button className="text-xs text-[#2F80ED] font-semibold hover:underline">View All</button>
      </div>

      <ul className="mt-4 space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
        {alerts.map((a, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] p-3 hover:bg-white/[0.06] transition cursor-pointer"
          >
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
              style={{ background: `${a.color}25`, color: a.color }}
            >
              <a.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">{a.title}</div>
              <div className="text-[11px] text-[color:var(--color-text-secondary)] leading-tight mt-0.5">
                {a.location}
              </div>
              <div className="text-[10px] text-[color:var(--color-text-secondary)]/70 mt-1">
                {a.time}
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
