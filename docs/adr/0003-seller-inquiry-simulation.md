# ADR 0003: In-App Seller Inquiry Simulation & Contact Honesty

- **Status:** Accepted
- **Decision owners:** Product & Safety rules from Torob Challenge Brief
- **Context:** The challenge dataset contains fake phone numbers for 100% of the stores and synthetic names for 98.3% of stores. However, the 4th step of the challenge explicitly requires addressing stale prices and store inquiry. Real automatic phone calling (e.g. Google Call) or SMS/Instagram messaging is impractical and unsafe with fake numbers, and was deferred to Phase 2.

## Decision

1. Implement an interactive in-app seller inquiry simulation in Phase 1 grounded directly in the audited `mock_seller_state_json`, `needs_seller_call`, `call_reason`, and working hours data present in `offers` and `shops`.
2. Explicitly ban rendering of fake phone numbers as actionable links (`tel:`) or text in user-facing UI.
3. For the 112 verified shops (`is_real_shop = 1`), provide verified Instagram and website links where available. For the remaining shops, display honest neutral labels ("فروشگاه حضوری در [پاساژ/خیابان]") and emphasize in-mall physical navigation.
4. Render clear in-app simulation badges ("استعلام شبیه‌سازی‌شده") to ensure complete truthfulness without misleading the user.

## Reasons

- Honors the core rule: Never fabricate seller contact or deceive the user.
- Fulfills the 4th step of the challenge in a truthful, delightful, interactive manner.
- Protects external third parties from unwanted spam/calls to fake numbers.
