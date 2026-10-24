/**
 * Storage & Repository Layer for Personal Finance Tracker
 * Encapsulates localStorage access, validation, default seeds, and error handling.
 */

const STORAGE_KEYS = {
  CATEGORIES: "pft_categories",
  TRANSACTIONS: "pft_transactions",
  RECURRING_RULES: "pft_recurring_rules",
  MONTHLY_OVERRIDES: "pft_monthly_overrides",
  SETTINGS: "pft_settings"
};

// Default seed categories (expense & income)
const DEFAULT_CATEGORIES = [
  { id: "cat_food", name: "خوراک و سوپرمارکت", type: "expense", color: "#e16b5a", icon: "food", isDefault: true },
  { id: "cat_housing", name: "مسکن و اجاره", type: "expense", color: "#e89a3c", icon: "housing", isDefault: true },
  { id: "cat_transport", name: "حمل‌ونقل و سوخت", type: "expense", color: "#2383e2", icon: "transport", isDefault: true },
  { id: "cat_bills", name: "قبوض و شارژ", type: "expense", color: "#787774", icon: "bills", isDefault: true },
  { id: "cat_health", name: "سلامت و درمان", type: "expense", color: "#c15c8a", icon: "health", isDefault: true },
  { id: "cat_personal", name: "پوشاک و خرید شخصی", type: "expense", color: "#9065b0", icon: "personal", isDefault: true },
  { id: "cat_leisure", name: "تفریح و سرگرمی", type: "expense", color: "#d4b138", icon: "leisure", isDefault: true },
  { id: "cat_salary", name: "حقوق و دستمزد", type: "income", color: "#0f7b6c", icon: "salary", isDefault: true },
  { id: "cat_freelance", name: "پروژه و فریلنسری", type: "income", color: "#4dab9a", icon: "freelance", isDefault: true },
  { id: "cat_investment", name: "سرمایه‌گذاری و سود", type: "income", color: "#529cca", icon: "investment", isDefault: true }
];

/**
 * Generate a unique random string ID
 * @param {string} prefix 
 * @returns {string}
 */
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Safe JSON parse with fallback
 * @param {string|null} raw 
 * @param {any} fallback 
 * @returns {any}
 */
function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Malformed storage JSON, using fallback:", err);
    return fallback;
  }
}

/**
 * Safe localStorage write with quota checking
 * @param {string} key 
 * @param {any} value 
 */
function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage for key '${key}':`, err);
    if (err.name === "QuotaExceededError" || err.code === 22) {
      alert("حافظه مرورگر پر شده است. لطفاً داده‌های قدیمی یا حافظه مرورگر را بررسی کنید.");
    }
  }
}

// ------------------------------------------------------------- Categories
function getCategories() {
  const data = safeJsonParse(localStorage.getItem(STORAGE_KEYS.CATEGORIES), null);
  if (!Array.isArray(data) || data.length === 0) {
    // Seed default categories
    saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return data;
}

function saveCategories(categories) {
  safeStorageSet(STORAGE_KEYS.CATEGORIES, categories);
}

// ------------------------------------------------------------- Transactions
function getTransactions() {
  const data = safeJsonParse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS), []);
  return Array.isArray(data) ? data : [];
}

function saveTransactions(transactions) {
  safeStorageSet(STORAGE_KEYS.TRANSACTIONS, transactions);
}

// ------------------------------------------------------------- Recurring Rules
function getRecurringRules() {
  const data = safeJsonParse(localStorage.getItem(STORAGE_KEYS.RECURRING_RULES), []);
  return Array.isArray(data) ? data : [];
}

function saveRecurringRules(rules) {
  safeStorageSet(STORAGE_KEYS.RECURRING_RULES, rules);
}

// ------------------------------------------------------------- Monthly Overrides
function getMonthlyOverrides() {
  const data = safeJsonParse(localStorage.getItem(STORAGE_KEYS.MONTHLY_OVERRIDES), []);
  return Array.isArray(data) ? data : [];
}

function saveMonthlyOverrides(overrides) {
  safeStorageSet(STORAGE_KEYS.MONTHLY_OVERRIDES, overrides);
}

// ------------------------------------------------------------- Settings
function getSettings() {
  const defaults = {
    theme: "light",
    selectedMonth: null,
    currencyUnit: "تومان"
  };
  return Object.assign(defaults, safeJsonParse(localStorage.getItem(STORAGE_KEYS.SETTINGS), {}));
}

function saveSettings(settings) {
  safeStorageSet(STORAGE_KEYS.SETTINGS, settings);
}

// Global Export
window.StorageManager = {
  STORAGE_KEYS,
  DEFAULT_CATEGORIES,
  generateId,
  getCategories,
  saveCategories,
  getTransactions,
  saveTransactions,
  getRecurringRules,
  saveRecurringRules,
  getMonthlyOverrides,
  saveMonthlyOverrides,
  getSettings,
  saveSettings
};
