# Task 7: Implement Month Selector

- **Epic:** Monthly Dashboard & Visualization
- **Phase:** phase-1
- **Status:** Done
- **Story Points:** 3

---

## اقدامات انجام‌شده

1. **موتور محاسبه و ناوبری ماه‌های جلالی (`assets/js/date-utils.js`):**
   - `getCurrentJalaliMonthSlug()`: تشخیص ماه جاری تقویم شمسی بر مبنای تاریخ امروز (مانند `1405-08`).
   - `getAdjacentMonth(slug, offset)`: حرکت به ماه قبل یا بعد با مدیریت ترنزیشن سال‌های شمسی (مانند بازگشت از `1405-01` به `1404-12` و پیشروی از `1405-12` به `1406-01`).
   - `generateMonthOptions(pastYears, futureYears)`: تولید بازه ۴ ساله ماه‌ها با برچسب فارسی خوانا.

2. **کنترلر و دراپ‌داون انتخاب ماه (`assets/js/dashboard.js`):**
   - پر کردن خودکار دراپ‌داون `#month-select`.
   - اتصال رویدادهای کلیک دکمه‌های «ماه قبل» (`#prev-month-btn`)، «ماه بعد» (`#next-month-btn`) و «امروز» (`#current-month-btn`).
   - ذخیره آخرین ماه انتخاب‌شده در `localStorage` تحت `pft_settings.selectedMonth` جهت ماندگاری وضعیت هنگام رفرش صفحه.
   - همگام‌سازی فوری جدول تراکنش‌ها، کارت‌های KPI و نمودار دونات با تغییر ماه.

---

## اعتبارسنجی
- تست‌های منطق مرز سال‌ها و تولید لیست ماه‌ها با موفقیت پاس شد.
