# Pramaan — Crime Intelligence Gateway for the Karnataka State Police

**Pramaan** (ಪ್ರಮಾಣ — *"proof / evidence"*) is a secure, bilingual
(Kannada + English) crime-intelligence platform that links siloed police records
— FIRs, vehicle registries, phone logs — into canonical identities, ranks similar
cases, maps criminal networks, and produces court-ready dossiers. Built for the
**Karnataka State Police (KSP) Datathon 2026** on **Zoho Catalyst**.

| | |
|---|---|
| **Backend** | FastAPI (Python 3.12) on Catalyst **AppSail** |
| **Frontend** | React 18 + Vite, hosted on Catalyst **Slate** |
| **Data & services** | Catalyst Data Store (ZCQL) · SmartBrowz (PDF) · Neo4j Aura (graph) · Bhashini (voice) · Gemini (NL) |
| **Status** | Deployed to **Development**; backend health / entity-resolution / case-twin verified live |
| **Live (Dev) frontend** | `https://ksp-datathon-ejrnghrv.onslate.in` |
| **Live (Dev) API** | `https://pramaan-50043776375.development.catalystappsail.in` |

> This README is generated from analysis of the repository. Details that cannot be
> inferred from the code are marked **`TODO`**.

---

## Table of contents

1. [Problem & solution](#1-problem--solution)
2. [Features](#2-features)
3. [Architecture](#3-architecture)
4. [Tech stack](#4-tech-stack)
5. [Project structure](#5-project-structure)
6. [Prerequisites](#6-prerequisites)
7. [Installation](#7-installation)
8. [Configuration](#8-configuration)
9. [Build & run](#9-build--run)
10. [API reference](#10-api-reference)
11. [Access control (RBAC)](#11-access-control-rbac)
12. [Data model](#12-data-model)
13. [Testing](#13-testing)
14. [Deployment](#14-deployment)
15. [Troubleshooting](#15-troubleshooting)
16. [Roadmap](#16-roadmap)
17. [Contributing](#17-contributing)
18. [License](#18-license)

---

## 1. Problem & solution

Investigative intelligence is fragmented across databases that don't interoperate,
and suspects exploit the gaps:

- **Identity fragmentation** — aliases, spelling/spacing variants, Kannada⇄English
  transliterations (e.g. *Mohammed Rafi* / *Md. Rafi* / *ಮೊಹಮ್ಮದ್ ರಫಿ*); exact-match
  SQL cannot link them.
- **Bilingual narratives** — FIRs and queries arrive in Kannada, English, or a
  code-mix; keyword search cannot judge cross-lingual semantic similarity.
- **Legal constraint** — per the Supreme Court's 2018 Aadhaar ruling, **Aadhaar is
  never used as a matching key**; only phone / vehicle-reg / DL / Voter-ID plus
  probabilistic matching.
- **Chain of evidence** — role-gated access and tamper-evident, court-ready dossiers.

**Pramaan** answers these with tiered entity resolution, multilingual case-twin
matching, graph analytics, transparent priority scoring, spatial hotspotting, a
natural-language + voice router, and SmartBrowz PDF export — all behind a
default-deny RBAC gateway that audits every access.

### Design principles (enforced in code)

- **No translation before reasoning** — Kannada is embedded/compared *in Kannada*
  (Vyakyarth multilingual embeddings); explicit anti-"simplification" comments guard this.
- **Explainability over black boxes** — the priority score is a visible weighted
  formula whose total is recomputable by hand from the factors it returns (a test
  asserts exactly this).
- **Fail honestly** — a missing dependency (Neo4j, Bhashini, SmartBrowz, LLM key)
  yields an explicit mock/fallback mode with a labelled header, never a faked success.
- **Canonical IDs only** — nothing downstream references a raw `person_id`; everything
  keys on the entity-resolved `canonical_id`.

## 2. Features

| Capability | Endpoint(s) | Notes |
|---|---|---|
| Tiered **entity resolution** | `POST /server/entity_resolution_fn/resolve` | Deterministic strong-key + Fellegi-Sunter probabilistic (Jaro-Winkler names, address overlap, age proximity) |
| **Case-twin matching** | `POST /server/case_twin_fn/match` | Location (Haversine) · time · MO · weapon · **narrative similarity (embeddings ▸ precomputed vector ▸ TF-IDF)**; flags shared canonical suspects |
| **Graph** traversal & clusters | `POST /server/graph_fn/traverse`, `/communities` | Neo4j GDS multi-hop + Leiden communities (mock without creds) |
| **Priority scoring** | `POST /server/graph_fn/priority` | Recency decay · severity tier · network centrality · **active-warrant (from `Warrant` table)**; hand-reproducible |
| **Spatial hotspots** | `POST /server/graph_fn/hotspots` | Haversine ~10 km clustering; isolates standalone incidents |
| **NL + voice router** | `POST /server/intent_router_fn/route`, `/voice` | Classifies EN/KN queries; Bhashini ASR-in/TTS-out; writes `ConversationLog` |
| **PDF export** | `POST /server/export_fn/conversation_pdf`, `/dossier_pdf` | Catalyst **SmartBrowz**; honest HTML fallback header when unavailable |
| **RBAC + audit** | middleware + `POST /server/gateway_fn/check_access` | Default-deny; every access → `AccessAuditLog` |
| **Graph export** | `POST /server/graph_fn/export` | Push Data Store records into Neo4j |
| **Public help desk** | `appsail/static/public-assistant/` | Unauthenticated, static-only, machine-enforced no-case-data isolation |

Every module also exposes `GET /server/<module>/health`.

## 3. Architecture

```
        React SPA (Vite)                    Catalyst Slate (static hosting)
              │  HTTP / JSON  (Authorization: session or Bearer role_*)
              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  Pramaan AppSail  —  FastAPI (Python 3.12), entrypoint run_app.py           │
│                                                                             │
│  middleware:  security headers  ·  default-deny RBAC  ·  SlowAPI limits     │
│                                                                             │
│  routers/  gateway_fn · entity_resolution_fn · case_twin_fn · graph_fn      │
│            intent_router_fn (+ bhashini) · export_fn                         │
│                                     │                                        │
│                    CatalystRepository (live Data Store ▸ mock fallback)      │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                       ▼
   Zoho Catalyst:  Data Store (ZCQL) · SmartBrowz (HTML→PDF) · Cache · Auth
   External:       Neo4j Aura (graph) · Bhashini (Kn ASR/TTS) · Gemini (NL intent)
```

- `run_app.py` binds `0.0.0.0` on `$X_ZOHO_CATALYST_LISTEN_PORT` and includes a
  **stdlib-only diagnostic fallback** server that returns the import traceback over
  HTTP if the app fails to boot.
- `CatalystRepository` decides **live vs fallback once at startup** via a probe
  (`SELECT ROWID FROM AccessAuditLog LIMIT 1`). If it fails, the whole app serves
  built-in mock/seed data (responses report `"mode": "seed_fallback"`).

## 4. Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, Uvicorn, SlowAPI (rate limiting) |
| ML / matching | scikit-learn (TF-IDF), rapidfuzz (Jaro-Winkler), Vyakyarth sentence-embeddings *(offline precompute — not shipped in the container)* |
| Graph | Neo4j 5 (GDS Leiden) |
| NL / voice | Google Gemini (intent classification), Bhashini (Kannada ASR/TTS) |
| Platform | Zoho Catalyst: AppSail, Data Store/ZCQL, SmartBrowz, Slate, Cache, Pipelines |
| Frontend | React 18, Vite 5 |
| SDK | `zcatalyst-sdk==1.4.0` |

Backend dependencies (`appsail/requirements.txt`):

```text
fastapi>=0.111.0        uvicorn>=0.30.1         slowapi>=0.1.9
zcatalyst-sdk==1.4.0    rapidfuzz>=3.9.3        scikit-learn>=1.5.0
neo4j>=5.21.0           google-generativeai>=0.7.2
cryptography>=42.0.8    requests>=2.32.3
```

> **Note:** `torch` / `sentence-transformers` are **intentionally not** in the
> deployed backend (too heavy for the container). Narrative embeddings are computed
> **offline** via `appsail/backfill_embeddings.py` and stored as vectors; the runtime
> scores with numpy cosine over stored vectors, or falls back to TF-IDF.

## 5. Project structure

```text
KSP/
├── appsail/                     # DEPLOYED backend (Catalyst AppSail target)
│   ├── app.py                   #   FastAPI app: CORS, security headers, RBAC middleware, rate limits
│   ├── run_app.py               #   entrypoint (0.0.0.0:$PORT) + stdlib diagnostic fallback
│   ├── rate_limit.py            #   shared SlowAPI limiter
│   ├── repositories.py          #   CatalystRepository: live Data Store ▸ mock fallback
│   ├── backfill_embeddings.py   #   offline narrative-vector precompute (idempotent)
│   ├── test_appsail.py          #   17-test suite (unittest + FastAPI TestClient)
│   ├── app-config.json          #   stack=python_3_12, command="python3.12 run_app.py", memory=2048
│   ├── requirements.txt
│   ├── routers/                 #   gateway, entity_resolution, case_twin, graph, intent_router, export, bhashini
│   └── static/                  #   compiled React client + isolated public-assistant/
├── client_src/                  # React + Vite source (builds → appsail/static)
├── functions/                   # Legacy standalone-function tree (kept green; NOT deployed)
├── schema/
│   ├── data_store_schema.sql    #   Data Store DDL (11 tables)
│   └── seed_data.sql            #   demo rows
├── catalyst.json                # deploys appsail/
├── catalyst-pipelines.yaml      # CI test stages + manual Production gate
├── DEPLOY_RUNBOOK.md            # step-by-step go-live (console tasks)
├── content.md                   # full dev log + outstanding-work roadmap (§6)
├── docs/                        # concept, roadmap, SDLC, build prompts
└── README.md
```

## 6. Prerequisites

- **Python 3.12**
- **Node.js 18+** and npm (for the React client)
- **Catalyst CLI** (`npm i -g zcatalyst-cli`) and a Zoho Catalyst account on the
  **India** data center
- Optional external services: a **Gemini API key**, a **Neo4j Aura** instance,
  and **Bhashini** credentials

## 7. Installation

```bash
git clone <REPO_URL>            # TODO: repository URL
cd KSP

# Backend deps (local dev / running tests)
cd appsail
python -m pip install -r requirements.txt
cd ..

# Frontend deps
cd client_src
npm install
cd ..
```

## 8. Configuration

Secrets are read from environment variables (or a local `.env`), never hardcoded.
On Catalyst they are set on the AppSail app's **Configuration → Environment Variables**.

| Variable | Used by | Effect if unset |
|---|---|---|
| `GEMINI_API_KEY` | `intent_router_fn` (LLM intent classification) | `/route` returns 400 (or regex fallback, per config) |
| `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` | `graph_fn` | graph traverse/communities run in **mock** mode |
| `BHASHINI_USER_ID`, `BHASHINI_ULCA_API_KEY`, `BHASHINI_PIPELINE_ID` | `intent_router_fn` voice | ASR/TTS run in **mock** mode |
| `NARRATIVE_EMBED_MODEL` | `case_twin_fn` | defaults to `krutrim-ai-labs/Vyakyarth` |
| `X_ZOHO_CATALYST_LISTEN_PORT` | `run_app.py` | injected by AppSail at runtime |

> The repo's `.env` currently defines `GEMINI_API_KEY`. **TODO:** document the exact
> Bhashini `PIPELINE_ID` and Neo4j Aura connection string for your environment.

## 9. Build & run

### Frontend build (outputs to `appsail/static`)

```bash
cd client_src
npm run dev        # Vite dev server
npm run build      # production build → ../appsail/static
```

### Backend (local — runs in fallback/mock mode without Catalyst cloud headers)

```bash
cd appsail
python -m uvicorn app:app --reload --port 9000
curl http://127.0.0.1:9000/server/gateway_fn/health      # -> {"status":"ok","module":"gateway_fn"}
```

For local API calls, RBAC accepts a header shortcut:
`Authorization: Bearer role_SI` (also `role_ACP`, `role_Analyst`, `role_Policy`).

## 10. API reference

Base path: `/server/<module>`. All POST bodies are JSON. Auth via Catalyst session
or the `Authorization: Bearer role_*` shortcut. Responses carrying a `mode` field
report `live` (Data Store) or `seed_fallback` (built-in mock data).

### Health — `GET /server/<module>/health`
```json
{ "status": "ok", "module": "gateway_fn" }
```

### Entity resolution — `POST /server/entity_resolution_fn/resolve`
```bash
curl -X POST "$API/server/entity_resolution_fn/resolve" \
  -H "Content-Type: application/json" -H "Authorization: Bearer role_SI" \
  -d '{"record_a":{"source_id":"a","source_table":"fir","name":"Mohammed Rafi","phone":"98450 11223","age":34},
       "record_b":{"source_id":"b","source_table":"registry","name":"Md. Rafi","phone":"9845011223","age":34}}'
```
```json
{ "decision": "auto_merge", "score": null, "evidence": ["..."] }
```
`decision ∈ {auto_merge, review_queue, reject}`.

### Case-twin match — `POST /server/case_twin_fn/match`
Body: `{ "target": <Case>, "candidates": [<Case>...], "top_k": 2 }` where a `Case`
has `case_id, crime_type, modus_operandi, narrative_text, latitude, longitude,
date_time, weapon?, canonical_suspect_ids?, narrative_embedding?`.
```json
{
  "top_matches": [
    { "case_id": "CASE-002", "total_score": 0.851,
      "breakdown": { "location": 0.98, "time": 0.90, "mo": 0.93, "weapon": 0.50, "narrative": 0.87 },
      "shared_confirmed_suspect": false } ],
  "flagged_linkages": []
}
```

### Graph — `POST /server/graph_fn/{traverse|communities|priority|hotspots|export}`
- `traverse` `{ "canonical_id": "CANON-0042" }` → `{ mode, nodes, relationships, canonical_id }`
- `communities` `{}` → `{ mode, communities: [{ canonical_id, name, communityId }] }`
- `priority` `{ "w_recency":1,"w_severity":1,"w_centrality":1,"w_warrant":1 }` →
  `{ mode, scores: [{ canonical_id, name, total_score, breakdown:{recency,severity,centrality,warrant}, variables:{prior_cases,co_accused_count,has_active_warrant} }] }`
- `hotspots` `{}` → `{ mode, hotspots: [{ cluster_id, latitude, longitude, density, primary_crime, case_ids }] }`

### NL router — `POST /server/intent_router_fn/route`
```bash
-d '{"query":"Find similar burglary cases to CASE-001"}'   # EN, KN, or code-mix
```
```json
{ "intent": "case-similarity-search", "classification": {...}, "status_code": 200, "response": {...} }
```

### Voice — `POST /server/intent_router_fn/voice`
Body: `{ "audio_base64": "...", "source_language": "kn", "tts": true }` →
`{ transcript, asr:{mode,language}, route:{...}, tts:{audio_base64,mode} }`.

### PDF export — `POST /server/export_fn/{conversation_pdf|dossier_pdf}`
- `conversation_pdf` `{ "session_id": "..."? }`
- `dossier_pdf` `{ "case_id": "CASE-001", "top_k": 3 }`

Returns `application/pdf` (header `X-Pramaan-Export-Mode: smartbrowz_pdf`) when
SmartBrowz is available, else `text/html` with
`X-Pramaan-Export-Mode: fallback_html_no_smartbrowz`.

### Access check — `POST /server/gateway_fn/check_access`
`{ "resource": "own_case_detail" }` → `{ allowed, role, resource, decision }` (403 if denied).

## 11. Access control (RBAC)

A default-deny middleware gates every `/server/*` request (except `/health` and
`/check_access`). Case-detail endpoints require `own_case_detail`; `/communities`
and `/hotspots` require `aggregate_analytics`. Every decision is written to
`AccessAuditLog`.

| Role | Permissions |
|---|---|
| `SI` | `own_case_detail`, `aggregate_analytics` |
| `ACP` | `own_case_detail`, `aggregate_analytics`, `case_reassignment`, `district_rollup` |
| `Analyst` | `aggregate_analytics`, `district_rollup` |
| `Policy` | `district_rollup`, `state_rollup` |

## 12. Data model

`schema/data_store_schema.sql` defines 11 tables. **`canonical_id` is the only
person reference downstream — never a raw `person_id`.** (`Case` is named
**`Cases`** to avoid a Catalyst SQL reserved-keyword collision.)

| Table | Purpose |
|---|---|
| `Person` | Raw person records from source systems |
| `EntityResolution` | Maps source records → `canonical_id` (deterministic/probabilistic) |
| `Cases` | FIR / case records (+ `narrative_embedding`, `embedding_model`) |
| `CasePersonLink` | Case ↔ `canonical_id` (accused/victim/witness) |
| `Location` | Geocoded incident locations |
| `Vehicle` | Vehicles linked to canonical owners |
| `FinancialTransaction` | Flagged financial records |
| `OffenderProfile` | Derived, explainable priority profile |
| `Warrant` | Active-warrant status (drives the priority warrant factor) |
| `ConversationLog` | One row per answered query, with cited record IDs |
| `AccessAuditLog` | Immutable RBAC access trail |

Seed demo rows: `schema/seed_data.sql`.

## 13. Testing

```bash
cd appsail && python -m unittest test_appsail -v          # 17 tests
python appsail/static/public-assistant/test_isolation.py   # public-assistant isolation scanner
```

| Suite | Covers |
|---|---|
| `AppSailUnifiedTests` | health, security headers, RBAC, entity resolution, case-twin (EN + **KN, no translation**), precomputed-vector path |
| `GraphAnalyticsTests` | **priority hand-reproducibility**, hotspot cluster/isolation, aggregate-analytics RBAC |
| `ExportTests` | ConversationLog write-through, conversation & dossier PDF (mode header) |
| `RateLimitAndRoleTests` | live 429 rate limit fires, Policy-role string ↔ enum |

CI (`catalyst-pipelines.yaml`) runs all of the above (plus the legacy `functions/`
suite) on every push; the Production deploy is a **manual** gate.

## 14. Deployment

> **Two hard-won gotchas** (details in `content.md` §6.5 and `DEPLOY_RUNBOOK.md`):
> 1. The AppSail container interpreter is **`python3.12`** (not `python`/`python3`).
> 2. **AppSail does not auto-install `requirements.txt`** — dependencies must be
>    **vendored** into `appsail/` as complete **Linux** wheels.

```bash
# 1) Vendor Linux deps into appsail/ (one-time / when requirements change)
cd appsail
pip download -r requirements.txt --only-binary=:all: \
  --python-version 312 --implementation cp --abi cp312 \
  --platform manylinux_2_17_x86_64 --platform manylinux_2_28_x86_64 -d _wheels
for w in _wheels/*.whl; do python -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall('.')" "$w"; done
rm -rf _wheels
cd ..

# 2) Build the client
cd client_src && npm run build && cd ..

# 3) Deploy backend to Development
catalyst deploy --only appsail
```

**Console tasks (cannot be scripted):**
1. Create all tables from `schema/data_store_schema.sql` (especially
   **`AccessAuditLog`** — the startup live/fallback probe checks it).
2. Import `schema/seed_data.sql` (or `catalyst ds:import`).
3. Set env vars (§8) and **restart** the app (live/fallback is decided at startup).
4. Enable **SmartBrowz** for real PDF output.

**Production:** promotion is a deliberate, gated step via `catalyst-pipelines.yaml`
(`when: manual`). **TODO:** Production URL and promotion sign-off checklist.

## 15. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `503 "Execution failed. Please check the startup command or port."` | Wrong interpreter, missing deps, or wrong bind | `command: python3.12 run_app.py`; deps **vendored** as Linux wheels; bind `0.0.0.0:$X_ZOHO_CATALYST_LISTEN_PORT` |
| `cannot import name 'FastAPI' from 'fastapi' (unknown location)` | Vendored package incomplete (missing `__init__.py`) | Re-vendor via the `pip download` block above |
| `No module named 'fastapi'` | Deps not vendored (AppSail doesn't auto-install) | Vendor deps into `appsail/` |
| Responses show `"mode": "seed_fallback"` | Data Store probe on `AccessAuditLog` failed | Create the tables, then **restart** the app |
| `/route` → 400 | No LLM key | Set `GEMINI_API_KEY` |
| PDF returns HTML (`fallback_html_no_smartbrowz`) | SmartBrowz unavailable | Enable SmartBrowz / run on live Catalyst |
| Live `429` never fires across instances | In-memory limiter is per-instance | Back SlowAPI with a shared store (Catalyst Cache/Redis) |

The `run_app.py` diagnostic fallback returns the real startup traceback as JSON at
`GET /server/gateway_fn/health` when the app fails to boot — check it first.

## 16. Roadmap

Outstanding work (console setup, live-service verification, distributed rate
limiting, Kannada terminology validation, Production promotion) is tracked in
**`content.md` §6**. Development history and problems solved: `content.md` §1–5.

## 17. Contributing

> Inferred from repo conventions — **TODO:** confirm/adjust as a `CONTRIBUTING.md`.

- Backend lives in **`appsail/`** (the deployed target). The `functions/` tree is
  legacy and not deployed; keep it green but prefer `appsail/`.
- Add tests to `appsail/test_appsail.py` and keep `python -m unittest test_appsail`
  green (17/17) before deploying; CI enforces this.
- Preserve the design principles in §1 (no pre-translation of Kannada, explainable
  scoring, fail-honest fallbacks, canonical-IDs-only).
- Do **not** commit vendored dependency directories as source; regenerate them at
  deploy time via the `pip download` step.
- **TODO:** branch/PR workflow, code style/linters, commit conventions, reviewers.

## 18. License

**TODO** — no `LICENSE` file is present in the repository. Add one (e.g. MIT /
Apache-2.0) or state the intended usage restrictions for KSP.

---

*Built for the Karnataka State Police Datathon 2026 · Zoho Catalyst · India Data Center.*
*Maintainers / contact: **TODO**.*
