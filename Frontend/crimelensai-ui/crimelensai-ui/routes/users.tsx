import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/dashboard/AppShell";
import { UserCircle2 } from "lucide-react";

const users = [
  { name: "Admin Officer", role: "Super Admin", email: "admin@scrb.kar.gov.in", status: "Online" },
  { name: "Ravi Kumar", role: "Investigator", email: "ravi.k@scrb.kar.gov.in", status: "Online" },
  { name: "Priya Nair", role: "Analyst", email: "priya.n@scrb.kar.gov.in", status: "Away" },
  { name: "Suresh Rao", role: "Station In-charge", email: "suresh.r@scrb.kar.gov.in", status: "Offline" },
  { name: "Anitha Shetty", role: "Cyber Cell Lead", email: "anitha.s@scrb.kar.gov.in", status: "Online" },
  { name: "Manjunath H.", role: "Field Officer", email: "manjunath.h@scrb.kar.gov.in", status: "Offline" },
];

const statusColor: Record<string, string> = { Online: "#27AE60", Away: "#F2C94C", Offline: "#7A8BA0" };

export const Route = createFileRoute("/users")({
  component: UsersPage,
  head: () => ({
    meta: [
      { title: "Users — CrimeLensAI" },
      { name: "description", content: "SCRB Karnataka user and role management." },
    ],
  }),
});

function UsersPage() {
  return (
    <AppShell>
      <PageHeader title="Users" subtitle="Officers and analysts with platform access" />
      <div className="glass-card p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--color-text-secondary)]">
              <th className="pb-3">Name</th><th className="pb-3">Role</th><th className="pb-3">Email</th><th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="py-3 flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#2F80ED]/15 text-[#2F80ED]"><UserCircle2 className="h-5 w-5" /></div>
                  <span className="font-semibold">{u.name}</span>
                </td>
                <td className="py-3 text-[color:var(--color-text-secondary)]">{u.role}</td>
                <td className="py-3 text-[color:var(--color-text-secondary)]">{u.email}</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: statusColor[u.status] }} />
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
