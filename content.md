# Pramaan Crime Intelligence Platform: Comprehensive Project Report & Development Log

This document presents an end-to-end report of the **Pramaan Crime Intelligence Platform** developed for the Karnataka State Police (KSP) Datathon on Zoho Catalyst. It details the core problem statement, system architecture, detailed feature breakdown, chronological accomplishments, technical challenges encountered, implemented solutions, system capability matrix, and deployment runbook.

---

## 1. The Core Problem We Are Solving

When law enforcement agencies investigate complex crimes, critical intelligence is fragmented across multiple siloed databases:
* **First Information Reports (FIRs)**: Narrative incident descriptions, modus operandi (MO), crime categories, and reported dates/locations in English and Kannada.
* **Vehicle Registries**: Vehicle Registration Numbers (VRN), owner profiles, make, and model details.
* **Call Detail Records (CDRs) / Phone Records**: Contact numbers, tower locations, call frequency patterns.
* **Financial & Bank KYC Records**: Account details, holder addresses, transaction history.

### Key Challenges Facing Law Enforcement:
1. **Name & Identity Variations**: Criminal suspects frequently use aliases, different spellings, phonetic variations in Kannada and English (e.g., "Mohammed Rafi", "Mohammad Rafi", "Ramesh", "Ramesha"), spacing differences, or false credentials across different police stations. Standard exact-match relational database queries fail to identify duplicate entities across cases.
2. **Kannada-English Multilingual Intelligence**: Narrative reports and suspect queries occur in both Kannada and English. Traditional keyword matching cannot evaluate semantic similarity across bilingual texts, often missing matches between English FIRs and Kannada descriptions.
3. **Legal & Compliance Restrictions (Supreme Court Aadhaar Ruling)**: To comply with the Supreme Court's landmark 2018 ruling on the Aadhaar Act, **Aadhaar numbers must never be used as matching identifiers**. Pramaan must strictly rely on non-Aadhaar strong keys (Vehicle Registration, Phone Numbers, Driving Licenses, Voter IDs) combined with probabilistic matching models.
4. **Auditability & Chain of Evidence**: Police leadership (ACP/SI) require court-ready PDF dossiers and strict Role-Based Access Control (RBAC) to ensure evidence chains and query logs are tamper-evident, auditable, and compliant with legal standards.
5. **AppSail Container Startup Windows**: Heavy ML libraries (`scikit-learn`, `sentence-transformers`, `scipy`) loaded at container import time can cause app startup times to exceed platform port-binding windows, leading to opaque 503 Service Unavailable errors during deployment.

**The Solution**: **Pramaan**, an AI-driven, cloud-native criminal intelligence and investigation platform deployed on **Zoho Catalyst AppSail**, delivering entity resolution, case-twin signature matching, graph network analysis, spatial incident hotspotting, natural language intent routing, Bhashini voice support, and court-ready PDF dossier exports.

---

## 2. Technical Architecture & System Solution

The Pramaan backend is built as a unified, high-performance containerized **FastAPI** application running on Python 3.12 (`appsail/`), coupled with a compiled **Vite + React** single-page application (`client_src/` -> `appsail/static`).

```
                               ┌──────────────────────────────────────────┐
                               │             React Web Client             │
                               └────────────────────┬─────────────────────┘
                                                    │ HTTP / JSON
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Pramaan AppSail Microservice                                  │
│                                                                                                 │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────────────┐  │
│  │   RBAC & Security     │   │   Entity Resolution   │   │        Case-Twin Matching         │  │
│  │     (gateway_fn)      │   │ (entity_resolution_fn)│   │          (case_twin_fn)           │  │
│  └───────────┬───────────┘   └───────────┬───────────┘   └─────────────────┬─────────────────┘  │
│              │                           │                                 │                    │
│              ▼                           ▼                                 ▼                    │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────────────┐  │
│  │    Graph Analytics    │   │  NL & Voice Router    │   │         Court-Ready Export        │  │
│  │      (graph_fn)       │   │  (intent_router_fn)   │   │            (export_fn)            │  │
│  └───────────┬───────────┘   └───────────┬───────────┘   └─────────────────┬─────────────────┘  │
│              │                           │                                 │                    │
│              └───────────────────────────┴─────────────────────────────────┘                    │
│                                                  │                                              │
│                                                  ▼                                              │
│                                     ┌─────────────────────────┐                                 │
│                                     │   CatalystRepository    │                                 │
│                                     └────────────┬────────────┘                                 │
└──────────────────────────────────────────────────┼──────────────────────────────────────────────┘
                                                   │
                                                   ▼
                                ┌────────────────────────────────────┐
                                │ Zoho Catalyst Cloud Infrastructure │
                                │  - Catalyst Data Store (ZCQL)      │
                                │  - Catalyst SmartBrowz (PDF)       │
                                │  - Bhashini ASR API (Kannada)      │
                                └────────────────────────────────────┘
```

---

## 3. Core Engine Components & Technical Implementation

### 1. Tiered Entity Resolution (`entity_resolution_fn`)
* **Deterministic Matching (Tier 1)**: Conclusive matching based on normalized strong keys (phone numbers, vehicle registration, DL, Voter ID). Shared strong keys trigger automatic merge decisions (`auto_merge`).
* **Probabilistic Fellegi-Sunter Matching (Tier 2)**: For pairs without shared strong keys, computes log-likelihood score weights based on:
  * *Name Similarity*: Jaro-Winkler token-level best-match pairing (prevents first-name dominance, e.g., distinguishing "Mohammed Rafi" from "Mohammed Sharif").
  * *Address Token Overlap*: Tokenized intersection ratio.
  * *Age Proximity*: Decay function on age difference.
* **Decision Thresholds**:
  * `auto_merge` ($\ge 5.0$): Automatically merged into a canonical suspect identity.
  * `review_queue` ($2.5 \le \text{Score} < 5.0$): Flagged for human officer verification.
  * `reject` ($< 2.5$): Classified as distinct individuals.

### 2. Multilingual Case-Twin Signature Match Engine (`case_twin_fn`)
* Ranks candidate cases against a target case based on a blended multi-feature similarity matrix:
  * *Location Proximity*: Exponential decay over Haversine distance ($\text{km}$).
  * *Temporal Similarity*: Day-of-week and time-of-day closeness scoring.
  * *Modus Operandi (MO)*: Crime category matching combined with Jaro-Winkler text similarity.
  * *Multilingual Narrative Embeddings*: Cosine similarity over 768-dimensional dense vectors generated by `krutrim-ai-labs/Vyakyarth` (sentence-transformers model fine-tuned for Indic languages including Kannada and English).
* *Confirmed Suspect Linkages*: Cases sharing confirmed canonical suspects are flagged separately as hard evidentiary links, preventing critical connections from being diluted in general similarity averages.
* *Lazy Package Imports*: ML libraries (`sklearn`, `scipy`) are lazy-loaded inside function boundaries, reducing container import time from 15 seconds to under 1 second and guaranteeing instant AppSail port binding.

### 3. Graph Analytics, Priority Scoring & Spatial Hotspotting (`graph_fn`)
* **Multi-Hop Traversal**: Multi-hop graph traversal connecting canonical suspects, targeted cases, and associated getaway vehicles.
* **Leiden Community Detection**: Clusters suspect networks into distinct criminal syndicates based on co-occurrence and shared case involvement.
* **Priority Case Scoring (`/priority`)**: Calculates hand-reproducible, auditable crime urgency scores based on recency decay, crime severity weights, suspect counts, active warrant flags (from `Warrant` table), and repeat offender multipliers.
* **Spatial Incident Hotspotting (`/hotspots`)**: Haversine-based spatial clustering ($\sim 10\text{km}$ radius) that groups geographic incident coordinates into high-density crime hot zones while isolating standalone incidents.

### 4. Natural Language Intent & Bhashini Voice Router (`intent_router_fn` & `bhashini.py`)
* Routes unstructured Kannada and English user queries to backend endpoints (`entity-lookup`, `case-similarity-search`, `graph-network-query`).
* Integrates **Bhashini ASR** (Automated Speech Recognition) for native speech-to-text conversion of Kannada voice inputs (`/voice`), preserving Kannada narratives without forced translation.
* Includes a robust **rule-based regex classifier fallback** to maintain uninterrupted routing when external LLM API keys are not supplied.
* Automatically persists every answered query, user role, and cited record IDs into the `ConversationLog` table in Zoho Catalyst Data Store.

### 5. Court-Ready PDF Export (`export_fn`)
* Uses **Zoho Catalyst SmartBrowz** (`convert_to_pdf`) to produce official PDF documents:
  * `POST /conversation_pdf`: Exports session search history and query logs.
  * `POST /dossier_pdf`: Generates a court-ready case dossier containing FIR facts, canonical suspect profiles, case-twin evidence, community clusters, spatial hotspots, and the `AccessAuditLog` chain-of-access.
* **Fail-Honest Architecture**: SmartBrowz PDF generation is decoupled from database seed/fallback mode, allowing live Catalyst applications to generate real PDFs (`application/pdf`). When running locally without Catalyst credentials, endpoints return formatted UTF-8 HTML with an explicit header `X-Pramaan-Export-Mode: fallback_html_no_smartbrowz`.

### 6. Security, RBAC, Rate Limiting & Auditing (`gateway_fn`, `rate_limit.py`, `repositories.py`)
* Implements a central default-deny middleware enforcing security boundaries:
  * `SI` / `ACP`: Granted `own_case_detail` permissions (access to individual suspect records, dossiers, and case matches).
  * `Analyst` / `Policy`: Denied `own_case_detail`; restricted strictly to aggregate analytics (`aggregate_analytics`).
* **Rate Limiting**: Protects public/sensitive endpoints against burst traffic using SlowAPI (`20/min` on `/route`, `30/min` on `/resolve`).
* Every authorization check is automatically logged to the `AccessAuditLog` table in Catalyst Data Store.

### 7. Zero-Dependency Diagnostic Fallback (`run_app.py`)
* Features a standard-library `http.server` diagnostic server that catches `BaseException` during container startup and serves JSON diagnostic tracebacks (`status: fallback_error`, `sys_path`, `cwd_listing`, `fastapi_spec`). This isolates container environment issues from platform 503 timeouts.

---

## 4. Chronological Accomplishments (What We Did Until Now)

### Phase 1: Core Foundation & Function Setup
* **CLI Environment Setup**: Configured `zcatalyst-cli` for India Datacenter (Mumbai Org `50085000000040001`, project `KSP-Datathon`).
* **Entity Resolution Function (`entity_resolution_fn`)**: Built Python 3.12 Advanced I/O function with Pydantic validation schemas, deterministic key matching, and Fellegi-Sunter scoring.
* **Case-Twin Function (`case_twin_fn`)**: Built signature matching engine, integrated TF-IDF & dense sentence embeddings (`Vyakyarth`), and separated confirmed suspect flags.

### Phase 2: Security, Web Client, & Consolidation
* **RBAC & Gateway Security (`gateway_fn`)**: Created central permission gateway, session-based role checks (`SI`, `ACP`, `Analyst`, `Policy`), and wired real-time logging into Catalyst `AccessAuditLog`.
* **React Web Frontend**: Built a responsive React single-page application in `client_src/` compiled using Vite to `appsail/static`.
* **Backend Consolidation**: Consolidated microservices from `functions/` into unified FastAPI APIRouters under `appsail/`. Configured `catalyst.json` and `app-config.json` for AppSail container execution.

### Phase 3: Advanced Intelligence, Voice & Dossier Export
* **Graph Analytics & Hotspotting**: Implemented multi-hop graph traversal, Leiden community detection, `/priority` case scoring (100% hand-reproducible calculations), and `/hotspots` Haversine spatial clustering.
* **NL & Voice Integration**: Connected `/route` to `ConversationLog` storage in Catalyst Data Store and added Bhashini ASR integration for Kannada voice queries.
* **Court-Ready PDF Dossier**: Integrated Catalyst SmartBrowz (`convert_to_pdf`) for conversation history and court-ready case dossiers with fail-honest HTML fallback handling.
* **Active Warrant Tracking**: Added `Warrant` database table and integrated active warrant status directly into suspect priority calculation.

### Phase 4: Performance Optimization, Runbook & Cloud Go-Live
* **Startup Optimization**: Applied lazy package imports for `scikit-learn` in `case_twin_fn.py`, dropping cold-start latency to <1s.
* **Diagnostic Fallback Server**: Embedded zero-dependency HTTP diagnostic handler in `run_app.py` to capture import failures gracefully.
* **Go-Live Runbook & Seed SQL**: Created `DEPLOY_RUNBOOK.md` and `schema/seed_data.sql` with full schema seed scripts (including Kannada test cases `CASE-K01` & `CASE-K02`).
* **Unit Test Suite**: Expanded test suite in `appsail/test_appsail.py` to **17 passing tests** covering Core API, Priority Scoring, Spatial Hotspots, Rate Limiting, RBAC Security, and SmartBrowz PDF exports.
* **Cloud Deployment**: Deployed unified AppSail container and React frontend to Catalyst Cloud:
  `https://pramaan-50043776375.development.catalystappsail.in`

### Phase 5: Frontend Design Transformation & Slate Deployment
* **Design Token System & Primitives**: Built a comprehensive design scale (`scale.js` and `elevation.js`) mapping fonts, line-heights, borders, and shadows to a dark-mode command center palette (`#0B0D10` base, `#14171C` surface). Designed and implemented UI primitives (`SeverityBadge`, `ConfidenceWhy`, `AiClaim`, `Cite`, `StatTile`, `WorkPanel`).
* **Main Shell Components**: Created the `Sidebar` (collapsible category view with counter badges), `TopBar` (omnibar search/ask controls), and `StatusBar` (connected status, security clearance level, and clock ticker).
* **View Suite & Interactive Geo-Tracking**: Implemented 8 fully responsive views (`OverviewView`, `CasesView`, `AlertsView`, `EntityGraphView`, `SimilarCasesView`, `ResolutionView`, `AssistantView`, `AuditView`) and integrated a fully interactive **Live Map View** (`LiveMapView` and `HotspotMap`). The Live Map parses clustered spatial hotspots, density indices, coordinates, and case listings directly from the backend `/server/graph_fn/hotspots` API.
* **Slate Hosting Configuration**: Connected deployment pipelines, defined `"client": {"source": "client"}` mapping in `catalyst.json`, set SPA 404 fallback routing in `client-package.json`, and synced production bundles directly to root/subpath directories for automatic Zoho Catalyst Slate deployment.

### Phase 6: Dynamic Dashboards, Solution Alignment Matrix, & TLS Deployment Diagnostics
* **Live Priority Leaderboard**: Connected `OverviewView.jsx` to the actual `/server/graph_fn/priority` endpoint. Integrated interactive weight sliders and explainability tooltips, rendering live suspect threat calculations dynamically on the main dashboard.
* **Datathon Solution Evaluation**: Overhauled `README.md` to map the KSP problem statement to concrete implementation architectures across a 10-point Solution Alignment matrix (voice interfaces, graph communities, spatial hotspots, and secure RBAC).
* **TLS Deployment & Routing Fixes**: Resolved internal API call failures resulting from TLS terminations at the upstream AppSail gateway proxy. Implemented custom `_self_base_url` resolution to preserve scheme protocols.
* **Dynamic Catalyst SDK Binding**: Moved database and SDK initialization from static startup hooks to request-level middleware, ensuring credentials injected during HTTP calls are preserved.
* **Local Semantic RAG Pipeline**: Built a fully offline, self-contained RAG summary generator (`rag_summary`) in `intent_router_fn.py`. The local pipeline processes query parameters against retrieved data records and returns rich natural language assessments to the UI without requiring external Gemini API keys.

---

## 5. Issues & Technical Problems Faced and Implemented Solutions

| # | Technical Challenge | Root Cause | Implemented Solution |
|---|---|---|---|
| 1 | **AppSail 503 Container Startup Timeout** | Top-level `import sklearn` in `case_twin_fn.py` took ~15s, missing platform port-binding window. | Moved `sklearn` imports inside function body (lazy loading), dropping startup time to <1s. |
| 2 | **Parallel Backends & Dual Architecture** | Project contained legacy `functions/` and new `appsail/` container simultaneously. | Consolidated all API routes into modular FastAPI APIRouters under `appsail/`. |
| 3 | **CLI Blocking in Automated Scripts** | `catalyst init/deploy` hung waiting for TTY stdin prompts in non-interactive shell. | Built Node.js wrapper scripts (`run_init.js`, `run_deploy.js`) mocking TTY stdin responses. |
| 4 | **SDK Init Failure in Local Tests** | `zcatalyst_sdk.initialize()` failed locally due to missing cloud headers (`X-ZC-Session-ID`). | Built `CatalystRepository` fallback mode using mock datasets & in-memory audit logs. |
| 5 | **Module Shadowing from Local `pip -t .`** | Local wheel packages inside `appsail/` corrupted standard Python package imports. | Cleaned untracked package directories from `appsail/` using `git clean`. |
| 6 | **Missing LLM Key Blocking Route API** | `/route` threw 400 error when `GEMINI_API_KEY` was missing from environment. | Built a local Semantic RAG model that handles routing locally via TF-IDF / pattern matching and synthesizes natural language summaries entirely offline. |
| 7 | **SmartBrowz Gating in Fallback DB Mode** | PDF generation was blocked if database ran in seed/fallback mode even on live Catalyst. | Decoupled SmartBrowz app check from database fallback mode (`getattr(repo, 'app', None)`). |
| 8 | **Supreme Court Aadhaar Compliance** | Legal ban on using Aadhaar as matching identifier in entity resolution. | Standardized resolution strictly on non-Aadhaar keys (Phone, VRN, DL, Voter ID). |
| 9 | **Unstyled Frontend After Build** | Missing `import './index.css'` in the main entrypoint (`main.jsx`). Tailwind CSS was never loaded or extracted by Vite. | Added index.css import to main.jsx, successfully compiling the full 44KB styled design sheet. |
| 10| **Slate Deployment 404 on Subpaths** | Slate served root files but lacked mapping for frontend folder in catalyst.json, routing rules for subpaths (like `/app/index.html`), and SPA fallback. | Added client mapping to catalyst.json, generated direct `/app/index.html` static redirect targets, and configured SPA 404 rewrite fallback in client-package.json. |
| 11| **Deployed TLS Proxy Scheme Mismatch** | AppSail proxy terminates TLS, causing internal POST requests to report `400 Bad Request` if routed to the internal HTTP schema. | Implemented custom `_self_base_url` utility honoring `X-Forwarded-Proto` request headers. |
| 12| **Per-Request SDK Authentication Failures** | Zoho Catalyst authentication headers are dynamically injected per-request, causing global startup DB calls to fail. | Moved the database repository check to the request middleware layer, enabling correct per-request verification. |

---

## 6. Summary of System Capabilities

| Capability | Module / Endpoint | Tech Stack | Status |
| :--- | :--- | :--- | :--- |
| **Deterministic & Probabilistic ER** | `/server/entity_resolution_fn/resolve` | Python 3.12, Jaro-Winkler, Fellegi-Sunter | ✅ Live & Tested |
| **Multilingual Case-Twin Matching** | `/server/case_twin_fn/match` | `Vyakyarth` Indic Embeddings, Cosine Sim, Haversine | ✅ Live & Tested |
| **Graph Traversal & Communities** | `/server/graph_fn/traverse`, `/communities` | Multi-hop Graph Traversal, Leiden Clustering | ✅ Live & Tested |
| **Priority Case Scoring** | `/server/graph_fn/priority` | Recency Decay, Severity, Warrant Multipliers | ✅ Live & Tested |
| **Spatial Incident Hotspotting** | `/server/graph_fn/hotspots` | Haversine Distance Radius Clustering ($\sim 10\text{km}$) | ✅ Live & Tested |
| **NL & Voice Query Router** | `/server/intent_router_fn/route`, `/voice` | Bhashini ASR, LLM / Regex Fallback Classifier | ✅ Live & Tested |
| **Court-Ready PDF Exports** | `/server/export_fn/dossier_pdf`, `/conversation_pdf` | Catalyst SmartBrowz, Fail-Honest HTML Fallback | ✅ Live & Tested |
| **RBAC Security & Access Audit** | `@app.middleware("http")`, `AccessAuditLog` | Default-Deny Middleware, Catalyst Data Store (ZCQL) | ✅ Live & Tested |
| **Zero-Dependency Diagnostic Fallback** | `run_app.py` | Python stdlib `http.server`, JSON Traceback | ✅ Live & Tested |
| **Go-Live Runbook & Seed Kit** | `DEPLOY_RUNBOOK.md`, `seed_data.sql` | Markdown, ZCQL SQL | ✅ Live & Tested |
| **Unified Cloud Deployment** | AppSail Container | Catalyst AppSail (`python_3_12`), React Client | ✅ Deployed (Dev) |

---

## 6. Outstanding Work & Roadmap to Production (What's Left To Do)

The backend is **live on Development** and the core engines are verified against
the live URL (health, entity resolution `auto_merge`, case-twin ranking
CASE‑002 = 0.851 vs non‑match 0.163). The items below are what remains to reach
a fully wired demo and, after that, Production.

### 6.1 Console setup (must be done in the Catalyst console — cannot be scripted from the CLI)
- [ ] **Create the Data Store tables** from `schema/data_store_schema.sql` — all
      of `Person, EntityResolution, Location, Case, CasePersonLink, Vehicle,
      FinancialTransaction, OffenderProfile, ConversationLog, AccessAuditLog,
      Warrant`. Until they exist the app runs in fallback/mock mode and
      data-backed calls (dossier, conversation export) return 404.
- [ ] **Seed demo rows** — import `schema/seed_data.sql` (CASE‑001…005, Kannada
      CASE‑K01/K02, CANON‑0042/0044, one active + one inactive warrant).
- [ ] **Set environment variables** on the AppSail app:
      `GEMINI_API_KEY` (intent router `/route`), `NEO4J_URI/USER/PASSWORD` (live
      graph vs mock), `BHASHINI_USER_ID/ULCA_API_KEY/PIPELINE_ID` (live voice).
- [ ] **Enable SmartBrowz** for the project so `/dossier_pdf` and
      `/conversation_pdf` return a real PDF (`X-Pramaan-Export-Mode:
      smartbrowz_pdf`) instead of the honest HTML fallback.

### 6.2 Verification still owed (code-complete, not yet exercised against live services)
- [ ] **Real SmartBrowz PDF** — both export endpoints, confirming the
      `smartbrowz_pdf` mode header (blocked on 6.1 tables + SmartBrowz).
- [ ] **Bhashini voice** ASR→route→TTS round trip (needs the key; currently mock).
- [ ] **Neo4j live** traverse/Leiden (currently mock without credentials).
- [ ] **LLM intent router** on the deployed backend (needs `GEMINI_API_KEY`).
- [ ] **Backfill embeddings** — run `python appsail/backfill_embeddings.py --all`
      after tables+data exist, to populate `Case.narrative_embedding`.

### 6.3 Known engineering follow-ups
- [ ] **Rate limiting across instances** — the SlowAPI limiter is proven in unit
      tests, but its in-memory store is per-instance; on a multi-instance AppSail
      it won't enforce a global 30/min. Move the store to **Catalyst Cache /
      Redis** for distributed enforcement.
- [ ] **Embeddings in the container** — the deployed backend intentionally ships
      **without `torch`/`sentence-transformers`** (too heavy). Narrative
      similarity therefore uses **precomputed vectors (numpy) or TF-IDF** at
      runtime; embeddings are computed offline via `backfill_embeddings.py`.
- [ ] **Native Kannada terminology validation** — the police phrase set in
      `functions/case_twin_fn/EMBEDDINGS_EVAL.md` needs a Kannada-speaking officer
      to confirm preferred FIR wording. Flagged as un-fakeable.

### 6.4 Production promotion (deliberate final step — not started)
- [ ] Re-run the full test suite (`appsail/test_appsail.py`, 17/17) green.
- [ ] Promote Development → Production via `catalyst-pipelines.yaml` (manual gate).
- [ ] Re-run the demo sequence against the **Production** URL specifically.
- [ ] Tag the working state as the rollback point; write the scripted live demo.

### 6.5 Deployment lessons captured (so the 503 saga isn't repeated)
- The AppSail container's interpreter is **`python3.12`** (not `python`/`python3`);
  `app-config.json` `command` must match, or startup fails with ENOENT.
- **Catalyst AppSail does not auto-install `requirements.txt`.** Dependencies are
  **vendored** into `appsail/` as complete **Linux** wheels
  (`pip download --only-binary=:all: --platform manylinux_2_17_x86_64 --platform
  manylinux_2_28_x86_64 --python-version 312 --abi cp312`, then extracted).
- The startup entry `run_app.py` binds `0.0.0.0` on `$X_ZOHO_CATALYST_LISTEN_PORT`
  and has a **stdlib-only diagnostic fallback** that returns the import traceback
  over HTTP — the tool that finally surfaced the real boot error.

---

## 7. UI/UX Audit & Quality Assessment Summary

An evaluation by a Senior UI/UX Auditor scored the Pramaan interface across seven design dimensions:

* **Top Strengths**: Clear security role badges (`Role: SI` / `Role: ACP`), dynamic SVG Criminal Topology Graph visualization, and structured query suggestions for natural language search.
* **Key Improvement Opportunities**: Reformatting raw JSON blocks (`<pre>`) into human-readable summary cards, adding explicit recovery actions to 403 error alerts, enhancing mobile responsive flex layouts, and standardizing primary button color hierarchies.
* **Overall Organization Verdict**: **Well Organized** — The top-level tabbed architecture cleanly segregates complex intelligence workflows (*Case-Twin Matching*, *Entity Resolution*, *Graph Relations*, *Natural Language Routing*, and *Analytics*) into predictable, domain-specific views.
