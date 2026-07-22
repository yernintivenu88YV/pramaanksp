import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-8 pb-10 space-y-5">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
