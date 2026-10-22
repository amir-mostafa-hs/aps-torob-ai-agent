---
name: dataset-audit
description: Inspect the actual Torob CSV, JSON and SQLite/FTS dataset, produce evidence-backed schemas/joins/provenance mappings, and keep source data unchanged.
---

# Dataset Audit

1. Search the workspace including locally available ignored files. Never assume a filename or schema before checking it.
2. Inventory all candidate data files with size, format and optional hash. Do not add these files to Git.
3. Open source SQLite in read-only mode. Inspect tables, views, FTS tables, indexes, schema, row counts, null/duplicate rates and integrity status. Do not mutate it.
4. Inspect CSV encoding/delimiter/headers and JSON top-level shape. Use bounded samples and avoid emitting sensitive/full records.
5. Derive real entity/offer/shop joins from keys and cross-check sample joins. Identify duplicate and missing-key behavior.
6. Trace each challenge requirement to exact source fields or mark it unsupported/simulated/manual. Do not guess.
7. Record known issues: fake phone numbers; potentially fake shop names; partial Tehran coverage; stale recorded offers; missing stock/hours/specs/images/contact/conditions.
8. Produce `docs/DATASET_AUDIT.md` and a field-to-feature mapping. Include repeatable commands, evidence and uncertainty.
9. Verify performance indexes/FTS availability and query plans. Do not build embeddings or a new database until measured evidence proves a need.
10. Finish with a concise recommendation for each use case: source SQLite/FTS, CSV, JSON, app-state SQLite, or unsupported.
