import { ChevronDown } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis } from "recharts";

const predData = [
  { d: "May 20", v: 240 },
  { d: "May 27", v: 260 },
  { d: "Jun 03", v: 255 },
  { d: "Jun 10", v: 290 },
  { d: "Jun 17", v: 320 },
];

function Select({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] text-[color:var(--color-text-secondary)]">{label}</div>
      <div className="flex items-center justify-between rounded-lg bg-white/[0.04] border border-[color:var(--color-border)] px-3 py-2 text-sm">
        <span>{value}</span>
        <ChevronDown className="h-4 w-4 text-[color:var(--color-text-secondary)]" />
      </div>
    </label>
  );
}

export function PredictionCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[15px] font-bold">PREDICTION</h3>
        <span className="text-xs text-[color:var(--color-text-secondary)]">(Next 30 Days)</span>
      </div>

      <div className="mt-4 space-y-3">
        <Select label="Select District" value="Bengaluru Urban" />
        <Select label="Select Crime Type" value="Theft" />
      </div>

      <div className="mt-4 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] p-4">
        <div className="text-[11px] font-semibold tracking-widest text-[color:var(--color-text-secondary)]">
          PREDICTION RESULT
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] text-[color:var(--color-text-secondary)]">Expected Cases</div>
            <div className="mt-1 text-xl font-extrabold text-[#EB5757]">320</div>
          </div>
          <div>
            <div className="text-[10px] text-[color:var(--color-text-secondary)]">Risk Level</div>
            <div className="mt-1 text-xl font-extrabold text-[#EB5757]">HIGH</div>
          </div>
          <div>
            <div className="text-[10px] text-[color:var(--color-text-secondary)]">Confidence</div>
            <div className="mt-1 text-xl font-extrabold text-[#EB5757]">91%</div>
          </div>
        </div>
        <div className="mt-2 h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predData} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
              <XAxis dataKey="d" stroke="#7A8BA0" fontSize={10} tickLine={false} axisLine={false} />
              <Line
                type="monotone"
                dataKey="v"
                stroke="#2F80ED"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2F80ED" }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
