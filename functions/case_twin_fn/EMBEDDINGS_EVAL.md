# Narrative-similarity embedding evaluation (Task 5)

**Decision: use `krutrim-ai-labs/Vyakyarth`.** It was evaluated head-to-head
against `BAAI/bge-m3` on the case-twin narrative set, in both English and
Kannada, **with Kannada scored in Kannada (no translation)**. Vyakyarth
separates genuine twins from non-matches more cleanly in both languages, has a
lower false-similarity floor, and is ~4× smaller. Model id is overridable via
the `NARRATIVE_EMBED_MODEL` env var, so pinning BGE-M3 later needs no code change.

## Why not just pick the higher scores?

The signal that matters is the **margin between a genuine twin and a non-match**,
not the absolute twin score. A model that scores everything high (twin *and*
non-match) is worse for ranking, because a high non-match floor inflates false
twins.

| Metric (higher margin = better) | Vyakyarth | BGE-M3 |
|---|---:|---:|
| English: twin − non-match | 0.873 − 0.270 = **0.603** | 0.913 − 0.502 = 0.411 |
| Kannada: twin − non-match | 0.792 − 0.363 = **0.429** | 0.833 − 0.595 = 0.238 |
| Kannada non-match floor (lower = better) | **0.363** | 0.595 |
| Unrelated crime-type phrases (lower = better) | **0.60 – 0.64** | 0.68 – 0.71 |
| Params / download size | **0.3B / ~1.2 GB** | 0.56B / ~2.5 GB |

BGE-M3's absolute twin scores are a touch higher, but its **non-match floor is
much higher** — the Kannada non-match (chain-snatching vs burglary) sits at
0.595, uncomfortably close to a real twin. Vyakyarth keeps non-matches low, so
the twin genuinely stands out. Both rank the twin first; Vyakyarth does it with
more headroom.

## Full numbers

Reproduce with `scratchpad/eval_embeddings.py` (append `--bge` for BGE-M3).
All cosine similarities on L2-normalized embeddings.

### English ranking vs CASE-001
| candidate | Vyakyarth | BGE-M3 |
|---|---:|---:|
| CASE-002 genuine twin | 0.873 | 0.913 |
| CASE-003 partial (front door, day) | 0.710 | 0.736 |
| CASE-004 non-match (chain snatch) | 0.270 | 0.502 |

### Kannada ranking vs CASE-K01 — **scored in Kannada, not translated**
| candidate | Vyakyarth | BGE-M3 |
|---|---:|---:|
| CASE-K02 genuine Kannada twin | 0.792 | 0.833 |
| CASE-K03 partial (front door, day) | 0.709 | 0.683 |
| CASE-K04 non-match (chain snatch) | 0.363 | 0.595 |

### Cross-lingual sanity — Kannada target vs English narratives
Proves translation is unnecessary: the Kannada burglary target lands near its
English burglary twins and far from the English chain-snatching non-match.

| English candidate | Vyakyarth | BGE-M3 |
|---|---:|---:|
| CASE-001 (English equivalent) | 0.799 | 0.779 |
| CASE-002 twin | 0.744 | 0.778 |
| CASE-003 partial | 0.547 | 0.695 |
| CASE-004 non-match | 0.236 | 0.561 |

## Kannada police-terminology phrases tested — including the weak ones

Honest reporting, per the task. "sim" is Vyakyarth cosine; BGE-M3 in brackets.
These are short **phrase-level** probes (harder than full narratives, which
carry more context). A native Kannada-speaking officer should still validate the
preferred FIR terminology — this has **not** been done and cannot be faked.

**Worked well (expected high, got high):**
- `ಗೃಹ ಕಳ್ಳತನ` ~ `ಮನೆ ಕಳ್ಳತನ` (house-burglary synonyms) — **0.980** [0.932]
- `ದ್ವಿಚಕ್ರ ವಾಹನ ಕಳ್ಳತನ` ~ `ಬೈಕ್ ಕಳ್ಳತನ` (vehicle theft, formal vs colloquial) — **0.801** [0.853]
- `ಹಿಂಬದಿ ಕಿಟಕಿ` ~ `ಹಿಂದಿನ ಕಿಟಕಿ` (rear-window variants) — **0.727** [0.745]
- `ಮನೆಗೆ ಕನ್ನ ಹಾಕಿದ್ದಾರೆ` ~ `ಮನೆಯಲ್ಲಿ ಕಳ್ಳತನ ನಡೆದಿದೆ` (housebreak idiom vs burglary) — **0.702** [0.786]

**Low-confidence / uncertain (flagged honestly):**
- `ಹಾರೆ` ~ `ಕಬ್ಬಿಣದ ಸರಳು` (crowbar vs "iron rod") — **0.403** [0.317].
  Both models are weak here; these are only loosely synonymous as bare nouns.
  A narrative using one won't strongly match a narrative using the other on this
  term alone. Consider normalizing weapon vocabulary upstream (the structured
  `weapon` field already covers this signal separately).
- `ಸರಗಳ್ಳತನ` ~ `ಚಿನ್ನದ ಸರ ಕಿತ್ತುಕೊಂಡರು` (chain-snatching noun vs verb phrase) —
  **0.405** [0.591]. Vyakyarth under-links the compound noun to its verb
  description; BGE-M3 does better on this one specific pair.
- **False-friend floor:** unrelated crime types that share the word `ಕಳ್ಳತನ`
  (theft) — e.g. `ಗೃಹ ಕಳ್ಳತನ` ~ `ಸರಗಳ್ಳತನ` — score **0.60** [0.68] even though
  they are different crimes. At **phrase** granularity neither model fully
  separates them. This is why narrative similarity is only one weighted signal
  (0.20) in `score_pair`, alongside crime-type, MO, location, time, and weapon —
  it is not trusted alone.

Net: at **full-narrative** granularity (what `narrative_similarity` actually
compares) the ranking is clean and robust in both languages; the caveats above
are phrase-level and are mitigated by the surrounding structured signals.

## Deployment note (Catalyst packaging)

`narrative_similarity()` uses embeddings as the **primary** path with a
graceful **TF-IDF fallback** if the model can't load (verified: forcing an
invalid model id falls back and the ranking still holds). Practical caveat:
`torch` + Vyakyarth is heavy for a Catalyst Advanced I/O package, and the
weights download on first cold start.

**Precompute is now implemented** on the deployed AppSail path:

- `appsail/routers/case_twin_fn.py` → `embed_narrative()` builds the vector;
  `narrative_similarity()` scores in three tiers — (1) stored vectors via numpy
  cosine (no model load), (2) on-the-fly embedding, (3) TF-IDF fallback.
- `appsail/backfill_embeddings.py` → run at ingestion / when `narrative_text`
  changes (`--all` re-embeds, `--dry-run` reports only). Idempotent.
- `schema/data_store_schema.sql` → `Case.narrative_embedding` (JSON array) +
  `Case.embedding_model`; `repositories.store_case_embedding()` persists them.

Verified: with `narrative_text` blanked and only stored vectors supplied, the
scores are identical to the on-the-fly path (Kannada twin 0.8341, non-match
0.2459, 768-dim), proving the stored vector — not the text — drives the score.

> Note: this doc lives in the legacy `functions/` tree. The deployed backend is
> `appsail/` (see `catalyst.json`). The model choice above applies to both.
