# Task: Implement localStorage Read/Write Layer

- **Epic:** Data Persistence (localStorage)
- **Phase:** phase-1
- **Status:** Done
- **Story Points:** 5

---

## اقدامات انجام‌شده

1. **طراحی معماری ذخیره‌سازی ایزوله با پیشوند `pft_` (`assets/js/storage.js`):**
   - تفکیک کلیدهای ذخیره‌سازی:
     - `pft_categories`: آرایه دسته‌بندی‌ها
     - `pft_transactions`: آرایه تراکنش‌های ثبت‌شده
     - `pft_recurring_rules`: قوانین تراکنش‌های دوره‌ای
     - `pft_monthly_overrides`: استثناها و ویرایش‌های ماهانه
     - `pft_settings`: تنظیمات تم و ماه فعال
   - تولید شناسه‌های یکتا با طول مناسب و پیشوند تفکیک‌شده (`generateId`).

2. **مدیریت خطاهای حافظه و اعتبارسنجی JSON:**
   - متد ایمن `safeJsonParse` برای جلوگیری از بروز کرش بر اثر دیتای مخدوش.
   - متد `safeStorageSet` با مدیریت استثنای `QuotaExceededError` برای هشدار در زمان پر شدن حافظه مرورگر.

3. **سید خودکار داده‌های اولیه (Initial Seeding):**
   - مقداردهی اولیه ۱۰ دسته‌بندی پیش‌فرض در صورت خالی بودن دیتابیس لوکال کاربر.

---

## اعتبارسنجی
- تست اتوماتیک خواندن، نوشتن و اعتبارسنجی کوئری‌ها در محیط Node.js با موفقیت پاس شد.
