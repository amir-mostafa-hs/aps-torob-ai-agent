# ADR 0001: Dataset-first, modular-monolith demo architecture

- **Status:** Accepted, subject to repository/data/deployment verification
- **Decision owners:** Product interview decisions; implementation evidence to be recorded by Antigravity
- **Context:** The Torob challenge scores product and UX heavily, requires use of its dataset, and asks for product discovery, nearby physical shops, comparison and seller inquiry. Current frontend is an MVP. The dataset files are locally supplied and excluded from GitHub.

## Decision

Build a Persian RTL, mobile-first Next.js + TypeScript frontend with Tailwind and shadcn/ui, connected to a FastAPI + Pydantic backend. Prefer a simple modular monolith or the fewest deployable units that meet current Liara constraints. Use the provided CSV/JSON and read-only SQLite/FTS dataset through audited adapters; keep writable anonymous session state separate when needed. Use deterministic backend services for data access/ranking and a bounded LLM tool loop for intent, targeted search expansion, explanation and controlled UI composition. Stream concise progress to the user.

Development uses a verified Google AI Studio compatible setup; demo/production uses BoxAPI with environment-configurable provider/model settings. Seller contact is simulated in Phase 1. Real messaging integrations are deferred.

## Reasons

- Maximizes challenge-relevant product and UX instead of infrastructure complexity.
- Keeps dataset facts deterministic and auditable.
- Allows the frontend and backend to be tested independently and together.
- Supports provider configuration changes without duplicating domain logic.
- Avoids pretending fake phone numbers or mock seller replies are real.
- Keeps a future path open without building future features now.

## Consequences

- Actual data schema and deployment topology cannot be finalized until audit.
- Data access requires robust startup/readiness validation.
- API and frontend types need a source of truth and automated drift checks.
- Tests must include unknown/stale data and provider failures.
- The app will not claim full Tehran coverage or live stock confirmation unless supported by reliable evidence.

## Revisit if

Measured search quality/latency, dataset incompatibility, platform constraints or new authorized seller APIs demonstrate a clear need to change the architecture. Record evidence in a new ADR rather than silently changing the decision.
