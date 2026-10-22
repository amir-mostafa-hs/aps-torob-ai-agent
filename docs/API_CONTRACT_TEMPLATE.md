# API Contract — Draft to finalize after dataset audit

This is a contract checklist, not permission to invent unsupported fields. Finalize paths/payloads after repository and data inspection. FastAPI/Pydantic should be the canonical schema source, with generated TypeScript types if the selected tool is maintained and reliable.

## Required capability groups

- Health: live and ready status; readiness verifies required data and state storage without revealing secret paths.
- Session: create/current/reset/expire anonymous session; cookie settings and TTL documented.
- Product search: query, pagination, sort and only data-backed filters.
- Product detail: base product data separated from offer-specific fields.
- Offer/product-shop retrieval: preserve the actual association; price and update timestamp separate from stock.
- Comparison: bounded product/offer IDs, comparable verified fields, explicit missing/unknown values.
- Shop search/nearby: actual coordinates, product relationship, distance approximation, hours/location details when present.
- Installment filter: positive verified eligibility only when strict filter is active.
- Agent stream: user-visible progress, text deltas, validated UI payloads, final event and safe errors.

## Suggested event model for streamed chat

Use a small documented event set. Names may be changed to fit existing conventions; keep payload types versioned and validated.

- `status`: concise Persian progress message and stage enum.
- `text_delta`: partial assistant text only if token streaming is genuinely reliable.
- `ui`: one schema-validated allowlisted block with a discriminated `type` and typed payload.
- `done`: final message/turn ID and state needed by the client.
- `error`: safe user-visible error code/message and retryability; never internal stack traces/secrets.

## Contract quality requirements

- Consistent API prefix/versioning and error envelope.
- Pydantic validation and parameterized SQL.
- Stable pagination and caps on result size.
- Correct null vs unknown semantics.
- Generated or automated cross-language type drift detection.
- Fast contract tests runnable without external services.
- SSE tested from an actual browser client. Do not assume native `EventSource` supports POST bodies; use a tested compatible approach such as `fetch` response streaming if POST is required.
