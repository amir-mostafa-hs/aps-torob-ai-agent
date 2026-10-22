# Future Ideas Backlog — Not in Current Scope

**Rule:** Add ideas here when found. Do not implement them in the current phase. Once the core architecture and all required challenge flows pass their acceptance gates, review and prioritize this list explicitly.

| Idea | Why it might help | Prerequisites / risks | Status |
|---|---|---|---|
| Real automatic SMS inquiry | Ask a real seller about hours/price/stock | Valid phone data, authorized SMS provider/API, delivery status, consent, costs. Challenge phone numbers are fake; do not use them. | Deferred Phase 2 |
| Official Instagram messaging integration | Ask a seller through an approved business account | Official API access, business permissions, valid account/page mapping, token storage, rate limits and delivery state. | Deferred Phase 2 |
| Embedding reranking | Improve recall for ambiguous/semantic product queries | Benchmark current FTS first, cost/latency check, only rerank a small candidate set, e.g. top 50. | Optional Phase 2 |
| External product reviews/comments | Give extra insight when the local dataset lacks review sentiment | Must not distract from dataset-first rule; source reliability, permissions and data freshness. | Low priority, future review |
| Long-term user preferences | Remember frequent brands/budget | User account/consent/privacy/deletion design; explicitly outside current anonymous session scope. | Deferred |
| Reservations, hold requests or order coordination | Reduce wasted trips | Real seller/store participation and confirmation API; not supported by current data alone. | Out of current scope |
| Broader map/place details | Better directions inside a mall | Current dataset field audit, service keys/cost/access, strong evidence of user benefit. | Evaluate only if needed |
| Additional AI fallback provider | Increase LLM availability | Only if outage metrics show need and cost/complexity is justified. | Not planned |

New agent-suggested features must be appended with rationale, impact, complexity, prerequisite and why they are not in current implementation. Never let this file silently expand the current scope.
