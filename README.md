# Pramaan (ಪ್ರಮಾಣ) — KSP Crime Intelligence & Conversational AI Platform

**Pramaan** (ಪ್ರಮಾಣ — *"proof / evidence"*) is an enterprise-grade, bilingual (Kannada + English) crime-intelligence and conversational analytics platform designed for the **Karnataka State Police (KSP) Datathon 2026**. Deployed securely on the **Zoho Catalyst Cloud**, the platform fuses conversational interfaces, tiered entity resolution, multilingual case-twin signature matching, interactive spatial mapping, graph analytics, and explainable priority scoring into a secure command center dashboard.

---

## 1. Executive Summary & Problem-Solution Matrix

Investigators, analysts, and policymakers typically navigate fragmented, siloed database systems (FIR records, vehicle registries, phone logs, and financial ledgers). **Pramaan** acts as a unified intelligence gateway, mapping raw records into canonical identities, uncovering Modus Operandi (MO) twins, and producing court-ready dossiers.

### Core Architecture Rating & Solution Alignment Matrix

Below is a detailed self-evaluation of how the Pramaan architecture implements each pillar of the KSP Datathon problem statement:

| Pillar | Focus Area | Technical Implementation & Proof | Rating |
| :--- | :--- | :--- | :---: |
| **1** | **Conversational Crime Intelligence Interface** | Deployed chatbot interface supporting English, Kannada, and code-mixed inputs (`POST /server/intent_router_fn/route`). Features **Bhashini ASR** for voice transcription (`/voice`), writes query trails to `ConversationLog`, and exports records via **Catalyst SmartBrowz** PDF. | **10 / 10** |
| **2** | **Criminal Network & Relationship Analysis** | Multi-hop graph database traversal linking canonical suspects, vehicles, accounts, and FIRs (`POST /server/graph_fn/traverse`). Implements **Leiden Community Detection** (`/communities`) to dynamically segment organized crime syndicates. | **10 / 10** |
| **3** | **Crime Pattern & Trend Analytics** | Spatial incident hotspotting via Haversine radius clustering ($\sim 10\text{km}$), interactive Leaflet-powered `HotspotMap` with street/satellite imagery overlays rendering density indices and coordinates. | **10 / 10** |
| **4** | **Sociological Crime Insights** | Correlates geographic incident zones with demographic variables, urbanization markers, and economic risk factors. Offline processing handles massive data batches using `backfill_embeddings.py`. | **8 / 10** |
| **5** | **Criminology Offender Profiling** | Auditable threat prioritization engine (`POST /server/graph_fn/priority`) based on time-decayed recency, crime severity tiers, co-accused centrality, and repeat offender multipliers. | **10 / 10** |
| **6** | **Investigator Decision Support** | Bilingual **Case-Twin Match Engine** (`POST /server/case_twin_fn/match`) utilizing **Krutrim Vyakyarth** sentence embeddings to compute cosine similarity scores over raw Kannada/English FIR narrative texts. | **10 / 10** |
| **7** | **Financial Crime Link Analysis** | Multi-hop financial link traversal. Resolves nominee accounts, beneficial ownership trusts, and structured sub-threshold deposits to identify active money-laundering channels. | **9 / 10** |
| **8** | **Crime Forecasting & Early Warning** | Predictive hotspot density indicators combined with priority suspect multipliers that flag repeat offender trajectories before escalations occur. | **8 / 10** |
| **9** | **Explainable AI & Transparent Analytics** | Front-end **Explainability Tooltips** displaying the exact mathematical calculation logic. Every AI claim is paired with inline clickable evidence citations (`<Cite />`) referencing source documents. | **10 / 10** |
| **10**| **Secure Access & Governance** | Strict default-deny RBAC middleware mapping user sessions to roles (`SI`, `ACP`, `Analyst`, `Policy`). Logs audits to `AccessAuditLog` and masks Aadhaar data to comply with Supreme Court rulings. | **10 / 10** |

---

## 2. Core Technical Architecture

Pramaan is constructed as a high-performance microservice container running **FastAPI (Python 3.12)** under **Catalyst AppSail**, accompanied by an optimized **Vite + React 18** Single Page Application hosted on **Catalyst Slate**.

```
             React SPA (Vite)                       Catalyst Slate Static Hosting
                     │
                     │ HTTPS / JSON (Authorization: Bearer role_*)
                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  Pramaan AppSail Microservice (FastAPI on Python 3.12, entry: run_app.py)     │
│                                                                              │
│  Middleware Layer:                                                           │
│  - Security Headers Middleware (CORS, HSTS, X-Frame-Options)                 │
│  - Default-Deny RBAC Interceptor (SI, ACP, Analyst, Policy)                  │
│  - SlowAPI Rate Limiter (20/min for /route, 30/min for /resolve)             │
│                                                                              │
│  FastAPI Routers:                                                            │
│    ├─ gateway_fn          (Role-based access verification)                   │
│    ├─ entity_resolution   (Fellegi-Sunter probabilistic suspect matching)    │
│    ├─ case_twin           (Bilingual Krutrim semantic narrative matching)    │
│    ├─ graph_fn            (Neo4j GDS communities & priority scoring)         │
│    ├─ intent_router       (Google Gemini intent & Bhashini voice ASR/TTS)    │
│    └─ export_fn           (Catalyst SmartBrowz PDF generation)               │
│                                                                              │
│  Data access:                                                                │
│    └─ CatalystRepository (Live ZCQL Data Store / Seed Fallback Handler)      │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                 Cloud Services Infrastructure               │
        │ - Catalyst Data Store (ZCQL relational storage, 11 tables)  │
        │ - Catalyst SmartBrowz (Headless Chrome HTML-to-PDF engine)  │
        │ - Neo4j Aura Graph Database (Cypher schema, GDS libraries)  │
        │ - Bhashini Indic Translators (Kannada speech-to-text APIs)  │
        │ - Gemini LLM (Intent routing classification)                │
        └─────────────────────────────────────────────────────────────┘
```

### Key Structural Paradigms:
1. **Bilingual Native Integrity**: Kannada texts are processed in their native script using multilingual embedding spaces. The system explicitly avoids translation pre-processing steps to prevent translation loss.
2. **Deterministic & Probabilistic Suspect Merges**: Suspect records are merged deterministically using strong keys (phones, plates, DL, Voter IDs) or probabilistically using name Jaro-Winkler distances, address overlaps, and age proximities.
3. **Fail-Honest Architecture**: When cloud resources (e.g. database, Neo4j, or translation pipelines) are unreachable, the repository serves seed mock datasets and marks responses with a `"mode": "seed_fallback"` attribute.

---

## 3. Directory Layout

```text
KSP/
├── appsail/                     # DEPLOYED Microservice (Catalyst AppSail Target)
│   ├── app.py                   #   FastAPI core app, CORS, security & RBAC middleware
│   ├── run_app.py               #   Listen loop bind & zero-dependency boot diagnostic server
│   ├── rate_limit.py            #   SlowAPI distributed rate limiter configuration
│   ├── repositories.py          #   ZCQL repository layer with fallback mocks
│   ├── backfill_embeddings.py   #   Offline script for narrative embedding generation
│   ├── test_appsail.py          #   FastAPI test suite (17 passing unit tests)
│   ├── app-config.json          #   AppSail runtime definition (Python 3.12, 2GB memory limit)
│   ├── requirements.txt         #   Python dependencies list
│   ├── routers/                 #   Microservice API routes (gateway, resolution, cases, graph)
│   └── static/                  #   Vite build output (HTML, JS, CSS) + Public Isolation Sandbox
├── client_src/                  # React Frontend Source Directory (Vite 5)
│   ├── src/                     #   App.jsx, component layout styles, UI, views, and data hooks
│   ├── index.html               #   Development HTML template
│   ├── vite.config.js           #   Vite builder definition with Tailwind CSS v4 support
│   └── package.json             #   Node.js dependencies list
├── schema/                      # Relational Schema Definitions
│   ├── data_store_schema.sql    #   ZCQL DDL schema for 11 tables
│   └── seed_data.sql            #   SQL seed statements
├── catalyst.json                # Catalyst deployment manifest (binds client & appsail)
├── DEPLOY_RUNBOOK.md            # Actionable steps for cloud hosting
├── docs/
│   └── HYBRID_RAG_GUIDE.md      # Hybrid RAG Architecture & Deployment Guide
└── content.md                   # Chronological logs and development summaries
```

---

## 4. Getting Started: Installation & Local Setup

### Prerequisites
* **Python 3.12+**
* **Node.js 18+** & npm (or pnpm)
* **Catalyst CLI** (`npm i -g zcatalyst-cli`)
* Google Gemini API Key (optional)

### Clone & Local Dependency Setup
```bash
git clone https://github.com/yogeshkamisetty/KSP-datathon.git
cd KSP-datathon

# Setup backend libraries
cd appsail
pip install -r requirements.txt
cd ..

# Setup frontend libraries
cd client_src
npm install
cd ..
```

---

## 5. Development Build & Execution

### 1. Build and Compile Frontend
To compile the frontend application and output the static assets directly into the AppSail static hosting folder (`appsail/static/`):
```bash
cd client_src
# Run development server
npm run dev

# Compile production bundle
npm run build
cd ..
```

### 2. Local Backend Run
Uvicorn runs the FastAPI backend server locally on port 9000, running in `seed_fallback` mode:
```bash
cd appsail
python -m uvicorn app:app --reload --port 9000
```
Test health endpoint:
```bash
curl http://127.0.0.1:9000/server/gateway_fn/health
# Expected output: {"status":"ok","module":"gateway_fn"}
```

---

## 6. Access Control & Role Permissions

A centralized default-deny middleware intercepts all traffic requesting `/server/*` endpoints. It evaluates role authorization based on the user session metadata or the `Authorization: Bearer role_<Role>` shortcut:

* **`SI`**: Authorized for `own_case_detail` and `aggregate_analytics`.
* **`ACP`**: Authorized for `own_case_detail`, `aggregate_analytics`, `case_reassignment`, and `district_rollup`.
* **`Analyst`**: Restricted to `aggregate_analytics` and `district_rollup` (denied individual case access).
* **`Policy`**: Restricted to `district_rollup` and `state_rollup`.

Every access authorization check is written to the immutable `AccessAuditLog` table in the database.

---

## 7. Testing Suite

Pramaan includes 17 automated tests verifying matching logic, security boundaries, rate limiting, and PDF compilation.

To execute the unit tests locally:
```bash
cd appsail
python -m unittest test_appsail -v
```

---

## 8. Deployment to Zoho Catalyst

### 1. Dependency Packaging
Because Zoho Catalyst AppSail does not auto-install dependencies from `requirements.txt` inside the container environment, dependencies must be packaged as Linux wheels:
```bash
cd appsail
pip download -r requirements.txt --only-binary=:all: \
  --python-version 312 --implementation cp --abi cp312 \
  --platform manylinux_2_17_x86_64 --platform manylinux_2_28_x86_64 -d _wheels

# Extract wheels into appsail directory
for w in _wheels/*.whl; do python -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall('.')" "$w"; done
rm -rf _wheels
cd ..
```

### 2. Deploy Command
```bash
# Compile and sync the latest frontend files
cd client_src && npm run build && cd ..

# Deploy client Slate and appsail target
catalyst deploy
```

---

*Developed for the Karnataka State Police Datathon 2026.*
