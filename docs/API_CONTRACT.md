# Torob Shopping Assistant — API Contract Specification

**Version:** 1.0.0  
**Schema Alignment:** FastAPI (Pydantic v2) ⟷ Next.js (TypeScript / Zod)  
**Encoding:** All string payloads are UTF-8 Persian. Digits in calculations are ASCII.  

---

## 1. Common Types & Enums

### Price Object
```typescript
interface PriceInfo {
  amount_toman: number;
  last_changed_at: string | null;
  age_days: number | null;
  freshness_label: 'به‌روز (کمتر از ۱ ماه)' | 'نسبتاً قدیمی (۱ تا ۳ ماه پیش - نیازمند استعلام)' | 'قدیمی (بیش از ۳ ماه پیش - احتمال تغییر قیمت بالا)' | 'نامشخص';
  needs_seller_call: boolean;
  call_reason: string;
}
```

### Store Location & Navigation
```typescript
interface StoreNavigation {
  is_inside_mall: boolean;
  mall_name_clean: string | null;
  floor_clean: string | null;
  unit_clean: string | null;
  indoor_navigation_hint: string | null;
  main_street: string | null;
  location_label: string | null;
}
```

### Working Hours
```typescript
interface StoreHours {
  hours_data_quality: 'verified' | 'unknown';
  is_hours_estimated: boolean;
  effective_sat_to_wed_hours: string | null;
  thu_hours: string | null;
  open_on_friday: boolean;
  clean_weekly_hours_json: Record<string, string> | null;
}
```

### Payment & Conditions
```typescript
interface PaymentConditions {
  has_installment: boolean;
  has_torob_pay: boolean;
  has_snapp_pay: boolean;
  has_digi_pay: boolean;
  has_tara: boolean;
  payment_providers: string | null;
}
```

---

## 2. Core Entities

### Product Entity (`ProductSummary` & `ProductDetail`)
```typescript
interface ProductSummary {
  product_id: string;
  category_name: string;
  persian_title_clean: string;
  brand_clean: string | null;
  model_clean: string | null;
  condition: 'نو' | 'استوک' | 'کارکرده';
  condition_source: string;
  authenticity: string;
  specs_count: number;
  specs_summary: string | null;
  primary_image_url: string | null;
  min_price_toman: number | null;
  max_price_toman: number | null;
  offers_count: number;
}

interface ProductDetail extends ProductSummary {
  buying_guide?: {
    market_price_summary: string;
    highlights_and_pros: string[];
    in_person_buying_checklist: string[];
  } | null;
}
```

### Store Offer Entity (`StoreOfferItem`)
```typescript
interface StoreOfferItem {
  offer_id: string;
  shop_id: string;
  shop_name: string;
  is_real_shop: boolean;
  price: PriceInfo;
  navigation: StoreNavigation;
  hours: StoreHours;
  payments: PaymentConditions;
  distance_meters: number | null;
  lat: number;
  lon: number;
  warranty_clean: string;
  has_warranty: boolean;
  instagram_url: string | null;
  website_url_clean: string | null;
}
```

---

## 3. Endpoints

### 3.1 Health & Readiness
`GET /api/v1/health`
- **Response (200 OK):**
```json
{
  "status": "ok",
  "database": "connected",
  "total_products": 225903,
  "total_shops": 6476,
  "total_offers": 331506
}
```

---

### 3.2 Product Search
`GET /api/v1/products/search?q={query}&category={cat}&brand={brand}&limit=20&offset=0`
- **Response (200 OK):**
```json
{
  "query": "سامسونگ",
  "total": 1420,
  "items": [
    {
      "product_id": "product_34a505516a1dd543943f1bab",
      "category_name": "قطعات موبایل",
      "persian_title_clean": "فلت رابط برد شارژ سامسونگ Samsung Galaxy A34",
      "brand_clean": "سامسونگ",
      "model_clean": "Galaxy A34",
      "condition": "نو",
      "condition_source": "default_assumed_new",
      "authenticity": "اصل / اورجینال",
      "specs_count": 4,
      "specs_summary": "نوع: فلت شارژ | سازگاری: A34",
      "primary_image_url": "https://...",
      "min_price_toman": 185000,
      "max_price_toman": 250000,
      "offers_count": 3
    }
  ]
}
```

---

### 3.3 Product Details
`GET /api/v1/products/{product_id}`
- **Response (200 OK):** `ProductDetail` object.

---

### 3.4 Stores Offering a Product
`GET /api/v1/products/{product_id}/shops?user_lat={lat}&user_lon={lon}&max_radius_meters={radius}&installment_only={bool}&open_now={bool}&sort={price|distance}`
- **Response (200 OK):**
```json
{
  "product_id": "product_34a505516a1dd543943f1bab",
  "total_offers": 3,
  "offers": [
    {
      "offer_id": "offer_8820c7419e71ab8256",
      "shop_id": "shop_3f93a30a9e66c6dece07cdff",
      "shop_name": "فروشگاه قطعات علاءالدین",
      "is_real_shop": false,
      "price": {
        "amount_toman": 185000,
        "last_changed_at": "2026-10-18T10:00:00",
        "age_days": 3,
        "freshness_label": "به‌روز (کمتر از ۱ ماه)",
        "needs_seller_call": false,
        "call_reason": "قیمت به‌روز و متعارف"
      },
      "navigation": {
        "is_inside_mall": true,
        "mall_name_clean": "پاساژ علاءالدین",
        "floor_clean": "طبقه ۱",
        "unit_clean": "واحد ۱۲",
        "indoor_navigation_hint": "جنب راهروی غربی",
        "main_street": "جمهوری",
        "location_label": "جمهوری"
      },
      "hours": {
        "hours_data_quality": "verified",
        "is_hours_estimated": false,
        "effective_sat_to_wed_hours": "10:00 - 21:00",
        "thu_hours": "10:00 - 19:00",
        "open_on_friday": false,
        "clean_weekly_hours_json": {}
      },
      "payments": {
        "has_installment": false,
        "has_torob_pay": false,
        "has_snapp_pay": false,
        "has_digi_pay": false,
        "has_tara": false,
        "payment_providers": null
      },
      "distance_meters": 450,
      "lat": 35.6985,
      "lon": 51.4120,
      "warranty_clean": "مهلت تست ۴۸ ساعته",
      "has_warranty": true,
      "instagram_url": null,
      "website_url_clean": null
    }
  ]
}
```

---

### 3.5 In-App Seller Inquiry Simulation
`POST /api/v1/inquiry/simulate`
- **Request Body:**
```json
{
  "offer_id": "offer_8820c7419e71ab8256",
  "inquiry_type": "stock_and_price", // "stock_and_price" | "hours" | "specs"
  "user_note": "می‌خواهم بعدازظهر حضوری مراجعه کنم"
}
```
- **Response (200 OK):**
```json
{
  "offer_id": "offer_8820c7419e71ab8256",
  "shop_id": "shop_3f93a30a9e66c6dece07cdff",
  "simulation_disclaimer": "پاسخ استعلام شبیه‌سازی‌شده بر اساس سابقه و وضعیت فروشگاه در ترب است.",
  "in_stock": true,
  "confirmed_price_toman": 185000,
  "price_changed": false,
  "seller_message": "بله قطعه موجوده و قیمت همون ۱۸۵ هزار تومان ثبت‌شده در ترب هست. تشریف بیارید طبقه اول واحد ۱۲.",
  "recommended_action": "مراجعه حضوری به فروشگاه"
}
```

---

### 3.6 Agent Chat & Generative UI (SSE Streaming)
`POST /api/v1/agent/chat`
- **Request Body:**
```json
{
  "session_id": "c1f7a28e-8a1e-450b-bc19-123456789abc",
  "message": "یه گوشی سامسونگ تا ۲۰ میلیون تومان نزدیک ونک می‌خوام",
  "context": {
    "user_lat": 35.7575,
    "user_lon": 51.4099,
    "area_name": "میدان ونک"
  }
}
```
- **SSE Stream Events (`text/event-stream`):**
  - `event: thinking`: `{"step": "جست‌وجوی کاتالوگ برای گوشی سامسونگ در بازه ۱۵ تا ۲۰ میلیون..."}`
  - `event: tool_start`: `{"tool": "search_products", "args": {"q": "گوشی سامسونگ", "max_price": 20000000}}`
  - `event: tool_done`: `{"tool": "search_products", "result_count": 3}`
  - `event: ui_block`: `{"type": "ProductCard", "data": {...}}`
  - `event: message`: `{"delta": "این سه مدل سامسونگ با بودجه و نیاز شما همخوانی دارند..."}`
  - `event: done`: `{"session_id": "...", "status": "finished"}`
