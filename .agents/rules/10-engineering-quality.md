---
trigger: always_on
description: Test-first implementation, code quality, phase gates, and evidence requirements.
---

- Inspect Git status and preserve user edits before changing files.
- For behavior with an observable contract, identify the public test seam, write a failing test, implement one small vertical slice, and refactor. Do not write a horizontal pile of tests before any implementation.
- Never mock project-internal modules just to assert call counts. Mock only genuine boundaries such as LLM providers, time, external services, and controlled filesystem/database boundaries.
- The default test suite must run offline and without LLM API credentials. Keep real-provider smoke tests optional and small.
- Run all relevant tests, type checks, lint and build checks. Never delete/skip/soften an assertion to force green.
- Review the diff independently against (1) engineering standards and (2) product spec/acceptance criteria.
- A phase only passes when its acceptance gate passes. Report blocked checks honestly.
- Checkpoint with Git only after a fully passing phase and only if doing so will not include user data, secrets or ignored datasets.
- Prefer established community-supported tools and stable versions; research depth should be proportional to decision impact. Record consequential decisions.
- Do not add heavy frameworks, services, state managers, job queues, vector stores, or abstractions without measured need.
