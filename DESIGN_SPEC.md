# Pramaan — Frontend UI/UX Design Specification

> A complete, opinionated design blueprint for the Pramaan crime-intelligence command center: the visual system, every page's layout and contents, what each role sees, and a reusable master design prompt.  
> **Aesthetic North Star**: The calm precision of Apple HIG + the clarity of Google Material 3 + the density-done-right of modern operator dashboards (Linear / Vercel / Palantir-lite).

---

## 1. Design Vision & Principles

> *"A calm command center for high-stakes work."*  
> Officers make consequential decisions under pressure — the UI must feel authoritative, never noisy.

1. **Clarity over decoration.** Every pixel earns its place. Data first, chrome last.
2. **Trust is visible.** Data source (`LIVE` vs `SEED`), evidence citations, and access restrictions are always shown — the UI never pretends.
3. **Bilingual-native.** Kannada and English are equal citizens; Kannada renders in proper script (`Noto Sans Kannada`), never as a bolt-on.
4. **Explainable by design.** Every AI number can be expanded to *why*.
5. **Role-honest.** The interface reflects exactly what the server permits.
6. **Quiet motion.** Transitions guide attention (150–250ms), never entertain.

---

## 2. Visual System

### 2.1 Color Palette (Dark-First "Midnight Command")

| Token | Hex | Use |
| :--- | :--- | :--- |
| `--bg` | `#0B0E14` | App background (near-black navy) |
| `--surface` | `#121722` | Cards / panels |
| `--elevated` | `#1A2130` | Raised rows, inputs, hover |
| `--panel` | `#232C3D` | Chips, table headers |
| `--border` | `#2A3346` | Hairline borders (1px) |
| `--text` | `#EAF0FA` | Primary text |
| `--text-secondary` | `#8A97AD` | Secondary / labels |
| `--primary` | `#3B82F6` → `#38BDF8` | Actions, active nav (blue → cyan) |
| `--secondary` | `#22D3EE` | Accents, links |
| `--success` | `#34D399` | Live, allow, resolved |
| `--warning` | `#FBBF24` | Review queue, seed fallback |
| `--critical` | `#F87171` | Alerts, deny, high priority |
| `--info` | `#A78BFA` | Analytics highlights |

**Crime-Type Semantic Colors** (used on map + charts, keep consistent):  
Burglary `#F59E0B` · Chain snatching `#EF4444` · Vehicle theft `#A855F7` · Theft `#F97316` · Assault `#EC4899` · Murder `#DC2626` · Default `#22D3EE`.

**Light Theme** (for daytime station use): Inverts to `#F6F8FB` bg, `#FFFFFF` surface, `#0F2A4A` primary while retaining semantic colors. Toggle in `TopBar`.

---

### 2.2 Typography
- **UI font**: Inter / SF Pro (system-ui fallback).  
- **Kannada**: Noto Sans Kannada.  
- **Numeric / IDs**: JetBrains Mono / ui-monospace (tabular figures for tables & scores).

| Style | Specs |
| :--- | :--- |
| **Display (Page Title)** | 20px · 700 · -0.01em |
| **Subheading** | 15px · 600 |
| **Body** | 13px · 450 |
| **Label** | 12px · 500 |
| **Micro / Meta** | 11px · 500 · text-secondary |
| **Eyebrow (Section Tag)** | 10px · 600 · uppercase · 0.08em · text-secondary/60 |

---

### 2.3 Spacing, Radius, & Elevation
- **Grid**: 4px base. Panel padding 20px; gap 12–16px; page padding 20px.
- **Radius**: Inputs/chips 6px · cards 10px · modals 14px · full for pills/avatars.
- **Elevation**: Cards = 1px border + `0 1px 2px rgba(0,0,0,.4)`; modals add `0 20px 40px rgba(0,0,0,.5)` + backdrop blur. Borders carry structure.

---

### 2.4 Core Components
- **Stat tile**: Eyebrow label + big mono value + trend chip + small icon (4-up grid).
- **WorkPanel (card)**: Title + eyebrow + right-aligned actions slot + body.
- **ModeBadge**: Pill with pulsing dot — `LIVE ZCQL` (green) / `SEED FALLBACK` (amber) / `MOCK` (cyan).
- **Explainability tooltip**: Clickable score → popover showing exact formula + factor values.
- **Evidence citation (`<Cite>`)**: Inline superscript chip linking a claim to its source record ID.
- **Data table**: Sticky header, zebra rows on elevated, mono for IDs/scores, row hover, right-aligned numbers.
- **Severity/decision badges**: `auto_merge`/`allow` = green, `review_queue` = amber, `reject`/`deny` = red.

---

## 3. Global App Shell Layout

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│          │  TOPBAR                                                        │
│ SIDEBAR  │  ‹ breadcrumb ›   ⌘K omni-search   │  [Role ▾] [EN|ಕನ] 🔔 👤   │
│ (240px / ├──────────────────────────────────────────────────────────────┤
│  64px)   │                                                                │
│          │   PAGE CONTENT (scrollable area)                               │
│          │                                                                │
├──────────┴──────────────────────────────────────────────────────────────┤
│ STATUS BAR:  ● backend LIVE · role: ACP · last sync 12s · v1.0.0-dev      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Role → Page Access Matrix

| Page (View) | Group | SI | ACP | Analyst | Policy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Overview** | Watch Floor | ✅ | ✅ | ✅ (Aggregate) | ✅ (Rollup) |
| **Alert Stream** | Watch Floor | ✅ | ✅ | ✅ | ✅ |
| **Case Register** | Investigate | ✅ | ✅ | 🔒 Restricted | 🔒 Restricted |
| **Identity Resolution** | Investigate | ✅ | ✅ | 🔒 Restricted | 🔒 Restricted |
| **Case Twins** | Investigate | ✅ | ✅ | 🔒 Restricted | 🔒 Restricted |
| **Live Crime Map** | Analyze | ✅ | ✅ | ✅ | ✅ |
| **Entity Graph** | Analyze | ✅ | ✅ | 🔒 Restricted | 🔒 Restricted |
| **AI Assistant** | Analyze | ✅ | ✅ | 🔒 Restricted | 🔒 Restricted |
| **Audit & Compliance** | Govern | ✅ | ✅ | ✅ | ✅ |

---

## 5. Master Design Prompt for Generators

```text
Design a modern, dark-themed crime-intelligence command center called "Pramaan" for the Karnataka State Police.
Aesthetic: Apple HIG precision + Google Material 3 clarity + Linear/Vercel density.
Colors: Near-black navy (#0B0E14), card surfaces (#121722), hairline 1px borders (#2A3346), primary blue→cyan (#3B82F6→#38BDF8), green/amber/red semantic badges.
Typography: Inter UI, JetBrains Mono tabular figures, Noto Sans Kannada script.
Layout: 240px sidebar (Watch Floor, Investigate, Analyze, Govern), 72px topbar (breadcrumb, ⌘K search, role switcher, EN/KN toggle), status bar.
Pages: Command Overview, Alert Stream, Case Register, Identity Resolution, Case Twins, Live Crime Map, Entity Graph, AI Assistant, Audit & Compliance, Public Help Desk.
```
