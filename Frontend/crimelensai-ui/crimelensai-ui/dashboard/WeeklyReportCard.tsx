export function WeeklyReportCard() {
  return (
    <div className="glass-card p-5">
      <h3 className="text-[15px] font-bold">WEEKLY REPORT SUMMARY</h3>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] text-[color:var(--color-text-secondary)]">Total FIRs</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums">3,254</div>
          <div className="text-[11px] text-[#27AE60]">+9.4%</div>
        </div>
        <div>
          <div className="text-[11px] text-[color:var(--color-text-secondary)]">Solved Cases</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums text-[#27AE60]">2,874</div>
          <div className="text-[11px] text-[#27AE60]">+11.2%</div>
        </div>
        <div>
          <div className="text-[11px] text-[color:var(--color-text-secondary)]">Pending Cases</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums text-[#F2994A]">380</div>
          <div className="text-[11px] text-[#EB5757]">-4.2%</div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[color:var(--color-border)] pt-3 text-sm">
        <span className="text-[color:var(--color-text-secondary)]">Most Affected District</span>
        <span className="font-semibold">Bengaluru Urban</span>
      </div>
    </div>
  );
}
