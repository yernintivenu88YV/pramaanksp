# Pramaan — Software Development Life Cycle

*Third document in this set. The Solution Breakdown covers concept and differentiation; the Technical Roadmap covers stack and algorithms. This one covers process: how the team should actually work, test, and ship. Read this alongside those two rather than instead of them.*

---

## 1. Architecture, condensed

Full architecture and data model live in the other two documents — this is the two-sentence version for orientation. An authenticated investigator client and a deliberately isolated public FAQ bot both sit behind a Catalyst API Gateway; the authenticated path alone reaches an orchestration layer that resolves entities to canonical IDs *before* anything else happens, then runs structured query, graph, and case-twin matching against Catalyst Data Store and Neo4j, and returns nothing to an officer that hasn't passed through an evidence composer citing a source record.

## 2. Methodology

Formal Scrum ceremonies are more process than a five-person, three-week team needs. Use a lighter structure instead:

- Treat each of the five build phases already defined as a **mini-sprint** (2–5 days), each with a clear Definition of Done rather than a fixed story-point estimate.
- **Daily 10–15 minute sync**, not a full standup ritual — what got done, what's blocked, what's next.
- **A running Kanban board** (To Do / In Progress / Review / Done) rather than sprint-planning overhead — better fit for a build where requirements clarify as you go, which is the normal condition for a hackathon.
- **One person owns "integration health"** on any given day — someone whose job that day is making sure everyone else's in-progress work still fits together, since a five-person team building five modules in parallel is exactly where things quietly drift apart.

## 3. Phases, with formal deliverables and exit criteria

| Phase | SDLC stage | Deliverable | Exit criteria |
|---|---|---|---|
| Phase 0 — Foundation | Requirements + Design | Schema live, roles defined, Development environment working | One Function deploys and returns a response end-to-end |
| Phase 1 — Entity resolution + gated query | Implementation | Matching pipeline, RBAC gateway, audit log | A typed English question returns a cited, role-correct answer; RBAC negative tests pass |
| Phase 2 — Case-twin + graph | Implementation | Signature matching, Neo4j graph, ranked twins | A seeded twin pair is correctly retrieved; network graph renders in the frontend |
| Phase 3 — Language | Implementation | Kannada text + voice, isolated public FAQ path | Golden-set regression (below) passes in both languages |
| Phase 4 — Analytics | Implementation | Hotspot detection, transparent priority scoring | Priority score is reproducible and inspectable by hand from its stated factors |
| Phase 5 — Demo prep | Testing + Deployment | Production promotion, rehearsed demo | Full demo script runs clean in **Production**, not just Development |

Nothing moves to the next phase without its exit criteria met — this matters more than it sounds like it should in a time-boxed build, because skipped exit criteria are exactly what surface as live-demo failures.

## 4. Testing strategy

A standard test pyramid, adapted for the parts of this system that don't behave like normal deterministic code:

**Unit tests (most numerous, fastest, run on every commit)**
- Entity-resolution scoring functions (Jaro-Winkler wrapper, Fellegi-Sunter weight calculation) against known input pairs with expected match / possible-match / non-match outcomes.
- Case-signature sub-score functions in isolation.
- RBAC permission checks — every role against every resource type, including the ones that should fail.

**Integration tests (run on every commit)**
- Function → Data Store round trips.
- Function → Neo4j (via Connections) round trips.
- The full chain — intent router → query template → Data Store → evidence composer — against a fixed set of seed records.

**API/contract tests**
- Catalyst's **ZEST** tool auto-generates test cases and automation reports for REST endpoints directly from the API definition — use it instead of hand-rolling this layer.

**LLM golden-set regression testing (the layer most teams skip, and the one that actually matters most here)**
- Maintain a fixed set of ~20–30 representative officer queries, in English and Kannada, each with an expected cited source record and expected confidence band.
- Re-run this set after *every* prompt change or model swap. A previously-correct citation that goes missing or wrong is a blocking regression, not "LLMs are unpredictable, ship it anyway." This is the discipline that keeps the evidence-composer promise from quietly degrading as the system evolves.

**Seeded synthetic-data validation**
- The duplicate-entity and near-duplicate-case fixtures from the viability plan should live as actual test fixtures loaded into a test Data Store instance, not a one-time manual check from week two.

**Where these run**: unit, integration, and API tests as automated stages in `catalyst-pipelines.yaml`, triggered on every push. The LLM golden-set and RBAC suite run on a slower, deliberate cadence — before every Production promotion, at minimum — since LLM calls cost time and money and don't need to fire on every single commit.

## 5. Deployment strategy

- **Build everything in the Development environment** through Phases 0–4. This is the default working environment and there's no reason to touch Production before Phase 5.
- **Treat "promote to Production" as a scheduled, tested Phase 5 activity**, not a last-minute scramble. Catalyst's Production environment is deliberately restricted — you cannot create new resources or Functions directly inside it, only migrate what already works in Development. Your first promotion attempt should happen days before the demo, not hours before.
- **Use Catalyst Pipelines** (`catalyst-pipelines.yaml`, GitHub-integrated) for automated build and test on every push to a working branch — set this to **automatic** trigger. Set the actual Production deployment step to **manual** trigger, so nobody accidentally pushes an untested change live thirty minutes before judges arrive.
- **Secrets** (LLM API key, Bhashini credentials) go through Catalyst's environment-variable configuration, never hardcoded into function source — check either environment's config screens for the current mechanism before Phase 1, since this is exactly the kind of detail worth confirming firsthand rather than assuming.
- **Keep a known-good rollback point.** Since Production only reflects what was last explicitly migrated from Development, tag or note the last fully-working Development state before making any change within 48 hours of the demo, so you can redeploy it fast if something breaks.
- **Rehearse in Production specifically, at least 24 hours out.** Production has different URLs and different restrictions than Development — the first time anyone sees the system behave under those conditions should not be in front of the judges.

---

*Document set: Solution Breakdown (concept, differentiation, requirements) → Technical Roadmap (stack, algorithms) → this document (process, testing, deployment). Sources consulted for this document: Zoho Catalyst official documentation (docs.catalyst.zoho.com) — Pipelines, CI/CD workflow, ZEST, and Development/Production environment behavior.*
