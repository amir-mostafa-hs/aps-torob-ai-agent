# راهنمای استقرار دستیار خرید حضوری ترب روی سرویس ابری لیارا (Liara Cloud)

این سند راهنمای کامل گام‌به‌گام برای استقرار سیستم روی پلتفرم ابری لیارا (Liara PaaS) است.

---

## ۱. معماری استقرار در لیارا

سیستم دارای دو سرویس مجزا و بهینه‌سازی‌شده برای زیرساخت ابری است:

1. **سرویس بک‌اند (FastAPI + SQLite + BoxAPI):** بر روی پلتفرم Docker لیارا اجرا می‌شود و پایگاه‌داده‌ی سبک FTS5 و موتور جستجو و ایجنت هوشمند را میزبانی می‌کند.
2. **سرویس فرانت‌اند (Next.js 16 + Tailwind v4):** بر روی پلتفرم NextJS یا Docker لیارا مستقر می‌شود و رابط کاربری فارسی و تعاملی را ارائه می‌دهد.

---

## ۲. پیش‌نیازها

1. نصب ابزار خط فرمان لیارا (Liara CLI):

```bash
npm install -g @liara/cli
```

2. ورود به حساب کاربری:

```bash
liara login
```

---

## ۳. استقرار بک‌اند (Backend)

### مرحله ۱: ایجاد برنامه در کنسول لیارا

- نام برنامه: `torob-assistant-api`
- نوع پلتفرم: **Docker**
- رم پیشنهادی: حداقل ۵۱۲ مگابایت (پیشنهادی ۱ گیگابایت برای کش پایگاه داده و FTS5)

### مرحله ۲: تنظیم متغیرهای محیطی (Environment Variables)

در بخش تنظیمات برنامه در کنسول لیارا یا از طریق CLI:

```bash
liara env:set \
  LLM_PROVIDER="boxapi" \
  BOXAPI_BASE_URL="https://ai.boxapi.ir/ai/v1" \
  BOXAPI_API_KEY="<کلید_اختصاصی_شما>" \
  BOXAPI_MODEL="gpt-5-mini" \
  PORT=8000 \
  CORS_ORIGINS="*" \
  --app torob-assistant-api
```

### مرحله ۳: استقرار

از ریشه پروژه یا پوشه backend دستور زیر را اجرا کنید:

```bash
liara deploy --app torob-assistant-api --port 8000
```

### بررسی سلامت پس از استقرار:

```bash
curl https://torob-assistant-api.liara.run/api/v1/health
```

پاسخ مورد انتظار:

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

## ۴. استقرار فرانت‌اند (Frontend)

### مرحله ۱: ایجاد برنامه

- نام برنامه: `torob-assistant-web`
- نوع پلتفرم: **NextJS** یا **Docker**
- رم پیشنهادی: ۵۱۲ مگابایت یا ۱ گیگابایت

### مرحله ۲: تنظیم متغیرهای محیطی فرانت‌اند

```bash
liara env:set \
  NEXT_PUBLIC_API_URL="https://torob-assistant-api.liara.run" \
  --app torob-assistant-web
```

### مرحله ۳: استقرار فرانت‌اند

از داخل پوشه `frontend`:

```bash
cd frontend
liara deploy --app torob-assistant-web --port 3000
```

---

## ۵. استقرار تک‌کانتینری با Docker Compose (روی سرور ابری/VPS)

برای استقرار همزمان فرانت‌اند و بک‌اند با یک دستور:

```bash
cp .env.example .env
# مقادیر کلید API را در .env قرار دهید
docker compose up -d --build
```

سپس فرانت‌اند روی پورت `3000` و بک‌اند روی پورت `8000` در دسترس خواهند بود.
