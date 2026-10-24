# Personal Finance Tracker — Data Model & Storage Specification

این سند مشخصات دقیق مدل داده و کلیدهای ذخیره‌سازی در `localStorage` را برای برنامه ردیاب امور مالی شخصی مشخص می‌کند.

---

## ۱. کلیدهای ذخیره‌سازی در localStorage

برای جلوگیری از تداخل با سایر برنامه‌ها، تمام کلیدها با پیشوند `pft_` نام‌گذاری شده‌اند:

| کلید در localStorage | نوع داده | شرح |
| :--- | :---: | :--- |
| `pft_categories` | `Array<Category>` | فهرست دسته‌بندی‌های هزینه و درآمد |
| `pft_transactions` | `Array<Transaction>` | تراکنش‌های ثبت‌شده کاربر |
| `pft_recurring_rules` | `Array<RecurringRule>` | قوانین تراکنش‌های تکرارشونده ماهانه |
| `pft_monthly_overrides` | `Array<MonthlyOverride>` | استثناها و ویرایش‌های ماهانه روی قوانین تکرار |
| `pft_settings` | `AppSettings` | تنظیمات کاربر (تم، آخرین ماه بازشده) |

---

## ۲. مدل‌های داده (Data Schemas)

### ۱.۲. مدل دسته‌بندی (`Category`)
```typescript
interface Category {
  id: string;              // شناسه یکتا، e.g. "cat_food_01" یا UUID
  name: string;            // نام دسته‌بندی به فارسی، e.g. "خوراک و مواد غذایی"
  type: "expense" | "income"; // نوع: هزینه یا درآمد
  color: string;           // رنگ معرف در نمودار، e.g. "#e16b5a"
  icon: string;            // نام یا برچسب نماد/آیکون
  isDefault: boolean;      // آیا جزو دسته‌های پیش‌فرض سیستم است؟
}
```

#### دسته‌بندی‌های پیش‌فرض اولیه (Default Seed Categories):
1. **خوراک و سوپرمارکت** (`expense`, `#e16b5a`)
2. **مسکن و اجاره** (`expense`, `#e89a3c`)
3. **حمل‌ونقل و سوخت** (`expense`, `#2383e2`)
4. **قبوض و شارژ ساختمان** (`expense`, `#787774`)
5. **سلامت و درمان** (`expense`, `#c15c8a`)
6. **پوشاک و خرید شخصی** (`expense`, `#9065b0`)
7. **تفریح و سرگرمی** (`expense`, `#d4b138`)
8. **حقوق و دستمزد** (`income`, `#0f7b6c`)
9. **پروژه و فریلنسری** (`income`, `#4dab9a`)
10. **سرمایه‌گذاری و سود** (`income`, `#529cca`)

---

### ۲.۲. مدل تراکنش (`Transaction`)
```typescript
interface Transaction {
  id: string;              // شناسه یکتا، e.g. "tx_1729780000_abc"
  amount: number;          // مبلغ تراکنش به تومان (بزرگ‌تر از صفر)
  type: "expense" | "income"; // نوع تراکنش
  categoryId: string;      // ارجاع به id دسته‌بندی
  date: string;            // تاریخ میلادی ثبت (YYYY-MM-DD) برای محاسبات جاوااسکریپت
  jalaliDate: string;      // تاریخ جلالی کامل (YYYY-MM-DD)، e.g. "1405-08-02"
  jalaliMonth: string;     // فیلد کلیدی فیلتر ماه (YYYY-MM)، e.g. "1405-08"
  description: string;     // شرح تراکنش (اختیاری)
  isRecurringInstance: boolean; // آیا این تراکنش از قانون تکرار تولید شده است؟
  ruleId?: string;         // در صورت مشتق شدن از قانون تکرار، شناسه قانون مربوطه
}
```

---

### ۳.۲. مدل قانون تراکنش تکرارشونده (`RecurringRule`)
```typescript
interface RecurringRule {
  id: string;              // شناسه قانون، e.g. "rule_rent_01"
  title: string;           // عنوان، e.g. "اجاره‌بها"
  amount: number;          // مبلغ به تومان
  type: "expense" | "income";
  categoryId: string;      // شناسه دسته‌بندی
  dayOfMonth: number;      // روز اجرای ماه (بین ۱ تا ۳۱ شمسی)
  startMonth: string;      // ماه شروع به فرمت YYYY-MM شمسی، e.g. "1405-01"
  endMonth?: string;       // ماه پایان اختیاری به فرمت YYYY-MM شمسی
  createdAt: string;       // زمان ایجاد ISO
}
```

---

### ۴.۲. مدل استثنا / ویرایش ماهانه (`MonthlyOverride`)
هنگامی که کاربر یک تراکنش تکرارشونده را فقط برای یک ماه خاص تغییر مبلغ می‌دهد یا حذف می‌کند، این تغییر به عنوان یک استثنا ذخیره می‌شود بدون آنکه قانون پایه یا سایر ماه‌ها دستکاری شوند:

```typescript
interface MonthlyOverride {
  id: string;              // شناسه استثنا
  ruleId: string;          // ارجاع به شناسه RecurringRule
  jalaliMonth: string;     // ماه هدف به فرمت YYYY-MM شمسی
  status: "modified" | "deleted"; // آیا ویرایش شده یا حذف شده است؟
  overrideData?: {         // در صورت modified، مقادیر بازنویسی‌شده
    amount?: number;
    categoryId?: string;
    description?: string;
    dayOfMonth?: number;
  };
}
```

---

### ۵.۲. مدل تنظیمات (`AppSettings`)
```typescript
interface AppSettings {
  theme: "light" | "dark";
  selectedMonth: string;   // آخرین ماه انتخاب‌شده در رابط کاربری، e.g. "1405-08"
  currencyUnit: string;    // "تومان"
}
```
