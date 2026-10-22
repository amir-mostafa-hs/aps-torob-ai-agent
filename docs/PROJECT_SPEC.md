# Torob In-Person Shopping Assistant — Technical & Product Specification

**Version:** 1.0.0  
**Status:** Approved & Gated (Phase 1 Baseline)  
**Target:** Torob Hackathon In-Person Shopping Agent  

---

## 1. System Mission & Core Values

The Torob In-Person Shopping Assistant is a Persian-first, RTL, mobile-first web application designed to guide shoppers through physical shopping in Tehran. The application pairs an intuitive, hybrid graphical user interface with an intelligent agentic conversational assistant.

### Non-Negotiable Invariants:
1. **Dataset Truthfulness:** Every presented price, shop, offer, specification, and mall unit is grounded in the audited dataset. No facts or products are hallucinated.
2. **Contact Honesty:** Phone numbers in the dataset are synthetic; the app never exposes them as actionable links (`tel:`) or claims to send external messages.
3. **Identity Honesty:** Shop identity is treated as unverified unless the shop is one of the 112 audited shops with verified online credentials.
4. **Separation of Concerns:** Recorded price, last-updated timestamp, and confirmed stock remain distinct concepts.
5. **Phase 1 Seller Inquiry:** Simulated strictly in-app using audited offer response states; real SMS/Instagram integration is deferred to Phase 2.
6. **Strict Installment Eligibility:** Only shops with verified installment providers qualify when installment filtering is active.
7. **Offline-First Resilience:** Search, filters, comparison, and shop details function deterministically without requiring an active LLM connection.

---

## 2. Four-Step Buyer Journey

```
[ Step 1: Need Discovery & Product Comparison ]
  ├── Natural Persian query or category chip
  ├── Deterministic FTS5 search with Persian/Arabic normalization
  ├── Product cards with specs, condition, and market price ranges
  └── Side-by-side product model comparison

[ Step 2: Physical Store Matching & Location ]
  ├── Find physical shops in Tehran carrying the selected product
  ├── Filter by Tehran area (GPS consent or manual district/mall picker)
  ├── Filter by budget, working hours, and verified installment support
  └── Approximate distance calculation (Haversine)

[ Step 3: Store Comparison & In-Mall Navigation ]
  ├── Side-by-side store comparison (price, distance, hours, installment, freshness)
  ├── Detailed store view with indoor navigation:
  │     Mall Name → Floor → Unit Number → Indoor Direction Hint
  └── Mall overview (metro access, traffic zone, parking, typical hours)

[ Step 4: Seller Inquiry Simulation & Alternatives ]
  ├── Interactive in-app seller simulation for stock/price/hours verification
  ├── Structured disclosure of simulated response (price confirmed vs updated)
  └── Data-backed alternative suggestions:
        ├── Nearby shops in the same mall or within 1km (from alternative_shops_json)
        └── Category market hubs across Tehran (from bazaar_hubs)
```

---

## 3. Generative UI Component Allowlist

To eliminate security risks and guarantee UI consistency, the agent may only return structured JSON requesting the rendering of components from this strict allowlist:

1. `ProductCard`: Displays product image, Persian title, brand, model, condition badge, market price range, and "دیدن فروشگاه‌ها" (View stores) action.
2. `ProductComparisonTable`: Multi-column comparison of 2-3 products showing price range, specifications, brand, and warranty.
3. `ShopCard`: Displays shop name, location label, distance in meters/km, mall badge, recorded price, price freshness badge, installment badge, and open/closed status.
4. `ShopComparisonTable`: Side-by-side store comparison comparing price, distance, open hours, and installment status.
5. `MallNavigationCard`: Visual card highlighting mall name, floor, unit number, indoor walking hint, nearest metro, and parking info.
6. `InquirySimulationCard`: Interactive in-app dialogue simulator showing buyer question, simulated seller reply, stock status, and confirmed price.
7. `BazaarHubCard`: Recommendation card showing the traditional commercial hub/bazaar in Tehran for a given category (used as alternative/fallback).
8. `AgentTextMessage`: Concise Persian conversational message explaining recommendations, tradeoffs, or requesting clarification.

*Any component type outside this allowlist is rejected by the frontend schema validator.*

---

## 4. Anonymous Session & State Model

- **Session Identification:** Managed via client-stored anonymous UUID (`x-session-id` header or cookie).
- **TTL (Time to Live):** 4 hours of inactivity. Stored in a lightweight SQLite database (`session_store.sqlite`).
- **Session State Attributes:**
  - Selected user location (latitude, longitude, area name).
  - Current step in the 4-step journey.
  - Active search query and active filters (budget, radius, installments, open now).
  - Selected product ID(s) and selected store ID(s).
  - Short conversation history (maximum 10 turns, strictly sanitized).
- **Privacy:** No user accounts, passwords, or personal identifying information are stored. Location is discarded on session reset.

---

## 5. Backend Architecture & Endpoints

### Technology:
- Python 3.11 + FastAPI + Pydantic v2 + Uvicorn.
- Native read-only SQLite adapter with FTS5.

### REST Endpoints:
- `GET /api/v1/health`: Health and readiness probe (checks dataset DB availability).
- `GET /api/v1/products/search`: Deterministic product search (query, category, brand, limit, offset).
- `GET /api/v1/products/{product_id}`: Product details, specifications, and buying guide.
- `GET /api/v1/products/{product_id}/shops`: List shops offering the product with distance, price, hours, and installment filters.
- `GET /api/v1/shops/{shop_id}`: Full shop details, indoor navigation, and alternative shops.
- `GET /api/v1/malls/{mall_name}`: Commercial mall directory info.
- `GET /api/v1/bazaars/{category_name}`: Category bazaar hub recommendations.
- `POST /api/v1/inquiry/simulate`: Simulated seller inquiry request.
- `POST /api/v1/agent/chat`: Streaming SSE agent chat with tool-calling progress and Generative UI blocks.
- `POST /api/v1/session/reset`: Reset anonymous session state.

---

## 6. LLM Provider Integration

### Two Supported Profiles:
1. **Production / Demo: BoxAPI**
   - Base URL: `https://ai.boxapi.ir/ai/v1`
   - Allowed Endpoints: `/chat/completions`, `/embeddings`
   - Allowed Model List: `gpt-6.1-sol`, `gpt-6-astra`, `gpt-6-luna`, `gpt-6-sol`, `gpt-5-mini`, `gpt-5.6-luna`, `gpt-5.6-terra`, `gpt-5.6-sol`, `gpt-5.4-mini`, `gpt-5.3-codex`, `text-embedding-3-small`, `text-embedding-3-large`.
   - Default recommended agent model: `gpt-5-mini` or `gpt-5.6-luna` (verified via smoke test).
2. **Development / Local: Google AI Studio (Gemini)**
   - Base URL: `https://generativelanguage.googleapis.com/v1beta/openai/`
   - Default model: `gemini-2.5-flash` or `gemini-1.5-flash`.

### Agent Tool Loop Safeguards:
- Maximum tool iterations: 3 per user turn.
- Tool call timeout: 8 seconds per tool.
- Fallback on provider failure: Return deterministic search results and friendly Persian error banner.
