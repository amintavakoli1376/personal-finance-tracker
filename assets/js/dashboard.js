/**
 * Dashboard & Monthly KPI Management Controller
 */

(function () {
  let activeMonthSlug = null;

  function initDashboard() {
    setupMonthSelector();
    setupSummaryKPIs();
    updateDashboardUI();
  }

  function setupMonthSelector() {
    const select = document.getElementById("month-select");
    const prevBtn = document.getElementById("prev-month-btn");
    const nextBtn = document.getElementById("next-month-btn");
    const currentBtn = document.getElementById("current-month-btn");

    if (!select) return;

    // Load saved or current month
    const settings = window.StorageManager.getSettings();
    const currentTodaySlug = window.DateUtils.getCurrentJalaliMonthSlug();
    activeMonthSlug = settings.selectedMonth || currentTodaySlug;

    // Populate dropdown with 36 months (past 2 years, next 1 year)
    const options = window.DateUtils.generateMonthOptions(2, 1);
    select.innerHTML = options
      .map(
        (opt) =>
          `<option value="${opt.slug}" ${opt.slug === activeMonthSlug ? "selected" : ""}>${opt.label}</option>`
      )
      .join("");

    // Fallback if activeMonthSlug was not in range
    if (!select.value) {
      select.value = options[0].slug;
      activeMonthSlug = select.value;
    }

    // Change event
    select.addEventListener("change", () => {
      setMonth(select.value);
    });

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const prevSlug = window.DateUtils.getAdjacentMonth(activeMonthSlug, -1);
        setMonth(prevSlug);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const nextSlug = window.DateUtils.getAdjacentMonth(activeMonthSlug, 1);
        setMonth(nextSlug);
      });
    }

    if (currentBtn) {
      currentBtn.addEventListener("click", () => {
        const todaySlug = window.DateUtils.getCurrentJalaliMonthSlug();
        setMonth(todaySlug);
      });
    }
  }

  function setMonth(monthSlug) {
    activeMonthSlug = monthSlug;
    const select = document.getElementById("month-select");
    if (select) {
      // If month is not in options, dynamically add it
      if (![...select.options].some((opt) => opt.value === monthSlug)) {
        const { jy, jm } = window.DateUtils.parseJalaliMonthSlug(monthSlug);
        const opt = document.createElement("option");
        opt.value = monthSlug;
        opt.textContent = window.DateUtils.formatJalaliMonth(jy, jm);
        select.prepend(opt);
      }
      select.value = monthSlug;
    }

    // Save in settings
    window.StorageManager.saveSettings({ selectedMonth: activeMonthSlug });

    // Refresh UI
    updateDashboardUI();
  }

  function setupSummaryKPIs() {
    // Initial calculation
    calculateAndRenderSummary();
  }

  function calculateAndRenderSummary() {
    const regularTxs = window.StorageManager.getTransactionsByMonth(activeMonthSlug);
    const recurringInstances = window.RecurringEngine
      ? window.RecurringEngine.getRecurringInstancesForMonth(activeMonthSlug)
      : [];

    const allItems = [...regularTxs, ...recurringInstances];

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCat = {};

    allItems.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === "income") {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        expenseByCat[tx.categoryId] = (expenseByCat[tx.categoryId] || 0) + amount;
      }
    });

    const netBalance = totalIncome - totalExpense;

    // DOM Elements
    const incomeEl = document.getElementById("total-income");
    const expenseEl = document.getElementById("total-expense");
    const balanceEl = document.getElementById("total-balance");

    if (incomeEl) {
      incomeEl.textContent = window.DateUtils.formatCurrency(totalIncome);
    }
    if (expenseEl) {
      expenseEl.textContent = window.DateUtils.formatCurrency(totalExpense);
    }
    if (balanceEl) {
      const sign = netBalance < 0 ? "-" : netBalance > 0 ? "+" : "";
      balanceEl.textContent = `${sign}${window.DateUtils.formatCurrency(Math.abs(netBalance))}`;
      
      // Notion minimal colors
      if (netBalance > 0) {
        balanceEl.style.color = "var(--income)";
      } else if (netBalance < 0) {
        balanceEl.style.color = "var(--expense)";
      } else {
        balanceEl.style.color = "var(--text-main)";
      }
    }

    // Render Chart
    if (window.ChartManager && typeof window.ChartManager.renderCategoryChart === "function") {
      const chartItems = Object.keys(expenseByCat).map((catId) => {
        const cat = window.StorageManager.getCategoryById(catId);
        return {
          label: cat.name,
          amount: expenseByCat[catId],
          color: cat.color
        };
      });
      window.ChartManager.renderCategoryChart(chartItems);
    }
  }

  function updateDashboardUI() {
    calculateAndRenderSummary();

    // Update transactions table
    if (window.TransactionsManager && typeof window.TransactionsManager.renderTransactionsTable === "function") {
      window.TransactionsManager.renderTransactionsTable(activeMonthSlug);
    }
  }

  document.addEventListener("DOMContentLoaded", initDashboard);

  window.DashboardManager = {
    initDashboard,
    getActiveMonth: () => activeMonthSlug,
    setMonth,
    updateDashboardUI,
    calculateAndRenderSummary
  };

  // Connect App orchestrator to DashboardManager
  if (window.App) {
    window.App.getCurrentMonth = () => activeMonthSlug || "1405-08";
    window.App.refreshDashboard = updateDashboardUI;
  }
})();
