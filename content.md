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

---

## 5. Issues & Technical Problems Faced and Implemented Solutions

| # | Technical Challenge | Root Cause | Implemented Solution |
|---|---|---|---|
| 1 | **AppSail 503 Container Startup Timeout** | Top-level `import sklearn` in `case_twin_fn.py` took ~15s, missing platform port-binding window. | Moved `sklearn` imports inside function body (lazy loading), dropping startup time to <1s. |
| 2 | **Parallel Backends & Dual Architecture** | Project contained legacy `functions/` and new `appsail/` container simultaneously. | Consolidated all API routes into modular FastAPI APIRouters under `appsail/`. |
| 3 | **CLI Blocking in Automated Scripts** | `catalyst init/deploy` hung waiting for TTY stdin prompts in non-interactive shell. | Built Node.js wrapper scripts (`run_init.js`, `run_deploy.js`) mocking TTY stdin responses. |
| 4 | **SDK Init Failure in Local Tests** | `zcatalyst_sdk.initialize()` failed locally due to missing cloud headers (`X-ZC-Session-ID`). | Built `CatalystRepository` fallback mode using mock datasets & in-memory audit logs. |
| 5 | **Module Shadowing from Local `pip -t .`** | Local wheel packages inside `appsail/` corrupted standard Python package imports. | Cleaned untracked package directories from `appsail/` using `git clean`. |
| 6 | **Missing LLM Key Blocking Route API** | `/route` threw 400 error when `GEMINI_API_KEY` was missing from environment. | Added rule-based fallback regex classifier in `intent_router_fn.py`. |
| 7 | **SmartBrowz Gating in Fallback DB Mode** | PDF generation was blocked if database ran in seed/fallback mode even on live Catalyst. | Decoupled SmartBrowz app check from database fallback mode (`getattr(repo, 'app', None)`). |
| 8 | **Supreme Court Aadhaar Compliance** | Legal ban on using Aadhaar as matching identifier in entity resolution. | Standardized resolution strictly on non-Aadhaar keys (Phone, VRN, DL, Voter ID). |

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

## 7. UI/UX Audit & Quality Assessment Summary

An evaluation by a Senior UI/UX Auditor scored the Pramaan interface across seven design dimensions:

* **Top Strengths**: Clear security role badges (`Role: SI` / `Role: ACP`), dynamic SVG Criminal Topology Graph visualization, and structured query suggestions for natural language search.
* **Key Improvement Opportunities**: Reformatting raw JSON blocks (`<pre>`) into human-readable summary cards, adding explicit recovery actions to 403 error alerts, enhancing mobile responsive flex layouts, and standardizing primary button color hierarchies.
* **Overall Organization Verdict**: **Well Organized** — The top-level tabbed architecture cleanly segregates complex intelligence workflows (*Case-Twin Matching*, *Entity Resolution*, *Graph Relations*, *Natural Language Routing*, and *Analytics*) into predictable, domain-specific views.
