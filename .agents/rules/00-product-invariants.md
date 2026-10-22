---
trigger: always_on
description: Product, dataset truth, and scope invariants that must hold for all Torob code changes.
---

- Challenge data is the primary source. Search it before reaching for external services.
- Never invent product, offer, shop, price, stock, seller-contact, hours, location, installment or guarantee facts.
- Never treat a recorded offer price as a live quote or treat unknown stock as available.
- Never use the challenge's fake phone numbers for contact, phone links, SMS, or user-facing actionable details.
- Treat shop identity as unverified when the audited source says the display name is fake. Use real website/Instagram links only when actually present and allowed.
- Phase 1 inquiry is simulated inside the product, based on audited data. Do not claim a real seller was messaged.
- Only verified data may produce a claim. Preserve unknown states explicitly.
- The app is Persian-first, RTL, mobile-first, minimal, accessible. Every feature must support a real buyer task.
- All generated UI must use validated schemas and an allowlist of frontend components; never execute generated HTML/JavaScript.
- Phase 2 ideas belong in `docs/FUTURE_IDEAS.md`; do not quietly expand current scope.
