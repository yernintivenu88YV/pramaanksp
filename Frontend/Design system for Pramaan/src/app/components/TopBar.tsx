import { useState } from "react";
import { Search, Sparkles, Command, Bell, SlidersHorizontal, Plus, ChevronRight, CircleDot } from "lucide-react";
import { type } from "./ui/scale";

const titles: Record<string, { title: string; sub: string }> = {
  overview: { title: "Command Overview", sub: "Watch floor" },
  cases: { title: "Case Register", sub: "Investigate" },
  alerts: { title: "Alert Stream", sub: "Watch floor" },
  graph: { title: "Entity Graph", sub: "Analyze" },
  similar: { title: "Similar Case Intelligence", sub: "Investigate" },
  resolution: { title: "Identity Resolution", sub: "Investigate" },
  timeline: { title: "Event Timeline", sub: "Analyze" },
  audit: { title: "Audit & Compliance", sub: "Govern" },
};

export function TopBar({ view }: { view: string }) {
  const meta = titles[view] ?? titles.overview;
  const [mode, setMode] = useState<"search" | "ask">("search");

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-pramaan-border bg-pramaan-bg px-4">
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-pramaan-text-secondary/70" style={type.eyebrow}>
          {meta.sub.toUpperCase()}
        </span>
        <ChevronRight size={13} className="text-pramaan-text-secondary/40" />
        <span className="truncate text-pramaan-text" style={type.subheading}>
          {meta.title}
        </span>
        <span className="ml-2 hidden items-center gap-1 text-pramaan-success md:flex" style={type.micro}>
          <CircleDot size={10} strokeWidth={2.5} className="animate-pulse" /> LIVE
        </span>
      </div>

      {/* Omni command — the AI is woven into navigation, not a separate chat */}
      <div className="mx-auto hidden w-full max-w-xl items-center gap-1 rounded-md border border-pramaan-border bg-pramaan-surface px-1 py-1 md:flex">
        <div className="flex overflow-hidden rounded bg-pramaan-elevated">
          <ModeBtn on={mode === "search"} onClick={() => setMode("search")} icon={Search} label="Find" />
          <ModeBtn on={mode === "ask"} onClick={() => setMode("ask")} icon={Sparkles} label="Ask AI" />
        </div>
        <input
          placeholder={
            mode === "search"
              ? "Search entities, cases, phones, vehicles…"
              : "Ask: “Who connects PRM-4821 to Vellum LLC?”"
          }
          className="min-w-0 flex-1 bg-transparent px-2 text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/50"
          style={type.body}
        />
        <span className="mr-1 flex items-center gap-0.5 rounded border border-pramaan-border px-1 text-pramaan-text-secondary/60" style={type.micro}>
          <Command size={10} /> K
        </span>
      </div>

      {/* Controls */}
      <div className="ml-auto flex items-center gap-1.5 md:ml-0">
        <IconBtn icon={SlidersHorizontal} />
        <IconBtn icon={Bell} dot />
        <button
          className="flex items-center gap-1.5 rounded-md bg-pramaan-primary px-3 py-1.5 text-pramaan-text transition-colors hover:bg-pramaan-secondary"
          style={type.label}
        >
          <Plus size={15} strokeWidth={2.25} />
          New Case
        </button>
      </div>
    </header>
  );
}

function ModeBtn({ on, onClick, icon: Icon, label }: { on: boolean; onClick: () => void; icon: typeof Search; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
        on ? "bg-pramaan-primary/20 text-pramaan-secondary" : "text-pramaan-text-secondary hover:text-pramaan-text"
      }`}
      style={type.label}
    >
      <Icon size={13} strokeWidth={2} />
      {label}
    </button>
  );
}

function IconBtn({ icon: Icon, dot }: { icon: typeof Bell; dot?: boolean }) {
  return (
    <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-pramaan-border bg-pramaan-surface text-pramaan-text-secondary transition-colors hover:border-pramaan-border-strong hover:text-pramaan-text">
      <Icon size={15} strokeWidth={1.75} />
      {dot && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-pramaan-critical" />}
    </button>
  );
}
