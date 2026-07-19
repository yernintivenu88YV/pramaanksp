# Pramaan Crime Intelligence Platform: Comprehensive Project Report & Development Log

This document presents an end-to-end report of the **Pramaan Crime Intelligence Platform** developed for the Karnataka State Police (KSP) Datathon on Zoho Catalyst. It details the core problem statement, architectural design, chronological accomplishments, technical challenges encountered, and implemented solutions.

---

## 1. The Core Problem We Are Solving

When law enforcement agencies investigate complex crimes, critical intelligence is fragmented across multiple siloed databases:
* **First Information Reports (FIRs)**: Narrative incident descriptions, modus operandi (MO), crime categories, and reported dates/locations.
* **Vehicle Registries**: Vehicle Registration Numbers (VRN), owner profiles, make, and model details.
* **Call Detail Records (CDRs) / Phone Records**: Contact numbers, tower locations, call frequency patterns.
* **Financial & Bank KYC Records**: Account details, holder addresses, transaction history.

### The Key Challenges:
1. **Name & Identity Variations**: Criminal suspects frequently use aliases, different spellings, phonetic variations in Kannada and English (e.g., "Ramesh", "Ramesha", "Ramya"), spacing differences, or false credentials across different police stations. Standard exact-match relational queries fail to identify duplicate entities.
2. **Kannada-English Multilingual Intelligence**: Narrative reports and suspect queries occur in both Kannada and English. Traditional keyword matching cannot evaluate semantic similarity across bilingual texts.
3. **Legal & Compliance Restrictions (Supreme Court Aadhaar Ruling)**: To comply with the Supreme Court's 2018 ruling on the Aadhaar Act, **Aadhaar numbers must never be used as matching identifiers**. Pramaan must rely on alternative strong keys (Vehicle Registration, Phone Numbers, Driving Licenses, Voter IDs) combined with probabilistic matching models.
4. **Auditability & Chain of Evidence**: Police leadership (ACP/SI) require court-ready PDF dossiers and strict Role-Based Access Control (RBAC) to ensure evidence chains and query logs are tamper-evident and compliant with legal standards.

**The Solution**: **Pramaan**, an AI-driven, cloud-native criminal intelligence and investigation platform deployed on **Zoho Catalyst AppSail**, delivering entity resolution, case-twin signature matching, graph network analysis, spatial incident hotspotting, natural language intent routing, and court-ready PDF dossier exports.

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

### Core Engine Components:

1. **Tiered Entity Resolution (`entity_resolution_fn`)**:
   * **Deterministic Matching (Tier 1)**: Conclusive matching based on normalized strong keys (phone numbers, vehicle registration, DL, Voter ID). Shared strong keys trigger automatic merge decisions (`auto_merge`).
   * **Probabilistic Fellegi-Sunter Matching (Tier 2)**: For pairs without shared strong keys, computes log-likelihood score weights based on:
     * *Name Similarity*: Jaro-Winkler token-level best-match pairing (prevents first-name dominance, e.g., distinguishing "Mohammed Rafi" from "Mohammed Sharif").
     * *Address Token Overlap*: Tokenized intersection ratio.
     * *Age Proximity*: Decay function on age difference.
   * **Decision Thresholds**:
     * `auto_merge` ($\ge 5.0$): Automatically merged into a canonical suspect identity.
     * `review_queue` ($2.5 \le \text{Score} < 5.0$): Flagged for human officer verification.
     * `reject` ($< 2.5$): Classified as distinct individuals.

2. **Case-Twin Signature Matching (`case_twin_fn`)**:
   * Ranks candidate cases against a target case based on a blended multi-feature similarity matrix:
     * *Location Proximity*: Exponential decay over Haversine distance ($\text{km}$).
     * *Temporal Similarity*: Day-of-week and time-of-day closeness scoring.
     * *Modus Operandi (MO)*: Crime category matching combined with Jaro-Winkler text similarity.
     * *Multilingual Narrative Embeddings*: Cosine similarity over 768-dimensional dense vectors generated by `krutrim-ai-labs/Vyakyarth` (sentence-transformers model fine-tuned for Indic languages including Kannada and English).
   * *Confirmed Suspect Linkages*: Cases sharing confirmed canonical suspects are flagged separately as hard evidentiary links, preventing critical connections from being diluted in general similarity averages.

3. **Graph Analytics & Spatial Hotspotting (`graph_fn`)**:
   * **Multi-Hop Traversal**: Multi-hop graph traversal connecting canonical suspects, targeted cases, and associated getaway vehicles.
   * **Leiden Community Detection**: Clusters suspect networks into distinct criminal syndicates based on co-occurrence and shared case involvement.
   * **Priority Case Scoring (`/priority`)**: Calculates multi-factor crime urgency scores based on recency decay, crime severity weights, suspect counts, active warrant flags, and repeat offender multipliers.
   * **Spatial Incident Hotspotting (`/hotspots`)**: Haversine-based spatial clustering ($\sim 10\text{km}$ radius) that groups geographic incident coordinates into high-density crime hot zones while isolating standalone incidents.

4. **Natural Language Intent & Voice Router (`intent_router_fn`)**:
   * Routes unstructured Kannada and English user queries to backend endpoints (`entity-lookup`, `case-similarity-search`, `graph-network-query`).
   * Integrates **Bhashini ASR** (Automated Speech Recognition) for speech-to-text conversion of Kannada voice inputs.
   * Includes a robust **rule-based regex classifier fallback** to maintain uninterrupted routing when external LLM API keys are not supplied.
   * Automatically persists every answered query, user role, and cited record IDs into the `ConversationLog` table in Zoho Catalyst Data Store.

5. **Court-Ready PDF Export (`export_fn`)**:
   * Uses **Zoho Catalyst SmartBrowz** (`convert_to_pdf`) to produce official PDF documents:
     * `POST /conversation_pdf`: Exports session search history and query logs.
     * `POST /dossier_pdf`: Generates a court-ready case dossier containing FIR facts, canonical suspect profiles, case-twin evidence, community clusters, spatial hotspots, and the `AccessAuditLog` chain-of-access.
   * **Fail-Honest Architecture**: When SmartBrowz credentials are unavailable in local/development environments, endpoints return formatted UTF-8 HTML with an explicit HTTP header `X-Pramaan-Export-Mode: fallback_html_no_smartbrowz` rather than raising unhandled errors.

6. **Role-Based Access Control & Auditing (`gateway_fn` / `repositories.py`)**:
   * Implements a central default-deny middleware that enforces permission boundaries:
     * `SI` / `ACP`: Granted `own_case_detail` permissions (access to individual suspect records, dossiers, and case matches).
     * `Analyst` / `Policy`: Denied `own_case_detail`; restricted strictly to aggregate analytics (`aggregate_analytics`).
   * Every authorization check is automatically logged to the `AccessAuditLog` table in Catalyst Data Store.

---

## 3. Chronological Accomplishments (What We Did Until Now)

### Phase 1: Core Foundation & Function Setup
* **CLI Environment Setup**: Programmatically configured `zcatalyst-cli` for the India Datacenter (Mumbai Org `50085000000040001`, project `KSP-Datathon`).
* **Entity Resolution Function (`entity_resolution_fn`)**: Bootstrapped Python 3.12 Advanced I/O function with Pydantic validation schemas, ingestion parsing, deterministic key matching, and Fellegi-Sunter scoring.
* **Case-Twin Function (`case_twin_fn`)**: Built case-twin signature matching, integrated TF-IDF & dense sentence embeddings (`Vyakyarth`), and separated confirmed suspect flags.

### Phase 2: Security, Web Client, & Consolidation
* **RBAC & Gateway Security (`gateway_fn`)**: Created central permission gateway, added session-based role checks (`SI`, `ACP`, `Analyst`, `Policy`), and wired real-time logging into Catalyst `AccessAuditLog`.
* **React Web Frontend**: Built a responsive React single-page application in `client_src/` compiled using Vite to `appsail/static`.
* **Backend Consolidation**: Resolved parallel backend ambiguity by consolidating microservices from `functions/` into unified, modular FastAPI APIRouters under `appsail/`. Configured `catalyst.json` and `app-config.json` for AppSail container execution.

### Phase 3: Advanced Intelligence & Dossier Export
* **Graph Analytics & Hotspotting**: Implemented multi-hop graph traversal, Leiden community detection, `/priority` case scoring (100% hand-reproducible calculations), and `/hotspots` Haversine spatial clustering.
* **NL & Voice Integration**: Connected `/route` to `ConversationLog` storage in Catalyst Data Store and added Bhashini ASR integration for Kannada voice queries.
* **Court-Ready PDF Dossier**: Integrated Catalyst SmartBrowz (`convert_to_pdf`) for conversation history and court-ready case dossiers with fail-honest HTML fallback handling.
* **Unit Test Suite & CI/CD Pipeline**: Built an automated unit test suite (`appsail/test_appsail.py`) with 14 comprehensive test cases covering all API routes, priority scoring hand-reproducibility, spatial clustering isolation, RBAC checks, and rate limiting. Integrated test stages into `catalyst-pipelines.yaml`.
* **Cloud Deployment**: Successfully deployed the consolidated AppSail backend and React client to Zoho Catalyst Cloud:
  `https://pramaan-50043776375.development.catalystappsail.in`

---

## 4. Issues & Technical Problems Faced

1. **Parallel Backends & Dual Architecture Confusion**:
   * *Problem*: Mid-development, the project structure contained both legacy Catalyst functions (`functions/`) and the new AppSail container (`appsail/`). Deployment files (`catalyst.json`) initially declared only AppSail, creating uncertainty regarding which backend was active.
   * *Solution*: Performed a comprehensive codebase audit and consolidated all backend routes into modular FastAPI APIRouters within `appsail/`, establishing a single unified backend runtime.

2. **CLI Blocking in Non-Interactive Automation**:
   * *Problem*: Running `catalyst init`, `catalyst serve`, or `catalyst deploy` inside automated script background tasks caused commands to hang indefinitely waiting for interactive TTY stdin prompts.
   * *Solution*: Developed node-based wrapper scripts (`run_login_tty.js`, `run_init.js`, `run_function_add.js`) that set `process.stdin.isTTY = true` and mocked prompt answers in the CLI runtime store.

3. **Catalyst Cloud SDK Initialization Outside Cloud Containers**:
   * *Problem*: Calling `zcatalyst_sdk.initialize()` in local Python environments failed with `{'code': 'FATAL ERROR', 'message': 'Catalyst headers are empty'}` because mandatory Cloud headers (`X-ZC-Session-ID`) were missing.
   * *Solution*: Implemented `CatalystRepository` fallback mode (`_is_fallback = True`), which detects missing cloud headers and gracefully uses mock datasets and in-memory log stores during local unit test runs.

4. **Local Python Package Conflicts (Module Shadowing)**:
   * *Problem*: Untracked wheel package directories generated by local `pip install -t .` inside `appsail/` caused namespace conflicts (`ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'`).
   * *Solution*: Cleaned untracked package directories from `appsail/` using `git clean`, restoring standard Python environment package importing.

5. **Missing LLM Credentials Blocking Route API**:
   * *Problem*: The `/route` endpoint threw a 400 Bad Request error if `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` environment variables were not configured.
   * *Solution*: Added a rule-based fallback regex classifier in `intent_router_fn.py` to route queries seamlessly in environments without active LLM keys.

6. **SmartBrowz Credentials Requirement for PDF Generation**:
   * *Problem*: Generating PDFs via Catalyst SmartBrowz requires live Catalyst Cloud credentials, which fail during local testing.
   * *Solution*: Designed a fail-honest export posture where endpoints return structured UTF-8 HTML with an explicit header `X-Pramaan-Export-Mode: fallback_html_no_smartbrowz` when SmartBrowz is unreachable.

7. **Environment Distinction (Development vs. Production)**:
   * *Problem*: Risk of treating Development cloud deployment (`.development.catalystappsail.in`) as final Production promotion.
   * *Solution*: Explicitly documented SDLC boundaries and maintained pipeline checks in `catalyst-pipelines.yaml` to ensure gatekeeping before Production release.

---

## 5. Summary of System Capabilities

| Capability | Module / Endpoint | Tech Stack | Status |
| :--- | :--- | :--- | :--- |
| **Deterministic & Probabilistic ER** | `/server/entity_resolution_fn/resolve` | Python 3.12, Jaro-Winkler, Fellegi-Sunter | ✅ Live & Tested |
| **Multilingual Case-Twin Matching** | `/server/case_twin_fn/match` | `Vyakyarth` Indic Embeddings, Cosine Sim, Haversine | ✅ Live & Tested |
| **Graph Traversal & Communities** | `/server/graph_fn/traverse`, `/communities` | Multi-hop Graph Traversal, Leiden Clustering | ✅ Live & Tested |
| **Priority Case Scoring** | `/server/graph_fn/priority` | Recency Decay, Severity & Suspect Multipliers | ✅ Live & Tested |
| **Spatial Incident Hotspotting** | `/server/graph_fn/hotspots` | Haversine Distance Radius Clustering ($\sim 10\text{km}$) | ✅ Live & Tested |
| **NL & Voice Query Router** | `/server/intent_router_fn/route`, `/voice` | Bhashini ASR, LLM / Regex Fallback Classifier | ✅ Live & Tested |
| **Court-Ready PDF Exports** | `/server/export_fn/dossier_pdf`, `/conversation_pdf` | Catalyst SmartBrowz, Fail-Honest HTML Fallback | ✅ Live & Tested |
| **RBAC Security & Access Audit** | `@app.middleware("http")`, `AccessAuditLog` | Default-Deny Middleware, Catalyst Data Store (ZCQL) | ✅ Live & Tested |
| **Unified Cloud Deployment** | AppSail Container | Catalyst AppSail (`python_3_12`), React Client | ✅ Deployed (Dev) |
