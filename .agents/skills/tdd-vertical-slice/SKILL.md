---
name: tdd-vertical-slice
description: Implement one Torob behavior through a public interface using a focused red-green-refactor loop, then verify integration without over-mocking internal code.
---

# TDD Vertical Slice

1. Restate the observable behavior in one sentence and identify the public seam (domain function, repository contract, API endpoint, UI action or browser journey).
2. Cite the acceptance criterion and its independent source of truth.
3. Add one test that should fail for the missing behavior. Expected values must be explicit fixture/spec values, not computed using the implementation under test.
4. Run that single test and confirm it fails for the expected reason.
5. Implement the smallest coherent vertical slice to pass it. Mock only external boundaries such as LLM API/time/network; do not mock internal collaborators to assert implementation details.
6. Run the focused test, then relevant tests, type checks/lint and integration checks.
7. Refactor only while all tests stay green. Add a regression test for any discovered bug.
8. Check data truth/provenance, errors, unknown states, performance bounds and security for the behavior.
9. Report exact command results. Never skip or weaken a failing valid test to pass the gate.
