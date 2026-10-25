/**
 * CSV / Excel Export Module with Persian UTF-8 BOM Support
 */

(function () {
  function initExport() {
    const exportBtn = document.getElementById("export-csv-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        exportCurrentMonthToCsv();
      });
    }
  }

  /**
   * Generates and triggers download of CSV file for the active month
   */
  function exportCurrentMonthToCsv() {
    const currentMonth = window.App ? window.App.getCurrentMonth() : "1405-08";

    // Gather all transactions for this month (regular + recurring instances)
    const regularTxs = window.StorageManager ? window.StorageManager.getTransactionsByMonth(currentMonth) : [];
    const recurringInstances = window.RecurringEngine
      ? window.RecurringEngine.getRecurringInstancesForMonth(currentMonth)
      : [];

    const allItems = [...regularTxs, ...recurringInstances];

    if (allItems.length === 0) {
      alert(`تراکنشی برای ماه ${currentMonth} جهت خروجی اکسل یافت نشد.`);
      return;
    }

    // CSV Headers
    const headers = [
      "ردیف",
      "تاریخ شمسی",
      "نوع تراکنش",
      "دسته‌بندی",
      "شرح / عنوان",
      "نوع ثبت",
      "مبلغ (تومان)"
    ];

    const rows = allItems.map((tx, idx) => {
      const cat = window.StorageManager ? window.StorageManager.getCategoryById(tx.categoryId) : { name: "دسته" };
      const typeFa = tx.type === "income" ? "درآمد" : "هزینه";
      
      let recType = "عادی";
      if (tx.isRecurringInstance) {
        recType = tx.hasOverride ? "دوره‌ای (ویرایش این ماه)" : "دوره‌ای";
      }

      const dateStr = tx.jalaliDate || tx.date || currentMonth;
      const desc = tx.description || "بدون شرح";
      const amount = Number(tx.amount) || 0;

      return [
        idx + 1,
        dateStr,
        typeFa,
        cat.name,
        desc,
        recType,
        amount
      ];
    });

    // Build CSV string with UTF-8 BOM
    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [
        headers.map(escapeCsvCell).join(","),
        ...rows.map((row) => row.map(escapeCsvCell).join(","))
      ].join("\r\n");

    // Download trigger via Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance-tracker-${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function escapeCsvCell(cell) {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initExport);
  }

  window.ExportManager = {
    initExport,
    exportCurrentMonthToCsv,
    escapeCsvCell
  };
})();
