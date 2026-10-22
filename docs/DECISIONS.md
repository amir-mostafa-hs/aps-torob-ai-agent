# Accepted Product and Architecture Decisions

These decisions were obtained through the project interview. Do not ask the user to reconfirm them. The implementation details still need to be validated against the real repository and datasets.

## Product and UX

1. Product is a Persian-first, RTL, mobile-first in-person shopping assistant for the Torob challenge.
2. Frontend interaction is hybrid: visible search, filters, cards, compare controls and shop views plus a contextual assistant. Not everything must happen in chat.
3. The existing React/Vite MVP is inspiration only. Inspect the code and reuse valuable ideas/assets, but rebuild/migrate to Next.js. Its interactions are mostly mocked and UI/UX is not yet good enough.
4. Desired UI is minimal and polished, with progressive disclosure, smooth restrained motion and interactive components. Simplicity and accessibility outweigh feature count.
5. Use Tailwind CSS + shadcn/ui, with a visual identity that feels compatible with Torob but is thoughtfully redesigned.
6. Generative UI can combine allowlisted components in different orders where helpful. Fall back to simpler structured output if the dynamic composition creates unnecessary complexity.
7. Response default is brief/direct. Explain more in chat only when the user asks or when a decision needs context.
8. The user should be able to adjust filters and criteria. Rank by a transparent combination of product fit, price, distance, hours and relevant conditions; product fit has priority over freshness alone.
9. If product need is unclear, make a useful first attempt or ask at most one or two targeted questions when the missing answer changes the outcome.
10. Location: ask consent for browser GPS; manual area/mall selection is always available. Store location only as needed and for limited session context.

## Data and truthfulness

11. The provided dataset is the primary source. Use data already provided rather than external search wherever relevant fields exist.
12. Current local inputs are believed to include multiple CSVs, JSON files and a SQLite database for agent/data access. Actual names, schemas, keys, indexes and relationships must be audited.
13. Treat source dataset SQLite as read-only. Use a small separate writable state store for session data if evidence supports it.
14. Recorded price, freshness timestamp and seller-confirmed availability remain separate.
15. Unknown installment status does not qualify under “installment only”; offer inquiry if there is no positive confirmed option or eligibility is unknown.
16. Fake phone numbers must never be used for contact. Shop names in the challenge data may also be fake; audit before representing identity as real.
17. Phase 1 inquiry uses an interactive in-app seller simulation grounded in real available mock/state data. It does not assert real contact or verified stock. Real automatic SMS/Instagram sending is deferred to Phase 2.
18. If search fails, use targeted aliases/English/title/brand/category expansion and data-backed alternatives; never invent a result.
19. Mock frontend data must be isolated behind a clean configuration/data-source boundary. Default production mode uses real data and cannot silently fall back to Mock.
20. The agent must record out-of-scope ideas in `docs/FUTURE_IDEAS.md`, not silently implement them.

## Technical approach

21. Backend: FastAPI + Pydantic.
22. Search: existing SQLite/FTS5 where present, Persian normalization, exact/FTS-first and bounded expansion. Embeddings are optional later, only if measured value justifies it (a reranker over a small candidate set is preferred over indexing all products at first).
23. Agent orchestration: simple controlled tool-calling loop, not a heavy agent framework by default. Candidate tools: `search_products`, `find_shops`, `compare_shops`, `get_mall_navigation`, `suggest_alternatives`, `contact_seller`.
24. REST for core actions and SSE-style progress/streaming for chat. WebSockets are not needed without a proven requirement.
25. Development LLM: Google AI Studio/Gemini via a verified OpenAI-compatible configuration. Production/demo provider: BoxAPI.
26. BoxAPI base URL: `https://ai.boxapi.ir/ai/v1`; user-provided hackathon endpoint allowlist is `/chat/completions` and `/embeddings` only. Supplied model allowlist: `gpt-6.1-sol`, `gpt-6-astra`, `gpt-6-luna`, `gpt-6-sol`, `gpt-5-mini`, `gpt-5.6-luna`, `gpt-5.6-terra`, `gpt-5.6-sol`, `gpt-5.4-mini`, `gpt-5.3-codex`, `text-embedding-3-small`, `text-embedding-3-large`. Select the actual model(s) based on controlled smoke tests and configured account support.
27. Keep all model/provider variables environment-configurable and secrets out of source/logs.
28. Deployment target is Liara with Docker if compatible. Inspect current platform docs and choose single-vs-split deployment only after checking Next runtime, SSE, storage, startup, cost and the actual account.
29. Architecture should be clean and extendable but appropriate for a low-traffic demo. Do not overengineer.
30. API contract must be typed, validated and kept aligned across FastAPI and TypeScript. Choose the most maintainable path after inspection; OpenAPI generation is a preferred candidate, not a dogma.
31. Quality: TDD for meaningful behavior, all relevant tests passing before phase advancement, E2E and visual/accessibility checks where practical, with mocked external services in normal tests and a few optional live API smoke tests.
32. Tests run without internet/API spend by default. Limit actual API testing to minimal opt-in smoke/evaluation runs.
33. Sessions: anonymous and TTL-limited, preserved across refresh in the session; no account system or long-term memory in this version.
34. Antigravity has broad implementation freedom for technical decisions, but should ask about high-impact business ambiguity, preserve user changes and never perform destructive/unrecoverable operations casually.
35. On each phase, reread key product constraints and remind itself of them. Phase gates require actual evidence.

## Scope order

- **Phase 1/current:** audit; Next.js UI; FastAPI APIs; real dataset search/filters/compare/shops/location/conditions; controlled agent and UI streaming; in-app simulated seller inquiry; anonymous TTL session; tests; Liara deployment.
- **Phase 2/future:** real SMS/Instagram integration (only with valid authorized accounts/credentials and trustworthy contact data), optional embeddings reranking, external review enrichment, long-term preference memory, reservation/order flows, and any extra ideas accepted later.
