/**
 * Personal Finance Tracker — Main Application Bootstrapper
 * Zero-build, vanilla JavaScript architecture
 */

document.addEventListener("DOMContentLoaded", () => {
  // Theme initialization
  const savedTheme = localStorage.getItem("pft_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("pft_theme", next);
      themeToggleBtn.textContent = next === "dark" ? "حالت روشن" : "حالت تاریک";
    });
    themeToggleBtn.textContent = savedTheme === "dark" ? "حالت روشن" : "حالت تاریک";
  }

  console.log("Personal Finance Tracker initialized successfully.");
});

// Global App Orchestrator
window.App = {
  getCurrentMonth: function () {
    const sel = document.getElementById("month-select");
    return sel && sel.value ? sel.value : "1405-08";
  },
  onTransactionChanged: function (tx) {
    if (window.TransactionsManager) {
      window.TransactionsManager.renderTransactionsTable(window.App.getCurrentMonth());
    }
    window.App.refreshDashboard();
  },
  refreshDashboard: function () {
    const currentMonth = window.App.getCurrentMonth();
    const txs = window.StorageManager ? window.StorageManager.getTransactionsByMonth(currentMonth) : [];

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCat = {};

    txs.forEach((t) => {
      if (t.type === "income") {
        totalIncome += Number(t.amount) || 0;
      } else {
        totalExpense += Number(t.amount) || 0;
        expenseByCat[t.categoryId] = (expenseByCat[t.categoryId] || 0) + (Number(t.amount) || 0);
      }
    });

    const balance = totalIncome - totalExpense;

    // Update KPI cards
    const incomeEl = document.getElementById("total-income");
    const expenseEl = document.getElementById("total-expense");
    const balanceEl = document.getElementById("total-balance");

    if (incomeEl) incomeEl.textContent = window.DateUtils.formatCurrency(totalIncome);
    if (expenseEl) expenseEl.textContent = window.DateUtils.formatCurrency(totalExpense);
    if (balanceEl) {
      balanceEl.textContent = (balance < 0 ? "-" : "") + window.DateUtils.formatCurrency(Math.abs(balance));
      balanceEl.style.color = balance < 0 ? "var(--expense)" : balance > 0 ? "var(--income)" : "var(--text-main)";
    }

    // Update Chart
    if (window.ChartManager && typeof window.ChartManager.renderCategoryChart === "function") {
      const chartData = Object.keys(expenseByCat).map((catId) => {
        const cat = window.StorageManager.getCategoryById(catId);
        return {
          label: cat.name,
          amount: expenseByCat[catId],
          color: cat.color
        };
      });
      window.ChartManager.renderCategoryChart(chartData);
    }
  }
};
