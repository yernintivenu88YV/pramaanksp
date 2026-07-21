# Pramaan — Go-Live Runbook (Development)

Console tasks are the only ones that can't be done from code. Do them in order.
Project: **KSP-Datathon** · Data Center: **India** · Backend: **AppSail `pramaan`**.

---

## 0. THE BLOCKER — fix the AppSail Startup Command (2 min)

The container keeps returning `503 "Execution failed. Please check the startup
command or port."` and never runs `run_app.py`. The repo's `app-config.json` is
correct (`python run_app.py`, 2048 MB, 0.0.0.0 bind) but the **console setting is
overriding it**.

1. Console → **AppSail → `pramaan` → Configuration** (a.k.a. Settings).
2. **Read the current Startup Command** and tell me what it says.
3. Set **Startup Command** = `python run_app.py`
   (if `python` isn't found, use `python3 run_app.py`).
4. **Stack** = Python 3.12 · **Memory** = 2048 MB.
5. **Save → Restart** the instance.
6. Confirm: `GET https://pramaan-50043776375.development.catalystappsail.in/server/gateway_fn/health`
   returns `{"status":"ok","module":"gateway_fn"}`.

> If it now returns `{"status":"fallback_error", "traceback": ...}` instead, that
> is `run_app.py`'s new stdlib diagnostic — paste me the traceback and I'll fix it.

---

## 1. Data Store — create tables

Console → **Data Store → New Table**, create each table from
`schema/data_store_schema.sql`:

`Person, EntityResolution, Location, Case, CasePersonLink, Vehicle,
FinancialTransaction, OffenderProfile, ConversationLog, AccessAuditLog, Warrant`

- `Case` must include the columns `narrative_embedding` (Text) and
  `embedding_model` (Varchar) — used by precomputed similarity.
- `Warrant` (new) columns: `warrant_number, canonical_id, active_flag,
  issuing_court, offence, issued_at, updated_at`.

## 2. Seed demo rows

Import `schema/seed_data.sql` (or paste the rows) so the demo has real data —
otherwise case-twin / dossier / graph return empty or 404. It seeds CASE-001…005,
the Kannada CASE-K01/K02, CANON-0042/0044, and two warrants (one active).

## 3. Environment variables

Console → **AppSail → `pramaan` → Configuration → Environment Variables**:

| Var | Needed for | Without it |
|-----|-----------|-----------|
| `GEMINI_API_KEY` | Intent router `/route` | 400 "missing LLM credentials" |
| `NEO4J_URI` / `NEO4J_USER` / `NEO4J_PASSWORD` | Live graph traverse/Leiden | graph runs in mock mode |
| `BHASHINI_USER_ID` / `BHASHINI_ULCA_API_KEY` / `BHASHINI_PIPELINE_ID` | Voice ASR/TTS | voice runs in mock mode |

(Redeploy or restart after adding env vars.)

## 4. SmartBrowz

Confirm **SmartBrowz** is enabled for the project (it's a built-in Catalyst
service). This is what makes PDF export return a real PDF
(`X-Pramaan-Export-Mode: smartbrowz_pdf`) instead of the HTML fallback.

---

## 5. Hand back to me

Once step 0 shows `{"status":"ok"}`, tell me. I will immediately:
- run `python appsail/backfill_embeddings.py --all` to fill narrative vectors,
- run the three live checks: **health 200**, one real **SmartBrowz PDF** from
  `/conversation_pdf` and `/dossier_pdf` (reporting the real `X-Pramaan-Export-Mode`),
  and one real **429** from the rate limiter,
- report actual output for each.
