# KSP Crime Intelligence Platform — Technical Roadmap: Stack, Algorithms & Engineering Practices

*Companion to the Solution Breakdown. That document covers the concept, differentiation, and phased plan. This one covers the how: what to install, which algorithm to use where and why, and how to build it so it holds up under a judge's follow-up question.*

---

## 1. Recommended tech stack, concretely

### Runtime split

Catalyst Functions support Java, Node.js, and Python side by side in the same project. Split by workload rather than picking one language for everything:

- **Python (3.12 or 3.13)** for anything ML/NLP-heavy — entity resolution, embeddings, case-signature matching, QuickML integration. Python's library ecosystem for exactly this kind of work is simply deeper.
- **Node.js (20 or 22) / TypeScript** for the gateway-facing API layer, request routing, and glue logic — and for the Slate frontend, which is React-based.

### Concrete libraries and tools

| Need | Tool | Why this one |
|---|---|---|
| Entity resolution — deterministic pass | Regex-normalized exact match on structured fields | No library needed; normalize phone/vehicle-reg formatting first, then compare |
| Entity resolution — fuzzy/probabilistic pass | `rapidfuzz` (fast C++-backed string distance) for pairwise scoring; `splink` (built by the UK Ministry of Justice, purpose-built for record linkage) if the dataset is large enough to need blocking and scale | These are the two tools built specifically for this problem, not general-purpose NLP libraries repurposed for it |
| Kannada/English name normalization | AI4Bharat's `indic_nlp_library` / `indic-transliteration` | Purpose-built for exactly the transliteration-variance problem this system runs into constantly |
| Semantic embeddings (case narratives, Kannada + English) | **Vyakyarth** (Krutrim AI Labs) as primary — explicitly trained across 10 Indic languages including Kannada, built for semantic search/similarity; **BGE-M3** as a broad-coverage fallback if Vyakyarth underperforms on police-specific vocabulary | Vyakyarth is purpose-fit and Indian-built (a genuinely nice narrative point); BGE-M3 is the safer, more battle-tested general option to have as backup |
| Vector similarity search | QuickML's Knowledge Base first; `faiss` (HNSW index) only if you outgrow it | Try the native Catalyst option before adding an external dependency you then have to justify to a Catalyst-focused judge |
| Graph algorithms | Neo4j's built-in Graph Data Science library — Leiden for community detection, betweenness centrality for broker identification, PageRank for influence ranking | Native to the graph DB already in the architecture; no separate library |
| LLM orchestration | Direct SDK calls with structured/function-calling output (Anthropic or OpenAI) | Keep this thin. A heavy agent framework adds an abstraction layer that's harder to explain live when a judge asks "walk me through what actually happens here" |
| Scheduled jobs (retention, recompute) | Catalyst **Job Scheduling** (not Cron — see correction above) | Cron is end-of-life for new projects |
| File/image storage (scanned FIRs pre-OCR) | Catalyst **Stratus** (not File Store) | Same reason |

## 2. The algorithms that actually matter

Five decisions carry almost all of the technical weight in this system. Get these right and the rest is comparatively routine engineering.

### A. Entity resolution — deterministic + probabilistic hybrid

Don't reach for a single fuzzy-match threshold and call it done. Use two tiers:

1. **Deterministic tier**: normalize and exact-match on strong identifiers — vehicle registration, verified phone number, a lawfully-linked ID. This handles the easy cases cheaply and with zero false-positive risk.
2. **Probabilistic tier**, for everything else: score name similarity with **Jaro-Winkler** rather than plain Levenshtein distance, because Jaro-Winkler gives extra weight to matching prefixes — and transliteration/abbreviation variance in Indian names typically preserves the prefix while varying at the end ("Mohammed" → "Mohd" → "Md"). Then combine that with partial-address similarity and approximate-age agreement using a **Fellegi-Sunter probabilistic record-linkage model** — the same statistical framework national statistics agencies and `splink` use for this exact class of problem. The key property that makes it the right choice here: it weights each comparison field by how *discriminating* it is. An exact phone-number match is strong evidence of a true match because it almost never agrees by chance; a shared birth year is weak evidence because it agrees by chance constantly. A naive "3 out of 5 fields match" rule treats those the same; Fellegi-Sunter doesn't.

Confidence bands: high-confidence scores auto-merge to a canonical ID; medium-confidence scores route to the human review queue; low-confidence scores are never merged, only surfaced as a weak, clearly-labeled lead.

### B. Case-twin / similarity matching — hybrid structured + semantic scoring

This runs *after* entity resolution, on canonicalized data, and combines two different kinds of similarity:

- **Structured feature similarity**: simple 0–1 sub-scores for MO category match, geographic proximity (haversine distance under a threshold), time-of-day/day-of-week pattern match, weapon or method match.
- **Semantic narrative similarity**: embed both case narratives with Vyakyarth or BGE-M3 and take cosine similarity, to catch cases that read alike even when the structured fields don't line up perfectly.

Combine the two with a weighted sum, or — if there's time and a labeled example set — a simple logistic regression re-ranker over the sub-scores. Don't reach for anything more complex than that; a fancier model is harder to explain and won't meaningfully outperform a well-weighted combination at this data scale. For retrieval at scale, use approximate nearest-neighbor search (HNSW, via `faiss` or a vector index) rather than brute-force comparison against every historical case — irrelevant for a small synthetic dataset today, but worth mentioning in the pitch as the design that scales.

### C. Network analysis — community detection + centrality

- **Leiden algorithm** for clustering the graph into likely gang/group structures, not Louvain — Leiden is the newer, corrected successor that guarantees internally well-connected communities; Louvain has a known failure mode where it can produce clusters that are actually disconnected internally.
- **Betweenness centrality** to identify likely "broker" individuals who connect otherwise-separate clusters — the standard technique for spotting the person who links two crews together, even if they don't look central by simple degree count.

### D. Priority / case-flag scoring — transparent weighted rules, deliberately not black-box ML

A simple weighted linear function over named, auditable factors: recency-weighted prior-offense count, crime-severity tier, network centrality score from (C), active-warrant flag. Every weight is visible and adjustable, no protected attributes anywhere in the feature set, framed throughout as a lead indicator rather than a verdict. If there's an urge to prove "real ML" capability somewhere, spend that effort on entity resolution and case-matching, where sophistication is a genuine asset — not here, where opacity is a liability rather than a flex.

### E. Hotspot detection

Kernel Density Estimation gets you a standard heatmap, which is table stakes. Worth going one step further if time allows: the **Getis-Ord Gi\*** statistic, which tests whether a cluster of incidents is *statistically* significant rather than just visually dense — it distinguishes a genuine hotspot from ordinary random spatial variation. Most teams will stop at a heatmap; this is a cheap way to show real GIS literacy.

## 3. Best practices for architecture and implementation

- **Version your prompts like code.** Keep every LLM prompt (intent classification, query-template selection, evidence composition) in its own file, not inline strings scattered across Functions, and re-test each one against a fixed set of example queries whenever it changes.
- **Use structured/function-calling output for anything the system will act on** — intent classification and query-template selection should return structured JSON the code can trust, not free text you regex-parse. This is the same principle as rejecting freeform text-to-SQL, applied consistently.
- **Make entity-resolution merges and case-signature updates idempotent.** Re-running them on the same input should never create duplicate canonical IDs or double-count a match.
- **Fail loudly, not silently.** If an LLM call times out or errors, say so in the response rather than returning an empty or partial answer without explanation — this is an extension of the same explainability principle already built into the evidence composer.
- **Build the seeded test scenarios from the viability plan as an actual small test suite**, run before every demo rehearsal — not a one-time manual check you did once in week two.
- **Use Catalyst's execution logs and Application Alerts during development**, not just for the final audit trail — configure alerts on Function failures so you catch breakage while building, not during the live demo.

## 4. Where this slots into the build phases

This document doesn't repeat the phased roadmap from the Solution Breakdown — it's the detail layer underneath it:

| Phase | Algorithm/practice from this document |
|---|---|
| Phase 1 (entity resolution + gated query) | Section A in full; structured-output discipline for the query agent |
| Phase 2 (case-twin + graph) | Sections B and C in full |
| Phase 3 (language) | Vyakyarth/BGE-M3 choice, transliteration normalization |
| Phase 4 (analytics) | Sections D and E |
| Throughout | Section 3's engineering practices, applied from day one, not retrofitted |

---

*Sources consulted: Zoho Catalyst official documentation (docs.catalyst.zoho.com) — Functions runtime support, Cron/File Store deprecation notices, Job Scheduling and Stratus release notes; Krutrim AI Labs (Vyakyarth model card); academic literature on multilingual embedding benchmarking for Indic languages; AI4Bharat IndicNLP resources.*
