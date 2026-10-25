/**
 * Recurring Transactions Engine & Monthly Overrides Manager
 */

(function () {
  function initRecurringEngine() {
    setupModals();
    setupAddRuleForm();
  }

  /**
   * Resolves recurring instances for a specific Jalali month (e.g. "1405-08")
   * Respects startMonth, endMonth, and monthlyOverrides (modified / deleted).
   * @param {string} jalaliMonth 
   * @returns {Array<Object>} Virtual Transaction instances
   */
  function getRecurringInstancesForMonth(jalaliMonth) {
    if (!jalaliMonth) return [];

    const rules = window.StorageManager.getRecurringRules();
    const overrides = window.StorageManager.getMonthlyOverrides().filter(
      (o) => o.jalaliMonth === jalaliMonth
    );

    const instances = [];

    rules.forEach((rule) => {
      // Check active range: startMonth <= jalaliMonth <= endMonth
      if (rule.startMonth && rule.startMonth > jalaliMonth) return;
      if (rule.endMonth && rule.endMonth < jalaliMonth) return;

      // Check override
      const override = overrides.find((o) => o.ruleId === rule.id);
      if (override) {
        if (override.status === "deleted") {
          // Instance cancelled for this month
          return;
        }
      }

      // Base properties
      let amount = rule.amount;
      let description = rule.title;
      let categoryId = rule.categoryId;
      let dayOfMonth = rule.dayOfMonth || 1;
      let hasOverride = false;

      if (override && override.status === "modified" && override.overrideData) {
        hasOverride = true;
        if (override.overrideData.amount !== undefined) amount = Number(override.overrideData.amount);
        if (override.overrideData.description) description = override.overrideData.description;
        if (override.overrideData.categoryId) categoryId = override.overrideData.categoryId;
        if (override.overrideData.dayOfMonth) dayOfMonth = Number(override.overrideData.dayOfMonth);
      }

      const dayStr = String(dayOfMonth).padStart(2, "0");
      const jalaliDate = `${jalaliMonth}-${dayStr}`;

      instances.push({
        id: `rec_inst_${rule.id}_${jalaliMonth}`,
        ruleId: rule.id,
        amount: Math.round(amount),
        type: rule.type,
        categoryId: categoryId,
        jalaliDate: jalaliDate,
        jalaliMonth: jalaliMonth,
        description: description,
        isRecurringInstance: true,
        hasOverride: hasOverride,
        createdAt: rule.createdAt
      });
    });

    return instances;
  }

  function setupModals() {
    // Open/Close Recurring Rules Management Modal
    const manageBtn = document.getElementById("manage-recurring-btn");
    const manageModal = document.getElementById("recurring-rules-modal");
    const closeManageBtn = document.getElementById("close-recurring-rules-modal");
    const openAddRuleBtn = document.getElementById("open-add-rule-btn");

    if (manageBtn && manageModal) {
      manageBtn.addEventListener("click", () => {
        openManageModal();
      });
    }

    if (closeManageBtn && manageModal) {
      closeManageBtn.addEventListener("click", () => {
        manageModal.classList.remove("open");
      });
    }

    if (manageModal) {
      manageModal.addEventListener("click", (e) => {
        if (e.target === manageModal) manageModal.classList.remove("open");
      });
    }

    // Add Rule Modal
    const addRuleModal = document.getElementById("add-rule-modal");
    const closeAddRuleBtn = document.getElementById("close-add-rule-modal");
    const cancelAddRuleBtn = document.getElementById("cancel-add-rule-btn");

    if (openAddRuleBtn && addRuleModal) {
      openAddRuleBtn.addEventListener("click", () => {
        openAddRuleModal();
      });
    }

    if (closeAddRuleBtn && addRuleModal) {
      closeAddRuleBtn.addEventListener("click", () => {
        addRuleModal.classList.remove("open");
      });
    }

    if (cancelAddRuleBtn && addRuleModal) {
      cancelAddRuleBtn.addEventListener("click", () => {
        addRuleModal.classList.remove("open");
      });
    }

    if (addRuleModal) {
      addRuleModal.addEventListener("click", (e) => {
        if (e.target === addRuleModal) addRuleModal.classList.remove("open");
      });
    }
  }

  function openManageModal() {
    const modal = document.getElementById("recurring-rules-modal");
    if (!modal) return;
    renderRulesList();
    modal.classList.add("open");
  }

  function openAddRuleModal() {
    const modal = document.getElementById("add-rule-modal");
    if (!modal) return;

    // Populate category dropdown according to default radio
    populateRuleCategorySelect("expense");

    // Populate month options for start/end
    populateMonthOptionsForRules();

    modal.classList.add("open");
  }

  function populateRuleCategorySelect(type) {
    const select = document.getElementById("rule-category");
    if (!select) return;

    const categories = window.StorageManager.getCategories().filter((c) => c.type === type);
    select.innerHTML = `<option value="">انتخاب دسته‌بندی…</option>`;
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  }

  function populateMonthOptionsForRules() {
    const startSelect = document.getElementById("rule-start-month");
    const endSelect = document.getElementById("rule-end-month");
    if (!startSelect || !endSelect) return;

    const options = window.DateUtils.generateMonthOptions(2, 2);
    const currentMonth = window.DateUtils.getCurrentJalaliMonthSlug();

    const html = options
      .map((opt) => `<option value="${opt.slug}" ${opt.slug === currentMonth ? "selected" : ""}>${opt.label}</option>`)
      .join("");

    startSelect.innerHTML = html;
    endSelect.innerHTML = `<option value="">نامحدود (بدون پایان)</option>` + html;
  }

  function setupAddRuleForm() {
    const form = document.getElementById("add-rule-form");
    if (!form) return;

    // Type change listener in rule form
    const typeRadios = document.querySelectorAll('input[name="rule-type"]');
    typeRadios.forEach((r) => {
      r.addEventListener("change", () => {
        populateRuleCategorySelect(r.value);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("rule-title").value.trim();
      const amount = Number(document.getElementById("rule-amount").value);
      const type = document.querySelector('input[name="rule-type"]:checked')?.value || "expense";
      const categoryId = document.getElementById("rule-category").value;
      const dayOfMonth = Number(document.getElementById("rule-day").value);
      const startMonth = document.getElementById("rule-start-month").value;
      const endMonth = document.getElementById("rule-end-month").value || null;

      if (!title || !amount || amount <= 0 || !categoryId || !startMonth) {
        alert("لطفاً اطلاعات لازم را به صورت کامل وارد کنید.");
        return;
      }

      window.StorageManager.addRecurringRule({
        title,
        amount,
        type,
        categoryId,
        dayOfMonth,
        startMonth,
        endMonth
      });

      form.reset();
      document.getElementById("add-rule-modal").classList.remove("open");
      renderRulesList();

      // Refresh dashboard to display newly created recurring instances
      if (window.App && typeof window.App.refreshDashboard === "function") {
        window.App.refreshDashboard();
      }
    });
  }

  function renderRulesList() {
    const container = document.getElementById("recurring-rules-list");
    if (!container) return;

    const rules = window.StorageManager.getRecurringRules();
    if (rules.length === 0) {
      container.innerHTML = `<div class="empty-state">هنوز هیچ قانون تراکنش دوره‌ای ثبت نشده است.</div>`;
      return;
    }

    container.innerHTML = rules
      .map((rule) => {
        const cat = window.StorageManager.getCategoryById(rule.categoryId);
        const formattedAmount = window.DateUtils ? window.DateUtils.formatCurrency(rule.amount) : rule.amount;
        const typeBadge =
          rule.type === "income"
            ? `<span class="tag-badge" style="color:var(--income); background:var(--income-bg);">درآمد</span>`
            : `<span class="tag-badge" style="color:var(--expense); background:var(--expense-bg);">هزینه</span>`;

        const dayFa = window.DateUtils ? window.DateUtils.toPersianDigits(rule.dayOfMonth) : rule.dayOfMonth;
        const endDesc = rule.endMonth
          ? `تا ${window.DateUtils ? window.DateUtils.toPersianDigits(rule.endMonth) : rule.endMonth}`
          : "بدون پایان";

        return `
          <div class="category-item-row" data-id="${rule.id}" style="padding:12px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:700;">${escapeHtml(rule.title)}</span>
                ${typeBadge}
                <span class="tag-badge">روز ${dayFa} ماه</span>
              </div>
              <div style="font-size:12px; color:var(--text-muted); display:flex; gap:10px;">
                <span>دسته‌بندی: ${escapeHtml(cat.name)}</span>
                <span>بازه: از ${window.DateUtils ? window.DateUtils.toPersianDigits(rule.startMonth) : rule.startMonth} (${endDesc})</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-weight:700; ${rule.type === "income" ? "color:var(--income);" : "color:var(--expense);"}">${formattedAmount}</span>
              <button type="button" class="btn btn-icon delete-rule-btn" data-id="${rule.id}" style="color:var(--expense);" title="حذف قانون پایه">حذف</button>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".delete-rule-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        deleteBaseRuleWithConfirm(id);
      });
    });
  }

  function deleteBaseRuleWithConfirm(ruleId) {
    const rules = window.StorageManager.getRecurringRules();
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    if (
      !window.confirm(
        `آیا از حذف کامل قانون تکرار «${rule.title}» مطمئن هستید؟\n(این قانون در تمام ماه‌های آینده حذف خواهد شد.)`
      )
    ) {
      return;
    }

    window.StorageManager.deleteRecurringRule(ruleId);
    renderRulesList();

    if (window.App && typeof window.App.refreshDashboard === "function") {
      window.App.refreshDashboard();
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initRecurringEngine);
  }

  window.RecurringEngine = {
    initRecurringEngine,
    getRecurringInstancesForMonth,
    openManageModal,
    openAddRuleModal,
    deleteBaseRuleWithConfirm
  };
})();
