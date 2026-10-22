---
name: phase-gate
description: Start and close a Torob implementation phase with explicit scope, test-first slices, acceptance evidence, independent review, and a safe Git checkpoint.
---

# Torob Phase Gate

Use before starting every phase and again before declaring it complete.

## Before changes
1. Read `AGENTS.md`, the relevant `.agents/rules`, `docs/DECISIONS.md`, `docs/WORK_PLAN.md`, the relevant acceptance rows, and the applicable section of the master prompt.
2. Inspect `git status --short` and preserve user changes.
3. State: goal, in-scope behavior, out-of-scope work, evidence/source of truth, risks, public test seams, checks, and completion criteria.
4. Check whether the environment has the relevant Matt Pocock Skills (particularly spec/tickets/TDD/implement/code-review). Use installed skills honestly; otherwise follow the procedure in these rules.
5. For every behavior with a meaningful external contract, create one focused failing test first. Avoid horizontal batching.

## During implementation
1. Work in small vertical slices; run the narrow test immediately.
2. Use actual data or explicit fixtures that reflect the audited schema. Never replace real integration with permanently hardcoded sample data.
3. After each slice, run relevant typecheck/lint/build/API tests before continuing.
4. If blocked by unavailable keys/platform access, record the evidence and keep working on independent tasks.

## Close the phase
1. Run all phase checks and record exact commands and exit results.
2. Review the diff separately against engineering standards and the product spec.
3. Check no secrets, ignored datasets, fabricated facts, disabled tests or unrelated user edits are included.
4. Update relevant docs and future ideas list.
5. Create a Git checkpoint/commit only when safe and after checks pass.
6. Report `PASS`, `BLOCKED`, or `FAIL` per gate. No ambiguous “done”.
