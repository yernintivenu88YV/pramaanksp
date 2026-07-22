import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  FileText,
  MessageSquareText,
  Package,
  HardDrive,
  Highlighter,
  MessageSquare,
  ChevronDown,
  CornerDownRight,
  ImageIcon,
  GitCompareArrows,
  FileSearch,
  Layers,
} from "lucide-react";
import { type } from "../ui/scale";
import { Button, IconButton, ConfidenceTier, StatusChip } from "../ui/controls";
import { Confidence } from "../ui/ai";
import {
  fileTree,
  kindLabel,
  transcript,
  similarCases,
  missingEvidence,
  contradictions,
  officerNotes,
  type EvidenceKind,
  type FileNode,
} from "../../data/workspace";

const kindIcon: Record<EvidenceKind, typeof FileText> = {
  document: FileText,
  statement: MessageSquareText,
  physical: Package,
  digital: HardDrive,
};

export function InvestigationWorkspace({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<FileNode>(fileTree[2]); // Witness A statement
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-pramaan-bg text-pramaan-text">
      {/* Case header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-pramaan-border bg-pramaan-bg px-3">
        <IconButton icon={ArrowLeft} variant="ghost" onClick={onBack} />
        <div className="flex min-w-0 items-center gap-2">
          <span className="tnum font-mono text-pramaan-secondary" style={type.caption}>
            PRM-4821
          </span>
          <span className="truncate text-pramaan-text" style={type.subheading}>
            Cross-border wire structuring ring
          </span>
          <StatusChip status="escalated" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="ghost">Export</Button>
          <Button size="sm" variant="secondary">Share</Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <FileTreeRail selected={selected} onSelect={setSelected} />
        <div className="flex min-w-0 flex-1 flex-col">
          <EvidenceViewer node={selected} />
          <NotesDrawer open={notesOpen} onToggle={() => setNotesOpen((o) => !o)} />
        </div>
        <AiAnalysisRail />
      </div>
    </div>
  );
}

/* ---------------- Left rail — filterable case-file list ---------------- */

function FileTreeRail({ selected, onSelect }: { selected: FileNode; onSelect: (n: FileNode) => void }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | EvidenceKind>("all");

  const grouped = useMemo(() => {
    const filtered = fileTree.filter(
      (f) =>
        (kind === "all" || f.kind === kind) &&
        (q === "" || f.name.toLowerCase().includes(q.toLowerCase()) || f.id.toLowerCase().includes(q.toLowerCase())),
    );
    const order: EvidenceKind[] = ["document", "statement", "physical", "digital"];
    return order
      .map((k) => ({ kind: k, items: filtered.filter((f) => f.kind === k) }))
      .filter((g) => g.items.length > 0);
  }, [q, kind]);

  const kinds: ("all" | EvidenceKind)[] = ["all", "document", "statement", "physical", "digital"];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-pramaan-border bg-pramaan-bg">
      <div className="border-b border-pramaan-border p-3">
        <div className="mb-2 flex items-center gap-2 rounded border border-pramaan-border bg-pramaan-surface px-2">
          <Search size={13} className="text-pramaan-text-secondary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter case files…"
            className="h-8 w-full bg-transparent text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/50"
            style={type.body}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`h-6 rounded px-2 capitalize transition-colors ${
                kind === k ? "bg-pramaan-elevated text-pramaan-text" : "text-pramaan-text-secondary hover:text-pramaan-text"
              }`}
              style={type.micro}
            >
              {k === "all" ? "All" : k}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {grouped.map((g) => {
          const Icon = kindIcon[g.kind];
          return (
            <div key={g.kind} className="mb-3 px-2 last:mb-0">
              <div className="flex items-center gap-1.5 px-1.5 pb-1 text-pramaan-text-secondary" style={type.eyebrow}>
                <Icon size={12} strokeWidth={2} />
                {kindLabel[g.kind].toUpperCase()}
                <span className="tnum ml-auto text-pramaan-text-secondary/50">{g.items.length}</span>
              </div>
              {g.items.map((f) => {
                const on = f.id === selected.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onSelect(f)}
                    className={`flex w-full flex-col rounded px-1.5 py-1.5 text-left transition-colors ${
                      on ? "bg-pramaan-primary/12" : "hover:bg-pramaan-hover"
                    }`}
                  >
                    <span className={`truncate ${on ? "text-pramaan-text" : "text-pramaan-text"}`} style={type.caption}>
                      {f.name}
                    </span>
                    <span className="tnum truncate font-mono text-pramaan-text-secondary" style={type.micro}>
                      {f.id} · {f.meta}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/* ---------------- Center — evidence viewer + annotation layer ---------------- */

function EvidenceViewer({ node }: { node: FileNode }) {
  const [annotate, setAnnotate] = useState(true);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-pramaan-bg">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-pramaan-border px-3">
        <span className="tnum font-mono text-pramaan-secondary" style={type.micro}>
          {node.id}
        </span>
        <span className="truncate text-pramaan-text-secondary" style={type.caption}>
          {node.name}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant={annotate ? "primary" : "ghost"}
            icon={Highlighter}
            onClick={() => setAnnotate((a) => !a)}
          >
            Annotate
          </Button>
          <IconButton icon={Layers} variant="ghost" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          {node.viewer === "transcript" && <TranscriptView annotate={annotate} />}
          {node.viewer === "image" && <ImageView node={node} />}
          {node.viewer === "pdf" && <PdfPlaceholder node={node} />}
        </div>
      </div>
    </div>
  );
}

function TranscriptView({ annotate }: { annotate: boolean }) {
  return (
    <div className="rounded-lg border border-pramaan-border bg-pramaan-surface">
      <div className="border-b border-pramaan-border px-4 py-2.5 text-pramaan-text-secondary" style={type.sectionHeader}>
        Interview Transcript
      </div>
      <div className="divide-y divide-pramaan-border/50">
        {transcript.map((l) => (
          <div
            key={l.n}
            className={`group relative flex gap-3 px-4 py-2 ${
              annotate && l.flagged ? "bg-pramaan-signal/[0.06]" : ""
            }`}
          >
            {annotate && l.flagged && <span className="absolute inset-y-0 left-0 w-0.5 bg-pramaan-signal" />}
            <span className="tnum w-6 shrink-0 pt-0.5 text-right font-mono text-pramaan-text-secondary/50" style={type.micro}>
              {l.n}
            </span>
            <div className="min-w-0">
              <span className="mr-2 text-pramaan-text-secondary" style={{ ...type.micro, fontWeight: 600, letterSpacing: "0.04em" }}>
                {l.speaker}
              </span>
              <span className="text-pramaan-text" style={type.body}>
                {l.text}
              </span>
              {annotate && l.flagged && (
                <span className="ml-2 inline-flex items-center gap-1 align-middle text-pramaan-signal" style={type.micro}>
                  <Highlighter size={10} /> annotated
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageView({ node }: { node: FileNode }) {
  return (
    <div className="relative rounded-lg border border-pramaan-border bg-pramaan-surface">
      <div className="flex aspect-[4/3] items-center justify-center text-pramaan-text-secondary/40">
        <ImageIcon size={48} strokeWidth={1} />
      </div>
      {/* Annotation pins */}
      <Pin x="34%" y="42%" n={1} />
      <Pin x="61%" y="66%" n={2} />
      <div className="border-t border-pramaan-border px-4 py-2 text-pramaan-text-secondary" style={type.micro}>
        {node.name} · 2 annotations
      </div>
    </div>
  );
}

function Pin({ x, y, n }: { x: string; y: string; n: number }) {
  return (
    <span
      className="tnum absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pramaan-signal text-[#0B0D10]"
      style={{ left: x, top: y, fontSize: 10, fontWeight: 700 }}
    >
      {n}
    </span>
  );
}

function PdfPlaceholder({ node }: { node: FileNode }) {
  return (
    <div className="rounded-lg border border-pramaan-border bg-pramaan-surface">
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-pramaan-text-secondary/50">
        <FileText size={40} strokeWidth={1} />
        <span style={type.caption}>{node.name}</span>
        <span className="tnum font-mono" style={type.micro}>{node.meta}</span>
      </div>
    </div>
  );
}

/* ---------------- Right rail — AI Analysis (max 3) ---------------- */

function AiAnalysisRail() {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-pramaan-border bg-pramaan-bg">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-pramaan-border px-3">
        <span className="text-pramaan-text-secondary" style={type.sectionHeader}>
          AI Analysis
        </span>
        <span className="ml-auto text-pramaan-text-secondary/50" style={type.micro}>
          context-triggered
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* 1 — Similar past cases */}
        <AiBlock icon={FileSearch} title="Similar Past Cases">
          <div className="flex flex-col gap-1.5">
            {similarCases.map((c, i) => (
              <div key={c.id} className="rounded border border-pramaan-border bg-pramaan-surface p-2.5">
                <div className="flex items-center gap-2">
                  <span className="tnum text-pramaan-text-secondary/50" style={type.micro}>#{i + 1}</span>
                  <span className="tnum font-mono text-pramaan-secondary" style={type.micro}>{c.id}</span>
                  <span className="ml-auto"><ConfidenceTier score={c.score} /></span>
                </div>
                <div className="mt-1 truncate text-pramaan-text" style={type.caption}>{c.title}</div>
                <div className="mt-0.5 text-pramaan-text-secondary" style={type.micro}>{c.reason}</div>
              </div>
            ))}
          </div>
        </AiBlock>

        {/* 2 — Missing evidence flags */}
        <AiBlock icon={FileSearch} title="Missing Evidence">
          <div className="flex flex-col gap-1.5">
            {missingEvidence.map((m) => (
              <div key={m.id} className="rounded border border-pramaan-border bg-pramaan-surface p-2.5">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-pramaan-signal" />
                  <span className="flex-1 text-pramaan-text" style={type.caption}>{m.flag}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <Confidence score={m.score} />
                </div>
                <div className="mt-1 text-pramaan-text-secondary" style={type.micro}>{m.reason}</div>
              </div>
            ))}
          </div>
        </AiBlock>

        {/* 3 — Detected contradictions (side-by-side) */}
        <AiBlock icon={GitCompareArrows} title="Detected Contradictions">
          <div className="flex flex-col gap-1.5">
            {contradictions.map((c) => (
              <div key={c.id} className="rounded border border-pramaan-border bg-pramaan-surface p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-pramaan-text-secondary" style={type.micro}>{c.reason}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <ConflictLine src={c.a.source} line={c.a.line} />
                  <ConflictLine src={c.b.source} line={c.b.line} tone="b" />
                </div>
                <div className="mt-2"><Confidence score={c.score} /></div>
              </div>
            ))}
          </div>
        </AiBlock>
      </div>
    </aside>
  );
}

function ConflictLine({ src, line, tone = "a" }: { src: string; line: string; tone?: "a" | "b" }) {
  const accent = tone === "a" ? "border-l-pramaan-primary" : "border-l-pramaan-critical";
  return (
    <div className={`rounded border border-pramaan-border border-l-2 ${accent} bg-pramaan-elevated/50 p-2`}>
      <div className="tnum mb-1 truncate font-mono text-pramaan-text-secondary/70" style={type.micro}>{src}</div>
      <div className="text-pramaan-text" style={type.micro}>“{line}”</div>
    </div>
  );
}

function AiBlock({ icon: Icon, title, children }: { icon: typeof FileSearch; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-1.5 text-pramaan-text-secondary" style={type.eyebrow}>
        <Icon size={12} strokeWidth={2} />
        {title.toUpperCase()}
      </div>
      {children}
    </section>
  );
}

/* ---------------- Bottom drawer — threaded officer notes ---------------- */

function NotesDrawer({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="shrink-0 border-t border-pramaan-border bg-pramaan-bg">
      <button
        onClick={onToggle}
        className="flex h-9 w-full items-center gap-2 px-3 text-pramaan-text-secondary transition-colors hover:text-pramaan-text"
      >
        <MessageSquare size={13} strokeWidth={2} />
        <span style={type.sectionHeader}>Officer Notes</span>
        <span className="tnum text-pramaan-text-secondary/50" style={type.micro}>{officerNotes.length} threads</span>
        <ChevronDown size={15} className={`ml-auto transition-transform ${open ? "" : "rotate-180"}`} />
      </button>

      {open && (
        <div className="max-h-56 overflow-y-auto border-t border-pramaan-border p-3">
          <div className="flex flex-col gap-3">
            {officerNotes.map((note) => (
              <div key={note.id} className="flex flex-col gap-2">
                <NoteRow author={note.author} time={note.time} text={note.text} />
                {note.replies?.map((r) => (
                  <div key={r.id} className="ml-6 flex gap-2">
                    <CornerDownRight size={13} className="mt-1 shrink-0 text-pramaan-text-secondary/40" />
                    <NoteRow author={r.author} time={r.time} text={r.text} />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded border border-pramaan-border bg-pramaan-surface px-2">
            <input
              placeholder="Add a note to the log…"
              className="h-8 w-full bg-transparent text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/50"
              style={type.body}
            />
            <Button size="sm" variant="secondary">Log</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteRow({ author, time, text }: { author: string; time: string; text: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-2">
        <span className="text-pramaan-text" style={type.bodyStrong}>{author}</span>
        <span className="tnum font-mono text-pramaan-text-secondary/60" style={type.micro}>{time}</span>
      </div>
      <p className="text-pramaan-text-secondary" style={type.caption}>{text}</p>
    </div>
  );
}
