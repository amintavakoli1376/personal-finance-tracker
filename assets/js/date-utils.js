/**
 * Date and Number Utilities for Jalali Calendar and Persian Formatting
 * Supports jalaali-js with standalone fallbacks
 */

const JALALI_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند"
];

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts English digits to Persian digits
 * @param {number|string} input 
 * @returns {string}
 */
function toPersianDigits(input) {
  if (input === null || input === undefined) return "";
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/**
 * Formats a currency number with commas and Persian digits
 * @param {number} amount 
 * @param {string} unit 
 * @returns {string}
 */
function formatCurrency(amount, unit = "تومان") {
  const num = Math.round(Number(amount) || 0);
  const formatted = num.toLocaleString("en-US");
  return `${toPersianDigits(formatted)} ${unit}`;
}

/**
 * Converts a Gregorian Date or ISO string into Jalali { jy, jm, jd }
 * @param {Date|string} date 
 * @returns {{ jy: number, jm: number, jd: number }}
 */
function toJalaliDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  if (window.jalaali && typeof window.jalaali.toJalaali === "function") {
    return window.jalaali.toJalaali(gy, gm, gd);
  }

  // Fallback conversion using Intl API if jalaali is absent
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
      year: "numeric",
      month: "numeric",
      day: "numeric"
    }).formatToParts(d);

    const jy = Number(parts.find(p => p.type === "year")?.value);
    const jm = Number(parts.find(p => p.type === "month")?.value);
    const jd = Number(parts.find(p => p.type === "day")?.value);
    return { jy, jm, jd };
  } catch (e) {
    console.error("Jalali conversion failed, falling back to basic:", e);
    return { jy: gy - 621, jm: gm, jd: gd };
  }
}

/**
 * Converts Jalali year, month, day to Gregorian Date
 * @param {number} jy 
 * @param {number} jm 
 * @param {number} jd 
 * @returns {Date}
 */
function toGregorianDate(jy, jm, jd) {
  if (window.jalaali && typeof window.jalaali.toGregorian === "function") {
    const g = window.jalaali.toGregorian(jy, jm, jd);
    return new Date(g.gy, g.gm - 1, g.gd);
  }
  // Approximate fallback
  return new Date(jy + 621, jm - 1, jd);
}

/**
 * Returns formatted month name in Persian, e.g. "آبان ۱۴۰۵"
 * @param {number} jy 
 * @param {number} jm 
 * @returns {string}
 */
function formatJalaliMonth(jy, jm) {
  const name = JALALI_MONTH_NAMES[jm - 1] || "";
  return `${name} ${toPersianDigits(jy)}`;
}

/**
 * Returns standard YYYY-MM slug for Jalali month, e.g. "1405-08"
 * @param {number} jy 
 * @param {number} jm 
 * @returns {string}
 */
function getJalaliMonthSlug(jy, jm) {
  return `${jy}-${String(jm).padStart(2, "0")}`;
}

/**
 * Parses "1405-08" into { jy: 1405, jm: 8 }
 * @param {string} slug 
 * @returns {{ jy: number, jm: number }}
 */
function parseJalaliMonthSlug(slug) {
  const [y, m] = slug.split("-").map(Number);
  return { jy: y, jm: m };
}

/**
 * Returns the number of days in a Jalali month
 * @param {number} jy 
 * @param {number} jm 
 * @returns {number}
 */
function getJalaliMonthLength(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  if (window.jalaali && typeof window.jalaali.isLeapJalaaliYear === "function") {
    return window.jalaali.isLeapJalaaliYear(jy) ? 30 : 29;
  }
  return 29;
}

/**
 * Returns adjacent Jalali month slug with given offset (-1 or +1)
 * @param {string} slug "YYYY-MM"
 * @param {number} offset 
 * @returns {string}
 */
function getAdjacentMonth(slug, offset = -1) {
  const { jy, jm } = parseJalaliMonthSlug(slug);
  let newY = jy;
  let newM = jm + offset;

  while (newM < 1) {
    newM += 12;
    newY -= 1;
  }
  while (newM > 12) {
    newM -= 12;
    newY += 1;
  }

  return getJalaliMonthSlug(newY, newM);
}

/**
 * Returns current Jalali month slug according to today
 * @returns {string}
 */
function getCurrentJalaliMonthSlug() {
  const j = toJalaliDate(new Date());
  return getJalaliMonthSlug(j.jy, j.jm);
}

/**
 * Generates an array of Jalali month options { slug, label }
 * @param {number} pastYears 
 * @param {number} futureYears 
 * @returns {Array<{ slug: string, label: string }>}
 */
function generateMonthOptions(pastYears = 2, futureYears = 1) {
  const current = toJalaliDate(new Date());
  const startYear = current.jy - pastYears;
  const endYear = current.jy + futureYears;
  const options = [];

  for (let y = endYear; y >= startYear; y--) {
    for (let m = 12; m >= 1; m--) {
      const slug = getJalaliMonthSlug(y, m);
      const label = formatJalaliMonth(y, m);
      options.push({ slug, label });
    }
  }

  return options;
}

// Global export for non-module HTML inclusion
window.DateUtils = {
  JALALI_MONTH_NAMES,
  toPersianDigits,
  formatCurrency,
  toJalaliDate,
  toGregorianDate,
  formatJalaliMonth,
  getJalaliMonthSlug,
  parseJalaliMonthSlug,
  getJalaliMonthLength,
  getAdjacentMonth,
  getCurrentJalaliMonthSlug,
  generateMonthOptions
};
