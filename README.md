# Personal Finance Tracker with Charts

یک وب‌اپلیکیشن مستقل و سبک برای پایش امور مالی شخصی، درآمدها و هزینه‌ها به صورت ماهانه، همراه با تقویم جلالی (شمسی)، تراکنش‌های دوره‌ای و نمودارهای Chart.js بدون نیاز به هیچ ابزار بیلد یا سرور بک‌اند.

---

## ویژگی‌های کلیدی

- **معماری Zero-Build (بدون نیاز به پکیج‌منیجر یا سرور):** اجرا به صورت خالص با HTML5, CSS3 و Vanilla JavaScript.
- **طراحی به سبک Notion:** رابط کاربری مینیمال، خنثی، خوانا و با استایل تمیز بدون ایموجی‌های زائد و نامربوط.
- **پشتیبانی کامل تقویم جلالی:** محاسبه و فیلتر خودکار بر اساس ماه‌های شمسی (آبان، آذر و...).
- **سیستم تراکنش‌های دوره‌ای هوشمند:** ایجاد قوانین تکرار ماهانه با قابلیت ویرایش یا حذف استثنا برای یک ماه خاص (Override) بدون آسیب به ماه‌های دیگر.
- **ذخیره‌سازی کامل در `localStorage`:** پایداری تمام اطلاعات در مرورگر کاربر بدون ارسال داده به سرور خارجی.
- **خروجی اکسل / CSV با پشتیبانی زبان فارسی:** تولید فایل استاندارد UTF-8 با امضای BOM جهت باز شدن صحیح در مایکروسافت اکسل.

---

## ساختار فایل‌ها و ماژول‌ها

```
personal-finance-tracker/
├── index.html                 # ساختار اصلی، فرم‌ها و مودال‌ها
├── style.css                  # پیوند به استایل‌های برنامه
├── script.js                  # پیوند به اسکریپت اصلی
├── assets/
│   ├── css/
│   │   └── style.css          # استایل اصلی با متغیرهای طراحی Notion و حالت دارک/لایت
│   ├── js/
│   │   ├── app.js             # ارکستراتور اصلی و هماهنگ‌کننده ماژول‌ها
│   │   ├── storage.js         # لایه ارتباط با localStorage، سیدها و رفع خطا
│   │   ├── date-utils.js      # توابع کمکی تقویم شمسی، محاسبات ماه‌ها و ارقام فارسی
│   │   ├── categories.js      # کنترلر مدیریت دسته‌بندی‌ها و مودال CRUD
│   │   ├── transactions.js    # کنترلر ثبت، ویرایش، حذف و جدول ریزتراکنش‌ها
│   │   ├── recurring.js       # موتور تراکنش‌های دوره‌ای و استثناهای ماهانه (Overrides)
│   │   ├── charts.js          # نمودار دونات دسته‌بندی با Chart.js و پشتیبانی تم
│   │   ├── dashboard.js       # محاسبات KPI، ناوبری ماه‌ها و به‌روزرسانی در لحظه
│   │   └── export.js          # خروجی استاندارد اکسل / CSV با امضای UTF-8 BOM
│   └── vendor/                # کتابخانه‌های خارجی جهت اجرای کاملاً آفلاین
│       ├── chart.umd.min.js
│       └── jalaali.min.js
├── docs/                      # مستندات تفصیلی تمام تسک‌ها، مدل داده و گزارش‌های تست
│   ├── data-model.md
│   ├── task-1-project-structure.md
│   ├── task-2-third-party-libraries.md
│   ├── task-3-data-model.md
│   ├── task-4-category-crud.md
│   ├── task-5-add-transaction-form.md
│   ├── task-6-transaction-list-crud.md
│   ├── task-7-month-selector.md
│   ├── task-8-monthly-summary-panel.md
│   ├── task-9-category-breakdown-chart.md
│   ├── task-10-recurring-rule-creation.md
│   ├── task-11-recurring-instance-generation.md
│   ├── task-12-monthly-override-edit.md
│   ├── task-13-monthly-override-delete.md
│   ├── task-14-recurring-rule-management.md
│   ├── task-15-csv-export.md
│   ├── task-data-persistence-localstorage.md
│   ├── task-persian-localization-jalali.md
│   ├── task-ui-ux-design-responsive.md
│   ├── task-testing-and-acceptance-qa.md
│   └── task-release-and-documentation.md
└── README.md
```

---

## نحوه اجرا

برای اجرای این برنامه به هیچ ابزار کامپایلر، پایتون یا Node.js نیازی نیست:

### روش ۱: باز کردن مستقیم در مرورگر (ساده‌ترین روش)
کافی است روی فایل `index.html` دابل‌کلیک کنید تا در هر مرورگر مدرنی (Chrome, Edge, Firefox, Safari) اجرا شود.

### روش ۲: استفاده از Live Server در VS Code
1. افزونه **Live Server** را در VS Code نصب کنید.
2. روی فایل `index.html` کلیک راست کرده و گزینه **Open with Live Server** را بزنید.
3. برنامه روی آدرس `http://127.0.0.1:5500` باز می‌شود.

### روش ۳: اجرای سریع با وب‌سرور داخلی پایتون
```bash
cd /root/personal-finance-tracker
python3 -m http.server 8080
```
سپس آدرس `http://localhost:8080` را در مرورگر باز کنید.
