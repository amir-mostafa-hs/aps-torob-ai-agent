---
trigger: always_on
description: Dataset adapters, API provider boundaries, agent tool calling, sessions, and LLM failure behavior.
---

- Inspect real SQLite schemas, FTS definitions/indexes, CSV headers, JSON shape, joins and row counts. Do not guess names or rewrite source data to make code easier.
- Use read-only mode for source dataset SQLite. Store anonymous sessions in separate writable storage if needed.
- Use parameterized SQL, bounded pagination, query timeouts/limits where supported, and stable response schemas.
- Backend owns search, filtering, price/distance calculations, data provenance, and ranking; the LLM does not invent database facts.
- Keep tool arguments/results typed and validated, tool loop bounded, timeouts configured, and output sizes limited.
- Test actual provider tool calling, streaming and structured outputs with a tiny smoke test before relying on them. Keep fallback simple and validated.
- Production BoxAPI base URL is `https://ai.boxapi.ir/ai/v1`; user-provided allowed endpoints are `/chat/completions` and `/embeddings`. Do not assume unsupported endpoint/feature compatibility.
- Development Google AI Studio settings must not leak into production defaults. No secrets in source, prompts, logs, screenshots, or committed `.env`.
- Product/search/shop functionality must remain useful when LLM is unavailable.
- Keep anonymous session history for limited TTL only; minimize storage of location and other potentially identifying data.
- Keep Mock data isolated and explicitly configurable. Production must not silently switch to Mock results when real data is unavailable.
