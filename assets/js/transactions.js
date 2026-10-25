/**
 * Transaction Management Controller & Table Renderer
 */

(function () {
  let currentEditingTxId = null;
  let currentEditingIsRecurring = false;
  let currentEditingRuleId = null;

  function initTransactions() {
    setupDateDefaults();
    setupAddTransactionForm();
    setupEditTransactionModal();
    renderTransactionsTable();
  }

  function setupDateDefaults() {
    const dateInput = document.getElementById("tx-date");
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.value = today;
    }
  }

  function setupAddTransactionForm() {
    const form = document.getElementById("transaction-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const amountInput = document.getElementById("tx-amount");
      const categorySelect = document.getElementById("tx-category");
      const dateInput = document.getElementById("tx-date");
      const descInput = document.getElementById("tx-desc");

      const activeTypeBtn = document.querySelector(".type-toggle-btn[data-active='true']");
      const type = activeTypeBtn ? activeTypeBtn.getAttribute("data-type") : "expense";

      const amount = Number(amountInput.value);
      if (!amount || amount <= 0) {
        alert("لطفاً مبلغی معتبر و بزرگ‌تر از صفر وارد کنید.");
        amountInput.focus();
        return;
      }

      if (!categorySelect.value) {
        alert("لطفاً یک دسته‌بندی انتخاب کنید.");
        categorySelect.focus();
        return;
      }

      if (!dateInput.value) {
        alert("لطفاً تاریخ تراکنش را مشخص کنید.");
        dateInput.focus();
        return;
      }

      // Add transaction via StorageManager
      const newTx = window.StorageManager.addTransaction({
        amount,
        type,
        categoryId: categorySelect.value,
        date: dateInput.value,
        description: descInput.value
      });

      // Clear description and amount, keep category and date for fast repeat entries
      amountInput.value = "";
      descInput.value = "";
      amountInput.focus();

      // If added transaction is in currently selected month, or update current month
      if (window.App && typeof window.App.onTransactionChanged === "function") {
        window.App.onTransactionChanged(newTx);
      } else {
        renderTransactionsTable();
      }
    });
  }

  function setupEditTransactionModal() {
    const modal = document.getElementById("edit-tx-modal");
    const closeBtn = document.getElementById("close-edit-tx-modal");
    const cancelBtn = document.getElementById("cancel-edit-tx-btn");
    const form = document.getElementById("edit-tx-form");

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => closeModal());
    }
    if (cancelBtn && modal) {
      cancelBtn.addEventListener("click", () => closeModal());
    }
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveEditedTransaction();
      });
    }
  }

  function openEditModal(txId, isRecurring = false, ruleId = null) {
    let tx = null;
    currentEditingIsRecurring = isRecurring;
    currentEditingRuleId = ruleId;

    if (isRecurring) {
      const currentMonth = window.App ? window.App.getCurrentMonth() : "1405-08";
      const instances = window.RecurringEngine ? window.RecurringEngine.getRecurringInstancesForMonth(currentMonth) : [];
      tx = instances.find(i => i.id === txId);
    } else {
      tx = window.StorageManager.getTransactions().find((t) => t.id === txId);
    }

    if (!tx) return;

    currentEditingTxId = tx.id;
    const modal = document.getElementById("edit-tx-modal");
    if (!modal) return;

    // Notice text in modal header for recurring
    const modalHeaderTitle = modal.querySelector(".modal-header h3");
    if (modalHeaderTitle) {
      modalHeaderTitle.textContent = isRecurring ? "ویرایش تراکنش دوره‌ای (استثنای این ماه)" : "ویرایش تراکنش";
    }

    document.getElementById("edit-tx-amount").value = tx.amount;
    document.getElementById("edit-tx-date").value = tx.date || (tx.jalaliDate ? "" : "");
    if (!document.getElementById("edit-tx-date").value) {
      // If recurring instance, use today or month default
      document.getElementById("edit-tx-date").value = new Date().toISOString().split("T")[0];
    }
    document.getElementById("edit-tx-desc").value = tx.description || "";

    if (tx.type === "income") {
      document.getElementById("edit-tx-type-income").checked = true;
    } else {
      document.getElementById("edit-tx-type-expense").checked = true;
    }

    // Disable type switch for recurring instances to preserve rule integrity
    const typeRadios = document.querySelectorAll('input[name="edit-tx-type"]');
    typeRadios.forEach(r => r.disabled = isRecurring);

    // Populate category dropdown for modal
    populateEditCategorySelect(tx.type, tx.categoryId);

    // Watch type change in edit form
    typeRadios.forEach((r) => {
      r.onchange = () => {
        const selectedType = document.querySelector('input[name="edit-tx-type"]:checked')?.value || "expense";
        populateEditCategorySelect(selectedType);
      };
    });

    modal.classList.add("open");
  }

  function populateEditCategorySelect(type, selectedCatId) {
    const select = document.getElementById("edit-tx-category");
    if (!select) return;

    const categories = window.StorageManager.getCategories().filter((c) => c.type === type);
    select.innerHTML = `<option value="">انتخاب دسته‌بندی…</option>`;

    let foundSelected = false;
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (cat.id === selectedCatId) {
        opt.selected = true;
        foundSelected = true;
      }
      select.appendChild(opt);
    });

    if (selectedCatId && !foundSelected) {
      const deletedCat = window.StorageManager.getCategoryById(selectedCatId);
      const opt = document.createElement("option");
      opt.value = deletedCat.id;
      opt.textContent = `[${deletedCat.name}]`;
      opt.selected = true;
      select.appendChild(opt);
    }
  }

  function closeModal() {
    const modal = document.getElementById("edit-tx-modal");
    if (!modal) return;
    modal.classList.remove("open");
    currentEditingTxId = null;
    currentEditingIsRecurring = false;
    currentEditingRuleId = null;
  }

  function saveEditedTransaction() {
    if (!currentEditingTxId) return;

    const amount = Number(document.getElementById("edit-tx-amount").value);
    const type = document.querySelector('input[name="edit-tx-type"]:checked')?.value || "expense";
    const categoryId = document.getElementById("edit-tx-category").value;
    const date = document.getElementById("edit-tx-date").value;
    const description = document.getElementById("edit-tx-desc").value;

    if (!amount || amount <= 0) {
      alert("لطفاً مبلغی معتبر و بزرگ‌تر از صفر وارد کنید.");
      return;
    }
    if (!categoryId) {
      alert("لطفاً یک دسته‌بندی انتخاب کنید.");
      return;
    }

    if (currentEditingIsRecurring && currentEditingRuleId) {
      const currentMonth = window.App ? window.App.getCurrentMonth() : "1405-08";
      // Save as Monthly Override
      window.StorageManager.setMonthlyOverride(currentEditingRuleId, currentMonth, {
        status: "modified",
        overrideData: {
          amount,
          categoryId,
          description
        }
      });
      closeModal();
      if (window.App && typeof window.App.refreshDashboard === "function") {
        window.App.refreshDashboard();
      }
      return;
    }

    if (!date) {
      alert("لطفاً تاریخ را مشخص کنید.");
      return;
    }

    const updated = window.StorageManager.updateTransaction(currentEditingTxId, {
      amount,
      type,
      categoryId,
      date,
      description
    });

    closeModal();

    if (window.App && typeof window.App.onTransactionChanged === "function") {
      window.App.onTransactionChanged(updated);
    } else {
      renderTransactionsTable();
    }
  }

  function deleteTransactionWithConfirm(txId, isRecurring = false, ruleId = null) {
    const currentMonth = window.App ? window.App.getCurrentMonth() : "1405-08";

    if (isRecurring && ruleId) {
      const instances = window.RecurringEngine ? window.RecurringEngine.getRecurringInstancesForMonth(currentMonth) : [];
      const tx = instances.find(i => i.id === txId);
      const title = tx ? tx.description : "تراکنش دوره‌ای";
      const formattedAmount = tx && window.DateUtils ? window.DateUtils.formatCurrency(tx.amount) : "";

      const msg = `تراکنش «${title}» (${formattedAmount}) یک تراکنش دوره‌ای است.\n\nآیا می‌خواهید این تراکنش فقط برای ماه جاری (${currentMonth}) حذف شود؟\n(قانون پایه برای ماه‌های دیگر حفظ خواهد شد.)`;

      if (!window.confirm(msg)) return;

      window.StorageManager.setMonthlyOverride(ruleId, currentMonth, {
        status: "deleted"
      });

      if (window.App && typeof window.App.refreshDashboard === "function") {
        window.App.refreshDashboard();
      }
      return;
    }

    const tx = window.StorageManager.getTransactions().find((t) => t.id === txId);
    if (!tx) return;

    const formattedAmount = window.DateUtils ? window.DateUtils.formatCurrency(tx.amount) : `${tx.amount} تومان`;
    const label = tx.description ? `«${tx.description}» به مبلغ ${formattedAmount}` : `به مبلغ ${formattedAmount}`;

    if (!window.confirm(`آیا از حذف این تراکنش ${label} مطمئن هستید؟`)) {
      return;
    }

    window.StorageManager.deleteTransaction(txId);

    if (window.App && typeof window.App.onTransactionChanged === "function") {
      window.App.onTransactionChanged(null);
    } else {
      renderTransactionsTable();
    }
  }

  function renderTransactionsTable(monthSlug) {
    const tbody = document.getElementById("transactions-table-body");
    if (!tbody) return;

    const currentMonth = monthSlug || (window.App ? window.App.getCurrentMonth() : "1405-08");
    const regularTxs = window.StorageManager.getTransactionsByMonth(currentMonth);
    const recurringInstances = window.RecurringEngine
      ? window.RecurringEngine.getRecurringInstancesForMonth(currentMonth)
      : [];

    const transactions = [...regularTxs, ...recurringInstances];

    if (transactions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">هنوز تراکنشی در این ماه ثبت نشده است.</td></tr>`;
      return;
    }

    tbody.innerHTML = transactions
      .map((tx) => {
        const cat = window.StorageManager.getCategoryById(tx.categoryId);
        const isIncome = tx.type === "income";
        const sign = isIncome ? "+" : "-";
        const amountClass = isIncome ? "amount-income" : "amount-expense";
        const formattedAmount = window.DateUtils ? window.DateUtils.formatCurrency(tx.amount) : tx.amount;
        const jalaliDateDisplay = tx.jalaliDate
          ? window.DateUtils
            ? window.DateUtils.toPersianDigits(tx.jalaliDate)
            : tx.jalaliDate
          : tx.date;

        let recurringBadge = "";
        if (tx.isRecurringInstance) {
          if (tx.hasOverride) {
            recurringBadge = `<span class="tag-badge recurring" style="background:rgba(232, 154, 60, 0.15); color:#c57a22; border-color:rgba(232, 154, 60, 0.3);" title="تراکنش دوره‌ای (ویرایش‌شده برای این ماه)">دوره‌ای (ویرایش این ماه)</span>`;
          } else {
            recurringBadge = `<span class="tag-badge recurring" title="تولیدشده از قانون تکرار ماهانه">دوره‌ای</span>`;
          }
        }

        const isRec = tx.isRecurringInstance ? "true" : "false";

        return `
          <tr data-id="${tx.id}" data-is-recurring="${isRec}" data-rule-id="${tx.ruleId || ''}">
            <td style="white-space: nowrap; font-size: 12px; color: var(--text-muted);">${jalaliDateDisplay}</td>
            <td style="font-weight: 500;">
              ${escapeHtml(tx.description || "بدون شرح")}
              ${recurringBadge}
            </td>
            <td>
              <span class="category-badge-pill" style="font-size: 12px;">
                <span class="color-dot" style="background-color: ${cat.color};"></span>
                <span>${escapeHtml(cat.name)}</span>
              </span>
            </td>
            <td class="amount-col ${amountClass}">
              ${sign}${formattedAmount}
            </td>
            <td>
              <div style="display: flex; gap: 4px;">
                <button type="button" class="btn btn-icon edit-tx-btn" data-id="${tx.id}" data-is-recurring="${isRec}" data-rule-id="${tx.ruleId || ''}" title="ویرایش">ویرایش</button>
                <button type="button" class="btn btn-icon delete-tx-btn" data-id="${tx.id}" data-is-recurring="${isRec}" data-rule-id="${tx.ruleId || ''}" title="حذف" style="color: var(--expense);">حذف</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // Attach row events
    tbody.querySelectorAll(".edit-tx-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const isRec = btn.getAttribute("data-is-recurring") === "true";
        const ruleId = btn.getAttribute("data-rule-id");
        openEditModal(id, isRec, ruleId);
      });
    });

    tbody.querySelectorAll(".delete-tx-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const isRec = btn.getAttribute("data-is-recurring") === "true";
        const ruleId = btn.getAttribute("data-rule-id");
        deleteTransactionWithConfirm(id, isRec, ruleId);
      });
    });
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

  document.addEventListener("DOMContentLoaded", initTransactions);

  window.TransactionsManager = {
    initTransactions,
    renderTransactionsTable,
    openEditModal,
    deleteTransactionWithConfirm
  };
})();
