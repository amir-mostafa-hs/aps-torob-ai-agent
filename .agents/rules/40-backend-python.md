---
trigger: glob
globs: "*.py, *.sql"
description: Rules for FastAPI, SQLite access, Pydantic contracts, agent tools, and testable Python behavior.
---

- Keep route handlers thin. Put domain rules in services and data access in repositories/adapters.
- Use Pydantic for API and tool contracts. Handle expected invalid input and provider errors as typed, safe responses.
- Open source SQLite read-only; use bound SQL parameters. Respect existing FTS indexes and validate any slow query with query-plan evidence.
- Never use `SELECT *` for large payloads sent to the UI/LLM; explicitly select needed fields and bound results.
- Distinguish missing, unknown, stale and positively known fields where user decisions rely on them.
- Add bounded timeouts and tool iteration limits. Do not let agent calls loop indefinitely.
- Keep provider-specific SDK behavior inside one small adapter. Test it using a fake client at the boundary.
- Do not log API keys, full sensitive session contents, raw location, or fabricated contact details.
