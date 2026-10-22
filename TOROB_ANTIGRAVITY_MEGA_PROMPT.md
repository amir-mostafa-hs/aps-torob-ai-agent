# Torob In-Person Shopping Agent — Master Implementation Prompt for Antigravity

> **Execution mode:** autonomous, phase-gated, test-first where meaningful, evidence-driven.  
> **Primary outcome:** deliver a cohesive, polished, working demo product that meets the Torob challenge, integrates the real preprocessed datasets, and can be deployed reliably.  
> **Do not stop after planning.** Audit first, document the plan, then implement the required phases without waiting for confirmation unless a high-impact business ambiguity cannot be resolved from this spec, the challenge document, repository, or real data.

## 1. Role and mission

Act as a senior full-stack engineer, product-minded architect, QA engineer, and deployment engineer. Take the existing repository from its current state (a React/Vite frontend MVP with largely mocked interactions, plus local preprocessed CSV/JSON files and a SQLite database whose exact structure must be inspected) to a cohesive, production-quality **hackathon demo**.

“Production-quality” here means reliable, safe, well-tested, accessible, coherent, and deployable for the expected demo scale. It does **not** mean building unnecessary enterprise infrastructure. Optimize for the competition’s actual scoring, real dataset use, straightforward maintainability, and a calm/minimal user experience.

The current React/Vite frontend is only a reference and source of potentially reusable ideas. It is not a constraint. Inspect it, identify useful product behavior and visual assets, then rebuild/migrate to Next.js. Do not preserve weak UI or awkward structure merely to avoid rewriting it.

## 2. Non-negotiable rules — reread at the start of every phase

Before each phase and before each high-impact change, reread `AGENTS.md`, `.agents/rules/`, `docs/DECISIONS.md`, this prompt’s relevant sections, and the current acceptance criteria. Explicitly restate the phase goal, constraints, tests, risk, and definition of done in the implementation notes.

1. **Use the provided Torob dataset first.** Search all relevant local CSV, JSON, SQLite, and FTS resources before considering any outside source. If a relevant field exists in the supplied data, using external search instead is a defect.
2. **Never invent facts.** Do not fabricate product specs, price, store identity, installment eligibility, opening hours, seller replies, verified availability, or contact success.
3. **Keep provenance separate.** A listed offer price, the timestamp of its last recorded update, and seller-confirmed stock are distinct facts. Do not conflate them.
4. **Phones in the challenge dataset are fake.** Never expose them as usable phone numbers, create `tel:` links from them, send SMS to them, or state that a real seller was contacted through them.
5. The challenge document says most shop names are fake; real names are only associated with records with website/social URLs. Audit the real data and its own fields. Do not present fake shop labels as independently verified businesses. Prefer a neutral store label plus reliable location data when identity is unverified.
6. **Phase 1 seller inquiry is simulated inside the app.** Use the actual available seller mock/state data after verifying its schema. Do not claim an external message was delivered or that a seller confirmed stock. The user has explicitly deferred real automatic SMS/Instagram messages to Phase 2. Do not implement those integrations in Phase 1.
7. User-facing text must be Persian, RTL, mobile-first, concise, and accessible. Keep language strings in a maintainable central message/resource structure, not scattered hard-coded text.
8. Minimalism outranks feature count. Every visible control must serve a real task. Do not add animations, maps, charts, panels, prompts, or controls purely for novelty.
9. Agentic autonomy must be constrained and inspectable. The LLM may plan/choose tools and explain results; deterministic backend code owns source-data retrieval, validation, filters, ranking, calculations, permissions, and truth claims.
10. UI generated from the LLM must use an allowlist of known components and validated data schemas. Never render arbitrary HTML, JavaScript, model-generated code, or unchecked URLs.
11. **Tests are gates.** Write a failing behavior test before implementation when a meaningful behavior can be independently specified. Use small red/green/refactor slices. Do not skip, delete, weaken, or rewrite a valid test just to make the suite pass.
12. Do not batch all tests horizontally and implement all code afterward. Build vertical slices from public behavior through API/data/UI.
13. Do not conceal failed tests, warnings, security concerns, incomplete features, or blocked deployment. Continue with independent work when a real blocker exists, and clearly record what remains blocked.
14. Never commit secrets, dataset files, generated private data, large SQLite files, or credentials. Honor the existing `.gitignore`; improve it only after checking current behavior.
15. Preserve user changes. Inspect `git status` first. Never run destructive cleanup, reset, force-push, or delete user data to obtain a clean baseline.
16. Use the simplest architecture with a clear reason. No microservices, queues, vector database, Redis, background workers, or extra stateful infrastructure unless repository/platform evidence proves a need.
17. If a low-risk, reversible detail is ambiguous, choose a sensible documented default and proceed. If ambiguity materially affects product behavior, challenge compliance, data truth, user consent, or irreversible operations, ask one focused question and continue independent work.
18. Capture genuinely useful out-of-scope ideas in `docs/FUTURE_IDEAS.md`; do not start implementing them in the current scope.

## 3. Challenge facts and scoring priorities

Use the challenge brief discovered in the repository as the authoritative challenge source. The uploaded brief states the complete score is 300 points:

- Product fit: 75
- UX: 75
- Agent intelligence: 50
- Deployment: 40
- Technical implementation: 40
- Dataset usage and truthful presentation: 20

Product and UX together are half of the score. Plan for an end-to-end buyer journey, not just an API or an impressive chat window.

The challenge’s intended four-step journey is:

1. Help a user clarify what product/model suits their need; search, filter, compare products/prices.
2. Find physical shops carrying the product, prioritizing an explicitly allowed user location/selected Tehran area and relevant nearby shops.
3. Compare shops by product match, recorded price, approximate distance, working hours, installment/payment conditions, and information freshness where present.
4. Help the user inquire about seller details such as hours/price/stock and provide sensible alternatives if a shop or product is unsuitable/unavailable.

Other challenge-specific needs: Persian RTL/mobile UX, flexible budget/area/conditions, installment filter, accurate use of `BaseProduct` versus `ProductInStore`/offers (or actual equivalent schema), store location / mall / floor / unit information when present, and successful deploy on Liara if supported by current plan/account.

The brief also says offers may be from the previous week, shop names are largely fake (6,364 of 6,476 in the brief), phone numbers are fake, only 112 shop records have corresponding Instagram or website identifiers (22 Instagram and 90 website as described in the brief), only a selective slice of Tehran is represented (described as around 10%), each shop’s product list is capped at 300, and the data includes 225,903 unique products and 331,506 offers. Treat these as challenge-provided context, then verify current files and any preprocessed-version differences before hardcoding counts or deriving user-facing claims.

The demo video (approximately five minutes) is required for competition submission, but creation/editing of that video is explicitly outside this coding prompt. Do not silently mark the overall competition submission complete without reminding the user of this separate obligation in the final report.

## 4. Decisions already made in the interview

Do not ask the user to re-answer these. Implement them or document evidence-backed reasons why a detail is infeasible:

- Target frontend: Next.js, replacing the React/Vite MVP. The old frontend is inspiration only.
- UI: Tailwind CSS + shadcn/ui; keep components cohesive, accessible, and reusable. Do not add multiple overlapping UI frameworks.
- Visual direction: recognizable Torob-like warmth but an original, modern, polished, minimal treatment; Persian-first RTL.
- Interaction: hybrid UI and chat. Search, filters, cards, selection, comparison, and map/navigation affordances must not require chat for every action.
- Generative UI: combination of prebuilt, allowlisted components with a validated schema. The agent can select/order a small set of components according to user intent. If this complexity does not earn its keep, use the simpler structured-output variant (validated JSON union of known components).
- Motion: smooth, restrained transitions and progressive disclosure. Prefer CSS transitions or a small proven library; do not add motion that hurts performance, readability, reduced-motion preferences, or mobile use.
- Backend: Python + FastAPI + Pydantic.
- Data: use the real preprocessed CSV/JSON sources and provided SQLite/FTS5 database in place. Inspect all source shapes and relationships first. Use a separate small writable SQLite store for anonymous sessions/app state if appropriate; keep source dataset DB read-only. Do not move everything into a new database without evidence.
- Search: begin with indexed/FTS5 and Persian-aware normalization; use deterministic filters/ranking in backend. Query expansion should be targeted, cheap, and only when needed. Embeddings are optional Phase 2 or a measured reranker for a small candidate set (e.g. top 50) only if benefits justify cost. Do not build a vector database for the first version.
- Agent: a simple, controlled tool-calling loop, not a large agent framework by default. Candidate tools: `search_products`, `find_shops`, `compare_shops`, `get_mall_navigation`, `suggest_alternatives`, `contact_seller`. Validate tool arguments, limit iterations, timeouts and result size. Final tool list must reflect actual data and acceptance needs.
- LLM: development uses Google AI Studio / Gemini via its OpenAI-compatible endpoint where supported. Production/demo deployment uses BoxAPI and the model allowlist supplied by the user. Keep provider configuration behind environment variables and a small provider adapter; do not duplicate application logic per provider.
- Production BoxAPI base URL supplied by user: `https://ai.boxapi.ir/ai/v1`. Allowed endpoints supplied for the hackathon: `/chat/completions` and `/embeddings`. Do not assume `/responses` or provider-specific features work. Supported model names supplied by the user: `gpt-6.1-sol`, `gpt-6-astra`, `gpt-6-luna`, `gpt-6-sol`, `gpt-5-mini`, `gpt-5.6-luna`, `gpt-5.6-terra`, `gpt-5.6-sol`, `gpt-5.4-mini`, `gpt-5.3-codex`, `text-embedding-3-small`, `text-embedding-3-large`. These are the challenge allowlist, not a claim that all endpoints/features behave identically. Verify actual model IDs, tool calling, streaming, timeout/error behavior, structured output, and embeddings with small smoke tests. Pick model(s) using measured performance/quality/availability and controlled token usage. Start with one capable agent model; use a cheaper model for smaller tasks only if tests prove it helps.
- Google AI Studio is for local/development only. Do not rely on Google AI Studio access in production.
- Client/backend: REST for search, product/shop details, compare, filters, session; SSE-like streaming for chat/tool progress. Pick POST streaming over `fetch` or an architecture that the browser can correctly consume; test real reconnection/error behavior. Do not add WebSockets unless a specific requirement proves they are needed.
- Anonymous sessions: preserve useful conversation/product/filter context for a limited TTL, including refresh within that session. Do not implement long-term preference memory or user accounts. Allow reset/new conversation. Avoid storing raw geolocation or personal data longer than necessary.
- Location: request browser geolocation only with consent; provide manual Tehran area/mall selection. Allow easy adjustment and approximate distances. Use haversine or a verified geo method as appropriate. Do not imply complete Tehran coverage.
- Ranking: a hybrid approach. LLM extracts user intent/constraints, deterministic code filters and ranks products/offers/shops on actual data, LLM explains the results briefly. Consider fit to requested product/use case, price/budget, distance, opening hours, installment eligibility when known, and data freshness. The product match matters most; freshness is shown, not allowed to overrule relevance blindly. Let user adjust constraints.
- Unknown installments: when “only installment” is active, only include records whose data positively and reliably indicates eligibility. If none or status is unknown, tell the user and offer inquiry rather than asserting eligibility.
- Unknown price/stock: if useful product matches exist but price or availability is uncertain, the agent may offer inquiry with the user’s consent. Never describe stored offer data as confirmed current stock.
- Seller inquiry in Phase 1: interactive in-app simulation based on inspected seller-state/mock data where available. Do not repeat a “simulated” disclaimer on every line if the overall demo context makes that redundant; however, do not claim actual external contact, actual seller response, or verified availability. UI must keep the state/provenance clear enough to prevent deception.
- Real SMS/Instagram integrations are a Phase 2 idea, not current implementation. No auto-send during Phase 1. The challenge dataset’s phone numbers are fake. Use a real contact URL only when it genuinely exists in source data and is permitted to publish.
- Outages: non-LLM core functionality must continue. Use deterministic fallbacks for simple tasks; clear user-facing errors for unavailable LLM-dependent features. Do not add a second provider unless evidence justifies it.
- Map: choose based on real data/platform/keys/cost. Start with shop list, distance, addresses and external directions; add an in-app map only if it clearly improves the flow without clutter or dependency. Mall navigation may only state floor/unit details present in trusted fields.
- Sessions/storage: simple separate writable app store only if required. Use TTL cleanup or lazy expiry; document the choice.
- Quality gate: TDD where meaningful, all relevant checks passing before the next phase. Tests include unit, API/contract, data integration, browser E2E and visual/accessibility checks where practical. Use mocks for ordinary tests, a small number of optional real-provider smoke tests, and no real API dependency in the default suite.
- Git: preserve current changes, make checkpoints before large migration, and commit only project-specific changes after a fully passing phase when Git is correctly configured and safe. Never include ignored dataset/API credentials.
- Deployment: Docker + Liara is the intended target if available. Investigate current official docs, disk/volume/object-storage behavior and account limits before committing to architecture. Dataset files are local to the repository workspace but excluded from GitHub and will be supplied separately in deployment. Data bootstrap/validation must fail clearly, never silently start against an empty/incorrect dataset.
- Planning: inspect whether the current Antigravity environment can load `.agents/skills`, then use the supported Skill/Rule mechanisms. Apply Matt Pocock’s engineering chain where available: resolved design/spec → small dependency-aware tickets → test-first vertical implementation → independent two-axis review (standards and spec) → retro. If a named skill is unavailable, follow the corresponding procedure explicitly; never pretend a skill was invoked.
- Future ideas must be recorded in `docs/FUTURE_IDEAS.md`, not implemented now.

## 5. Required initial audit — do this before any major code changes

### 5.1 Repository and frontend audit

1. Run `git status --short`, inspect active branch/history, check uncommitted/user-owned changes, and record a safe baseline. Do not reset the tree.
2. Inspect repository layout, package manager/lockfiles, scripts, dependencies, routing, UI components, current data mocks, `.gitignore`, env examples, deployment files, tests, lint/typecheck/build commands, and current visual assets.
3. Run the existing app and its available checks before changing code. Record baseline failures accurately.
4. Map routes/pages and user journeys in the MVP. Identify which components/assets can be reused, which should be redesigned, and which mocked interactions must be replaced. Do not assume that a visually rendered control is functional.
5. Verify current compatibility of Node.js, Next.js, Tailwind, shadcn/ui, motion library (if any), and deployment target via official docs/current lockfile. Choose current stable versions that work together; do not blindly upgrade unrelated dependencies.

### 5.2 Dataset audit

1. Find the challenge brief and every candidate CSV/JSON/SQLite file by inspecting repository and ignored local files. Never print secrets or dump sensitive full records.
2. Produce a manifest: path, format, size, hash (where useful), encoding, delimiter, header/shape, row count, primary/foreign keys, null rates, duplicate rates, data types, sample values redacted where appropriate.
3. Inspect SQLite in read-only mode. Capture `.schema`, table/index/trigger list, FTS virtual table definitions, FK status, row counts, index coverage and `PRAGMA quick_check`/equivalent. Check FTS5 availability; do not recreate or mutate the source database just to inspect it.
4. For CSV/JSON, inspect schemas with bounded sampling, infer join keys, and confirm whether records duplicate or represent base products vs product-in-shop offers. Never assume column names or join relationships.
5. Trace each challenge requirement to actual fields, with one of `supported`, `partially supported`, `not present`, `must simulate`, `needs manual configuration`. Explicitly identify fake phone numbers, unreliable shop names, unknown stock/price/conditions, missing hours, missing product images/specs, and incomplete Tehran coverage.
6. Determine the canonical source for each operation. Prefer the provided SQLite/FTS for queries it supports and CSV/JSON for fields it uniquely holds. Do not ingest/copy all sources into a new database by default. No user-facing claims may rely on inferred columns before verification.
7. Write `docs/DATASET_AUDIT.md` and a field-to-feature mapping. Include commands/steps to reproduce the audit.

### 5.3 Output of audit

Before implementation, create/update:
- `docs/PROJECT_SPEC.md`: product behavior, in-scope/out-of-scope, data truths, edge cases.
- `docs/WORK_PLAN.md`: phases, dependencies, acceptance gates, explicit risk list.
- `docs/DATASET_AUDIT.md`: evidence from actual local data.
- `docs/API_CONTRACT.md`: API endpoints and typed schema intentions adjusted to audited fields.
- `docs/adr/`: concise records for high-impact architecture decisions only.
- `GLOSSARY.md`: definitions only, no implementation details.

Then continue implementation. Do not stop at these documents unless a high-impact question truly blocks safe product behavior.

## 6. Expected high-level architecture (validate against evidence before finalizing)

Aim for a modular monolith with clear boundaries, not distributed services by default:

- `frontend/` (or a clearly named existing root Next.js app): Next.js + TypeScript, Tailwind, shadcn/ui, typed client, RTL and accessible components.
- `backend/` (or a clearly named app): FastAPI, Pydantic request/response models, data adapters/repositories, search/ranking services, agent orchestration, provider adapter, session store, health/readiness.
- Immutable source datasets: read-only SQLite/FTS5 plus CSV/JSON files. A small separate writable SQLite DB for app sessions if justified. Any local data path must be environment-configurable.
- Shared API contract: prefer FastAPI’s OpenAPI source with generated TypeScript declarations or another evidence-backed contract generation tool. Do not hand-maintain duplicated schemas if generation is simple and reliable. Keep JSON response/UI schemas validated at both boundaries.
- The final physical deployment layout (one or two services) must be chosen only after checking current Liara constraints, SSE, Next.js runtime requirements, persistence, startup behavior and cost. Simplicity, speed and reliability are priorities.

Keep modules cohesive: routes thin, domain logic in services, data access in repositories/adapters, provider integration behind an interface, UI components separated from page orchestration. Avoid generic “framework” layers that do not solve a current problem.

## 7. Functional requirements

### 7.1 Product discovery and search

- Search Persian and English titles/aliases/brand/category when actual fields support it.
- Normalize Persian/Arabic character variants, Persian/Arabic numerals, diacritics, whitespace/half-space and punctuation for search without mutating raw data.
- Start with parameterized SQLite/FTS queries and existing indexes. Inspect FTS syntax and ranking before using it.
- Use deterministic filters for category/brand/price/condition/offer fields found in the real data. Avoid adding filters unsupported by the dataset.
- Search expansion must be bounded and targeted: exact/FTS search first; only invoke LLM expansion or secondary candidate search when the initial result is inadequate. Never send every product or large dataset to an LLM.
- Display why the result matches and distinguish product-level specs from seller/offer-specific details.
- Handle no-results by broadening with trustworthy aliases, English names, brand/category and related products. Say when an exact match is unavailable. Never invent products.

### 7.2 Product comparison and ranking

- Provide a clear mobile-first comparison, responsive without overloading the screen. Select a practical default maximum only after inspecting fields and screen layout; allow users to remove options or progressively reveal details.
- Ranking is deterministic and explainable. LLM must not rank using facts it made up.
- Price normalization/units/currency display must be data-informed. Never compare incomparable units or silently convert missing units.
- Show timestamp/age where present; if freshness cannot be computed reliably, say unknown rather than guessing.
- Product “fit” is based on available specs/use case only. Do not invent claims such as medical suitability or technical capabilities.

### 7.3 Nearby shops and navigation

- Only use reliable latitude/longitude and actual offer/product/shop associations.
- Ask browser location permission contextually and voluntarily; always provide manual area/mall selection as fallback and the ability to change it.
- Distances are approximate; document/label the calculation. Nearby rankings should not suggest that data covers all Tehran shops.
- Display only the hours/area/mall/floor/unit/address details present in source data. If missing, state that it is unknown.
- Provide outbound directions links only when a valid destination can be built from known location data. Do not make map keys or third-party paid services mandatory for the primary journey.

### 7.4 Installment and purchase conditions

- Model states such as confirmed-eligible / confirmed-ineligible / unknown if source data supports these distinctions; do not collapse unknown into false or true internally.
- With “installment only” active, return only offers/shops whose source data explicitly supports eligibility. When there are no eligible results or some plausible results are unknown, explain that and offer the Phase 1 inquiry simulation.
- Apply the same cautious semantics to Torob Pay, credit services, calorie/commodity coupon, instant delivery, guarantee and any other condition.

### 7.5 Seller inquiry and alternatives

- In Phase 1, use a bounded simulation driven by actual `mock_seller_state_json` or its audited equivalent if present. If it is absent, implement a lightweight deterministic mock grounded only in recorded information and clearly separate recorded facts from invented dialogue; do not pretend to know stock or current prices.
- The user approved not repeating the word “simulation” on every chat turn because this is a demo, but the overall demo experience must not imply that real external contact or seller confirmation happened. Never show a fabricated phone as callable contact information.
- On seller uncertainty, ask user consent before beginning the inquiry flow. Display a useful status such as “information in dataset”, “unknown”, “inquiry simulation”, or equivalent wording that is clear but not intrusive.
- Suggest alternatives based on actual data and explain the tradeoff briefly (closer, lower recorded price, closest match). Never claim the alternative has confirmed stock unless the dataset provides an explicitly trustworthy recent confirmation (unlikely; verify).
- Real SMS and Instagram sending, official permissions/credentials and delivery webhooks are Phase 2. Document a provider interface boundary only if this has near-zero cost and does not distract from Phase 1; do not build the integration now.

### 7.6 Agent behavior

- Start with a controlled Python tool loop. Avoid heavy agent frameworks unless verified needs demand one.
- Candidate tools: `search_products`, `find_shops`, `compare_shops`, `get_mall_navigation`, `suggest_alternatives`, `contact_seller`. Keep the list small and reflect actual backend services.
- Define Pydantic parameter and result schemas for each tool. Validate arguments and outputs. Tool output must include source/provenance and known/unknown statuses where applicable.
- Limit tool iterations, per-tool timeouts, response sizes, total wall time, prompt history and token usage with configurable conservative defaults. There must be a hard stop against loops.
- Only use the LLM when it adds value (natural-language intent extraction, ambiguity clarification when necessary, targeted query expansion, concise explanation, controlled UI selection). Use deterministic code for exact database operations and ranking.
- Verify OpenAI-style function calling with each actual configured provider/model in small smoke tests. If the endpoint or model does not support a required feature reliably, choose the simplest proven fallback (validated JSON action proposal or deterministic route) and record the decision. Never claim support based only on a model name or API-compatible label.
- Agent should proactively ask at most one or two targeted questions only when missing criteria genuinely alter the product choice; otherwise proceed with stated assumptions and make filters editable.
- If BoxAPI fails, the product search, filtering, comparison and shop lists must still work. Chat can fall back to deterministic help and a clear retry notice.

### 7.7 Controlled Generative UI and conversation stream

- Use a discriminated union/JSON schema for approved UI blocks, e.g. `product_results`, `comparison`, `shop_results`, `filter_controls`, `seller_inquiry`, `empty_state`, `location_picker`, `progress_status`. These are examples, not mandatory if the existing product requires a better small set.
- Each block has a Pydantic-validated payload. Frontend maps only known `type` values to components. Unknown types are dropped safely and logged without exposing prompt internals.
- Backend sends progress events that make sense to a shopper: “در حال جست‌وجوی محصولات”، “در حال بررسی فروشگاه‌ها”، “در حال مقایسه گزینه‌ها”. Do not expose raw tool parameters, chain-of-thought, model internals, secrets, or massive debug payloads.
- Stream concise assistant text and structured UI events. Define event names, payload types, cancellation/error handling, and a final completion marker in `docs/API_CONTRACT.md`.
- Use accessible loading states, skeletons only where they help, reduced-motion support and clear retry/cancel behavior.

## 8. Initial API contract to verify against audited data

Use a versioned REST API, for example `/api/v1`. Adjust the exact paths to repository conventions and actual data, but cover these capabilities:

- `GET /health/live`: process is running.
- `GET /health/ready`: required datasets/indices and writable app storage are reachable; report safe booleans/status only, not secrets or sensitive paths.
- `POST /api/v1/sessions` (if needed) and current-session retrieval/reset/expiry with HttpOnly cookie strategy or an equally defensible lightweight design.
- `GET /api/v1/products/search`: query plus verified filters, pagination and stable sort.
- `GET /api/v1/products/{product_id}` and offer/shop associations as the schema supports.
- `POST /api/v1/products/compare`: validate a bounded list of existing IDs and return comparable attributes with explicit unknowns.
- Shop/offer endpoints for product-linked shops, nearby shop sorting, opening hours and location/mall details.
- `POST /api/v1/chat/stream`: accept the current message and session context, return SSE-formatted events over `fetch` streaming or another proven browser-compatible method.
- Optional ordinary non-stream chat endpoint only if needed for accessibility, retries or testing without complicating the system.

Pydantic models and the OpenAPI contract must be the source of truth. Generate/update frontend TypeScript types using a current well-maintained generator if reliable. Add contract tests to catch drift. Do not implement a fake endpoint simply because it appears in this section; all endpoint semantics must be derived from the audited schema and actual UI needs.

## 9. Provider configuration and environment

Create a documented `.env.example` with safe placeholders only. Suggested configuration names (adapt coherently):

- `APP_ENV=development|production|test`
- `LLM_PROVIDER=google_ai_studio|boxapi|mock`
- `LLM_API_KEY=`
- `LLM_BASE_URL=`
- `LLM_AGENT_MODEL=`
- `LLM_LIGHT_MODEL=` (optional, use only if it earns its cost)
- `LLM_EMBEDDING_MODEL=` (leave unset when embeddings are not enabled)
- `DATA_DIR=`
- `DATASET_SQLITE_PATH=` (only if a separate DB file exists)
- `APP_STATE_DB_PATH=`
- `SESSION_TTL_SECONDS=`
- `CORS_ORIGINS=`
- `LOG_LEVEL=`

For local Google AI Studio/Gemini OpenAI compatibility, verify the current Google endpoint and feature limits from official docs; never confuse a local dev provider setting with production BoxAPI. Google documents its compatibility endpoint as `https://generativelanguage.googleapis.com/v1beta/openai/` but notes compatibility is beta and has feature limitations. BoxAPI’s user-provided production base URL is `https://ai.boxapi.ir/ai/v1`; the supplied hackathon endpoint allowlist is `/chat/completions` and `/embeddings` only. Keep each environment’s credentials separate and never log them.

Use model IDs exactly as accepted by the configured BoxAPI account and the hackathon list. Smoke test API connectivity, tool calls and streaming using tiny prompts. Model comparison should be a small purposeful evaluation, not a large expensive benchmark. Do not run real-API tests in every test suite by default.

## 10. Frontend quality bar

Rebuild with Next.js + TypeScript + Tailwind + shadcn/ui; select App Router or another architecture only after verifying current project/repository conventions and deployment compatibility. Do not preserve Vite-specific configuration in the final runtime.

The final UI must:
- Be Persian-first and correctly RTL; handle mixed Latin brand/model IDs and numbers with appropriate bidi isolation.
- Be mobile-first and responsive for realistic phone widths, keyboard navigation, visible focus states, adequate contrast, accessible form labels, semantic elements, screen readers and reduced motion.
- Use a calm, minimal first screen with search and a clear route into chat. Reveal advanced filters and details progressively.
- Let users complete key flows through visible controls instead of requiring chat for everything.
- Render product/shop comparison clearly and concisely, with detailed information available on demand.
- Provide clear states for loading, empty results, unknown data, API errors, session expiry, location denied, and retries.
- Use light but polished motion; no perpetual animation or layout movement that harms readability/performance.
- Follow a consistent design token system, reusable component primitives, and central copy. Avoid a stack of overlapping state-management tools. Use React state or the simplest proven state library needed for session/product filters.
- Avoid displaying raw source IDs as the only label if a readable, non-misleading label can be created. Do not show a fake store brand as verified. Never invent missing photos/specs; use a subtle placeholder.

## 11. Testing, evaluation, and phase gates

### Testing principles

- Before implementing each concrete behavior, state the observable behavior and public test seam. Write one focused test that should fail first, then implement just enough code, make it pass, and refactor. Expected values must come from the spec or known test fixture, not the implementation itself.
- Mock external boundaries (LLM API, time, external map/contact APIs) in fast tests. Do not mock internal modules in a way that just tests that an internal function was called.
- Browser E2E tests come after the behavior and API contract work; they should test the user’s journey, not internal implementation details.
- Default CI/local test suite must run without Internet, credentials or LLM credit.
- Separate optional live-provider smoke tests, protected by an explicit env flag, with a tiny budget and clear output.
- Include regression tests for every bug. Never reduce test coverage by deleting assertions or skipping valid tests to force a pass.

### Required evaluation scenarios

1. Persian query matching Persian/English title/brand where real fields support it.
2. Budget filter returns no item above the limit and handles unknown currency/unit defensively.
3. Comparison presents genuine differences and marks unavailable fields unknown.
4. Product-to-offer-to-shop joins return only real relationships.
5. Nearest shop sorting uses correct coordinates and graceful location-denied fallback.
6. “Only installment” never includes unknown eligibility as confirmed-eligible.
7. Old offer data shows age/provenance; stock is not falsely claimed as verified.
8. Missing product/spec/image produces a clean fallback without invented values.
9. Search expansion runs only when justified and returns real data-backed results.
10. Chat agent correctly selects tools, validates malformed arguments, stops at its hard cap and handles an empty result.
11. SSE shows understandable progress and final result; handles timeout, disconnect, cancellation and provider errors.
12. Seller inquiry simulation is explicitly an in-app demo experience at product level, does not call fake phone numbers and never claims a real message was sent.
13. Refresh within a session preserves the agreed limited state; expired/reset sessions do not leak old context.
14. API provider outage leaves deterministic product/search/shop capabilities usable.
15. RTL, mobile layouts, keyboard controls, reduced motion, browser errors, and all important UI states are exercised.
16. `health/ready` correctly reports missing or invalid dataset and can recover after data is supplied.

### Phase gate — must pass before moving forward

Each phase must end with:
1. Implementation summary and changed paths.
2. The spec/ticket acceptance criteria and evidence each was met.
3. Exact test/build/lint/typecheck commands and their actual exit results.
4. Remaining failures, warnings, blockers and known limitations.
5. Security/data-provenance review appropriate to the phase.
6. Independent code review against both repository standards and the project spec (use an installed skill if available; otherwise conduct the review explicitly).
7. A recoverable Git checkpoint/commit for the phase when repository state and Git configuration make it safe. Never include ignored files/secrets.

A phase is not “done” when code was generated; it is done only when its acceptance gate passes. If a check cannot run because a tool/service/credential is genuinely unavailable, mark it **BLOCKED**, show evidence and continue only with independent tasks. Never misreport a blocked check as successful.

## 12. Execution plan — proceed in this order

### Phase 0 — Baseline and repository reconnaissance

- Perform the audits in Section 5, inspect current skills/rules available in Antigravity, and establish safe Git checkpoints.
- Produce real repo/data inventories, architecture proposal, challenge requirement traceability and an ordered phase plan.
- Identify the actual first runnable test and baseline commands.
- Pass gate: findings are evidence-backed; no dataset assumptions remain silently unverified; critical blockers are identified.

### Phase 1 — Product/domain/API spec and data adapters

- Define audited domain models for base products, product-shop offers, shops, prices/timestamps, conditions, coordinates/hours, contact provenance and unknown states.
- Map every accepted product behavior to a source field or explicit simulation rule.
- Define stable API schemas and test seams; make OpenAPI the canonical contract if the generator path is validated.
- Implement read-only data adapters and query services against existing data. Keep SQL parameterized; respect indexes and use query plans for slow operations.
- Pass gate: real dataset integration tests prove product/offers/shop joins, filters, FTS availability and honest unknown handling.

### Phase 2 — Backend MVP and reliability

- Build FastAPI config, domain/services/repositories, versioned REST endpoints, health/readiness, data bootstrap/validation and user/session storage.
- Keep data SQLite read-only and separate writable app state if needed. Ensure sessions expire and are not persisted forever.
- Implement deterministic search, filters, comparison, shop location/distance, opening-hours and installment logic from verified data.
- Pass gate: all backend unit, query, API/contract, security and data integration tests pass.

### Phase 3 — Next.js product UI

- Inspect the MVP for useful components/assets, then rebuild/migrate to Next.js with TypeScript, Tailwind and shadcn/ui. Remove Vite-only runtime assumptions in the final app.
- Implement minimal Persian RTL shell, search, product cards, filters, selection/comparison, nearby shops, conditions, states and navigation links.
- Connect real backend contracts. Keep optional mock mode behind explicit environment configuration and isolate it from real adapters. Production must default to real data and fail visibly if required data is missing, not quietly fall back to fake results.
- Pass gate: type/lint/build/tests and Playwright paths work with real API; key screens have visual/accessibility checks.

### Phase 4 — Agent and controlled Generative UI

- Build a small agent loop and tools using the audited service interfaces. Implement contextual user intent parsing, targetted search expansion when needed, bounded calls, progress events and validated output blocks.
- Verify live `chat/completions` tool calling and streaming for the selected actual provider/model; implement the smallest proven fallback if necessary.
- Implement Phase 1 simulated seller inquiry using actual available mock state/data, with truthful provenance and useful alternatives.
- Pass gate: deterministic tool loop tests, provider mock tests, small opt-in provider smoke test, SSE tests and the scenario evaluation set all pass.

### Phase 5 — Integration, polish, accessibility, and performance

- Test full journeys across UI/API/data/agent/session; resolve integration defects and regression issues.
- Improve responsive layouts, reduced motion, keyboard/accessibility, loading/empty/error states and visual consistency.
- Measure baseline response time/query plans and browser performance using the real available environment; optimize actual bottlenecks only. Use sensible result limits, bounded outputs, and caching only where correctness/invalidation is clear.
- Pass gate: full E2E suite, accessibility/visual review, regression suite and basic load/latency checks pass at demo scale.

### Phase 6 — Deployment on Liara

- Read current official Liara docs and test available options for Docker deployment, volumes/persistent storage, object storage, environment variables, health checks, ports, deploy commands, Node/Next runtime, Python/FastAPI and SSE.
- Decide one-service versus split frontend/backend only after evaluating Next.js SSR/runtime, SSE, CORS/cookies, available persistent storage, dataset size/startup time and cost. Prefer the simplest proven layout.
- The dataset is not tracked in GitHub; provide it separately in production. Use a configurable data directory, file presence/schema/checksum checks, and an explicit bootstrap/upload/download method supported by actual platform constraints. Never bake the large source SQLite into the Docker image or Git by default.
- Verify that source database access is read-only, app-state storage is actually persistent if required, and the app reports not-ready instead of falsely healthy when data is missing.
- Configure production secrets only through platform environment settings. Run deployed smoke tests for health, search, compare, session, SSE, and graceful LLM failure. Verify external URL/CORS/cookie behavior.
- Pass gate: deployed application is reachable; readiness is true only when prerequisites exist; core journeys succeed against deployed real data; evidence is recorded.

### Phase 7 — Final independent review and handoff

- Run the full check suite and independent standards/spec review.
- Verify all challenge criteria against `docs/ACCEPTANCE_MATRIX.md`; identify any intentionally unsupported field and how UI represents it.
- Update README setup/deploy/production configuration, dataset setup, test commands, architecture, known limitations, and `docs/FUTURE_IDEAS.md`.
- Provide a concise Persian handoff to the user with deployed URL if genuinely verified, completed features, test commands/results, configuration/deployment blockers, remaining risks, and the separate mandatory demo-video reminder.
- Do not create the demo video or add Phase 2 features unless separately requested.

## 13. First response and operating style

Start by acknowledging you have loaded this master prompt and will work from repository evidence. Then inspect the repo and execute Phase 0. Do not ask questions already answered in `docs/DECISIONS.md`. Do not send the user a wall of generic recommendations instead of inspecting/running the actual project. After reconnaissance, summarize only evidence-backed findings, create the spec/tickets, and begin implementation.

For each phase, show the user: phase goal, short plan, concrete result, tests and evidence, remaining blockers, and the next gate. Keep progress reports short and useful. Never claim deployed, tested, contacted, confirmed, or persisted unless the action actually succeeded and evidence exists.
