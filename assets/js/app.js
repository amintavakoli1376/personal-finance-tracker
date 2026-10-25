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

  // Setup Mobile Bottom Navigation & Routing
  setupMobileNavigation();

  console.log("Personal Finance Tracker initialized successfully.");
});

function setupMobileNavigation() {
  const navButtons = document.querySelectorAll(".nav-tab-btn");
  const dashboardView = document.getElementById("view-dashboard");
  const transactionsView = document.getElementById("view-transactions");
  const fabBtn = document.getElementById("mobile-add-fab");

  function switchTab(target) {
    navButtons.forEach(btn => {
      btn.setAttribute("data-active", btn.getAttribute("data-target") === target ? "true" : "false");
    });

    if (window.innerWidth < 768) {
      if (target === "dashboard") {
        if (dashboardView) dashboardView.classList.add("active");
        if (transactionsView) transactionsView.classList.remove("active");
      } else if (target === "transactions") {
        if (dashboardView) dashboardView.classList.remove("active");
        if (transactionsView) transactionsView.classList.add("active");
      } else if (target === "categories") {
        if (window.CategoriesManager && typeof window.CategoriesManager.openModal === "function") {
          window.CategoriesManager.openModal();
        }
      } else if (target === "recurring") {
        if (window.RecurringEngine && typeof window.RecurringEngine.openManageModal === "function") {
          window.RecurringEngine.openManageModal();
        }
      }
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      window.location.hash = target;
      switchTab(target);
    });
  });

  // FAB button scrolls to quick-add or opens form
  if (fabBtn) {
    fabBtn.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        // Switch to dashboard and scroll to quick add
        switchTab("dashboard");
        window.location.hash = "dashboard";
      }
      const quickAdd = document.getElementById("quick-add-panel");
      if (quickAdd) {
        quickAdd.scrollIntoView({ behavior: "smooth" });
        const amountInput = document.getElementById("tx-amount");
        if (amountInput) amountInput.focus();
      }
    });
  }

  // Handle initial hash or window resize
  const initialTab = (window.location.hash || "").replace("#", "") || "dashboard";
  switchTab(initialTab);

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      if (dashboardView) dashboardView.classList.add("active");
      if (transactionsView) transactionsView.classList.add("active");
    } else {
      const curTab = (window.location.hash || "").replace("#", "") || "dashboard";
      switchTab(curTab);
    }
  });
}

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
