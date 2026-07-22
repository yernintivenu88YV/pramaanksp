import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { useState } from "react";

function Toggle({ initial = false }: { initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button onClick={() => setOn((v) => !v)} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-[#2F80ED]" : "bg-white/10"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — CrimeLensAI" },
      { name: "description", content: "Configure CrimeLensAI notifications, security and preferences." },
    ],
  }),
});

function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Preferences, notifications and security" />
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="text-[15px] font-bold">PROFILE</h3>
          <div className="mt-4 space-y-3">
            {[["Full Name", "Admin Officer"], ["Email", "admin@scrb.kar.gov.in"], ["Role", "Super Admin"], ["Department", "State Crime Records Bureau"]].map(([l, v]) => (
              <label key={l} className="block">
                <div className="mb-1 text-[11px] text-[color:var(--color-text-secondary)]">{l}</div>
                <input defaultValue={v} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/60" />
              </label>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-[15px] font-bold">NOTIFICATIONS</h3>
          <ul className="mt-4 space-y-4">
            {[
              ["Critical crime alerts", true],
              ["Weekly report emails", true],
              ["AI prediction notifications", false],
              ["System maintenance updates", true],
              ["New user registrations", false],
            ].map(([label, def]) => (
              <li key={String(label)} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Toggle initial={def as boolean} />
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-[15px] font-bold">SECURITY</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="text-[11px] text-[color:var(--color-text-secondary)]">Two-factor authentication</div>
              <div className="mt-1 text-sm font-semibold text-[#27AE60]">Enabled</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="text-[11px] text-[color:var(--color-text-secondary)]">Last password change</div>
              <div className="mt-1 text-sm font-semibold">12 days ago</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="text-[11px] text-[color:var(--color-text-secondary)]">Active sessions</div>
              <div className="mt-1 text-sm font-semibold">3 devices</div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
