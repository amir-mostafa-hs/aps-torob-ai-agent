# Torob Implementation Work Plan

## Principles

- Optimize for the challenge's 300-point rubric: Product 75, UX 75, Agent Intelligence 50, Deployment 40, Technical 40, Dataset 20.
- The React/Vite MVP is reference material. New target is Next.js.
- The project is a demo-scale modular monolith. Do not over-engineer.
- Use real dataset fields before external sources; preserve truth/provenance.
- Test-first small vertical slices, independent review, phase gates.
- Phase 1 uses in-app simulated seller inquiry. Real external messaging is deferred.

## Phase 0 — Baseline/reconnaissance

**Output:** `docs/REPO_AUDIT.md`, `docs/DATASET_AUDIT.md`, baseline test report, challenge field-to-feature map, architecture proposal.  
**Tasks:** inspect Git status; frontend routes, mocks, scripts and dependencies; inventory data files; SQLite schema/FTS/indexes/query plans; CSV/JSON relationships and quality; deployment current state; available Antigravity rules/skills. Run baseline commands before editing.  
**Gate:** real findings documented, source files protected, unknown schemas no longer guessed.

## Phase 1 — Domain and API specification

**Output:** `docs/PROJECT_SPEC.md`, `docs/API_CONTRACT.md`, concise ADRs, acceptance test seams.  
**Tasks:** define domain models from audited fields; status/provenance values; API schemas and frontend type generation; agent tool contracts; session expiration; error model.  
**Gate:** every required user flow maps to real fields or an explicitly identified simulation/unknown state.

## Phase 2 — Data/search/backend vertical slices

**Tasks:** data adapters with read-only source SQLite; Persian normalization; parameterized FTS search and fallbacks; query/filter/ranking; product-offer-shop relationships; compare; nearby-shop distance; working hours; installment constraints; health/readiness; anonymous session persistence with TTL. Build APIs in slices.  
**Gate:** data/query/unit/API tests pass on actual local data; query plans and bounded result behavior are understood.

## Phase 3 — Next.js UI vertical slices

**Tasks:** migrate/rebuild from reference; setup Next.js + TypeScript + Tailwind + shadcn/ui; central Persian copy, RTL, mobile-first layout; search, filters, cards, compare, shop results, location choices, states and navigation. Connect real APIs as each slice lands. Keep mock mode behind explicit configuration only.  
**Gate:** lint/typecheck/build/component tests and first Playwright user journeys pass; no production mock fallback.

## Phase 4 — Agent and Generative UI

**Tasks:** controlled tool-calling loop; Pydantic tool schemas; `search_products`, `find_shops`, `compare_shops`, `get_mall_navigation`, `suggest_alternatives`, `contact_seller` where audit supports them; tool limits; SSE progress; schema-validated UI blocks; limited contextual memory; seller simulation. Small real provider smoke tests validate tools and streaming.  
**Gate:** deterministic mocked tests pass, agent evaluation scenarios pass, provider capability is evidenced, and no fake data is presented as verified.

## Phase 5 — UX integration, accessibility, performance

**Tasks:** complete four-step shopping flow; validate empty/error/unknown states; keyboard/contrast/reduced motion/RTL/mobile review; compare visual screenshots where stable; measure actual bottlenecks; optimize only measured issues; regression suite.  
**Gate:** full automated journey and visual/accessibility checks pass at expected demo scale.

## Phase 6 — Liara deployment

**Tasks:** review current official Docker, runtime, environment, volume/object-storage, health-check and deployment docs. Choose single versus split service based on current platform constraints and cost. Prepare `.env.example`, data setup/verification, production secrets guidance, CORS/cookies and SSE. Verify real data files are supplied outside Git. Run remote smoke checks after deployment.  
**Gate:** URL is reachable; health/readiness is truthful; product search/compare/session/SSE work against actual deployed data; failure behavior is safe. If credentials/account access are missing, report `BLOCKED` with remaining manual actions.

## Phase 7 — Independent review and handoff

**Tasks:** full suite; standards+spec review; security/data provenance pass; README deploy instructions; known limitations; `docs/FUTURE_IDEAS.md`; final Persian handoff.  
**Gate:** no high-severity known issue left unreported, all challenge rows have evidence or transparent limitation.

## Change and Git policy

- Before work, inspect status and preserve existing changes.
- Create a restore point before large migrations.
- After each fully passing phase, create a checkpoint/commit if Git is configured and the staged changes are project-only. Do not commit datasets, `.env`, generated credentials, or unrelated user edits.
- Never run destructive Git commands or delete raw dataset files to fix a test.

## Explicitly deferred

- Real automatic SMS/Instagram integrations and delivery webhooks.
- External product review/comment enrichment.
- Long-term user preference memory/accounts.
- Embeddings-based reranking/vector retrieval unless measured gains justify a Phase 2 design.
- Product reservation/order workflows.
- Any other extra capability suggested by the agent; log it in `docs/FUTURE_IDEAS.md`.
