# Dataset Audit Report (populate from actual local files)

> Do not fill this template from guessed schema. Use `.agents/skills/dataset-audit/SKILL.md` and preserve raw files.

## 1. Inventory

| Relative path | Format | Size | SHA-256 (optional) | Git ignored? | Role |
|---|---|---:|---|---|---|

## 2. SQLite/FTS audit

- File(s):
- Tables/views/FTS virtual tables:
- Indexes:
- Row counts:
- Integrity check:
- Read-only open verified:
- Query plans for important queries:

## 3. CSV audit

For each file: encoding, delimiter, header, row count, type/null/duplicate summary, likely keys and relationships.

## 4. JSON audit

For each file: shape, key fields, array/object sizes, optional/missing fields, joins.

## 5. Domain relationship map

Describe only proven relationships among base products, product-offers, shops, conditions, location and seller state. Include join key evidence and edge cases.

## 6. Quality and trustworthiness

- Fake/unverified shop identity fields:
- Fake or unusable phone numbers:
- Contact URLs that are actually present:
- Price freshness distribution:
- Availability/stock evidence:
- Installment/payment condition evidence:
- Missing hours/location/spec/image/warranty rates:
- Geographic coverage limitations:
- Data duplication and orphan records:

## 7. Field-to-feature matrix

| Challenge requirement | Exact source file/table/column | Query/join | Completeness | User-facing caveat | Test fixture/case |
|---|---|---|---|---|---|

## 8. Recommended read strategy

| Use case | Source of truth | Index/query strategy | Why | Known limits |
|---|---|---|---|---|

## 9. Reproducibility

List exact commands and safe read-only steps used to generate this report.
