import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const trendData = [
  { m: "Jun", v: 15000 },
  { m: "Jul", v: 17000 },
  { m: "Aug", v: 19500 },
  { m: "Sep", v: 18200 },
  { m: "Oct", v: 22000 },
  { m: "Nov", v: 24500 },
  { m: "Dec", v: 26000 },
  { m: "Jan", v: 32000 },
  { m: "Feb", v: 27000 },
  { m: "Mar", v: 29500 },
  { m: "Apr", v: 26500 },
  { m: "May", v: 28500 },
];

const distData = [
  { name: "Theft", value: 32.6, color: "#2F80ED" },
  { name: "Cyber Crime", value: 18.7, color: "#27AE60" },
  { name: "Assault", value: 16.1, color: "#F2994A" },
  { name: "Robbery", value: 12.4, color: "#9B51E0" },
  { name: "Murder", value: 8.7, color: "#EB5757" },
  { name: "Others", value: 11.5, color: "#556784" },
];

const districts = [
  { name: "Bengaluru City", value: 45231, color: "#2F80ED", pct: 100 },
  { name: "Mysuru", value: 22134, color: "#27AE60", pct: 49 },
  { name: "Hubballi Dharwad", value: 18765, color: "#F2994A", pct: 41 },
  { name: "Belagavi", value: 15423, color: "#9B51E0", pct: 34 },
  { name: "Shivamogga", value: 12334, color: "#EB5757", pct: 27 },
];

export function CrimeTrendCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[15px] font-bold">CRIME TREND</h3>
        <span className="text-xs text-[color:var(--color-text-secondary)]">(Last 12 Months)</span>
      </div>
      <div className="mt-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="crimeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F80ED" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2F80ED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="m"
              stroke="#7A8BA0"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#7A8BA0"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v / 1000}K`}
              domain={[0, 40000]}
              ticks={[0, 10000, 20000, 30000, 40000]}
            />
            <Tooltip
              contentStyle={{
                background: "#0D2747",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#2F80ED"
              strokeWidth={2.5}
              fill="url(#crimeArea)"
              dot={{ r: 3, fill: "#2F80ED", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={1400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CrimeDistributionCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[15px] font-bold">CRIME DISTRIBUTION</h3>
        <span className="text-xs text-[color:var(--color-text-secondary)]">(By Type)</span>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distData}
                dataKey="value"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={2}
                stroke="none"
                animationDuration={1200}
              >
                {distData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-xl font-extrabold tabular-nums">2,15,430</div>
              <div className="text-[11px] text-[color:var(--color-text-secondary)]">Total</div>
            </div>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-sm">
          {distData.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="text-[color:var(--color-text-secondary)]">{d.name}</span>
              </span>
              <span className="font-semibold tabular-nums">{d.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TopDistrictsCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[15px] font-bold">TOP 5 DISTRICTS</h3>
        <span className="text-xs text-[color:var(--color-text-secondary)]">(By Crimes)</span>
      </div>
      <ul className="mt-4 space-y-4">
        {districts.map((d) => (
          <li key={d.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-[color:var(--color-text-secondary)]">{d.name}</span>
              <span className="font-semibold tabular-nums">{d.value.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${d.pct}%`, background: d.color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
