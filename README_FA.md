# دستیار خرید حضوری ترب (Torob In-Person Shopping Assistant)

پروژه دستیار خرید حضوری ترب، یک راهکار هوشمند و ترکیبی (Deterministic Retrieval + Agentic LLM) برای راهنمایی خریداران تهرانی در خریدهای فیزیکی است. این سیستم با اتکا به داده‌های رسمی چالش ترب (۲۲۵,۹۰۳ محصول، ۶,۴۷۶ فروشگاه حضوری و ۳۳۱,۵۰۶ آفر) طراحی و پیاده‌سازی شده و فرآیند ۴ مرحله‌ای خرید حضوری را پوشش می‌دهد.

---

## ۱. ویژگی‌های کلیدی سیستم

1. **جستجوی دقیق فارسی بدون وابستگی به هوش مصنوعی:**
   - موتور جستجوی قطعی (Deterministic) بر پایه SQLite FTS5 با نرمال‌سازی فارسی (یکسان‌سازی حروف ک/ی، تبدیل ارقام به لاتین، اصلاح نیم‌فاصله‌ها و فیلتر ایست‌واژه‌های محاوره‌ای).
   - رتبه‌بندی بر اساس ارتباط کالا، تنوع فروشگاه‌ها و قیمت.

2. **یافتن و مقایسه فروشگاه‌های فیزیکی تهران:**
   - فیلتر بر اساس موقعیت مکانی کاربر (فرمول Haversine) و انتخاب دستی محله‌های تهران.
   - فیلتر سخت‌گیرانه خرید اقساطی (فقط فروشگاه‌های با `has_installment == 1` معتبر ترب‌پی).
   - تشخیص وضعیت باز/بسته بودن فروشگاه بر اساس ساعات کاری مستند.

3. **راهنمای ناوبری داخل پاساژها و راسته‌بازارها:**
   - پوشش ۱۶۴ مجتمع تجاری معتبر تهران (پاساژ علاءالدین، چارسو، ایران، کوروش و...).
   - نمایش دقیق طبقه، پلاک/واحد تجاری، راهنمای مسیر داخل راهروها، ایستگاه متروی نزدیک و وضعیت پارکینگ.
   - ارجاع به راسته‌بازارهای تخصصی کالا بر پایه ۴,۰۶۶ تحلیل هاب تجاری.

4. **شبیه‌سازی استعلام زنده موجودی و قیمت (Seller Inquiry Simulation):**
   - استعلام زنده مبتنی بر سابقه واقعی فروشگاه (`mock_seller_state_json`).
   - اعلام صریح وضعیت: موجودی قطعی، تغییر قیمت احتمالی یا نیاز به مراجعه حضوری.
   - رعایت اصل صداقت داده: شماره تلفن‌های فیک دیتاست چالش هرگز به عنوان لینک تماس یا ارسال پیامک واقعی استفاده نمی‌شوند.

5. **دستیار هوشمند تعاملی (Streaming Agent & Generative UI):**
   - اتصال به سرویس ابری BoxAPI (مدل تولیدی چالش) و Google AI Studio / Gemini با فال‌بک کاملاً آفلاین.
   - استریم بلادرنگ پاسخ‌ها (Server-Sent Events) همراه با نمایش مراحل تفکر (`thinking`) و ابزارها (`tool_start`/`tool_done`).
   - کارت‌های رابط کاربری زایا (Generative UI) اعتبارسنجی‌شده با کامپوننت‌های امن React.

6. **پایداری نشست‌های ناشناس (Anonymous Sessions):**
   - ذخیره وضعیت مکالمه و فیلترهای کاربر در پایگاه‌داده مجزای SQLite با انقضای خودکار ۴ ساعته (TTL)، بدون نیاز به ثبت‌نام یا نگهداری اطلاعات حساس.

---

## ۲. معماری فنی (Technical Architecture)

```
                           +--------------------------------------+
                           |          کاربر / مرورگر وب            |
                           |   (Next.js 16 + Tailwind CSS v4)     |
                           +------------------+-------------------+
                                              |
                          HTTP / SSE Requests | (Reverse Proxy / API)
                                              v
                           +--------------------------------------+
                           |          FastAPI Backend             |
                           |    (Python 3.11 + Pydantic v2)       |
                           +--------+--------------------+--------+
                                    |                    |
             +----------------------+--+        +--------+------------------+
             |                         |        |                           |
             v                         v        v                           v
+------------------------+   +---------------+  +--------------+  +--------------------+
| SQLite FTS5 (Read-Only)|   | Session Store |  | BoxAPI /     |  | Mock Agent Engine  |
| 225k Products          |   | 4-Hour TTL    |  | Gemini LLM   |  | (Offline Fallback) |
| 6.4k Shops / 331k Offers|  | SQLite        |  | (OpenAI API) |  |                    |
+------------------------+   +---------------+  +--------------+  +--------------------+
```

- **فرانت‌اند:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Lucide Icons (کاملاً RTL و بهینه‌سازی‌شده برای موبایل با فونت وزیرمتن).
- **بک‌اند:** FastAPI + Pydantic v2 + SQLite3 FTS5 + sse-starlette.
- **امنیت داده:** باز کردن دیتابیس کاتالوگ به صورت اکیداً فقط‌خواندنی (`mode=ro`) جهت تضمین دست‌نخوردن داده‌های پایه.

---

## ۳. ممیزی داده‌های چالش ترب (Dataset Audit Facts)

بر اساس ممیزی رسمی فایل `torob-dataset/processed_data/torob_agent.sqlite` (حجم: ۷۵۸.۸ مگابایت):
- **محصولات (`products`):** ۲۲۵,۹۰۳ رکورد (شامل کاتالوگ تمیز شده عنوان، برند، مدل و مشخصات).
- **فروشگاه‌ها (`shops`):** ۶,۴۷۶ رکورد (۳,۸۳۹ فروشگاه داخل پاساژ، ۲۶۶ فروشگاه با خرید قسطی تأییدشده ترب‌پی، ۱۱۲ فروشگاه با وب‌سایت/اینستاگرام واقعی).
- **پیشنهادات (`offers`):** ۳۳۱,۵۰۶ رکورد قیمت و موجودی ثبت‌شده.
- **مجتمع‌های تجاری (`tehran_malls_directory.json`):** ۱۶۴ پاساژ تجاری تهران همراه با ساعت کاری و امکانات ناوبری.
- **راسته‌بازارها (`tehran_bazaar_hubs_by_category.json`):** ۴,۰۶۶ تحلیل راسته‌بازار به تفکیک دسته‌بندی.

---

## ۴. راه‌اندازی و اجرای محلی (Local Setup)

### پیش‌نیازها:
- Node.js 18+ و pnpm (`npm install -g pnpm`)
- Python 3.10 یا 3.11

### گام ۱: راه‌اندازی بک‌اند (FastAPI)
```bash
# رفتن به پوشه بک‌اند
cd backend

# ایجاد و فعال‌سازی محیط مجازی پایتون
python -m venv .venv
# ویندوز:
.venv\Scripts\activate
# لینوکس/مک:
source .venv/bin/activate

# نصب وابستگی‌ها
pip install -r requirements.txt

# اجرای سرور تست روی پورت 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### گام ۲: راه‌اندازی فرانت‌اند (Next.js)
```bash
# در ترمینال دیگر، رفتن به پوشه فرانت‌اند
cd frontend

# نصب پکیج‌ها با pnpm
pnpm install

# اجرای محیط توسعه
pnpm dev
```
اکنون برنامه روی آدرس `http://localhost:3000` در دسترس است.

---

## ۵. اجرای آزمون‌های خودکار (Automated Tests)

تمام تست‌های پیش‌فرض سیستم به صورت ۱۰۰٪ آفلاین و بدون نیاز به کلید API یا اینترنت اجرا می‌شوند:

```bash
# اجرای ۲۰ تست یکپارچگی بک‌اند با pytest
python -m pytest backend/tests -v
```
خروجی تست‌ها:
```
tests/test_agent_service.py::test_agent_stream_product_search PASSED     [  5%]
tests/test_agent_service.py::test_agent_stream_mall_navigation PASSED    [ 10%]
tests/test_api_endpoints.py::test_health_endpoint PASSED                 [ 15%]
tests/test_api_endpoints.py::test_product_search_api PASSED              [ 20%]
tests/test_api_endpoints.py::test_product_detail_api PASSED              [ 25%]
tests/test_api_endpoints.py::test_product_shops_api PASSED               [ 30%]
tests/test_api_endpoints.py::test_inquiry_simulation_api PASSED          [ 35%]
tests/test_normalizer.py::test_digits_to_ascii PASSED                    [ 40%]
tests/test_normalizer.py::test_normalize_persian_text_arabic_characters PASSED [ 45%]
tests/test_normalizer.py::test_normalize_persian_text_zwnj_and_spaces PASSED [ 50%]
tests/test_normalizer.py::test_build_fts5_query_safe_tokens PASSED       [ 55%]
tests/test_repository.py::test_source_db_connection_read_only PASSED     [ 60%]
tests/test_repository.py::test_search_products_persian_and_english PASSED [ 65%]
tests/test_repository.py::test_get_product_detail_with_buying_guide PASSED [ 70%]
tests/test_repository.py::test_get_offers_for_product_and_installment_filter PASSED [ 75%]
tests/test_repository.py::test_bazaar_hub_lookup PASSED                  [ 80%]
tests/test_services.py::test_haversine_distance_tehran PASSED            [ 85%]
tests/test_services.py::test_search_service_filter_and_sort PASSED       [ 90%]
tests/test_services.py::test_inquiry_service_simulation PASSED           [ 95%]
tests/test_services.py::test_session_service_lifecycle PASSED            [100%]

======================== 20 passed in 1.62s ========================
```

تست ساخت فرانت‌اند:
```bash
pnpm --prefix frontend run build
```

---

## ۶. استقرار ابری (Cloud Deployment on Liara)

سیستم دارای راهنمای اختصاصی و کامل استقرار در لیارا در فایل [docs/LIARA_DEPLOYMENT_GUIDE.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/LIARA_DEPLOYMENT_GUIDE.md) است.

### استقرار با Docker Compose (سرور مجازی یا توسعه ابری):
```bash
cp .env.example .env
docker compose up -d --build
```

---

## ۷. ساختار مستندات و تصمیمات معماری (ADRs)

- [docs/WORK_PLAN.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/WORK_PLAN.md): سند فازبندی گام‌به‌گام پروژه.
- [docs/ACCEPTANCE_MATRIX.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/ACCEPTANCE_MATRIX.md): ماتریس پذیرش و شواهد آزمون‌های چالش.
- [docs/DATASET_AUDIT.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/DATASET_AUDIT.md): گزارش ممیزی کامل ساختار و رکوردهای دیتابیس.
- [docs/API_CONTRACT.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/API_CONTRACT.md): قرارداد کامل اندپوینت‌های REST و رویدادهای SSE.
- [docs/DECISIONS.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/DECISIONS.md): تصمیمات قطعی استخراج‌شده از مصاحبه معماری.
- [docs/adr/0001-product-and-architecture.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/adr/0001-product-and-architecture.md): تصمیم معماری مونولیت ماژولار.
- [docs/adr/0002-data-layer-and-search-strategy.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/adr/0002-data-layer-and-search-strategy.md): استراتژی جستجوی FTS5 و رتبه‌بندی.
- [docs/adr/0003-seller-inquiry-simulation.md](file:///d:/projects/current-git-project/aps-torob-ai-agent/docs/adr/0003-seller-inquiry-simulation.md): مدل‌سازی استعلام درون‌برنامه‌ای و حفاظت از داده‌ها.
