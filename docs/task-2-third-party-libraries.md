# Task 2: Integrate Third-Party Libraries

- **Epic:** Project Setup & Technical Foundation
- **Phase:** phase-1
- **Status:** Done
- **Story Points:** 3

---

## اقدامات انجام‌شده

1. **یکپارچه‌سازی کتابخانه Chart.js:**
   - اتصال نسخه ۴ Chart.js از طریق CDN رسمی jsDelivr در `index.html`.
   - دانلود نسخه آفلاین `chart.umd.min.js` در `assets/vendor/` با مکانیسم Fallback خودکار در صورت عدم دسترسی به اینترنت:
     ```html
     <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
     <script>window.Chart || document.write('<script src="assets/vendor/chart.umd.min.js"><\/script>')</script>
     ```

2. **یکپارچه‌سازی کتابخانه تبدیل تقویم جلالی (jalaali-js):**
   - اتصال `jalaali-js` از CDN و ذخیره نسخه آفلاین در `assets/vendor/jalaali.min.js`.
   - پیاده‌سازی Fallback دولایه: هم فایل لوکال و هم استفاده از API بومی مرورگر (`Intl.DateTimeFormat("en-US-u-ca-persian")`).

3. **پیاده‌سازی توابع کمکی تاریخ و ارقام فارسی (`assets/js/date-utils.js`):**
   - `toJalaliDate(date)`: تبدیل تاریخ میلادی به آبجکت `{ jy, jm, jd }`.
   - `toGregorianDate(jy, jm, jd)`: تبدیل تاریخ شمسی به شیء `Date` میلادی.
   - `formatJalaliMonth(jy, jm)`: نمایش عنوان ماه شمسی (مانند «آبان ۱۴۰۵»).
   - `getJalaliMonthSlug(jy, jm)` / `parseJalaliMonthSlug(slug)`: تولید و پارس اسلاگ استاندارد ماه‌ها (`1405-08`).
   - `toPersianDigits(str)`: تبدیل اعداد انگلیسی به ارقام فارسی (۰ تا ۹).
   - `formatCurrency(amount)`: فرمت سه‌رقم سه‌رقم با ارقام فارسی و واحد تومان.

4. **پیاده‌سازی ماژول نمودار دونات (`assets/js/charts.js`):**
   - رندر و به‌روزرسانی نمودار دایره‌ای/دونات برای دسته‌بندی‌های هزینه.
   - اعمال پالت رنگی خنثی و مینیمال Notion.
   - پشتیبانی از تم‌های روشن و تاریک و نمایش تولتیپ فارسی همراه با درصد سهم هر دسته.
   - مدیریت وضعیت بدون داده (`empty-state`).

---

## اعتبارسنجی
- تست اتوماتیک تبدیل تاریخ ۲۴ اکتبر ۲۰۲۶ به ۲ آبان ۱۴۰۵ با موفقیت پاس شد.
- تضمین معماری کاملاً کلاینت‌ساید و بدون نیاز به وب‌پک یا بیلدتول.
