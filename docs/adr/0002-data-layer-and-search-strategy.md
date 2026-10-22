# ADR 0002: SQLite FTS5 Search & Read-Only Data Layer Strategy

- **Status:** Accepted
- **Decision owners:** Antigravity Engineering
- **Context:** The dataset contains 225,903 products, 6,476 shops, and 331,506 offers pre-processed and indexed in `torob-dataset/processed_data/torob_agent.sqlite` (758.8 MB). Full table scans or unindexed text searches would be slow. External vector databases or massive embedding jobs add unnecessary cost, complexity, and failure modes for a hackathon demo.

## Decision

1. Use SQLite 3 in strict read-only mode (`mode=ro`) via URI connection to access `torob_agent.sqlite`.
2. Rely on the pre-built `products_fts` virtual table (FTS5) for full-text search across `persian_title_clean`, `category_name`, `brand_clean`, `model_clean`, and `specs_summary`.
3. Normalize search queries in Python (Persian/Arabic character unification, Arabic/Persian digits to ASCII, ZWNJ stripping) prior to executing parameterized FTS queries.
4. For location and proximity, calculate Haversine distance in Python over candidate shops that actually offer the product.
5. In-memory cache `tehran_malls_directory.json` and `product_reviews_and_buying_guides.json` upon application startup.
6. Defer dense embeddings and vector stores to Phase 2 unless measured search quality metrics prove a distinct need.

## Reasons

- Sub-millisecond FTS query execution time observed during Phase 0 audit (<5ms).
- Zero external infrastructure dependency (runs completely offline and self-contained).
- Guarantees immutability of the source dataset.

## Consequences

- Backend must handle Windows/Linux UTF-8 character encoding cleanly.
- Complex typo tolerance is bounded by token prefix matching (`query*`) rather than fuzzy phonetic indexing.
