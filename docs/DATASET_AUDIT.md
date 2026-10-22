# Torob In-Person Shopping Dataset Audit Report

**Date of Audit:** 2026-10-23  
**Auditor:** Antigravity (Phase 0 Autonomous Audit)  
**Primary Source:** `torob-dataset/processed_data/torob_agent.sqlite` (and source CSVs)  
**Mode:** Strict Read-Only Verification  

---

## 1. Inventory of Data Assets

| Relative Path | Format | Size | Row Count | Git Ignored? | Role in System |
|---|---|---:|---:|---|---|
| `torob-dataset/shops.csv` | CSV (UTF-8) | 9.2 MB | 6,476 | Yes | Raw source: physical shops |
| `torob-dataset/products.csv` | CSV (UTF-8) | 196.1 MB | 225,903 | Yes | Raw source: catalog products |
| `torob-dataset/offers.csv` | CSV (UTF-8) | 79.9 MB | 331,506 | Yes | Raw source: shop-product offers |
| `torob-dataset/processed_data/torob_agent.sqlite` | SQLite 3 | 758.8 MB | 567,951+ | Yes | **Primary operational source**: enriched tables, indexes & FTS5 |
| `torob-dataset/processed_data/products_enriched.csv` | CSV (UTF-8) | 206.9 MB | 225,903 | Yes | Enriched products backup |
| `torob-dataset/processed_data/shops_enriched.csv` | CSV (UTF-8) | 21.1 MB | 6,476 | Yes | Enriched shops backup |
| `torob-dataset/processed_data/offers_enriched.csv` | CSV (UTF-8) | 283.6 MB | 331,506 | Yes | Enriched offers backup |
| `torob-dataset/processed_data/real_shops_112.csv` | CSV (UTF-8) | 0.4 MB | 112 | Yes | The 112 verified shops with real Instagram / website |
| `torob-dataset/processed_data/tehran_malls_directory.json` | JSON (UTF-8) | 0.18 MB | 164 | Yes | Directory of Tehran commercial malls & hubs |
| `torob-dataset/processed_data/tehran_bazaar_hubs_by_category.json` | JSON (UTF-8) | 4.2 MB | 4,066 | Yes | Market centers / bazaars by category in Tehran |
| `torob-dataset/processed_data/product_reviews_and_buying_guides.json` | JSON (UTF-8) | 0.81 MB | 600 | Yes | Technical buying checklists for top products |

---

## 2. SQLite / FTS5 Audit (`torob_agent.sqlite`)

- **Integrity Status:** `PRAGMA quick_check` returned `ok`.
- **Read-Only Mode:** Verified using URI `file:path?mode=ro`.
- **Database Tables & Row Counts:**
  - `shops`: **6,476** rows (47 columns).
  - `products`: **225,903** rows (15 columns).
  - `offers`: **331,506** rows (25 columns).
  - `bazaar_hubs`: **4,066** rows (12 columns).
  - `products_fts`: **225,903** virtual rows (FTS5).
- **FTS5 Virtual Table Schema:**
  ```sql
  CREATE VIRTUAL TABLE products_fts USING fts5(
      product_id UNINDEXED,
      persian_title_clean,
      category_name,
      brand_clean,
      model_clean,
      specs_summary
  );
  ```
- **Indexes:**
  - `idx_products_id` on `products(product_id)`
  - `idx_products_cat` on `products(category_name)`
  - `idx_products_brand` on `products(brand_clean)`
  - `idx_shops_id` on `shops(shop_id)`
  - `idx_shops_mall` on `shops(mall_name_clean)`
  - `idx_shops_major_mall` on `shops(is_major_mall)`
  - `idx_shops_loc` on `shops(location_label)`
  - `idx_shops_installment` on `shops(has_installment)`
  - `idx_offers_product` on `offers(product_id)`
  - `idx_offers_shop` on `offers(shop_id)`
  - `idx_offers_price` on `offers(price_toman)`
  - `idx_offers_call` on `offers(needs_seller_call)`
- **Query Plan Verification:**
  - FTS query + JOIN on `products`: Uses virtual table index scan followed by `SEARCH p USING INDEX idx_products_id (product_id=?)`. Execution time < 5ms for common queries like "سامسونگ" or "iPhone".

---

## 3. Proven Domain Relationships & Join Keys

```
               [products] (225,903)
                   │
                   │ (1:N on product_id)
                   ▼
                [offers] (331,506)
                   ▲
                   │ (N:1 on shop_id)
                   │
                [shops] (6,476)
                   │
                   ├─► mall_name_clean ──► [tehran_malls_directory.json] (164 malls)
                   └─► alternative_shops_json ──► up to 4 nearby peer shops (<1000m)
```

- Every offer links to exactly one valid `product_id` and one valid `shop_id`.
- There are no orphaned offers.
- Products have an average of 1.47 offers per product. 500 top products have 10 to 300+ offers.
- Shops have an average of 51.2 offers, capped at 300 offers per shop.

---

## 4. Quality & Truthfulness Audit

### A. Phone Numbers (100% Fake)
- **Fact:** All phone numbers in `shops` and `offers` are synthetic test numbers generated for the challenge.
- **Enforced Rule:** The backend API and frontend UI **must never** render actionable phone links (`tel:`), expose numbers as real contact info, or claim that SMS/calls reach a live person.

### B. Shop Identity (98.3% Fake Names)
- **Fact:** 6,364 of the 6,476 shops have synthetic names (e.g., "فرورا رویس", "آرین وییار").
- **Verified Shops (112):** Exactly 112 shops (`is_real_shop = 1`) have verified online footprints:
  - 22 have real Instagram accounts (e.g., `Ariya__co`, `tie_center`).
  - 90 have real websites (e.g., `https://takhtjamshidmobile.com/`, `https://iransani.ir/`).
- **Enforced Rule:** Non-verified shops must be labeled neutrally (e.g., "فروشگاه حضوری در [پاساژ/خیابان]") and their physical coordinates/indoor hints prioritized. Real websites/Instagram links may be provided for the 112 verified shops.

### C. Geographic Coverage (Selective Tehran Slice)
- **Fact:** The dataset covers approximately 10% of Tehran retail locations, centered on major commercial districts (فردوسی, علاءالدین, جمهوری, ولیعصر, بازار, میرداماد).
- **Enforced Rule:** The app must never claim "exhaustive coverage of all Tehran". If a user searches an outlying neighborhood with no shops, the agent must clearly state the coverage limit and recommend the nearest commercial hub or bazaar using `bazaar_hubs`.

### D. Indoor Navigation & Malls
- **Inside Mall:** 3,839 shops (59.3%) are located inside commercial malls/passages.
- **Key Navigation Fields:**
  - `mall_name_clean`: 421 distinct mall names recognized.
  - `floor_clean`: Clean floor name (e.g., "همکف", "طبقه ۱", "زیرهمکف").
  - `unit_clean`: Commercial unit / shop number (e.g., "واحد ۱۲", "پلاک ۴۵").
  - `indoor_navigation_hint`: Micro-location directions (e.g., "جنب آسانسور", "راهروی غربی").

### E. Price Freshness & Stale Data
- **Distribution:**
  - به‌روز (کمتر از ۱ ماه): 182,476 (55.0%)
  - نسبتاً قدیمی (۱ تا ۳ ماه پیش - نیازمند استعلام): 69,336 (20.9%)
  - قدیمی (بیش از ۳ ماه پیش - احتمال تغییر قیمت بالا): 78,925 (23.8%)
  - نامشخص: 769 (0.2%)
- **Needs Seller Call:** 140,123 (42.3%) offers have `needs_seller_call = 1` due to stale price or large deviation from the product median price (`price_vs_median_ratio < 0.75` or `> 1.35`).
- **Enforced Rule:** Recorded price and price freshness must be displayed honestly. Stale prices must carry a badge recommending price confirmation.

### F. Installments (Strict Verification)
- **Fact:** Only **266 shops** (4.1%) have verified installment support (`has_installment = 1`, TorobPay, SnappPay, DigiPay, or Tara).
- **6,210 shops** are unverified or do not offer installments (`has_installment = 0`).
- **Enforced Rule:** When the "فقط خرید قسطی" (Installments only) filter is active, **only** the 266 confirmed shops may be returned. Unverified shops must never leak into installment results.

### G. Warranty Status
- **Verified Warranty:** 56,556 offers (17.1%) have structured warranty providers & durations.
- **Text-Mined Warranty:** 4,976 offers (1.5%).
- **Explicit No-Warranty:** 2,318 offers (0.7%).
- **Unknown:** 267,656 offers (80.7%).
- **Enforced Rule:** Never display "بدون گارانتی" when warranty is simply `unknown`. Mark it as "نامشخص (نیازمند استعلام)".

### H. Seller Inquiry Simulation
- **Fact:** In `offers`, `mock_seller_state_json` provides simulated seller responses (`in_stock`, `confirmed_price_toman`, `price_changed`, `seller_message`).
- **Enforced Rule:** Phase 1 uses in-app interactive simulation. The UI must clearly indicate this is an in-app simulation for the demo, avoiding any claim that a real seller was messaged via external SMS.

---

## 5. Field-to-Feature Matrix

| Challenge Requirement | Exact Source Table / Column | Query / Extraction Strategy | Completeness | User-Facing Caveat / Rule |
|---|---|---|---|---|
| **Product Search (Persian)** | `products_fts(persian_title_clean, category_name, brand_clean)` | FTS5 `MATCH` with normalized query | 100% | Handles Persian/Arabic characters and English keywords |
| **Product Specs & Brand** | `products(brand_clean, model_clean, specs_summary, condition)` | Direct column select from `products` | High | Differentiate between verified condition vs default assumed new |
| **Product Buying Guide** | `product_reviews_and_buying_guides.json` | Key lookup by `product_id` | 600 top products | Disclose as technical buying checklist, not Torob user review |
| **Store Matching for Product** | `offers(product_id, shop_id, price_toman)` JOIN `shops` | Indexed SQL join `idx_offers_product` | 100% | Show only stores with actual recorded offers |
| **Store Physical Navigation** | `shops(address, mall_name_clean, floor_clean, unit_clean, indoor_navigation_hint)` | Direct column select | 59.3% in malls | Show floor & unit only when present |
| **Tehran Commercial Malls** | `tehran_malls_directory.json` | Key lookup by `mall_name_clean` | 164 malls | Includes nearest metro, parking info, traffic zone |
| **Category Bazaars (Fallback)** | `tehran_bazaar_hubs_by_category.json` & `bazaar_hubs` | Lookup by `category_name` | 4,066 categories | Used when catalog has no local stock in selected area |
| **Distance Calculation** | `shops(lat, lon)` vs user coordinates | Haversine formula in Python backend | 100% valid coords | Requires user location consent or manual area choice |
| **Working Hours** | `shops(clean_weekly_hours_json, hours_data_quality, effective_sat_to_wed_hours)` | Parsed JSON shift timetable | 68.7% verified | Disclose if hours are estimated from mall norms |
| **Installment Filter** | `shops(has_installment, payment_providers)` | SQL `WHERE has_installment = 1` | 4.1% (266 shops) | Strict inclusion only; never guess |
| **Seller Inquiry Simulation** | `offers(mock_seller_state_json, needs_seller_call, call_reason)` | Parsed JSON from `offers` | 100% of offers | In-app simulated dialogue; no external SMS/calls |
| **Alternative Shops** | `shops(alternative_shops_json)` | Pre-computed nearest peer shops | High | Provides up to 4 backup shops in same mall or <1km |

---

## 6. Recommended Read Strategy

1. **Read-Only SQLite Engine:** Use `sqlite3` in read-only mode (`mode=ro`) pointing to `torob-dataset/processed_data/torob_agent.sqlite`.
2. **Deterministic Data Access:**
   - Products & Search: `products_fts` + `products`.
   - Offers & Comparison: `offers` indexed on `product_id`.
   - Shops & Malls: `shops` indexed on `shop_id`.
   - Fallback Bazaars: `bazaar_hubs` table.
3. **In-Memory JSON Caching:** Load `tehran_malls_directory.json` and `product_reviews_and_buying_guides.json` into memory on backend startup for instantaneous O(1) lookups.
4. **App-State Persistence:** Use a distinct writable SQLite file (`session_store.sqlite`) for anonymous user sessions with TTL cleanup.
