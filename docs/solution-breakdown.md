# Intelligent Conversational AI for the KSP Crime Database — Comprehensive Solution Breakdown

*Datathon 2026 — Karnataka State Police × Hack2Skill, built on Zoho Catalyst*

---

## 1. Core concept

Most teams will read this brief as "build a chatbot for the police." That framing under-serves the actual problem. Karnataka State Police does not lack data — FIRs, vehicle records, phone records, financial records, and criminal histories already exist across CCTNS and the state's Police IT systems. What's missing is the connective layer that turns those records into intelligence: the ability to recognize that a name spelled three different ways across three databases is one person, that a new FIR resembles one filed eight months ago in a different district, and that an answer given to an officer can be trusted because every claim in it traces back to a specific source record. This is not a hypothetical volume problem — India adds roughly 2,000 new criminal cases to police records every day nationally (per NCRB figures), without a matching growth in investigative capacity.

The core concept is a **governance-native crime intelligence layer**, built natively on Zoho Catalyst, that sits between KSP's existing data and its investigators. It does three things in a fixed order, and the order is the actual design decision:

1. It resolves entities to canonical identities *before* it does anything else with them.
2. It lets investigators ask questions in English or Kannada, by text or voice, and get answers that are always cited to a source record with a confidence figure attached.
3. It enforces who can see what through role-based access checked at the data layer, not hidden behind a UI.

Everything else — the network graph, the case-twin finder, the hotspot analytics, the priority-scoring — is built as a client of that foundation, not a separate feature bolted on beside it. In one sentence: **the platform doesn't just answer questions about crime data, it makes sure the answer is trustworthy before it lets an officer act on it.**

## 2. What makes it unique compared to existing alternatives

### Compared to other likely datathon submissions

Most teams will arrive at some combination of a natural-language search box, a dashboard, a heatmap, and a graph visualization, because those are the pieces named directly in the ten-point brief. That combination is necessary but not sufficient, and it's also what nearly every other team will submit. Two things separate this solution from that baseline, and neither shows up as a single feature in a demo screenshot: entity resolution is treated as a hard prerequisite that every other module depends on, rather than an assumed join key; and role-based access and explainability are built into the request pipeline itself — every query passes through an authenticated gateway and an evidence composer — rather than added afterward as a settings page.

### Compared to deployed international platforms

The closest real-world analog is SoundThinking's CrimeTracer Gen3, a US law enforcement platform connecting over a billion CJIS-compliant records across more than 2,100 agencies, with a natural-language chatbot, role-based access controls, and audit logging of every AI-generated query. It validates the general architecture here — conversational access to unified, siloed law-enforcement data, with RBAC and audit trails as first-class requirements, not afterthoughts. It is also not a fit for Karnataka: a commercial, per-agency-licensed US product with no Indian-language support, not built to India's DPDP Act, and not deployable on infrastructure that keeps data inside an Indian jurisdiction.

### Compared to platforms already live in India

This is not a hypothetical problem space — several Indian states have live deployments as of 2026. Innefu Labs' Prophecy Alethia and AI Vision platforms are deployed across Gujarat, Delhi, and Chandigarh Police, fusing CCTNS, Dial 112, and VAAHAN data with call-detail-record analysis to surface offender networks at the station level. Maharashtra's MahaCrimeOS AI, built on Microsoft Foundry, went from a 23-station pilot in Nagpur to a statewide rollout across all 1,100 stations in under a year, acting as an investigation copilot that extracts case details from uploaded files and suggests next steps. Goa Police's in-house "Deep Trace" platform, launched February 2026, traces digital footprints across mobile numbers, PAN, and vehicle records to generate leads. Karnataka does not yet have an equivalent of its own — this datathon is effectively KSP's on-ramp to a wave that comparable states have already started riding. Based on what's publicly documented, none of these platforms expose entity-resolution confidence scoring as a visible, human-reviewable layer, and none appear to be Kannada-native by design rather than by bolted-on translation.

### The three differentiators that actually matter

1. **Entity resolution as a visible, auditable layer**, not an invisible backend join — every merge is confidence-scored, low-confidence matches route to a human review queue, and every downstream feature (graph, case-twin finder, priority score) reads canonical IDs rather than raw fields.
2. **Kannada as a first-class design constraint**, handled by letting the reasoning layer work in Kannada directly rather than machine-translating and losing nuance, with Bhashini — India's own sovereign language infrastructure — covering voice.
3. **DPDP Act-aligned governance with a named, cost-conscious path from prototype to production**, built natively on the sponsor's own platform rather than a generic cloud stack, with an explicit accounting of what changes between a datathon prototype and a real deployment.

## 3. Technical requirements for implementation

### Component map

| Capability | Catalyst component | External dependency |
|---|---|---|
| Backend logic, orchestration | Functions | LLM API (BYOK) for reasoning; QuickML-hosted open models for simpler subtasks |
| Structured data | Data Store + ZCQL | — |
| Case narratives, conversation logs | NoSQL | — |
| Session context, query caching | Cache | — |
| Authentication + roles | Authentication, API Gateway, Security Rules | — |
| Network/relationship graph | Connections (outbound) | Neo4j Aura |
| Hotspot/trend/priority models | QuickML / AutoML | — |
| Narrative semantic search | QuickML Knowledge Base first; fall back only if it can't do what's needed | pgvector / Qdrant (fallback only) |
| Public FAQ assistant (non-case-data only) | ConvoKraft | — |
| Kannada + English voice | — | Bhashini ASR/TTS — free PoC tier, documented paid upgrade path |
| Kannada/English text reasoning | Functions calling the LLM directly | Sarvam AI translation as an evaluated fallback, not the default |
| Alerts | Push Notifications, Mail, Cron | — |
| Frontend hosting | Slate / Web Client Hosting | — |
| CI/CD | Pipelines | — |
| Data residency | — | India Data Center (Mumbai primary, Chennai secondary) — select explicitly, it is not the default |

### Core data model

- **Case** — case_id, FIR_number, station_id, crime_type, modus_operandi, date_time, status, narrative_text
- **Person** — person_id, role (accused/victim/witness), name, age, gender, address, prior_record_flag
- **Location** — location_id, station_id, latitude, longitude, area_type
- **Vehicle, Phone, FinancialTransaction** — entity-specific detail tables
- **CasePersonLink** — case_id, person_id, role_in_case — the seed table exported into the graph
- **EntityResolution** — canonical_id, source_record_id, source_table, match_confidence, matched_by, reviewed_by, reviewed_at — the table most reference architectures for this challenge omit, and the one everything else quietly depends on
- **OffenderProfile** (derived, never manually entered) — person_id, priority_score, contributing_factors, last_computed_at, model_version — rule-based and transparent, not a black-box score
- **ConversationLog** — session_id, user_id, role, query_text, response_text, cited_record_ids, timestamp — what makes the audit trail and PDF export of conversation history possible

### System architecture

```
┌──────────────────────────────────────────────────────────────┐
│ INTERACTION LAYER                                              │
│ Investigator client (Slate, Catalyst Auth, Kannada/English      │
│ voice via Bhashini)   |   Public FAQ (ConvoKraft, unauthenticated,│
│ no case data — isolated by design, not by oversight)            │
└───────────────────────────┬────────────────────────────────────┘
                             │ investigator path only
┌───────────────────────────▼────────────────────────────────────┐
│ GATEWAY LAYER — API Gateway + Authentication + Security Rules    │
│ (RBAC)  +  immutable audit log on every call                     │
└───────────────────────────┬────────────────────────────────────┘
                             │
┌───────────────────────────▼────────────────────────────────────┐
│ ORCHESTRATION LAYER (Catalyst Functions)                          │
│ Intent router → Entity resolution (canonical IDs, confidence-      │
│ scored) → [structured query | graph query | narrative RAG |        │
│ case-twin matching] → Evidence composer (always last)              │
└───────────────────────────┬────────────────────────────────────┘
                             │
┌───────────────────────────▼────────────────────────────────────┐
│ DATA & INTELLIGENCE LAYER                                          │
│ Data Store (Case/Person/Location/CasePersonLink/Vehicle/Phone/      │
│ EntityResolution/OffenderProfile) · NoSQL (narratives, logs) ·       │
│ Neo4j Aura via Connections · QuickML (hotspot/trend, rule-based       │
│ priority scoring)                                                     │
└──────────────────────────────────────────────────────────────────┘
```

### Non-functional requirements

- **Data residency:** India Data Center, selected explicitly at project creation.
- **Retention and audit:** align to the DPDP Rules baseline (minimum one year retention of processing logs) rather than the older IT Act floor — 2026 is the compliance build-year ahead of the May 2027 enforcement date, so this is worth designing to now.
- **Latency:** structured/graph queries should resolve in single-digit seconds; show a visible "thinking" state during LLM reasoning steps rather than a silent wait.
- **Language coverage:** Kannada and English at parity for text; voice coverage for both via Bhashini.

### Team and skill requirements

A workable team of five: one owns Catalyst backend (Functions, Data Store, Auth, Security Rules), one owns LLM orchestration and prompt design (including entity resolution and the evidence composer), one owns the graph module and Neo4j integration, one owns analytics (QuickML, priority-scoring logic), one owns frontend (Slate, the investigator client, graph and map visualizations). If anyone has informal exposure to real investigative workflows, loop them in for a short review before the demo — it's the fastest way to catch where the system would feel obviously wrong to an actual officer.

## 4. Step-by-step build guide

Registration for this event appears to close around July 19, 2026, with the event running in person; confirm the exact final submission date on the organizer portal, since it changes how the phases below should compress or stretch. The plan assumes roughly three weeks of build time.

**Phase 0 — Foundation (days 1–3)**
- Create the Catalyst project on the India Data Center.
- Stand up Authentication with the full role model (SI/Investigator, ACP/Supervisor, Analyst, Policy) from day one, not retrofitted later.
- Define and load the Data Store schema, *including* the EntityResolution table, before writing feature logic against it.
- Load the sample dataset; deploy one trivial Function end-to-end to validate the pipeline.

**Phase 1 — Entity resolution + gated structured query (days 4–8)**
- Build the three-tier matching logic: deterministic, probabilistic with confidence scoring, and a human review queue for ambiguous matches.
- Wire the API Gateway + Security Rules + audit logging as the mandatory front door for every request — infrastructure, not a later feature.
- Build a small library of parameterized ZCQL query templates, selected by LLM intent classification, instead of freeform text-to-SQL.
- Milestone: a typed English question returns a cited, role-appropriate answer.

**Phase 2 — Case-twin finder + network graph (days 9–13)**
- Build case-signature vectorization (MO, location/time pattern, evidence profile) *on top of* the canonical entity IDs from Phase 1, not in parallel with them.
- Export CasePersonLink into Neo4j Aura via Connections; build basic traversal queries.
- Render the network graph and ranked "twin case" results in the frontend, with the evidence composer attached to both.

**Phase 3 — Language and the public/authenticated split (days 14–17)**
- Integrate Bhashini for Kannada/English ASR and TTS.
- Validate direct Kannada/English text handling by the LLM against real Kannada police terminology, not just casual phrases.
- Build the ConvoKraft public FAQ assistant as a genuinely separate, unauthenticated path scoped to procedural questions only; confirm it structurally cannot reach case data.
- Add PDF export of conversation history.

**Phase 4 — Analytics and priority scoring (days 18–20)**
- QuickML pipelines for hotspot and trend detection.
- Rule-based, transparent priority scoring — explicit contributing factors shown, no protected attributes in the feature set, framed as a lead indicator rather than a verdict.
- Missing-evidence detection: compare each case's attached evidence against a crime-type checklist template and flag gaps.

**Phase 5 — Demo preparation (remaining days)**
- Script the two-role RBAC demonstration: same query, two logins, visibly different results.
- Rehearse the case-twin-finder opening sequence — new FIR in, entity resolution, signature, ranked twins with evidence — as the lead demo beat.
- Prepare explicit "what we chose not to build and why" talking points; restraint reads as maturity to a panel that's seen every team's version of the ambitious feature list.

## 5. Performance and viability analysis

### What to measure, per component

| Component | Metric | How to test it |
|---|---|---|
| Entity resolution | Precision/recall on merges | Seed the dataset with deliberately aliased duplicate records (name variants, partial address matches); measure correct merges vs. false merges |
| Case-twin finder | Precision@k / manual relevance scoring | Seed a handful of deliberately near-duplicate "twin" cases with varied phrasing; confirm they surface in top results |
| RBAC | Pass/fail on a negative test suite | Attempt cross-role and cross-jurisdiction access directly; confirm denial *and* confirm an audit log entry is created for the attempt itself |
| Query latency | End-to-end response time | Time structured/graph queries against a single-digit-second target; disclose LLM-reasoning latency honestly rather than hiding it |
| Kannada handling | Accuracy on real terminology | Build a small curated set of real Kannada police phrasing (not generic sentences); spot-check ASR and direct text handling before demo day |
| Explainability | Binary compliance | Every returned answer must carry at least one cited source record ID, enforced structurally by the evidence composer — worth testing that no code path can bypass it |

### Validating without real production data

The dataset for this event will almost certainly be synthetic or heavily masked, not real CCTNS/Police-IT data, for the same legal-sensitivity reasons that make real data inappropriate to hand to a hackathon in the first place. That means the validation strategy has to be built, not assumed: deliberately seed the sample dataset with known-answer test cases — duplicate-with-variation person records for entity resolution, near-duplicate cases with different phrasing for the twin-finder, cross-role access attempts for RBAC — and use those seeded scenarios as the actual proof points in the pitch, instead of a general "it works" claim. This is also the honest way to talk about production readiness: name what's validated against the seeded synthetic data today, and name specifically what would need re-tuning against real, messier station-level records (OCR'd scanned FIRs, inconsistent district-level schemas, genuine transliteration noise) in an actual deployment.

### Operational and cost viability

- Bhashini's open pipeline API is explicitly scoped to proof-of-concept use; a real deployment needs their paid production tier — a known, plannable cost rather than a surprise.
- LLM API costs scale with query volume; have a rough per-query cost estimate ready (the token cost of the reasoning and evidence-composer steps) rather than leaving cost as an unaddressed question.
- Real deployment timelines for comparable Indian state integrations (CCTNS plus other core systems) have run three to six months in recent rollouts — worth citing as the honest production-timeline comparison against a three-week prototype, rather than implying the datathon build is deployment-ready as-is.
- The India Data Center choice keeps the data-residency story simple and avoids a cross-border transfer conversation entirely.

### How this likely gets judged

Comparable recent police-hackathon events in India have scored along lines like concept, design, development, scalability, and adaptability, and it's reasonable to expect a similar mix here alongside the brief's own explicit emphasis on explainability and governance. Mapped against that: concept is carried by the entity-resolution-first reframing and the case-twin-finder narrative; design and development are carried by staying genuinely Catalyst-native rather than bolting on a generic stack; scalability is carried by the cost and timeline honesty above; adaptability — multilingual support, role-based views for different ranks — is carried by the Kannada design and the RBAC model. The single strongest thing to lead with in front of judges is probably the live two-role RBAC demonstration, since it's the one part of the pitch that can't be faked with a slide.

## 6. Drawbacks and how to overcome them

| Drawback | Why it's real | Mitigation |
|---|---|---|
| Entity resolution errors have real consequences, not just technical debt | A false merge can attach one person's criminal history to a different, innocent person | Medium/low-confidence matches never auto-merge; every auto-merge stays reversible and logged with the triggering evidence |
| Evidence composer reduces hallucination, doesn't eliminate it | An LLM can cite a real record while misrepresenting what's in it | Golden-set regression testing at build time; periodic manual audit of a sample of live answers against their cited sources in production |
| Kannada quality is a genuine risk | LLM capability in lower-resource languages measurably lags English | Test against real Kannada police terminology; treat "not confident, here's the closest verified answer" as a safe failure mode |
| Tuning against synthetic data risks optimizing for the demo | A small sample dataset can be gamed without the system actually being robust | Use seeded cases to validate the mechanism, not to maximize apparent accuracy — and say so in the pitch |
| Deep Catalyst-native design constrains future portability | Tight coupling has a real cost if KSP ever needed to move platforms | Keep core logic (matching, scoring, composition) in code that calls Catalyst services rather than code inseparable from Catalyst-specific syntax |
| Cloud/connectivity dependency is invisible in a demo, real at scale | Rural stations can't be assumed to have reliable high-throughput connectivity | Name this explicitly as a production-phase requirement (offline caching/local fallback), not a prototype gap to hide |
| Judging rubric and panel composition aren't fully public | Irreducible uncertainty in any competitive submission | Lean on broadly defensible principles (explainability, RBAC, restraint) rather than optimizing for one guessed score weighting |

## 7. The winning strategy, distilled

1. Open the demo with the case-twin-finder sequence — FIR in, entity resolution confidence shown, ranked twins with evidence — the most persuasive proof point available.
2. Make the two-role RBAC comparison a live moment, not a slide.
3. State, unprompted, what was deliberately not built and why — restraint reads as maturity to a panel that's seen every team's ambitious feature list.
4. Ground the pitch in real numbers, not vague claims of scale.
5. Name the real precedents confidently (Maharashtra, Gujarat/Delhi/Chandigarh, Goa) and use Karnataka's current gap relative to them as the urgency case.
6. Close with the state-level vision below — a team that's visibly thought past the demo reads as more fundable, not just more impressive.

## 8. From datathon prototype to a state-level deployment

Karnataka State Police runs roughly 900 police stations across 32 districts and 6 city commissionerates under 7 ranges, with crime-data computerization already institutionally owned by the Police Computer Wing and the State Crime Records Bureau. That is the honest target, and it differs in kind — not just degree — from a demo against a synthetic dataset.

Maharashtra's MahaCrimeOS AI is the closest live precedent for exactly this jump: a 23-station Nagpur pilot the state announced expanding to all 1,100 Maharashtra stations within the year. Its rollout has been unusually candid about what changes at scale:

- **Data isn't clean before AI ever touches it.** The platform's technical lead named inconsistent terminology across real station records — different words describing the same financial fraud or method — as the first real challenge, independent of anything AI-related. This is the entity-resolution problem at the center of this design, independently confirmed by a team that's done this at state scale.
- **Connectivity is a real production constraint.** Rural stations commonly lack reliable high-throughput internet; a cloud-first architecture needs offline caching or local fallback modes to function there. A demo on a stable connection doesn't have to solve this — a statewide rollout does.
- **A hackathon team isn't the long-term owner.** Maharashtra created a dedicated special-purpose vehicle (MARVEL) specifically to own AI deployment in law enforcement, rather than leaving it with the original build team. The honest framing here is "a prototype KSP's technical wing could adopt and extend," with the existing Police Computer Wing and State Crime Records Bureau as the plausible institutional home.
- **Independent scrutiny is the norm for this category, not a hypothetical.** Researchers evaluating Maharashtra's rollout have directly raised hallucination, bias, data-governance, and fair-trial-rights concerns, and asked whether SOPs exist for post-deployment monitoring including model drift — exactly what this design's audit-everything, evidence-composer-always approach is built to answer, but at state scale it needs a published, public-facing governance document, not just a well-built system.
- **Scale in stages, with published acceptance criteria.** The soundest independent guidance on Maharashtra's rollout is to define minimum acceptance criteria — accuracy, false-positive rate, latency — with independent validation required before each expansion stage, rather than one statewide launch. That's a strong "what happens after we win" narrative: pilot in two or three districts, publish the numbers, expand only once they're met.

Worth stating plainly in the pitch: officers on Maharashtra's Nagpur pilot report tasks that previously took months now taking days. That's the realistic scale of what's being proposed for Karnataka here — not hypothetical, but actively happening one state over, on a comparable timeline to this datathon.

---

*Sources consulted: SoundThinking (CrimeTracer Gen3 product pages and press releases, soundthinking.com); Innefu Labs (AI-powered Intelligence Fusion Centres, innefu.com); Microsoft News Source Asia and independent coverage (MahaCrimeOS AI, Maharashtra Police, MARVEL); BW Police World (Goa Police "Deep Trace"); Zoho (Catalyst documentation and data center guidance); Bhashini (bhashini.gov.in, National Language Translation Mission); MeitY-linked legal trackers (DPDP Rules 2025 implementation status); Karnataka State Police organizational structure (ksp.karnataka.gov.in, Wikipedia).*
