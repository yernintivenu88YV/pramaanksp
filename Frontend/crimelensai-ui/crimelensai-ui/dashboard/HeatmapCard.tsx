import { motion } from "framer-motion";
import { ChevronRight, ShieldAlert } from "lucide-react";

// Stylized Karnataka heatmap built from an SVG grid of "districts".
const cells = [
  // rough silhouette rows: [x, y, risk]  risk: 0 low, 1 med, 2 high, 3 extreme
  [4, 0, 0], [5, 0, 1], [6, 0, 0],
  [3, 1, 1], [4, 1, 1], [5, 1, 2], [6, 1, 1], [7, 1, 0],
  [2, 2, 0], [3, 2, 1], [4, 2, 2], [5, 2, 3], [6, 2, 2], [7, 2, 1], [8, 2, 0],
  [1, 3, 0], [2, 3, 1], [3, 3, 2], [4, 3, 3], [5, 3, 3], [6, 3, 2], [7, 3, 1], [8, 3, 1],
  [1, 4, 1], [2, 4, 2], [3, 4, 3], [4, 4, 3], [5, 4, 2], [6, 4, 1], [7, 4, 1], [8, 4, 0],
  [2, 5, 1], [3, 5, 2], [4, 5, 3], [5, 5, 2], [6, 5, 1], [7, 5, 0],
  [3, 6, 1], [4, 6, 2], [5, 6, 2], [6, 6, 1],
  [4, 7, 1], [5, 7, 1],
] as const;

const riskColors = ["#27AE60", "#F2C94C", "#F2994A", "#EB5757"];

export function HeatmapCard() {
  return (
    <div className="glass-card p-5">
      <h3 className="text-[15px] font-bold">KARNATAKA CRIME HEATMAP</h3>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-[1fr_240px]">
        <div className="relative">
          <motion.svg
            viewBox="0 0 10 8"
            className="w-full h-[280px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {cells.map(([x, y, r], i) => (
              <motion.rect
                key={i}
                x={x + 0.05}
                y={y + 0.05}
                width={0.9}
                height={0.9}
                rx={0.15}
                fill={riskColors[r]}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.9, scale: 1 }}
                transition={{ delay: i * 0.015 }}
              />
            ))}
          </motion.svg>

          <ul className="mt-2 flex flex-wrap gap-4 text-xs">
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#EB5757]" /> High Risk
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#F2994A]" /> Medium Risk
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#27AE60]" /> Low Risk
            </li>
          </ul>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-[color:var(--color-border)] p-4">
          <div className="text-sm font-semibold">BENGALURU URBAN</div>
          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#EB5757]/15 px-2 py-0.5 text-[10px] font-bold text-[#EB5757]">
            <ShieldAlert className="h-3 w-3" /> HIGH RISK
          </span>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-[11px] text-[color:var(--color-text-secondary)]">
                Crime Risk Score
              </div>
              <div className="text-2xl font-extrabold text-[#EB5757]">89% ↑</div>
              <div className="text-[11px] text-[#27AE60]">↑ 12% from last month</div>
            </div>
            <div>
              <div className="text-[11px] text-[color:var(--color-text-secondary)]">
                Most Common Crime
              </div>
              <div className="font-semibold">Theft</div>
            </div>
            <div>
              <div className="text-[11px] text-[color:var(--color-text-secondary)]">
                Last 7 Days Cases
              </div>
              <div className="font-semibold">452</div>
            </div>
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg bg-[#2F80ED] py-2 text-xs font-semibold hover:bg-[#2F80ED]/90 transition">
            View District Details <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
