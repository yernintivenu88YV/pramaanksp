# Pramaan — Crime Intelligence Gateway for the Karnataka State Police

> **Pramaan** (ಪ್ರಮಾಣ, "proof / evidence") is a secure, bilingual
> (Kannada + English) crime-intelligence platform that turns siloed police
> records — FIRs, vehicle registries, phone logs — into linked, court-defensible
> intelligence. Built for the **KSP Datathon 2026** on **Zoho Catalyst**.

**Live (Development):**
- Frontend (React): `https://ksp-datathon-ejrnghrv.onslate.in`
- Backend API (AppSail): `https://pramaan-50043776375.development.catalystappsail.in`

---

## 1. The problem

When police investigate a crime, the intelligence needed to solve it is scattered
across databases that don't talk to each other, and suspects actively exploit the
gaps:

- **Identity fragmentation** — aliases, spelling and spacing variants, Kannada⇄
  English transliterations (e.g. *Mohammed Rafi* / *Md. Rafi* / *ಮೊಹಮ್ಮದ್ ರಫಿ*).
  Exact-match SQL can't link them.
- **Bilingual narratives** — FIRs and queries arrive in Kannada, English, or a
  code-mix. Keyword search can't judge semantic similarity across languages.
- **Legal constraints** — per the Supreme Court's 2018 Aadhaar ruling, **Aadhaar
  must never be a matching key**. Pramaan uses other strong keys (phone, vehicle
  reg., DL, Voter ID) plus probabilistic matching.
- **Chain of evidence** — officers need role-gated access and tamper-evident,
  court-ready dossiers.

## 2. What Pramaan does

| # | Capability | Endpoint |
|---|------------|----------|
| 1 | **Entity resolution** — deterministic (strong-key) + probabilistic (Fellegi-Sunter) identity linking into canonical IDs | `POST /server/entity_resolution_fn/resolve` |
| 2 | **Case-twin matching** — ranks similar cases by location, time, MO, weapon, and **multilingual narrative similarity (Kannada scored in Kannada, no translation)**; flags shared canonical suspects | `POST /server/case_twin_fn/match` |
| 3 | **Graph analytics** — multi-hop traversal + Leiden associate clusters | `POST /server/graph_fn/traverse`, `/communities` |
| 4 | **Priority scoring** — transparent, hand-reproducible weighted score (recency, severity, centrality, **active-warrant from a real `Warrant` table**) | `POST /server/graph_fn/priority` |
| 5 | **Spatial hotspots** — Haversine clustering (~10 km) with isolated-incident separation | `POST /server/graph_fn/hotspots` |
| 6 | **NL + voice router** — classifies Kannada/English queries to the right engine; Bhashini ASR-in / TTS-out; logs every answer to `ConversationLog` | `POST /server/intent_router_fn/route`, `/voice` |
| 7 | **Court-ready PDF export** — conversation history + case dossier via Catalyst **SmartBrowz** | `POST /server/export_fn/conversation_pdf`, `/dossier_pdf` |
| 8 | **RBAC + audit** — default-deny middleware, every access written to `AccessAuditLog` | `@app.middleware` + `/server/gateway_fn/check_access` |
| 9 | **Public help desk** — a *genuinely isolated*, unauthenticated static assistant (complaint steps, helplines, station locator) with a machine-enforced no-case-data contract | `appsail/static/public-assistant/` |

## 3. Design principles

- **Don't translate Kannada before reasoning.** Narratives and queries are
  embedded/compared **in Kannada** (Vyakyarth multilingual embeddings), mirroring
  the intent router. This is enforced with explicit anti-"simplification" comments.
- **Explainability over black boxes.** The priority score is a visible weighted
  formula whose total is recomputable by hand from the factors it returns — a test
  asserts exactly this.
- **Fail honestly.** Missing a live dependency (Neo4j, Bhashini, SmartBrowz, an LLM
  key) yields an explicit mock/fallback mode with a labelled header — never a faked
  success or a silent empty answer.
- **Canonical IDs only.** Nothing downstream references a raw `person_id`; everything
  keys on the entity-resolved `canonical_id`.

## 4. Architecture

```
React SPA (Vite)  ──HTTP/JSON──►  Pramaan AppSail (FastAPI, Python 3.12)
  served by Slate                   ├── gateway_fn        (RBAC middleware + audit)
                                     ├── entity_resolution_fn
                                     ├── case_twin_fn      (embeddings ▸ precomputed ▸ TF-IDF)
                                     ├── graph_fn          (traverse, communities, priority, hotspots)
                                     ├── intent_router_fn  (LLM/regex + Bhashini voice)
                                     ├── export_fn         (SmartBrowz PDF)
                                     └── CatalystRepository (live ▸ mock fallback)
                                              │
                     Zoho Catalyst ───────────┼───────────────────────────
                     Data Store (ZCQL) · SmartBrowz (PDF) · Cache · Auth
                     External: Neo4j Aura (graph) · Bhashini (Kn ASR/TTS) · Gemini (NL)
```

## 5. Repository layout

```
appsail/                 # DEPLOYED backend (FastAPI on Catalyst AppSail)
  app.py                 #   app + security headers + RBAC middleware + rate limiting
  run_app.py             #   entrypoint: binds 0.0.0.0:$X_ZOHO_CATALYST_LISTEN_PORT (+ stdlib diag fallback)
  repositories.py        #   CatalystRepository: live Data Store ▸ mock fallback
  rate_limit.py          #   shared SlowAPI limiter
  routers/               #   gateway, entity_resolution, case_twin, graph, intent_router, export, bhashini
  static/                #   compiled React client + isolated public-assistant/
  backfill_embeddings.py #   offline narrative-vector precompute
  test_appsail.py        #   17-test suite (see §8)
  app-config.json        #   stack=python_3_12, command="python3.12 run_app.py", memory=2048
client_src/              # React + Vite source (builds to appsail/static)
functions/               # Legacy standalone-function tree (kept green; not deployed)
schema/
  data_store_schema.sql  # Data Store DDL (incl. Warrant)
  seed_data.sql          # demo rows
catalyst.json            # deploys appsail/
catalyst-pipelines.yaml  # CI test stages + manual Production gate
docs/                    # concept, roadmap, SDLC, build prompts
content.md               # full development log + outstanding-work roadmap
DEPLOY_RUNBOOK.md        # step-by-step go-live (console tasks)
```

## 6. Running locally

```bash
# Backend (runs in fallback/mock mode without Catalyst cloud headers)
cd appsail
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload --port 9000
# http://127.0.0.1:9000/server/gateway_fn/health  -> {"status":"ok"}

# Frontend
cd client_src
npm install
npm run build      # outputs to appsail/static
npm run dev        # or dev server
```

Auth for local API calls uses a header shortcut: `Authorization: Bearer role_SI`
(also `role_ACP`, `role_Analyst`, `role_Policy`).

## 7. Deploying to Catalyst (Development)

> **Two hard-won gotchas** (see `content.md` §6.5 and `DEPLOY_RUNBOOK.md`):
> 1. The container interpreter is **`python3.12`** (not `python`/`python3`).
> 2. **AppSail does not auto-install `requirements.txt`** — dependencies must be
>    **vendored** into `appsail/` as complete **Linux** wheels.

```bash
# Vendor Linux deps into appsail/ (one-time / when requirements change)
cd appsail
pip download -r requirements.txt --only-binary=:all: \
  --python-version 312 --implementation cp --abi cp312 \
  --platform manylinux_2_17_x86_64 --platform manylinux_2_28_x86_64 -d _wheels
for w in _wheels/*.whl; do python -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall('.')" "$w"; done
rm -rf _wheels

# Deploy the backend (Development)
cd ..
catalyst deploy --only appsail
```

**Console tasks** (can't be scripted — see `DEPLOY_RUNBOOK.md`): create Data Store
tables + seed rows, set env vars (`GEMINI_API_KEY`, `NEO4J_*`, `BHASHINI_*`), and
enable SmartBrowz.

## 8. Testing

```bash
cd appsail && python -m unittest test_appsail -v      # 17 tests
python appsail/static/public-assistant/test_isolation.py   # public-assistant isolation scanner
```
Coverage: RBAC (per role), entity resolution (auto-merge + surname rejection),
case-twin (English **and Kannada, no translation**, + precomputed-vector path),
**priority scoring hand-reproducibility**, **hotspot cluster/isolation**,
ConversationLog write-through, PDF export mode, **live rate-limit 429**, and the
Policy-role string. CI runs these on every push (`catalyst-pipelines.yaml`);
Production deploy is a manual gate.

## 9. Status

| Area | Status |
|------|--------|
| Backend live (Dev) — health, entity resolution, case-twin | ✅ Verified against live URL |
| Graph / priority / hotspots / RBAC / exports (code) | ✅ Built, 17/17 tests green |
| Real SmartBrowz PDF, live Neo4j, live Bhashini, LLM router | ⏳ Code-complete; need Data Store tables + keys + SmartBrowz (console) |
| Distributed rate limiting, Kannada terminology validation, Production promotion | 🔜 See `content.md` §6 |

**Full roadmap and remaining tasks: `content.md` §6.** Development history and the
problems solved along the way: `content.md` §1–5.

## 10. Tech stack

Python 3.12 · FastAPI · SlowAPI · scikit-learn · rapidfuzz · Vyakyarth
(sentence-transformers, offline) · Neo4j GDS (Leiden) · React + Vite · Zoho
Catalyst (AppSail, Data Store/ZCQL, SmartBrowz, Slate, Pipelines) · Bhashini
(Kannada ASR/TTS) · Gemini (intent classification).

---

*Built for the Karnataka State Police Datathon 2026 · India Data Center.*
