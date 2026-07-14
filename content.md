# Pramaan Crime Intelligence Platform: Entity Resolution Engine

This document details the development history, technical architecture, issues encountered, and solutions implemented during the initialization and migration of the entity resolution module for the Karnataka State Police (KSP) Datathon.

---

## 1. The Actual Problem We Are Building
When law enforcement investigates crimes, suspect and case details are scattered across multiple unconnected datasets:
* First Information Reports (FIRs)
* Vehicle Registries
* Phone Records / Call Detail Records (CDRs)
* Financial / Bank KYC Records

Suspects frequently use alias variations, different spellings, abbreviated names, or false credentials. Standard relational databases fail to link these records because of name spelling variations, spacing discrepancies, and missing fields. 

**The Goal**: Build "Pramaan," a high-stakes investigation support system that performs entity resolution and case-twin matching. It must link records belonging to the same entity across disparate systems with high precision, maintaining an explainable audit trail so that law enforcement can justify decisions without relying on "black-box" AI.

### Legal and Compliance Boundary
To comply with the Supreme Court's 2018 ruling on the Aadhaar Act, **Aadhaar numbers must not be used as matching identifiers**. Pramaan must rely on other strong identifiers (Vehicle Registration, Phone Numbers, Driving Licenses, Voter IDs) and probabilistic matching logic.

---

## 2. Technical Solution
We built a hybrid, two-tiered resolution engine:
1. **Deterministic Matching (Tier 1)**: Conclusive matching based on strong identifiers. If two records share the exact same normalized phone number or vehicle registration, they are automatically merged.
2. **Probabilistic Matching (Tier 2)**: For record pairs that do not share strong identifiers, a simplified Fellegi-Sunter scoring framework computes log-likelihood style weights based on:
   * **Name Similarity**: Jaro-Winkler token-level best-match pairing to prevent first-name dominance (e.g., preventing "Mohammed Rafi" and "Mohammad Sharif" from incorrectly matching based on "Mohammed" alone).
   * **Address Token Overlap**: Tokenized intersection over maximum length.
   * **Age Proximity**: Difference-based decaying proximity score.

### Decision Boundaries
* **Auto-Merge (Score >= 5.0)**: Highly confident duplicates are merged automatically.
* **Review Queue (2.5 <= Score < 5.0)**: Ambiguous pairs are routed to a human review queue.
* **Reject (Score < 2.5)**: Insufficient evidence; treated as distinct entities.

---

## 3. Work Done
1. **CLI Authentication & Bypassing**: Set up the `zcatalyst-cli` environment and automated DC configuration and Org selection.
2. **Project Initialization**: Programmatically ran `catalyst init` and initialized the project for the India Datacenter (Mumbai) under project ID `50085000000040001` (KSP-Datathon) with both Functions and Client modules enabled.
3. **Advanced I/O Function Setup**: Added a Python 3.12 Advanced I/O function named `entity_resolution_fn`.
4. **Logic Migration**: Migrated the core `entity_resolution.py` engine, unit tests (`test_entity_resolution.py`), and the interactive `demo_console.py` from the prototype folder.
5. **Input Validation & Ingestion Layer**: 
   * Created `schemas.py` using **Pydantic** models (`PersonRecordInput`, `ResolveRequest`) for HTTP request validation.
   * Created `ingestion.py` as a single point of data parsing.
6. **API Handler Implementation**: Modified `main.py` using Flask to expose:
   * `GET /health`: Health checks.
   * `POST /resolve`: Performing real-time entity resolution.
7. **Local Testing**: Installed required dependencies (`zcatalyst-sdk`, `rapidfuzz`, `pydantic`) and verified local server responses on port `3000` via `catalyst serve`.

---

## 4. Problems Faced
1. **CLI Hangs in Non-Interactive Environments**: Running `catalyst` commands directly in background tasks hung indefinitely because the CLI expects a TTY for telemetry and confirmation questions.
2. **Device Code Polling Timeout**: The device authentication polling loop of `zcatalyst-cli` timed out too quickly (30 retries of 5 seconds = 150 seconds), which didn't allow enough time to authenticate in the browser.
3. **Interactive Prompts Blocking Automation**: The `catalyst init` command asks multiple questions (DC, Org, Features, Functions, Client template types, package name, entry points) which are hard to pipe dynamically.
4. **Checkbox Value Selection Mismatch**: In the checkbox prompts (like selecting project features), the zcatalyst-cli wrapper code matches exact choice IDs rather than option values. Passing raw values like `['functions', 'client']` resulted in an empty feature list.
5. **Incorrect Runtime Selection**: Selecting `python312` failed with a "Selected runtime is invalid" error.
6. **Port Conflicts**: Investigating ports showed port `8080` was already occupied by an Oracle Database Express Edition (XE) listener rather than the Catalyst server.

---

## 5. Approaches and Solutions
1. **Piping and Stdin Mocking**: Used `"" | catalyst ...` to terminate the stdin prompt check immediately when calling simple non-interactive commands.
2. **CLI Patching & In-Process Authentication**:
   * Patched the global CLI `login.js` source code to increase the retry counter from `30` to `300` (allowing 10 minutes).
   * Programmed an in-process mock script `run_login_tty.js` that set `process.stdin.isTTY = true` and mocked inquirer selections inside the global CLI's runtime store, bypassing telemetry prompts.
3. **Scripted Init and Prompt Interception**:
   * Wrote `run_init.js` which directly loaded the CLI runtime store and set the prompt answers beforehand under the `'prompt'` key.
   * Created a JavaScript `Proxy` getter on the `name` property to handle sequential prompts named `name` differently (returning `entity_resolution_fn` for the function and `client_app` for the client name).
4. **Source Code Inspection & Target Mapping**:
   * Inspected the CLI's `init/util/common.js` and `init/util/client.js` to determine how checkbox and list selections are mapped.
   * Discovered that the features selection prompt uses choice names as IDs (e.g., `'Functions: Configure and deploy http/non-http functions'`), and the python runtime in the India DC is registered as `'python_3_12'` (not `python312`).
   * Configured the exact target IDs in the mock prompts.
5. **Net TCP Connection Check**: Used Powershell's `Get-NetTCPConnection` to pinpoint the exact local interface and port. Discovered that the Catalyst server was listening on `127.0.0.1:3000`, resolving connection attempts.
