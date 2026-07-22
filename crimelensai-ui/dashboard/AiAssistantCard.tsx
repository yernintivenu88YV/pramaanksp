import { Bot, Send } from "lucide-react";

const chips = [
  "Show cyber crime cases in Bengaluru last month",
  "Which district has highest theft cases?",
  "Show solved vs unsolved cases trend",
];

export function AiAssistantCard() {
  return (
    <div className="glass-card p-5 flex flex-col">
      <h3 className="text-[15px] font-bold">AI ASSISTANT</h3>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] p-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#2F80ED]/20 text-[#2F80ED]">
          <Bot className="h-5 w-5" />
        </div>
        <input
          placeholder="Ask me anything about crime data..."
          className="flex-1 bg-transparent text-sm placeholder:text-[color:var(--color-text-secondary)] focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            className="rounded-lg border border-[color:var(--color-border)] bg-white/[0.03] px-3 py-1.5 text-[11px] text-[color:var(--color-text-secondary)] hover:bg-white/[0.06] hover:text-white transition"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-3 py-2.5">
          <input
            placeholder="Type your question here..."
            className="flex-1 bg-transparent text-sm placeholder:text-[color:var(--color-text-secondary)] focus:outline-none"
          />
          <button className="grid h-8 w-8 place-items-center rounded-lg bg-[#2F80ED] hover:bg-[#2F80ED]/90 transition">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
