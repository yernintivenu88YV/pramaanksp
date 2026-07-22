import { Bell, ChevronDown, Search, UserCircle2 } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex items-center gap-6 px-8 py-5">
      <div className="relative flex-1 max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-secondary)]" />
        <input
          placeholder="Search FIR, District, Crime Type..."
          className="h-11 w-full rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] pl-11 pr-4 text-sm text-white placeholder:text-[color:var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/60"
        />
      </div>

      <div className="ml-auto flex items-center gap-5">
        <button className="relative grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] hover:bg-white/5 transition">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#EB5757] text-[10px] font-bold">
            5
          </span>
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] px-3 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#2F80ED]/15 text-[#2F80ED]">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold">Admin Officer</div>
            <div className="text-[11px] text-[color:var(--color-text-secondary)]">Super Admin</div>
          </div>
          <ChevronDown className="h-4 w-4 text-[color:var(--color-text-secondary)]" />
        </div>
      </div>
    </header>
  );
}
