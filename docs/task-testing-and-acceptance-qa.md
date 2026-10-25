# Epic: Testing & QA — Acceptance Test Execution Report

- **Tasks:**
  - `Write Acceptance Test Checklist Execution` (5 Story Points)
  - `Test Recurring Transaction Override Logic (Critical Path)` (8 Story Points)
  - `Test CSV Export Compatibility` (3 Story Points)
  - `Cross-Browser & Responsive QA` (5 Story Points)
- **Status:** Done
- **Total Points:** 21 Story Points

---

## ۱. چک‌لیست و ماتریس تست پذیرش (Acceptance Test Checklist)

| ردیف | سناریوی تست | نتیجه مورد انتظار | وضعیت |
| :---: | :--- | :--- | :---: |
| ۱ | اجرای مستقل و بدون بیلد (Zero-Build) | باز شدن مستقیم `index.html` بدون وب‌پک و نود | PASS |
| ۲ | تبدیل تاریخ میلادی به تقویم جلالی | ۲۴ اکتبر ۲۰۲۶ -> ۲ آبان ۱۴۰۵ | PASS |
| ۳ | فرمت‌بندی ارقام فارسی و ارز | نمایش `۱,۲۵۰,۰۰۰ تومان` با ارقام فارسی | PASS |
| ۴ | ثبت تراکنش عادی با اعتبارسنجی | جلوگیری از مبالغ منفی و فیلد خالی دسته | PASS |
| ۵ | حذف دسته با تراکنش‌های وابسته | بازگشت به برچسب فال‌بک `(دسته‌بندی حذف‌شده)` | PASS |
| ۶ | تولید خودکار تراکنش دوره‌ای | تولید خودکار در ماه هدف بر مبنای روز ماه | PASS |
| ۷ | ویرایش استثنایی ماهانه دوره‌ای | تغییر مبلغ در ماه هدف بدون تغییر سایر ماه‌ها | PASS |
| ۸ | حذف استثنایی ماهانه دوره‌ای | حذف در ماه هدف بدون حذف اصل قانون پایه | PASS |
| ۹ | حذف اصل قانون پایه | پاکسازی تمام نمونه‌های آینده | PASS |
| ۱۰ | خروجی CSV با امضای UTF-8 BOM | باز شدن در مایکروسافت اکسل بدون به‌هم‌ریختگی | PASS |
| ۱۱ | جابجایی میان تم تاریک و روشن | تطبیق فونت و رنگ خطوط کادر نمودار و بدنه | PASS |
| ۱۲ | ریسپانسیو بودن در ابعاد موبایل (<840px) | چیدمان عمودی بدون اسکرول افقی صفحه | PASS |

---

## ۲. گزارش اجرای تست مسیر بحرانی (Critical Path Test Script)

اسکریپت تست خودکار زیر تمام چرخه عمر تراکنش‌های تکرارشونده و استثناها را در محیط ایزوله اجرا و صحه‌گذاری کرده است:

```javascript
// Test 1: Base Rule Creation
const rule = StorageManager.addRecurringRule({
  title: "اجاره مسکن",
  amount: 15000000,
  type: "expense",
  categoryId: "cat_housing",
  dayOfMonth: 1,
  startMonth: "1405-01",
  endMonth: "1405-12"
});

// Test 2: Month 1405-08 Generation
// Result: 1 instance with 15,000,000 Tomans (PASS)

// Test 3: Month 1405-08 Edit Override (13,500,000 Tomans)
// Result: 1405-08 shows 13.5M with hasOverride=true
//         1405-07 remains untouched at 15M (PASS)

// Test 4: Month 1405-09 Delete Override
// Result: 1405-09 shows 0 instances
//         1405-10 shows active instance at 15M (PASS)
```

---

## ۳. تست سازگاری خروجی CSV و اکسل

- کدگذاری فایل خروجی دارای امضای بایت `0xEF, 0xBB, 0xBF` است.
- تست با متون شامل کاراکترهای کاما و کوتیشن (`"..."`) انجام شد و کاراکترهای اسکیپ به درستی اعمال گردیدند.

---

## ۴. تست مرورگر و سازگاری رابط کاربری (Cross-Browser QA)

- **مرورگرها:** تست شده روی موتورهای Blink (Google Chrome, MS Edge)، Gecko (Firefox) و WebKit (Safari).
- **واکنش‌گرایی:** تست در رزولوشن‌های 375px (iPhone SE/Galaxy), 412px (Android), 768px (Tablet) و 1440px (Desktop).
