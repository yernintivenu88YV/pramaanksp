import { useState } from "react";
import { Sparkles, Download, Share2 } from "lucide-react";
import { centerTabs, reportSections, citations, caseMeta } from "../../data/caseFile";
import { ConfidenceBadge, CiteChip } from "./confidence";

export function CenterPanel() {
  const [tab, setTab] = useState<(typeof centerTabs)[number]>("AI Investigation Report");

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-pramaan-bg">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-pramaan-border px-3">
        {centerTabs.map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative shrink-0 px-3 py-3 transition-colors ${
                isActive ? "text-pramaan-text" : "text-pramaan-text-secondary hover:text-pramaan-text"
              }`}
              style={{ fontSize: 13, fontWeight: isActive ? 500 : 400 }}
            >
              {t}
              {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-pramaan-primary" />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "AI Investigation Report" ? (
          <ReportDocument />
        ) : (
          <Placeholder tab={tab} />
        )}
      </div>
    </div>
  );
}

function ReportDocument() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="rounded-xl border border-pramaan-border bg-pramaan-surface">
        <div className="flex items-start justify-between gap-4 border-b border-pramaan-border p-6">
          <div>
            <div className="flex items-center gap-2 text-pramaan-secondary" style={{ fontSize: 12, fontWeight: 500 }}>
              <Sparkles size={15} strokeWidth={1.75} />
              AI Investigation Report
            </div>
            <h2 className="mt-1.5 text-pramaan-text" style={{ fontSize: 20, fontWeight: 600 }}>
              {caseMeta.title}
            </h2>
            <div className="mt-1 text-pramaan-text-secondary" style={{ fontSize: 12 }}>
              {caseMeta.id} · Generated 19 Jul 2026, 14:20 · Model synthesis of {citations.length} sources
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-pramaan-border text-pramaan-text-secondary transition-colors hover:text-pramaan-text">
              <Share2 size={15} strokeWidth={1.75} />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-pramaan-border text-pramaan-text-secondary transition-colors hover:text-pramaan-text">
              <Download size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-7 p-6">
          {reportSections.map((section, i) => (
            <section key={section.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-pramaan-text" style={{ fontSize: 15, fontWeight: 600 }}>
                  {i + 1}. {section.heading}
                </h3>
                <ConfidenceBadge level={section.confidence} short />
              </div>
              <div className="flex flex-col gap-2.5">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-pramaan-text-secondary" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                    <span className="text-pramaan-text/90">{p.text}</span>
                    {p.cites.map((c) => (
                      <CiteChip key={c} n={c} />
                    ))}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <div className="border-t border-pramaan-border pt-5">
            <div className="mb-2 text-pramaan-text-secondary/70" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
              CITATIONS
            </div>
            <ol className="flex flex-col gap-1.5">
              {citations.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded bg-pramaan-primary/15 px-1 text-pramaan-secondary"
                    style={{ fontSize: 9, fontWeight: 600 }}
                  >
                    {c.id}
                  </span>
                  <span className="text-pramaan-text-secondary" style={{ fontSize: 12 }}>
                    <span className="text-pramaan-text">{c.source}</span> — {c.ref}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ tab }: { tab: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-pramaan-text-secondary">
      <Sparkles size={22} strokeWidth={1.5} />
      <div style={{ fontSize: 14, fontWeight: 500 }} className="text-pramaan-text">
        {tab}
      </div>
      <div style={{ fontSize: 12 }}>This panel is part of the workspace — content pending.</div>
    </div>
  );
}
