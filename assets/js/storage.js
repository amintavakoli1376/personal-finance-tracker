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

function addCategory(cat) {
  const categories = getCategories();
  const newCat = {
    id: generateId("cat"),
    name: cat.name.trim(),
    type: cat.type || "expense",
    color: cat.color || "#787774",
    icon: cat.icon || "tag",
    isDefault: false
  };
  categories.push(newCat);
  saveCategories(categories);
  return newCat;
}

function updateCategory(id, updates) {
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return null;
  categories[idx] = Object.assign({}, categories[idx], updates, { id }); // Protect id
  saveCategories(categories);
  return categories[idx];
}

function deleteCategory(id) {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  saveCategories(filtered);
  return true;
}

function getCategoryById(id) {
  const categories = getCategories();
  const found = categories.find(c => c.id === id);
  if (found) return found;

  // Fallback for deleted category
  return {
    id: id,
    name: "دسته‌بندی حذف‌شده",
    color: "#9b9a97",
    type: "expense",
    isDeleted: true
  };
}

// ------------------------------------------------------------- Transactions
function getTransactions() {
  const data = safeJsonParse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS), []);
  return Array.isArray(data) ? data : [];
}

function saveTransactions(transactions) {
  safeStorageSet(STORAGE_KEYS.TRANSACTIONS, transactions);
}

function addTransaction(tx) {
  const transactions = getTransactions();
  const d = tx.date ? new Date(tx.date) : new Date();
  
  let jalaliDate = tx.jalaliDate;
  let jalaliMonth = tx.jalaliMonth;
  if (!jalaliDate || !jalaliMonth) {
    if (window.DateUtils) {
      const j = window.DateUtils.toJalaliDate(d);
      jalaliDate = `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(j.jd).padStart(2, "0")}`;
      jalaliMonth = window.DateUtils.getJalaliMonthSlug(j.jy, j.jm);
    } else {
      jalaliDate = tx.date;
      jalaliMonth = tx.date.substring(0, 7);
    }
  }

  const newTx = {
    id: generateId("tx"),
    amount: Math.round(Number(tx.amount) || 0),
    type: tx.type === "income" ? "income" : "expense",
    categoryId: tx.categoryId,
    date: tx.date || d.toISOString().split("T")[0],
    jalaliDate: jalaliDate,
    jalaliMonth: jalaliMonth,
    description: (tx.description || "").trim(),
    isRecurringInstance: Boolean(tx.isRecurringInstance),
    ruleId: tx.ruleId || null,
    createdAt: new Date().toISOString()
  };

  transactions.unshift(newTx); // Newest first
  saveTransactions(transactions);
  return newTx;
}

function updateTransaction(id, updates) {
  const transactions = getTransactions();
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;

  const current = transactions[idx];
  let date = updates.date || current.date;
  let jalaliDate = current.jalaliDate;
  let jalaliMonth = current.jalaliMonth;

  if (updates.date && updates.date !== current.date) {
    if (window.DateUtils) {
      const j = window.DateUtils.toJalaliDate(new Date(updates.date));
      jalaliDate = `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(j.jd).padStart(2, "0")}`;
      jalaliMonth = window.DateUtils.getJalaliMonthSlug(j.jy, j.jm);
    }
  }

  const updatedTx = Object.assign({}, current, updates, {
    id, // Protect ID
    amount: updates.amount !== undefined ? Math.round(Number(updates.amount) || 0) : current.amount,
    date,
    jalaliDate,
    jalaliMonth,
    description: updates.description !== undefined ? updates.description.trim() : current.description
  });

  transactions[idx] = updatedTx;
  saveTransactions(transactions);
  return updatedTx;
}

function deleteTransaction(id) {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
  return true;
}

function getTransactionsByMonth(jalaliMonth) {
  const transactions = getTransactions();
  return transactions.filter(t => t.jalaliMonth === jalaliMonth);
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
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getTransactions,
  saveTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByMonth,
  getRecurringRules,
  saveRecurringRules,
  getMonthlyOverrides,
  saveMonthlyOverrides,
  getSettings,
  saveSettings
};
