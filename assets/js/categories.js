/**
 * Category Management Controller & UI Handlers
 */

(function () {
  const PRESET_COLORS = [
    "#e16b5a", "#e89a3c", "#d4b138", "#4dab9a", "#2383e2",
    "#9065b0", "#c15c8a", "#787774", "#4472c4", "#548235"
  ];

  let currentEditingCategoryId = null;
  let activeTabType = "expense";
  let selectedColor = PRESET_COLORS[0];

  function initCategoriesUI() {
    const modalBackdrop = document.getElementById("categories-modal");
    const manageBtn = document.getElementById("manage-categories-btn");
    const closeBtn = document.getElementById("close-categories-modal");
    const categoryForm = document.getElementById("category-edit-form");
    const cancelEditBtn = document.getElementById("cancel-cat-edit-btn");
    const tabExpenseBtn = document.getElementById("cat-tab-expense");
    const tabIncomeBtn = document.getElementById("cat-tab-income");

    if (manageBtn && modalBackdrop) {
      manageBtn.addEventListener("click", () => {
        openModal();
      });
    }

    if (closeBtn && modalBackdrop) {
      closeBtn.addEventListener("click", () => {
        closeModal();
      });
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    if (tabExpenseBtn && tabIncomeBtn) {
      tabExpenseBtn.addEventListener("click", () => {
        activeTabType = "expense";
        tabExpenseBtn.setAttribute("data-active", "true");
        tabIncomeBtn.setAttribute("data-active", "false");
        document.getElementById("cat-type-expense").checked = true;
        renderCategoriesList();
      });

      tabIncomeBtn.addEventListener("click", () => {
        activeTabType = "income";
        tabIncomeBtn.setAttribute("data-active", "true");
        tabExpenseBtn.setAttribute("data-active", "false");
        document.getElementById("cat-type-income").checked = true;
        renderCategoriesList();
      });
    }

    // Color swatches
    renderColorSwatches();

    // Form submit
    if (categoryForm) {
      categoryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveCategoryFromForm();
      });
    }

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => {
        resetCategoryForm();
      });
    }

    // Initial populate of transaction category selector
    populateTransactionCategorySelect();

    // Wire up transaction form type toggle (Expense vs Income)
    const txTypeButtons = document.querySelectorAll(".type-toggle-btn");
    txTypeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        txTypeButtons.forEach((b) => b.setAttribute("data-active", "false"));
        btn.setAttribute("data-active", "true");
        const type = btn.getAttribute("data-type") || "expense";
        populateTransactionCategorySelect(type);
      });
    });
  }

  function openModal() {
    const modal = document.getElementById("categories-modal");
    if (!modal) return;
    modal.classList.add("open");
    resetCategoryForm();
    renderCategoriesList();
  }

  function closeModal() {
    const modal = document.getElementById("categories-modal");
    if (!modal) return;
    modal.classList.remove("open");
    populateTransactionCategorySelect();
    if (window.App && typeof window.App.refreshDashboard === "function") {
      window.App.refreshDashboard();
    }
  }

  function renderColorSwatches() {
    const container = document.getElementById("color-swatches-container");
    if (!container) return;
    container.innerHTML = "";

    PRESET_COLORS.forEach((color, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "color-swatch-btn";
      btn.style.backgroundColor = color;
      btn.setAttribute("data-color", color);
      btn.setAttribute("data-selected", idx === 0 ? "true" : "false");

      btn.addEventListener("click", () => {
        selectedColor = color;
        container.querySelectorAll(".color-swatch-btn").forEach((b) => b.setAttribute("data-selected", "false"));
        btn.setAttribute("data-selected", "true");
      });

      container.appendChild(btn);
    });
  }

  function selectColorSwatch(color) {
    selectedColor = color;
    const container = document.getElementById("color-swatches-container");
    if (!container) return;
    container.querySelectorAll(".color-swatch-btn").forEach((b) => {
      b.setAttribute("data-selected", b.getAttribute("data-color") === color ? "true" : "false");
    });
  }

  function renderCategoriesList() {
    const listEl = document.getElementById("categories-list-container");
    if (!listEl) return;

    const categories = window.StorageManager.getCategories().filter((c) => c.type === activeTabType);

    if (categories.length === 0) {
      listEl.innerHTML = `<div class="empty-state">دسته‌بندی ثبت‌شده‌ای برای این بخش وجود ندارد.</div>`;
      return;
    }

    listEl.innerHTML = categories
      .map((c) => {
        const defaultTag = c.isDefault ? `<span class="tag-badge" style="font-size:10px;">پیش‌فرض</span>` : "";
        return `
          <div class="category-item-row" data-id="${c.id}">
            <div class="category-badge-pill">
              <span class="color-dot" style="background-color: ${c.color};"></span>
              <span>${c.name}</span>
              ${defaultTag}
            </div>
            <div class="category-item-actions">
              <button type="button" class="btn btn-icon edit-cat-btn" title="ویرایش" data-id="${c.id}">ویرایش</button>
              <button type="button" class="btn btn-icon delete-cat-btn" title="حذف" data-id="${c.id}" style="color: var(--expense);">حذف</button>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll(".edit-cat-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        startEditCategory(id);
      });
    });

    listEl.querySelectorAll(".delete-cat-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        handleDeleteCategory(id);
      });
    });
  }

  function startEditCategory(id) {
    const cat = window.StorageManager.getCategoryById(id);
    if (!cat || cat.isDeleted) return;

    currentEditingCategoryId = cat.id;
    document.getElementById("cat-name-input").value = cat.name;
    document.getElementById("cat-form-title").textContent = "ویرایش دسته‌بندی";
    document.getElementById("submit-cat-btn").textContent = "بروزرسانی دسته‌بندی";
    document.getElementById("cancel-cat-edit-btn").style.display = "inline-flex";

    if (cat.type === "income") {
      document.getElementById("cat-type-income").checked = true;
    } else {
      document.getElementById("cat-type-expense").checked = true;
    }

    selectColorSwatch(cat.color);
  }

  function resetCategoryForm() {
    currentEditingCategoryId = null;
    const form = document.getElementById("category-edit-form");
    if (form) form.reset();
    document.getElementById("cat-form-title").textContent = "افزودن دسته‌بندی جدید";
    document.getElementById("submit-cat-btn").textContent = "افزودن دسته";
    document.getElementById("cancel-cat-edit-btn").style.display = "none";
    if (activeTabType === "income") {
      document.getElementById("cat-type-income").checked = true;
    } else {
      document.getElementById("cat-type-expense").checked = true;
    }
    selectColorSwatch(PRESET_COLORS[0]);
  }

  function saveCategoryFromForm() {
    const nameInput = document.getElementById("cat-name-input");
    const name = nameInput.value.trim();
    if (!name) return;

    const type = document.querySelector('input[name="cat-type"]:checked')?.value || activeTabType;

    if (currentEditingCategoryId) {
      window.StorageManager.updateCategory(currentEditingCategoryId, {
        name,
        type,
        color: selectedColor
      });
    } else {
      window.StorageManager.addCategory({
        name,
        type,
        color: selectedColor
      });
    }

    resetCategoryForm();
    renderCategoriesList();
    populateTransactionCategorySelect();
  }

  function handleDeleteCategory(id) {
    const cat = window.StorageManager.getCategoryById(id);
    if (!cat) return;

    const confirmMsg = `آیا از حذف دسته‌بندی «${cat.name}» مطمئن هستید؟\n(تراکنش‌های قدیمی حذف نمی‌شوند و با برچسب حذف‌شده نمایش داده خواهند شد.)`;
    if (!window.confirm(confirmMsg)) return;

    window.StorageManager.deleteCategory(id);
    if (currentEditingCategoryId === id) {
      resetCategoryForm();
    }
    renderCategoriesList();
    populateTransactionCategorySelect();
  }

  function populateTransactionCategorySelect(desiredType) {
    const select = document.getElementById("tx-category");
    if (!select) return;

    const currentType =
      desiredType ||
      document.querySelector(".type-toggle-btn[data-active='true']")?.getAttribute("data-type") ||
      "expense";

    const categories = window.StorageManager.getCategories().filter((c) => c.type === currentType);

    const prevValue = select.value;
    select.innerHTML = `<option value="">انتخاب دسته‌بندی…</option>`;

    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });

    if (categories.some((c) => c.id === prevValue)) {
      select.value = prevValue;
    }
  }

  document.addEventListener("DOMContentLoaded", initCategoriesUI);

  window.CategoriesManager = {
    initCategoriesUI,
    openModal,
    closeModal,
    populateTransactionCategorySelect
  };
})();
