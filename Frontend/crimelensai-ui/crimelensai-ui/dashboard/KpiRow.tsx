import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { FileText, FolderOpen, Gavel, Fingerprint, AlertTriangle } from "lucide-react";

type Variant = "blue" | "green" | "orange" | "purple" | "red";

const styles: Record<
  Variant,
  { grad: string; ring: string; icon: string; iconBg: string; delta: string }
> = {
  blue: {
    grad: "from-[#1E4A8A]/60 to-[#0D2747]",
    ring: "ring-[#2F80ED]/40",
    icon: "text-[#5FA8FF]",
    iconBg: "bg-[#2F80ED]/15",
    delta: "text-[#5FA8FF]",
  },
  green: {
    grad: "from-[#134E36]/70 to-[#0D2747]",
    ring: "ring-[#27AE60]/40",
    icon: "text-[#27AE60]",
    iconBg: "bg-[#27AE60]/15",
    delta: "text-[#27AE60]",
  },
  orange: {
    grad: "from-[#6E3B12]/70 to-[#0D2747]",
    ring: "ring-[#F2994A]/40",
    icon: "text-[#F2994A]",
    iconBg: "bg-[#F2994A]/15",
    delta: "text-[#F2994A]",
  },
  purple: {
    grad: "from-[#3E1E6E]/70 to-[#0D2747]",
    ring: "ring-[#9B51E0]/40",
    icon: "text-[#B47CF0]",
    iconBg: "bg-[#9B51E0]/15",
    delta: "text-[#B47CF0]",
  },
  red: {
    grad: "from-[#5A1D1D]/70 to-[#0D2747]",
    ring: "ring-[#EB5757]/40",
    icon: "text-[#EB5757]",
    iconBg: "bg-[#EB5757]/15",
    delta: "text-[#EB5757]",
  },
};

function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.4, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

const inFormat = new Intl.NumberFormat("en-IN").format;

interface KpiProps {
  variant: Variant;
  label: string;
  value: number;
  delta: string;
  icon: LucideIcon;
  index: number;
  deltaColor?: string;
}

function KpiCard({ variant, label, value, delta, icon: Icon, index, deltaColor }: KpiProps) {
  const s = styles[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-gradient-to-br ${s.grad} p-5 ring-1 ${s.ring} shadow-[0_10px_30px_rgba(0,0,0,0.35)]`}
    >
      <div className="flex items-start gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${s.iconBg}`}>
          <Icon className={`h-6 w-6 ${s.icon}`} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[color:var(--color-text-secondary)]">
            {label}
          </div>
          <div className="mt-1 text-[26px] font-extrabold leading-tight tabular-nums">
            <AnimatedNumber value={value} format={inFormat} />
          </div>
          <div className={`mt-1 text-[11px] font-medium ${deltaColor ?? s.delta}`}>{delta}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function KpiRow() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        index={0}
        variant="blue"
        label="TOTAL FIRs"
        value={215430}
        delta="+12.5% from last month"
        icon={FileText}
      />
      <KpiCard
        index={1}
        variant="green"
        label="ACTIVE CASES"
        value={58234}
        delta="+8.3% from last month"
        icon={FolderOpen}
      />
      <KpiCard
        index={2}
        variant="orange"
        label="SOLVED CASES"
        value={156782}
        delta="+15.7% from last month"
        icon={Gavel}
      />
      <KpiCard
        index={3}
        variant="purple"
        label="TOTAL ARRESTS"
        value={38219}
        delta="+10.2% from last month"
        icon={Fingerprint}
      />
      <KpiCard
        index={4}
        variant="red"
        label="RISK ALERTS"
        value={12}
        delta="High Priority"
        icon={AlertTriangle}
        deltaColor="text-[#EB5757]"
      />
    </div>
  );
}
