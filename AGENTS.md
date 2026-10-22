# Project-wide instructions for Antigravity

## Mission
Build the Torob in-person shopping assistant as a minimal, truthful, responsive Persian RTL demo. Read `TOROB_ANTIGRAVITY_MEGA_PROMPT.md`, `docs/DECISIONS.md`, `docs/WORK_PLAN.md`, and `docs/ACCEPTANCE_MATRIX.md` before substantial work.

## Always-on invariants

- Use the supplied challenge dataset as the primary source. Audit real files before assuming schemas. Do not call external search for facts already available in the local dataset.
- Never fabricate data, seller contact, product properties, stock confirmation, opening hours, installment eligibility, or deployment success.
- Challenge phone numbers are fake: never display them as actionable, create `tel:` links, or send messages to them. Shop names may also be fake; be careful not to imply verified identity.
- Phase 1 seller inquiry is an in-app simulation grounded in audited mock/source data. Real SMS/Instagram sending is deferred to Phase 2.
- Keep recorded offer price, last update timestamp and seller-confirmed availability as separate concepts.
- Product/shop searches, filters and comparisons must work without the LLM. Use deterministic backend logic for data retrieval, ranking and validation.
- Keep the architecture simple and modular. No infrastructure or major dependency without an evidence-backed need.
- Frontend target is Next.js + TypeScript + Tailwind + shadcn/ui. React/Vite is reference material only. UI is Persian, RTL, mobile-first, accessible and progressively disclosed.
- Generative UI may render only an allowlist of schema-validated components; never execute or render arbitrary model-generated code/HTML.
- Anonymous session state may persist for a limited TTL across refresh. No accounts or long-term user profile memory in this version.
- Development LLM: Google AI Studio/Gemini via the currently verified compatible endpoint. Production: BoxAPI using its supplied base URL and only verified supported endpoints/models. Secrets only via env or platform secret settings.
- BoxAPI URL supplied for production: `https://ai.boxapi.ir/ai/v1`. User-provided endpoints: `/chat/completions`, `/embeddings`; treat other endpoints/features as unsupported until proven by smoke tests.
- Tests must be reliable and run without internet/LLM credentials by default. Live provider checks are optional smoke tests. Use TDD in small vertical behavior slices.
- Never disable or weaken tests to make a build pass. Explain blockers and continue independent work.
- Inspect `git status` before edits, preserve uncommitted changes, and never put dataset/secret files into Git.
- Keep out-of-scope ideas in `docs/FUTURE_IDEAS.md`; do not implement them without a new explicit scope decision.

## Phase-start checklist

Before every phase and significant architectural change:
1. Read the applicable project rules, accepted decisions and phase criteria.
2. State the behavior being implemented and the public test seam.
3. Inspect current code/data and official docs when a key version/provider/platform fact may have changed.
4. Write/adjust a failing behavior test before implementation when meaningful.
5. Make a small vertical change, run the narrow test, then run the relevant full checks.
6. Review the diff against standards and the spec separately.
7. Record test commands/results, known limitations and next gate. Checkpoint the phase in Git only when safe.

## Ambiguity protocol

- Low-risk, reversible, implementation-level ambiguity: choose a sensible documented default and proceed.
- High-impact product/business ambiguity, data integrity question, truthfulness concern, consent issue or destructive/irreversible operation: ask one focused question. Continue unrelated work while waiting.
- Do not re-ask any decision recorded in `docs/DECISIONS.md`.

## Done means evidence

Never report a phase as complete just because files were generated. Show actual test/build/lint/typecheck exit results, acceptance evidence and any blocked checks. Never state that seller contact, stock verification, deployment or persistence succeeded unless the outcome was observed.
