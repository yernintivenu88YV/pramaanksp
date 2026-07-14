# Pramaan — Remaining Build Prompts & Reference (Tasks 3–7)

*Tasks 1 (entity resolution) and 2 (case-twin finder) are done — built, tested, one real bug found and fixed in each. This document covers what's left: consolidated tech stack, what still needs integrating, security and usability requirements, and all five remaining Antigravity prompts, ready to paste in order.*

---

## Already built and tested

| Module | Status |
|---|---|
| `entity_resolution.py` | 1.00 precision/recall on seeded pairs. One bug found and fixed (first-name dominance masking a surname mismatch). |
| `case_twin.py` | Ranking + separately-flagged shared-suspect signal. One design flaw found and fixed (arbitrary blend weight burying a confirmed connection). |
| `rbac.py` | 28/28 checks pass clean. Default-deny confirmed for informant identity and cross-jurisdiction detail. |
| `data_store_schema.sql` | Full schema; `CasePersonLink` references `canonical_id`, never raw `person_id`, by design. |
| `demo_console.py` | Cross-examine + live-counterfactual demo mechanics. |

## Tech stack, consolidated

**Catalyst-native:**
Functions (Python 3.12/3.13 for the ML-heavy work above; Node.js 20/22 + TypeScript for gateway-facing glue if needed) · Data Store + ZCQL · NoSQL (narratives, conversation logs) · Authentication + API Gateway + Security Rules · Cache · Connections (→ Neo4j Aura) · QuickML/AutoML · ConvoKraft (public FAQ only) · Job Scheduling (not Cron) · Stratus (not File Store) · Pipelines (CI/CD) · Slate/Web Client Hosting · India Data Center

**External:**
Neo4j Aura (graph) · Bhashini (Kannada/English ASR+TTS, free PoC tier now, paid tier for production) · Sarvam AI (translation-quality fallback, evaluate only if needed) · an LLM API, Anthropic or OpenAI, BYOK · Vyakyarth or BGE-M3 embeddings (real environment only — TF-IDF is the tested placeholder here since this sandbox can't reach model hubs)

## Integrations you need to set up before the matching task

- [ ] Confirm the Catalyst project is on the **India Data Center** (should already be done — can't be changed later)
- [ ] **Neo4j Aura** account, connection URI + credentials — before Task 4
- [ ] **Bhashini** API signup (bhashini.gov.in), free tier key — before Task 5
- [ ] **LLM API key** (Anthropic or OpenAI), with an actual budget checked — before Task 3
- [ ] **GitHub repo** connected to Catalyst Pipelines — before Task 7
- [ ] A **Kannada-speaking teammate or contact** to validate real terminology — before Task 5, can't be skipped or faked
- [ ] **QuickML** access confirmed in console — before Task 6

## Security and robustness, tied to where each gets built

- RBAC enforced via Security Rules at the data layer, never just hidden in the UI — **Task 3**
- Every request stamped with who/what/when in an immutable audit log — **Task 3**
- Secrets (LLM key, Bhashini credentials) via Catalyst environment variables, never hardcoded — **all tasks**
- Structured/function-calling LLM output for intent classification, never freeform text-to-SQL — **Task 3**
- Entity-resolution merges and case-signature updates stay idempotent — already true in tested code
- Fail loudly: an LLM timeout or error surfaces explicitly, never a silent empty answer — **all tasks**
- No protected attribute anywhere in the priority-scoring feature set — **Task 6**
- ConvoKraft structurally isolated from case data — a design fact, not a policy — **Task 5**
- Golden-set regression re-run before every Production promotion, not just once — **Task 7**

## Usability, so the finished thing is actually usable

- Visible "thinking" state during LLM reasoning steps — officers won't tolerate a silent multi-second pause
- Kannada and English at genuine parity, not Kannada as a degraded secondary path
- Role-appropriate views: an SI sees case detail, an Analyst sees aggregates — less cognitive load per role, rather than one dense screen trying to serve everyone
- Evidence and confidence visible but not overwhelming — a simple visual treatment, not a wall of numbers, for someone glancing at this on a station terminal or a phone
- Graceful degradation on low connectivity — fail with a clear message rather than an indefinite spinner; a real constraint at rural stations, worth at least a stub
- PDF export of conversation history — an explicit requirement in the original brief, easy to let slip because it isn't the "impressive" feature

---

## Task 3 — RBAC gateway + audit logging

```
Continue building Pramaan. Tasks 1 (entity_resolution_fn) and 2
(case_twin_fn) should already exist in this project. This folder now
also contains rbac.py and test_rbac.py -- a role-permission model (SI,
ACP, Analyst, Policy against seven resource types) that's already
tested: 28 of 28 checks pass, and informant identity plus
other-jurisdiction case detail are confirmed denied to every role by
default, not just the ones without explicit access.

Read rbac.py's docstring first. The default-deny design is deliberate:
informant identity and cross-jurisdiction detail aren't in ANY role's
permission set on purpose. Do not add a role that grants these by
default -- that requires a separate, explicit clearance model this
version doesn't implement, and skipping that is a governance decision,
not a coding shortcut.

Your task:
1. Add a third Python function, gateway_fn, same runtime as the others.
   Move rbac.py and test_rbac.py into it.
2. Wire Catalyst Authentication with the four roles above. Every
   incoming request must resolve to one of these four roles via the
   authenticated session -- never a role passed as an unverified
   request parameter, since that would let a caller simply claim to be
   ACP.
3. Wrap check_access() as the mandatory pre-check every other Function
   (entity_resolution_fn, case_twin_fn) calls before returning any
   data. If check_access returns allowed=False, the caller gets a clear
   403-style response, not an empty or silent result.
4. Every check_access call -- allow or deny -- writes an entry to an
   audit table in Data Store (session_id, role, resource, decision,
   timestamp). This is not optional and not deferred -- it's the same
   table the ConversationLog schema already has a slot for.
5. Run test_rbac.py and confirm all 28 checks still pass after wiring
   this into Catalyst Authentication -- the logic shouldn't change,
   only where it's called from.
6. Test locally with catalyst run: simulate two different
   authenticated sessions (SI and Analyst) and confirm they get
   different responses to the same underlying query.

Plan first, as before.
```

## Task 4 — Neo4j graph

```
Continue building Pramaan. This task needs a Neo4j Aura account already
created, with its connection URI and credentials in hand -- if that's
not done yet, stop and get it first (free tier is enough), then come
back.

Context: the schema (data_store_schema.sql, already in this project)
has a CasePersonLink table that references canonical_id from
EntityResolution, never a raw person_id. This is the single most
important constraint in this task -- the graph you're about to build
is only trustworthy if every node in it is a canonical identity, not a
raw, unresolved record. If you find yourself exporting person_id
directly into the graph anywhere, stop and check entity_resolution_fn's
output instead.

Your task:
1. Set up a Catalyst Connection to the Neo4j Aura instance.
2. Write an export job that reads CasePersonLink and writes nodes
   (Person via canonical_id, Case, Location, Vehicle) and edges
   (ACCUSED_IN, VICTIM_IN, WITNESS_IN, LOCATED_AT) into Neo4j.
3. Write two traversal queries using Neo4j's Graph Data Science
   library: (a) "who else is linked to this canonical_id" (direct
   neighbors), and (b) community detection using the Leiden algorithm
   -- not Louvain, which can produce internally disconnected clusters
   -- to group likely gang/associate structures.
4. Expose both as a new Function, graph_fn, callable through
   gateway_fn's RBAC check first, same as the others.
5. Render the result as an interactive graph in the client.

Plan first. Tell me explicitly which Neo4j driver/library you're
using and confirm it's compatible with the Python runtime version
already in use elsewhere in this project.
```

## Task 5 — Kannada/Bhashini + isolated ConvoKraft

```
Continue building Pramaan. This task needs a Bhashini API key already
in hand (bhashini.gov.in, free tier) -- get that first if it's not done.

Context, and this is the part to get right: ConvoKraft, Catalyst's
native chatbot service, is English-only in its NLU and its bots are
unauthenticated by default -- they cannot see the logged-in user's
identity. ConvoKraft is structurally the wrong tool for anything
touching case data. This is a deliberate architectural decision from
earlier in this project, not something to "solve" by finding a
workaround that pipes case data through it anyway.

Your task:
1. Build a genuinely separate, unauthenticated public assistant using
   ConvoKraft, scoped ONLY to static procedural content (filing a
   complaint, station locator, general FAQ) -- no case data, no
   database queries, ever. Verify by checking that ConvoKraft's bot has
   no code path calling entity_resolution_fn, case_twin_fn, or graph_fn.
2. For the real, authenticated investigator interface, do NOT use
   ConvoKraft. Build it as a custom interface in the client that calls
   gateway_fn directly, carrying the authenticated session.
3. Wire Bhashini for voice: ASR in, TTS out, for both Kannada and
   English.
4. For typed text, do not machine-translate Kannada to English before
   reasoning over it -- pass Kannada (or code-mixed Kannada-English)
   directly to the LLM call. Flag this decision clearly in a comment so
   it doesn't get "simplified" into a translate-then-process pipeline later.
5. Add PDF export of conversation history -- an explicit requirement in
   the original brief, not optional polish.

Before calling this done: give me a short list of specific Kannada
police-terminology phrases you tested against, and be honest about any
that gave a low-confidence or uncertain result, not just the successes.

Plan first.
```

## Task 6 — QuickML hotspot + priority scoring

```
Continue building Pramaan.

Context: priority scoring in this project is deliberately rule-based
and transparent, not a black-box model -- a considered decision, not a
capability gap. A wrong "high risk" tag on the wrong person is a real
liability; an explainable, adjustable formula is both safer and, on
this timeline, more reliably correct than an opaque model. Do not
replace this with a trained classifier without checking with me first.

Your task:
1. Use QuickML/AutoML for hotspot and trend detection only -- the
   appropriate place for a real model here, since a wrong hotspot
   suggestion is a resourcing inefficiency, not a liability against a
   specific person.
2. For priority scoring, implement the weighted formula: recency-
   weighted prior offense count, crime severity tier, network
   centrality score (from graph_fn's centrality output), active-warrant
   flag. Every weight visible and adjustable; the output must show
   which factors contributed, not just a final number.
3. Confirm no protected attribute (caste, religion, gender alone,
   specific community) appears anywhere in the feature set. If you're
   unsure whether a field qualifies, ask me before including it.
4. Expose this as part of graph_fn or a new analytics_fn -- your call;
   plan it and tell me which you'd recommend and why.
5. Test that the priority score is fully reproducible by hand from its
   stated inputs -- if I can't recompute the same number myself from
   the factors shown, the explainability requirement isn't actually met.

Plan first.
```

## Task 7 — Production promotion + demo rehearsal

```
Continue building Pramaan -- the last task before the demo itself.

Context: Catalyst's Production environment is deliberately restricted
-- you cannot create new resources or Functions directly inside it,
only migrate what already works in Development. This is the first time
anything in this project touches Production, so treat this task as the
one place where caution matters more than speed.

Your task:
1. Set up catalyst-pipelines.yaml: automatic trigger on push for unit,
   integration, and API test stages (Catalyst's ZEST tool can
   auto-generate the API test layer), MANUAL trigger only for the
   actual Production deployment step.
2. Before promoting anything, re-run every existing test file
   (test_entity_resolution.py, test_case_twin.py, test_rbac.py) and
   report results plainly -- don't promote if any of them fail.
3. Promote to Production. Immediately after, re-run the full demo
   sequence against Production specifically, not Development -- URLs
   and restrictions differ, and this is the first time anyone will have
   seen the system behave under Production conditions.
4. Script, in writing, the exact live demo sequence: the case-twin-
   finder opening (new FIR in, entity resolution confidence shown,
   ranked twins with evidence), the two-role RBAC comparison (same
   query, two logins, visibly different results), and one deliberately
   planted ambiguous case that correctly lands in the review queue
   instead of being confidently guessed.
5. Tag or note this exact working state as the rollback point before
   anyone changes anything else close to the demo date.

Plan first, and flag anything in the existing test suite that looks
fragile before going anywhere near Production.
```
