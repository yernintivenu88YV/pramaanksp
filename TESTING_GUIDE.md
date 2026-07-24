# Pramaan (ಪ್ರಮಾಣ) — Complete Website Testing Guide & Verification Matrix

> **Karnataka State Police (KSP) Datathon 2026**  
> **Live Site (Slate SPA)**: [https://ksp-datathon-ejrnghrv.onslate.in](https://ksp-datathon-ejrnghrv.onslate.in)  
> **AppSail REST Backend**: [https://pramaan-50043776375.development.catalystappsail.in](https://pramaan-50043776375.development.catalystappsail.in)  
> **GitHub Repository**: [https://github.com/yogeshkamisetty/Pramaan-The-Intelligence](https://github.com/yogeshkamisetty/Pramaan-The-Intelligence)

---

## 📋 Comprehensive Testing Checklist Overview

| Test Module # | Feature / Area | Scope & Objectives | Access Level | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **Module 1** | **Multi-Level Security Portal** | Authenticate & switch across 5 clearance levels | All Roles | Dynamic badge, title, & permission updates |
| **Module 2** | **Bilingual Language Switcher** | Translate UI between English & Kannada (`EN` ⇄ `KN`) | All Roles | Headers, buttons, & search omnibar translate |
| **Module 3** | **Command Overview Watch Floor** | Interactive threat priority leaderboard | All Roles | Real-time score updates on slider change |
| **Module 4** | **Case Register** | FIR database table filtering & layout modes | `SI`, `IO`, `ACP` | Filter by status (`Active`, `Escalated`, `Closed`) |
| **Module 5** | **Case Twin Intelligence** | Multilingual signature & MO similarity matching | `SI`, `IO`, `ACP` | Ranked match percentages & shared suspect flags |
| **Module 6** | **Identity Resolution** | Fellegi-Sunter pair resolver & canonical IDs | `IO`, `ACP` | Decision `AUTO_MERGE` with match evidence |
| **Module 7** | **Live Crime Map & Mobile Signals** | Cell tower triangulation & crime density map | `Analyst`, `ACP` | BTS tower pings, IMEI details, & density heatmaps |
| **Module 8** | **Entity Graph Explorer** | Criminal network topology & Leiden clusters | `Analyst`, `ACP` | Interactive node graph & confidence floor slider |
| **Module 9** | **AI Investigation Assistant** | Natural language RAG router & dossier export | `SI`, `IO`, `ACP` | Structured `RoutedResultCard` & PDF export |
| **Module 10** | **Audit & 403 Recovery Actions** | Tamper-evident ledger & access denial recovery | `Policy` / Restricted | Interactive role switch buttons on 403 denial |

---

## 🧪 Detailed Step-by-Step Test Suites

### 1. Multi-Level Security Portal Test (`LoginView.jsx`)
* **URL Location**: Top Bar → Click **"Switch Role"** button.
* **Test Steps**:
  1. Open [https://ksp-datathon-ejrnghrv.onslate.in](https://ksp-datathon-ejrnghrv.onslate.in).
  2. Click **"Switch Role"** in the top bar to open the Security Login Portal.
  3. Click through each of the 5 security clearance role buttons:
     - `SI (Sub-Inspector)` — Level 2 Field Ops
     - `IO (Investigating Officer)` — Level 3 Tactical
     - `ACP (Assistant Commissioner)` — Level 5 Full Command
     - `Analyst (Crime Analyst)` — Level 4 GEOINT & Graph
     - `Policy (Policy Auditor)` — Level 1 Compliance
  4. Click **"Authenticate & Enter Command Floor"**.
* **Verification**: Verify that the active role badge in the top bar and sidebar status footer updates instantly.

---

### 2. Bilingual Support Switcher Test (`TopBar.jsx` & `translations.js`)
* **URL Location**: Top Bar → Click **`EN` / `KN - ಕನ್ನಡ`** toggle button.
* **Test Steps**:
  1. Click **`EN` / `KN - ಕನ್ನಡ`** in the top right header bar.
  2. Inspect the UI elements in English mode (`EN`).
  3. Switch to Kannada mode (`KN - ಕನ್ನಡ`).
* **Verification**: Verify that the following UI elements translate cleanly into Kannada:
  - Sidebar navigation headings (`ಕಮಾಂಡ್ ಮೇಲ್ನೋಟ`, `ಪ್ರಕರಣಗಳ ನೋಂದಣಿ`, `ಎಚ್ಚರಿಕೆ ವಾಹಿನಿ`, `ನೈಜ ಸಮಯದ ಅಪರಾಧ ನಕ್ಷೆ`, `ಸಂಬಂಧಿತ ಜಾಲಲಕ್ಷಣ Graph`).
  - Search omnibar placeholder (`ಪ್ರಕರಣಗಳು, ಅನುಮಾನಾಸ್ಪದ ವ್ಯಕ್ತಿಗಳು, ಫೋನ್ ನಂಬರ್‌ಗಳನ್ನು ಹುಡುಕಿ...`).
  - Mode buttons (`ಹುಡುಕು` / `ಎಐ ಕೇಳಿ`).

---

### 3. Command Overview & Priority Leaderboard Test (`OverviewView.jsx`)
* **URL Location**: Sidebar → **Command Overview** (`/overview`).
* **Test Steps**:
  1. Navigate to **Command Overview**.
  2. Inspect the **Intelligence Briefing** banner and key metrics strip (63 Active Cases, 128 Open Alerts, 9 Critical).
  3. Locate the **Priority Score Slider** on the right panel.
  4. Adjust the weight sliders (Recency, Severity, Centrality, Active Warrant).
* **Verification**: Verify that suspect threat priority scores (`CANON-0042` *Mohammed Rafi*: `87.4%`) recalculate in real-time.

---

### 4. Case Register & FIR Data Store Test (`CasesView.jsx`)
* **URL Location**: Sidebar → **Case Register** (`/cases`).
* **Test Steps**:
  1. Navigate to **Case Register**.
  2. Click the status filter tabs: `All`, `Active`, `Escalated`, `Review`, `Closed`.
  3. Click the layout density buttons: `Dense` / `Comfortable`.
* **Verification**: Verify that FIR records (such as `104430006202600001` — Indiranagar Burglary) display proper status chips (`Active`, `Escalated`) and severity badges (`Critical`, `High`).

---

### 5. Case Twin Intelligence Test (`SimilarCasesView.jsx`)
* **URL Location**: Sidebar → **Case Twins** (`/similar`).
* **Test Steps**:
  1. Navigate to **Case Twins**.
  2. Inspect the **Target Case** card on the left (`CASE-001` — Indiranagar Burglary).
  3. Click **"Run Case Twin API"**.
* **Verification**:
  - Verify that **no red `HTTP Error 405` box appears**.
  - Verify that ranked match cards display:
    * **`CASE-002`**: **82% Similarity** with dimension score bars (Location `0.42`, Time `0.78`, MO `0.91`, Weapon `1.0`, Narrative `0.84`).
    * **`CASE-003`**: **43% Similarity** (Door lock picking MO).
    * **`CASE-005`**: **29% Similarity**.
  - Verify that `CASE-005` appears under **Shared Suspect Flags** on the right column (`CANON-0042`).

---

### 6. Identity Resolution Test (`ResolutionView.jsx`)
* **URL Location**: Sidebar → **Identity Resolution** (`/resolution`).
* **Test Steps**:
  1. Navigate to **Identity Resolution**.
  2. In the **Live Pair Resolver** card, click **"Resolve"**.
* **Verification**:
  - Verify that the resolver output displays **Decision: `AUTO_MERGE`** (or `REVIEW_QUEUE`).
  - Check the evidence list (Exact phone match `+91 98801 23456`, high name similarity).
  - Click on suspect profiles (e.g. `CANON-0042` *Mohammed Rafi*) to expand contact, vehicle, and address details.

---

### 7. Live Crime Map & Mobile Signal Triangulation Test (`LiveMapView.jsx`)
* **URL Location**: Sidebar → **Live Crime Map** (`/map`).
* **Test Steps**:
  1. Navigate to **Live Crime Map**.
  2. Toggle the **"Mobile Signals (BTS / IMEI)"** switch on the top right panel.
  3. Hover over or click cell tower icons (blue tower icons) and suspect signal pings (pulsing red markers) on the Leaflet map.
* **Verification**:
  - Verify that the inspector popup displays real-time signal strength (e.g. `-72 dBm`), carrier (`Airtel` / `Jio`), IMEI (`864920048192041`), and last-seen ping timers.
  - Verify crime density hotspot clusters (`HOTSPOT-1` Indiranagar: 4 incidents).

---

### 8. Entity Graph Explorer Test (`EntityGraphView.jsx`)
* **URL Location**: Sidebar → **Entity Graph** (`/graph`).
* **Test Steps**:
  1. Navigate to **Entity Graph**.
  2. Toggle the node type checkboxes (`Person`, `Vehicle`, `Phone`, `Account`, `FIR`).
  3. Drag the **Confidence Floor** slider ($\ge 48\%$).
  4. Click on nodes in the interactive SVG topology canvas (e.g. `Ravi Kumar S.`, `CANON-0042`).
* **Verification**: Verify that the right inspector panel displays connected edges (`Manjunath G.`, `KA-05-MJ-42`, `KA-01-AG-18`).

---

### 9. AI Investigation Assistant Test (`AssistantView.jsx`)
* **URL Location**: Sidebar → **AI Assistant** (`/assistant`).
* **Test Steps**:
  1. Navigate to **AI Assistant**.
  2. Enter a query in the search bar: *"Find similar burglary cases to CASE-001"*.
  3. Click **"Send Query"**.
  4. Click **"Export CASE-001 Dossier"**.
* **Verification**:
  - Verify that the **Current Assessment** card displays the RAG summary.
  - Verify that the **Routed Result** renders a clean `RoutedResultCard` with intent badges.
  - Click **"Inspect Raw JSON"** to verify audit log payload inspectability.

---

### 10. Audit Ledger & 403 Access Denial Recovery Test (`AuditView.jsx` & `RestrictedView.jsx`)
* **URL Location**: Sidebar → **Audit & Compliance** (`/audit`).
* **Test Steps**:
  1. Switch role to **`Policy`** (Policy Auditor) from the top bar.
  2. Click **Case Twins** or **Entity Graph** in the sidebar.
  3. Inspect the **403 Restricted Access Card**:
     - Click **"Switch to ACP Role"** to automatically elevate clearance.
     - Click **"Contact ACP for Permission"** to send an escalation request.
  4. Navigate to **Audit & Compliance**.
* **Verification**: Verify that the tamper-evident `AccessAuditLog` displays append-only log entries with officer ID, role, resource, decision (`allow` / `deny`), timestamp, and IP address.

---

## 📡 API Endpoint Verification Matrix (DevTools / cURL)

You can verify backend API endpoints directly via browser DevTools console or cURL against `https://pramaan-50043776375.development.catalystappsail.in`:

```bash
# 1. Health Check
curl -X GET "https://pramaan-50043776375.development.catalystappsail.in/server/gateway_fn/health"

# 2. Case Twin Matching
curl -X POST "https://pramaan-50043776375.development.catalystappsail.in/server/case_twin_fn/match" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer role_ACP" \
     -d '{"target":{"case_id":"CASE-001","crime_type":"Burglary","modus_operandi":"Rear window entry"},"top_k":3}'

# 3. Entity Resolution
curl -X POST "https://pramaan-50043776375.development.catalystappsail.in/server/entity_resolution_fn/resolve" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer role_IO" \
     -d '{"record_a":{"name":"Mohammed Rafi","phone":"9880123456"},"record_b":{"name":"Md. Rafi","phone":"9880123456"}}'

# 4. Intent Router (RAG Engine)
curl -X POST "https://pramaan-50043776375.development.catalystappsail.in/server/intent_router_fn/route" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer role_ACP" \
     -d '{"query":"Find similar burglary cases to CASE-001"}'
```

---

## 🏁 Summary Checklist Sign-Off

- [x] Multi-Level Security Clearance Authentication (5 Roles)
- [x] Bilingual English / Kannada UI Translation Switcher
- [x] Command Overview Threat Priority Leaderboard
- [x] Case Register FIR Data Store Table & Layout Modes
- [x] Case Twin Multilingual MO Similarity Matching (Zero 405 Errors)
- [x] Fellegi-Sunter Identity Resolution & Canonical IDs
- [x] Live Crime Map Cell Tower Triangulation & Hotspot Heatmaps
- [x] Criminal Network Entity Graph & Leiden Community Detection
- [x] AI Investigation Assistant Online/Offline RAG Pipeline
- [x] Tamper-Evident Access Audit Ledger & Interactive 403 Recovery Actions
