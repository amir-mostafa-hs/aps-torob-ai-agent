# Repository and Environment Audit Report

**Date:** 2026-10-23  
**Project:** Torob In-Person Shopping Assistant (دستیار هوشمند خرید حضوری ترب)  
**Execution Context:** Windows PowerShell, Node.js v22.20.0, Python 3.11.0  

---

## 1. Git Baseline & Working Tree Status

- **Branch:** `main` (clean baseline before Phase 0 documentation)
- **Git status:**
  - Modified: `.gitignore`
  - Untracked: `.agents/rules/`, `.agents/skills/`, `AGENTS.md`, `README_FA.md`, `TOROB_ANTIGRAVITY_MEGA_PROMPT.md`, `docs/`
- **Data Protection Check:**
  - Large dataset files (`torob-dataset/*.csv`, `torob-dataset/processed_data/*.sqlite`, `torob-dataset/processed_data/*.csv`) are in `torob-dataset/` which is ignored in `.gitignore`.
  - Confirmed: No dataset files or secret keys will be staged or committed.

---

## 2. Environment & System Tooling

| Tool / Runtime | Detected Version | Status / Notes |
|---|---|---|
| **Python** | 3.11.0 | Available; standard library includes `sqlite3` with FTS5 support. |
| **Python Packages** | FastAPI 0.115+, Pydantic 2.13.4, Uvicorn 0.44.0, sse-starlette 3.4.5, httpx 0.28+, pytest 9.1.1 | All required backend & testing libraries are pre-installed in the environment. |
| **Node.js** | v22.20.0 | Supported LTS version; compatible with Next.js 14/15. |
| **npm** | 11.7.0 | Modern npm package manager. |
| **Platform Target** | Liara (Docker / Node runtime) | Documented in `docs/WORK_PLAN.md` and `docs/DECISIONS.md`. |

> [!IMPORTANT]
> **Windows Python Console Encoding:**  
> On Windows, Python's default console encoding is `cp1252`. When printing Persian strings or piping UTF-8 characters via PowerShell, `sys.stdout.reconfigure(encoding='utf-8')` is required in Python scripts to prevent `UnicodeEncodeError`.

---

## 3. Existing Frontend Audit (`sample-front-for-project`)

The repository includes a reference React/Vite MVP under `sample-front-for-project/`:

- **Framework:** Vite 8.3 + React 19 + TypeScript + TailwindCSS v4.
- **Dependencies:** `@google/genai`, `leaflet`, `lucide-react`, `motion`, `zod`, `express`.
- **Package state:** `node_modules` was not installed; `bun.lock` and `package.json` are present.
- **Components & Layout:**
  - `src/App.tsx`: Monolithic single-file container (~51KB) handling search, chat, filters, and step progression.
  - `src/components/`: Modular presentation components (`AppShell`, `DiscoveryComponents`, `StoreComponents`, `CallComponents`, `LocationComponents`, `StoreMap`, `TrustBadge`).
  - `src/copy/fa.ts`: Excellent, high-quality, comprehensive Persian text constants for all UI steps, badges, warnings, and placeholder prompts.
  - `src/contracts/api.ts`: Well-defined Zod schemas matching the proposed API schema (Price, Availability, Store, Offer, Product, Filters).
  - `src/mocks/`: Mock data server with synthetic Tehran stores and fixtures (`tehranData.ts`).
- **Shortcomings of the reference frontend:**
  1. Relies purely on local mocked datasets (`mockServer.ts`) rather than real SQLite backend data.
  2. UI is cluttered and requires significant restructuring for true mobile-first RTL responsiveness and accessibility.
  3. Uses client-side direct `@google/genai` calls which leaks API architecture and violates backend orchestration rules.
- **Migration Strategy:**
  - As decided in `docs/DECISIONS.md` (Decision 3 & 68), rebuild the frontend in Next.js + TypeScript + Tailwind + shadcn/ui.
  - Salvage and reuse:
    - `src/copy/fa.ts`: Reusable central Persian language dictionary.
    - `src/contracts/api.ts`: API schema reference and Zod validation definitions.
    - Reusable UI ideas: four-step shopping flow, progressive disclosure of store details, mall indoor navigation badges.

---

## 4. Source Dataset & Processed Artifacts Status

The directory `torob-dataset/` contains:
1. **Raw Challenge Data:**
   - `shops.csv`: 6,476 rows, 9.2 MB (physical shops in Tehran).
   - `products.csv`: 225,903 rows, 196 MB (catalog products).
   - `offers.csv`: 331,506 rows, 80 MB (shop-product price listings).
2. **Processed & Enriched Pipeline Artifacts (`torob-dataset/processed_data/`):**
   - `torob_agent.sqlite`: 758.8 MB SQLite database containing enriched `shops`, `products`, `offers`, `bazaar_hubs`, and `products_fts` (FTS5). Tested and verified: `PRAGMA quick_check` returned `ok`.
   - `tehran_malls_directory.json`: 164 multi-store shopping malls with coordinates, metro, hours, and navigation hints.
   - `tehran_bazaar_hubs_by_category.json`: 4,066 category market hubs in Tehran with coordinates and advice.
   - `product_reviews_and_buying_guides.json`: 600 product buying checklists synthesized from technical specifications.
   - `real_shops_112.csv`: 112 verified shops with real websites/Instagram accounts.
   - `DATA_QUALITY_COMPARISON.md` & `PROCESSED_DATA_GUIDE.md`: Comprehensive documentation from previous data enrichment.

---

## 5. Available Skills & Rules

- **Workspace Skills (`.agents/skills/`):**
  - `phase-gate`: Enforcement of phase-by-phase verification, test evidence, and safe Git checkpoints.
  - `dataset-audit`: Inspection and verification of raw & processed datasets.
  - `tdd-vertical-slice`: TDD implementation loop for vertical behavior slices.
  - `code-review`: Two-axis standards & spec review.
- **Rules (`.agents/rules/`):**
  - `00-product-invariants.md`: Data truthfulness, fake phone prohibition, simulation clarity, Persian RTL.
  - `10-engineering-quality.md`: Public test seams, real data fixtures, offline default tests, no softened assertions.
  - `20-data-agent-and-provider.md`: Read-only source DB, bounded pagination, BoxAPI & Gemini configs, separate session store.

---

## 6. Architecture Proposal

A clean **modular monolith** with two cohesive services:
1. **`backend/` (FastAPI + Pydantic + SQLite):**
   - Read-only connection to `torob-dataset/processed_data/torob_agent.sqlite`.
   - Lightweight writable SQLite database for anonymous sessions (`session_store.sqlite`) with TTL auto-expiry.
   - Deterministic search, filtering, distance calculation, ranking, and seller inquiry simulation.
   - Agent orchestration loop with validated tool calling and SSE streaming progress.
   - Configurable LLM provider (BoxAPI for production, Gemini/Google AI Studio for local development).
2. **`frontend/` (Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui):**
   - Mobile-first, Persian RTL layout with progressive disclosure.
   - Server components and client interactions for discovery, comparison, shop view, and seller simulation.
   - Generative UI rendering an allowlist of schema-validated components (`ProductCard`, `ShopCard`, `ComparisonTable`, `MallNavigationCard`, `InquirySimulationCard`, `BazaarHubCard`).
   - Direct SSE consumption for streaming chat progress.

---

## 7. Phase 0 Gate Check

- [x] Git status verified; raw dataset files safely untracked and preserved.
- [x] Environment runtimes (Node 22, Python 3.11, FastAPI stack) confirmed functional.
- [x] Reference frontend analyzed; reusable assets identified; migration need justified.
- [x] Source datasets and SQLite database validated (integrity check `ok`).
- [x] Architecture proposal aligned with project constraints and accepted decisions.
