import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/dashboard/AppShell";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
  head: () => ({
    meta: [
      { title: "Sign out — CrimeLensAI" },
      { name: "description", content: "Sign out of CrimeLensAI." },
    ],
  }),
});

function LogoutPage() {
  return (
    <AppShell>
      <div className="grid min-h-[60vh] place-items-center">
        <div className="glass-card p-10 text-center max-w-md">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EB5757]/15 text-[#EB5757]">
            <LogOut className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">Sign out</h1>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
            You are about to end your CrimeLensAI session. Any unsaved work will be lost.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/" className="rounded-lg bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Cancel</Link>
            <button className="rounded-lg bg-[#EB5757] px-4 py-2 text-sm font-semibold hover:bg-[#EB5757]/90">Confirm sign out</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
