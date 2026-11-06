const STORAGE_KEY = "dompetku-transactions-v1";
const THEME_STORAGE_KEY = "dompetku-theme";
const PREFERENCES_STORAGE_KEY = "dompetku-preferences-v1";

const categories = {
  income: [
    { name: "Gaji", icon: "salary", color: "#7a62e8" },
    { name: "Freelance", icon: "work", color: "#4b9ddd" },
    { name: "Investasi", icon: "chart", color: "#46b887" },
    { name: "Lainnya", icon: "tag", color: "#e5aa54" },
  ],
  expense: [
    { name: "Makanan", icon: "food", color: "#f29a55" },
    { name: "Transportasi", icon: "transport", color: "#5c9fe5" },
    { name: "Belanja", icon: "shopping", color: "#a17ce5" },
    { name: "Tagihan", icon: "receipt", color: "#e47777" },
    { name: "Hiburan", icon: "media", color: "#e5b34d" },
    { name: "Kesehatan", icon: "health", color: "#4bbd9b" },
    { name: "Pendidikan", icon: "book", color: "#5d84d9" },
    { name: "Lainnya", icon: "tag", color: "#9ca4b4" },
  ],
};

const defaultPreferences = {
  theme: "system",
  accent: "purple",
  density: "comfortable",
  hideBalances: false,
  defaultType: "expense",
  monthlyBudget: 0,
  categoryBudgets: {},
  savingsGoal: 0,
  customCategories: { income: [], expense: [] },
};

const elements = {
  todayLabel: document.querySelector("#todayLabel"),
  balanceValue: document.querySelector("#balanceValue"),
  incomeValue: document.querySelector("#incomeValue"),
  expenseValue: document.querySelector("#expenseValue"),
  savingsValue: document.querySelector("#savingsValue"),
  savingsPercent: document.querySelector("#savingsPercent"),
  categoryMonthLabel: document.querySelector("#categoryMonthLabel"),
  cashflowChart: document.querySelector("#cashflowChart"),
  categoryContent: document.querySelector("#categoryContent"),
  monthFilter: document.querySelector("#monthFilter"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  transactionRows: document.querySelector("#transactionRows"),
  emptyState: document.querySelector("#emptyState"),
  resultsCount: document.querySelector("#resultsCount"),
  budgetOverview: document.querySelector("#budgetOverview"),
  savingsOverview: document.querySelector("#savingsOverview"),
  dialog: document.querySelector("#transactionDialog"),
  form: document.querySelector("#transactionForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  transactionId: document.querySelector("#transactionId"),
  descriptionInput: document.querySelector("#descriptionInput"),
  amountInput: document.querySelector("#amountInput"),
  dateInput: document.querySelector("#dateInput"),
  categoryInput: document.querySelector("#categoryInput"),
  noteInput: document.querySelector("#noteInput"),
  recurrenceInput: document.querySelector("#recurrenceInput"),
  formError: document.querySelector("#formError"),
  settingsDialog: document.querySelector("#settingsDialog"),
  themeSelect: document.querySelector("#themeSelect"),
  accentSelect: document.querySelector("#accentSelect"),
  densitySelect: document.querySelector("#densitySelect"),
  hideBalances: document.querySelector("#hideBalances"),
  defaultTypeSelect: document.querySelector("#defaultTypeSelect"),
  monthlyBudgetInput: document.querySelector("#monthlyBudgetInput"),
  savingsGoalInput: document.querySelector("#savingsGoalInput"),
  categoryBudgetInputs: document.querySelector("#categoryBudgetInputs"),
  customCategoryName: document.querySelector("#customCategoryName"),
  customCategoryType: document.querySelector("#customCategoryType"),
  customCategoryList: document.querySelector("#customCategoryList"),
  backupFileInput: document.querySelector("#backupFileInput"),
  calculatorDialog: document.querySelector("#calculatorDialog"),
  calculatorDisplay: document.querySelector("#calculatorDisplay"),
  sortFilter: document.querySelector("#sortFilter"),
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const shortCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });

let transactions = loadTransactions();
let preferences = loadPreferences();
let lastDeletedTransaction = null;
let toastTimer;
let recurringTransactionCount = 0;

const categoryIconPaths = {
  salary: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 3 2 6-7M16 6h4v4"/>',
  food: '<path d="M4 3v8M7 3v8M4 7h3M5.5 11v10M15 3v18M15 3c3 2 4 5 4 9h-4"/>',
  transport: '<path d="m5 11 2-6h10l2 6M4 11h16v7H4zM7 18v2M17 18v2M7 14h.01M17 14h.01"/>',
  shopping: '<path d="M4 8h16l-1 13H5L4 8ZM9 8a3 3 0 0 1 6 0"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6M9 16h3"/>',
  media: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  health: '<path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"/><path d="M9 12h6M12 9v6"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4zM20 4h-4a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h4z"/>',
  tag: '<path d="M20 13 13 20 3 10V4h6zM7.5 7.5h.01"/>',
};

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isValidTransaction(item) {
  return (
    item &&
    typeof item.id === "string" &&
    (item.type === "income" || item.type === "expense") &&
    typeof item.description === "string" &&
    typeof item.category === "string" &&
    Number.isSafeInteger(item.amount) &&
    item.amount > 0 &&
    typeof item.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
    (item.note === undefined || (typeof item.note === "string" && item.note.length <= 200)) &&
    (item.recurrence === undefined || ["none", "weekly", "monthly"].includes(item.recurrence)) &&
    (item.recurrenceParentId === undefined || typeof item.recurrenceParentId === "string")
  );
}

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isValidTransaction)) {
      throw new Error("Format data transaksi tidak sesuai.");
    }
    return parsed
      .filter((transaction) => !transaction.id.startsWith("demo-"))
      .map((transaction) => ({ recurrence: "none", note: "", ...transaction }));
  } catch (error) {
    window.setTimeout(() => {
      showToast(
        error instanceof SyntaxError || error.message === "Format data transaksi tidak sesuai."
          ? "Data transaksi tersimpan tidak dapat dibaca. Mulai dengan catatan kosong."
          : "Penyimpanan browser tidak tersedia. Perubahan hanya tersimpan sementara.",
        "error",
      );
    }, 0);
    return [];
  }
}

function loadPreferences() {
  try {
    const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return normalizePreferences(parsed);
    }

    const legacyTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return { ...defaultPreferences, theme: legacyTheme === "light" || legacyTheme === "dark" ? legacyTheme : "system" };
  } catch {
    window.setTimeout(() => showToast("Pengaturan tidak dapat dibaca. Pengaturan bawaan digunakan.", "error"), 0);
    return { ...defaultPreferences, categoryBudgets: {}, customCategories: { income: [], expense: [] } };
  }
}

function normalizePreferences(value) {
  const parsed = value && typeof value === "object" ? value : {};
  const customCategories = { income: [], expense: [] };
  for (const type of ["income", "expense"]) {
    const source = parsed.customCategories?.[type];
    if (Array.isArray(source)) {
      customCategories[type] = source
        .filter((name) => typeof name === "string")
        .map((name) => name.trim().slice(0, 24))
        .filter((name, index, list) => name && list.indexOf(name) === index)
        .slice(0, 40);
    }
  }

  const categoryBudgets = {};
  if (parsed.categoryBudgets && typeof parsed.categoryBudgets === "object") {
    Object.entries(parsed.categoryBudgets).forEach(([name, amount]) => {
      if (typeof name === "string" && Number.isSafeInteger(amount) && amount > 0) {
        categoryBudgets[name] = amount;
      }
    });
  }

  return {
    ...defaultPreferences,
    ...parsed,
    theme: ["system", "light", "dark"].includes(parsed.theme) ? parsed.theme : "system",
    accent: ["purple", "blue", "green"].includes(parsed.accent) ? parsed.accent : "purple",
    density: parsed.density === "compact" ? "compact" : "comfortable",
    hideBalances: parsed.hideBalances === true,
    defaultType: parsed.defaultType === "income" ? "income" : "expense",
    monthlyBudget: Number.isSafeInteger(parsed.monthlyBudget) && parsed.monthlyBudget > 0 ? parsed.monthlyBudget : 0,
    savingsGoal: Number.isSafeInteger(parsed.savingsGoal) && parsed.savingsGoal > 0 ? parsed.savingsGoal : 0,
    categoryBudgets,
    customCategories,
  };
}

function getCategoryList(type) {
  if (!categories[type]) {
    return [];
  }
  const custom = (preferences.customCategories[type] || []).map((name, index) => ({
    name,
    icon: "tag",
    color: ["#6e8fe8", "#bd75b4", "#53a99a", "#ce895c"][index % 4],
  }));
  return [...categories[type], ...custom];
}

function savePreferences(notify = false) {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    if (notify) {
      showToast("Pengaturan tidak dapat disimpan di browser ini.", "error");
    }
    return false;
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch {
    showToast("Penyimpanan browser gagal. Perubahan hanya tersedia sementara.", "error");
    return false;
  }
}

function showToast(message, type = "success") {
  let toast = document.querySelector("#appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.remove("has-action");
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function formatCurrency(value) {
  return currencyFormatter.format(value).replace(/\s/g, "");
}

function formatShortCurrency(value) {
  return `Rp${shortCurrencyFormatter.format(value)}`;
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getCategory(type, name) {
  const list = getCategoryList(type);
  return list.find((item) => item.name === name) || list[list.length - 1];
}

function renderCategoryIcon(category) {
  const path = categoryIconPaths[category.icon] || categoryIconPaths.tag;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function getSelectedMonth() {
  const [year, month] = elements.monthFilter.value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function getMonthlyTransactions(date) {
  const key = monthKey(date);
  return transactions.filter((transaction) => transaction.date.slice(0, 7) === key);
}

function renderSummary() {
  const selectedMonth = getSelectedMonth();
  const monthly = getMonthlyTransactions(selectedMonth);
  const income = monthly
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = monthly
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = income - expense;
  const savingsRate = income ? Math.round((balance / income) * 100) : 0;

  elements.balanceValue.textContent = formatCurrency(balance);
  elements.incomeValue.textContent = formatCurrency(income);
  elements.expenseValue.textContent = formatCurrency(expense);
  elements.savingsValue.textContent = formatCurrency(balance);
  elements.savingsPercent.textContent = `${savingsRate}%`;
  elements.categoryMonthLabel.textContent = monthFormatter.format(selectedMonth);
  renderTargets(monthly, expense, balance);
}

function renderProgress(label, value, limit, type) {
  const percentage = Math.min(Math.round((value / limit) * 100), 100);
  const status = type === "budget" ? (value > limit ? "is-over" : "") : "";
  return `
    <div class="progress-label">
      <span>${escapeHTML(label)}</span>
      <span class="progress-values"><strong>${escapeHTML(formatCurrency(value))}</strong> / ${escapeHTML(formatCurrency(limit))}</span>
    </div>
    <div class="progress-track ${status}" role="progressbar" aria-label="${escapeHTML(label)}" aria-valuenow="${Math.min(value, limit)}" aria-valuemin="0" aria-valuemax="${limit}">
      <span style="width:${percentage}%"></span>
    </div>`;
}

function renderTargets(monthly, expense, balance) {
  const overallBudget = preferences.monthlyBudget;
  const categoryTotals = new Map();
  monthly
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      categoryTotals.set(transaction.category, (categoryTotals.get(transaction.category) || 0) + transaction.amount);
    });

  const categoryRows = Object.entries(preferences.categoryBudgets)
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => renderProgress(name, categoryTotals.get(name) || 0, amount, "budget"));

  elements.budgetOverview.innerHTML = `
    ${
      overallBudget
        ? renderProgress("Pengeluaran bulan ini", expense, overallBudget, "budget")
        : '<p class="target-empty">Atur batas pengeluaran bulanan di pengaturan.</p>'
    }
    ${categoryRows.length ? `<div class="category-progress-list">${categoryRows.join("")}</div>` : ""}
    ${overallBudget && expense > overallBudget ? '<p class="budget-warning">Pengeluaran sudah melewati batas.</p>' : ""}
  `;

  const savedAmount = Math.max(balance, 0);
  elements.savingsOverview.innerHTML = preferences.savingsGoal
    ? `${renderProgress("Tabungan bersih bulan ini", savedAmount, preferences.savingsGoal, "savings")}
      <p class="target-caption">${escapeHTML(formatCurrency(Math.max(preferences.savingsGoal - savedAmount, 0)))} lagi untuk mencapai target.</p>`
    : '<p class="target-empty">Atur target tabungan bulanan di pengaturan.</p>';
}

function renderChart() {
  const selectedMonth = getSelectedMonth();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 5 + index, 1);
    const monthTransactions = getMonthlyTransactions(date);
    return {
      date,
      income: monthTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      expense: monthTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    };
  });
  const maximum = Math.max(...months.map((month) => Math.max(month.income, month.expense)), 1);
  const axis = [maximum, maximum * 0.66, maximum * 0.33, 0];

  elements.cashflowChart.innerHTML = `
    <div class="chart-axis" aria-hidden="true">
      ${axis.map((value) => `<span>${value ? escapeHTML(formatShortCurrency(value)) : "0"}</span>`).join("")}
    </div>
    <div class="chart-plot">
      <i class="chart-gridline"></i><i class="chart-gridline"></i><i class="chart-gridline"></i><i class="chart-gridline"></i>
      ${months
        .map((month) => {
          const incomeHeight = month.income ? Math.max((month.income / maximum) * 100, 3) : 0;
          const expenseHeight = month.expense ? Math.max((month.expense / maximum) * 100, 3) : 0;
          const label = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(month.date);
          const fullLabel = monthFormatter.format(month.date);
          return `
            <div class="chart-month" aria-label="${escapeHTML(
              `${fullLabel}: pemasukan ${formatCurrency(month.income)}, pengeluaran ${formatCurrency(month.expense)}`,
            )}">
              <div class="chart-bars">
                <span class="chart-bar chart-bar-income" style="height:${incomeHeight}%" data-tooltip="Masuk ${escapeHTML(formatShortCurrency(month.income))}"></span>
                <span class="chart-bar chart-bar-expense" style="height:${expenseHeight}%" data-tooltip="Keluar ${escapeHTML(formatShortCurrency(month.expense))}"></span>
              </div>
              <span class="chart-month-label">${escapeHTML(label)}</span>
            </div>`;
        })
        .join("")}
    </div>`;
}

function renderCategories() {
  const monthly = getMonthlyTransactions(getSelectedMonth()).filter(
    (transaction) => transaction.type === "expense",
  );
  const total = monthly.reduce((sum, transaction) => sum + transaction.amount, 0);

  if (!total) {
    elements.categoryContent.innerHTML = '<p class="category-empty">Belum ada pengeluaran bulan ini.</p>';
    return;
  }

  const totals = new Map();
  monthly.forEach((transaction) => {
    totals.set(transaction.category, (totals.get(transaction.category) || 0) + transaction.amount);
  });
  const entries = [...totals.entries()]
    .map(([name, amount]) => ({ name, amount, color: getCategory("expense", name).color }))
    .sort((first, second) => second.amount - first.amount);
  const shown = entries.slice(0, 4);
  const remaining = entries.slice(4).reduce((sum, entry) => sum + entry.amount, 0);
  if (remaining) {
    shown.push({ name: "Kategori lain", amount: remaining, color: "#9ca4b4" });
  }

  let progress = 0;
  const gradient = shown
    .map((entry) => {
      const start = progress;
      progress += (entry.amount / total) * 100;
      return `${entry.color} ${start}% ${progress}%`;
    })
    .join(", ");

  elements.categoryContent.innerHTML = `
    <div class="donut-chart" style="background:conic-gradient(${gradient})" role="img" aria-label="Total pengeluaran ${formatCurrency(total)}">
      <div class="donut-center"><strong>${escapeHTML(formatShortCurrency(total))}</strong><span>Total keluar</span></div>
    </div>
    <div class="category-legend">
      ${shown
        .map(
          (entry) => `
            <div class="category-legend-row">
              <i class="category-swatch" style="background:${entry.color}"></i>
              <span class="category-name">${escapeHTML(entry.name)}</span>
              <span class="category-amount">${escapeHTML(formatShortCurrency(entry.amount))}</span>
            </div>`,
        )
        .join("")}
    </div>`;
}

function getFilteredTransactions() {
  const key = elements.monthFilter.value;
  const search = elements.searchInput.value.trim().toLocaleLowerCase("id-ID");
  const type = elements.typeFilter.value;
  const category = elements.categoryFilter.value;

  const sort = elements.sortFilter.value;
  return transactions
    .filter((transaction) => transaction.date.startsWith(key))
    .filter((transaction) => type === "all" || transaction.type === type)
    .filter((transaction) => category === "all" || transaction.category === category)
    .filter((transaction) => {
      const searchable = `${transaction.description} ${transaction.category} ${transaction.note || ""}`.toLocaleLowerCase("id-ID");
      return searchable.includes(search);
    })
    .sort((first, second) => {
      if (sort === "date-asc") {
        return first.date.localeCompare(second.date) || first.id.localeCompare(second.id);
      }
      if (sort === "amount-desc") {
        return second.amount - first.amount || second.date.localeCompare(first.date);
      }
      if (sort === "amount-asc") {
        return first.amount - second.amount || second.date.localeCompare(first.date);
      }
      if (sort === "name-asc") {
        return first.description.localeCompare(second.description, "id") || second.date.localeCompare(first.date);
      }
      return second.date.localeCompare(first.date) || second.id.localeCompare(first.id);
    });
}

function renderTransactions() {
  const filtered = getFilteredTransactions();
  elements.transactionRows.innerHTML = filtered
    .map((transaction) => {
      const category = getCategory(transaction.type, transaction.category);
      const income = transaction.type === "income";
      const detailLabel = income ? "Pemasukan" : "Pengeluaran";
      const metaLabel = transaction.note || (transaction.recurrenceParentId ? "Transaksi berulang" : detailLabel);
      return `
        <tr>
          <td>
            <div class="transaction-name">
              <span class="transaction-icon" aria-hidden="true" style="--category-color:${category.color}">${renderCategoryIcon(category)}</span>
              <div>
                <strong>${escapeHTML(transaction.description)}</strong>
                <span>${escapeHTML(metaLabel)}</span>
              </div>
            </div>
          </td>
          <td><span class="category-pill"><i class="category-pill-dot" style="background:${category.color}"></i>${escapeHTML(transaction.category)}</span></td>
          <td>${escapeHTML(formatDate(transaction.date))}</td>
          <td class="transaction-amount ${income ? "is-income" : ""}">${income ? "+" : "−"} ${escapeHTML(formatCurrency(transaction.amount))}</td>
          <td>
            <div class="row-actions">
              <button class="row-action" type="button" data-action="edit" data-id="${escapeHTML(transaction.id)}" aria-label="Edit ${escapeHTML(transaction.description)}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></svg>
              </button>
              <button class="row-action" type="button" data-action="duplicate" data-id="${escapeHTML(transaction.id)}" aria-label="Salin ${escapeHTML(transaction.description)}" title="Salin transaksi">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
              </button>
              <button class="row-action delete" type="button" data-action="delete" data-id="${escapeHTML(transaction.id)}" aria-label="Hapus ${escapeHTML(transaction.description)}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" /></svg>
              </button>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  elements.emptyState.hidden = filtered.length !== 0;
  elements.resultsCount.textContent = `${filtered.length} transaksi`;
}

function render() {
  renderSummary();
  renderChart();
  renderCategories();
  renderTransactions();
}

function populateCategoryOptions(type, selectedValue = "") {
  elements.categoryInput.innerHTML = getCategoryList(type)
    .map(
      (category) =>
        `<option value="${escapeHTML(category.name)}">${escapeHTML(category.name)}</option>`,
    )
    .join("");
  if (getCategoryList(type).some((category) => category.name === selectedValue)) {
    elements.categoryInput.value = selectedValue;
  }
}

function showFormError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = !message;
}

function openDialog(transaction = null) {
  elements.form.reset();
  showFormError("");
  elements.dialogTitle.textContent = transaction ? "Edit transaksi" : "Tambah transaksi";
  elements.transactionId.value = transaction?.id || "";
  elements.descriptionInput.value = transaction?.description || "";
  elements.amountInput.value = transaction?.amount ?? "";
  elements.noteInput.value = transaction?.note || "";
  elements.recurrenceInput.value = transaction?.recurrence || "none";

  const selectedDate = getSelectedMonth();
  const currentDay = new Date().getDate();
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const defaultDate = localDateString(
    transaction
      ? parseLocalDate(transaction.date)
      : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), Math.min(currentDay, lastDay)),
  );
  elements.dateInput.value = transaction?.date || defaultDate;

  const type = transaction?.type || preferences.defaultType;
  elements.form.querySelector(`input[name="type"][value="${type}"]`).checked = true;
  populateCategoryOptions(type, transaction?.category || "");
  elements.dialog.showModal();
  elements.descriptionInput.focus();
}

function closeDialog() {
  elements.dialog.close();
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function handleSubmit(event) {
  event.preventDefault();
  showFormError("");

  const formData = new FormData(elements.form);
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description")).trim();
  const date = String(formData.get("date"));
  const type = String(formData.get("type"));
  const category = String(formData.get("category"));
  const note = String(formData.get("note") || "").trim();
  const recurrence = String(formData.get("recurrence") || "none");

  if (
    !description ||
    !isValidDate(date) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    !getCategoryList(type)?.some((item) => item.name === category) ||
    !["none", "weekly", "monthly"].includes(recurrence)
  ) {
    showFormError("Lengkapi semua kolom dan masukkan jumlah rupiah yang valid.");
    return;
  }

  const id = elements.transactionId.value || createId();
  const original = transactions.find((transaction) => transaction.id === id);
  const updated = {
    id,
    type,
    description,
    category,
    amount,
    date,
    note,
    recurrence,
    ...(original?.recurrenceParentId ? { recurrenceParentId: original.recurrenceParentId } : {}),
  };
  transactions = elements.transactionId.value
    ? transactions.map((transaction) => (transaction.id === id ? updated : transaction))
    : [updated, ...transactions];

  recurringTransactionCount = materializeRecurringTransactions();
  const saved = saveTransactions();
  render();
  closeDialog();
  if (saved) {
    const message = elements.transactionId.value ? "Transaksi berhasil diperbarui." : "Transaksi berhasil ditambahkan.";
    showToast(recurringTransactionCount ? `${message} ${recurringTransactionCount} transaksi berulang dibuat.` : message);
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = parseLocalDate(value);
  return localDateString(date) === value;
}

function recurrenceDateFromAnchor(value, recurrence, index) {
  const date = parseLocalDate(value);
  if (recurrence === "weekly") {
    date.setDate(date.getDate() + index * 7);
    return localDateString(date);
  }
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + index, 1);
  const day = date.getDate();
  nextMonth.setDate(Math.min(day, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
  return localDateString(nextMonth);
}

function materializeRecurringTransactions() {
  const today = localDateString(new Date());
  const recurringParents = transactions.filter(
    (transaction) => transaction.recurrence && transaction.recurrence !== "none" && !transaction.recurrenceParentId,
  );
  const existing = new Set(
    transactions
      .filter((transaction) => transaction.recurrenceParentId)
      .map((transaction) => `${transaction.recurrenceParentId}:${transaction.date}`),
  );
  const generated = [];

  recurringParents.forEach((parent) => {
    for (let index = 1; index <= 600; index += 1) {
      const occurrence = recurrenceDateFromAnchor(parent.date, parent.recurrence, index);
      if (occurrence > today) {
        break;
      }
      const key = `${parent.id}:${occurrence}`;
      if (existing.has(key)) {
        continue;
      }
      existing.add(key);
      generated.push({
        ...parent,
        id: createId(),
        date: occurrence,
        recurrence: "none",
        recurrenceParentId: parent.id,
      });
    }
  });

  if (generated.length) {
    transactions = [...generated, ...transactions];
  }
  return generated.length;
}

function downloadFile(filename, content, mimeType) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCSV() {
  const filtered = getFilteredTransactions();
  const rows = [
    ["Tanggal", "Jenis", "Deskripsi", "Kategori", "Jumlah (IDR)", "Catatan", "Pengulangan"],
    ...filtered.map((transaction) => [
      transaction.date,
      transaction.type === "income" ? "Pemasukan" : "Pengeluaran",
      transaction.description,
      transaction.category,
      String(transaction.amount),
      transaction.note || "",
      transaction.recurrence === "weekly" ? "Mingguan" : transaction.recurrence === "monthly" ? "Bulanan" : "",
    ]),
  ];
  const csv = `\uFEFF${rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\r\n")}`;
  downloadFile(`dompetku-${elements.monthFilter.value}.csv`, csv, "text/csv;charset=utf-8");
  showToast(`${filtered.length} transaksi berhasil diekspor.`);
}

function renderSettings() {
  elements.themeSelect.value = preferences.theme;
  elements.accentSelect.value = preferences.accent;
  elements.densitySelect.value = preferences.density;
  elements.hideBalances.checked = preferences.hideBalances;
  elements.defaultTypeSelect.value = preferences.defaultType;
  elements.monthlyBudgetInput.value = preferences.monthlyBudget || "";
  elements.savingsGoalInput.value = preferences.savingsGoal || "";
  elements.categoryBudgetInputs.innerHTML = getCategoryList("expense")
    .map(
      (category) => `
        <label class="category-budget-row">
          <span>${renderCategoryIcon(category)}${escapeHTML(category.name)}</span>
          <input type="number" min="0" step="1000" inputmode="numeric" data-category-budget="${escapeHTML(category.name)}" aria-label="Batas ${escapeHTML(category.name)}" value="${preferences.categoryBudgets[category.name] || ""}" placeholder="Tanpa batas" />
        </label>`,
    )
    .join("");

  elements.customCategoryList.innerHTML = ["expense", "income"]
    .flatMap((type) =>
      preferences.customCategories[type].map(
        (name) => `
          <span class="custom-category-chip">
            ${escapeHTML(name)} <small>${type === "income" ? "Pemasukan" : "Pengeluaran"}</small>
            <button type="button" data-remove-category="${escapeHTML(name)}" data-category-type="${type}" aria-label="Hapus kategori ${escapeHTML(name)}">×</button>
          </span>`,
      ),
    )
    .join("");
}

function applyPreferences(notify = false) {
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches || false;
  const activeTheme = preferences.theme === "system" ? (systemDark ? "dark" : "light") : preferences.theme;
  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.dataset.accent = preferences.accent;
  document.documentElement.dataset.density = preferences.density;
  document.documentElement.classList.toggle("amount-hidden", preferences.hideBalances);
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = activeTheme === "dark" ? "#161922" : "#f6f7fb";
  }
  if (notify) {
    const saved = savePreferences();
    showToast(
      saved ? "Pengaturan berhasil disimpan." : "Pengaturan diterapkan, tetapi tidak dapat disimpan.",
      saved ? "success" : "error",
    );
  }
}

function saveSettingsForm() {
  const monthlyBudget = Number(elements.monthlyBudgetInput.value || 0);
  const savingsGoal = Number(elements.savingsGoalInput.value || 0);
  if (
    !Number.isSafeInteger(monthlyBudget) ||
    monthlyBudget < 0 ||
    !Number.isSafeInteger(savingsGoal) ||
    savingsGoal < 0
  ) {
    showToast("Anggaran harus berupa angka rupiah yang valid.", "error");
    return false;
  }

  const categoryBudgets = {};
  for (const input of elements.categoryBudgetInputs.querySelectorAll("[data-category-budget]")) {
    const amount = Number(input.value || 0);
    if (!Number.isSafeInteger(amount) || amount < 0) {
      showToast(`Batas kategori ${input.dataset.categoryBudget} tidak valid.`, "error");
      input.focus();
      return false;
    }
    if (amount > 0) {
      categoryBudgets[input.dataset.categoryBudget] = amount;
    }
  }

  preferences = normalizePreferences({
    ...preferences,
    theme: elements.themeSelect.value,
    accent: elements.accentSelect.value,
    density: elements.densitySelect.value,
    hideBalances: elements.hideBalances.checked,
    defaultType: elements.defaultTypeSelect.value,
    monthlyBudget,
    savingsGoal,
    categoryBudgets,
  });
  applyPreferences(true);
  render();
  elements.settingsDialog.close();
  return true;
}

function addCustomCategory() {
  const name = elements.customCategoryName.value.trim();
  const type = elements.customCategoryType.value;
  const exists = ["income", "expense"].some((group) =>
    getCategoryList(group).some((category) => category.name.toLocaleLowerCase("id") === name.toLocaleLowerCase("id")),
  );
  if (!name || name.length > 24 || exists) {
    showToast(exists ? "Kategori dengan nama itu sudah ada." : "Masukkan nama kategori maksimal 24 karakter.", "error");
    elements.customCategoryName.focus();
    return;
  }
  if (preferences.customCategories[type].length >= 40) {
    showToast("Jumlah kategori tambahan sudah mencapai batas.", "error");
    return;
  }
  preferences.customCategories[type].push(name);
  savePreferences(true);
  renderSettings();
  refreshCategoryFilter();
  render();
  elements.customCategoryName.value = "";
}

function removeCustomCategory(button) {
  const { removeCategory: name, categoryType: type } = button.dataset;
  const used = transactions.some((transaction) => transaction.type === type && transaction.category === name);
  if (used) {
    showToast("Kategori ini masih dipakai transaksi dan tidak dapat dihapus.", "error");
    return;
  }
  preferences.customCategories[type] = preferences.customCategories[type].filter((category) => category !== name);
  delete preferences.categoryBudgets[name];
  savePreferences(true);
  renderSettings();
  refreshCategoryFilter();
  render();
}

function refreshCategoryFilter() {
  const previous = elements.categoryFilter.value;
  const names = [...getCategoryList("income"), ...getCategoryList("expense")]
    .map((category) => category.name)
    .filter((name, index, list) => list.indexOf(name) === index);
  elements.categoryFilter.innerHTML = `<option value="all">Semua kategori</option>${names
    .map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`)
    .join("")}`;
  if (names.includes(previous)) {
    elements.categoryFilter.value = previous;
  }
}

function exportBackup() {
  const backup = {
    format: "dompetku-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    preferences,
  };
  downloadFile(
    `dompetku-cadangan-${localDateString(new Date())}.json`,
    JSON.stringify(backup, null, 2),
    "application/json",
  );
  showToast("Cadangan data berhasil diunduh.");
}

function validateBackup(value) {
  if (
    !value ||
    value.format !== "dompetku-backup" ||
    value.version !== 1 ||
    !Array.isArray(value.transactions) ||
    value.transactions.length > 20000 ||
    !value.transactions.every(isValidTransaction)
  ) {
    return false;
  }
  const transactionIds = value.transactions.map((transaction) => transaction.id);
  if (new Set(transactionIds).size !== transactionIds.length) {
    return false;
  }
  const namesValid = ["income", "expense"].every((type) => {
    const names = value.preferences?.customCategories?.[type];
    return names === undefined || (Array.isArray(names) && names.length <= 40 && names.every((name) => typeof name === "string"));
  });
  return namesValid;
}

async function importBackup(file) {
  if (!file || file.size > 5_000_000) {
    showToast("File cadangan kosong atau lebih besar dari 5 MB.", "error");
    return;
  }
  try {
    const backup = JSON.parse(await file.text());
    if (!validateBackup(backup)) {
      throw new Error("Struktur cadangan tidak sesuai.");
    }
    if (!window.confirm("Pulihkan cadangan? Data transaksi dan pengaturan saat ini akan diganti.")) {
      return;
    }
    lastDeletedTransaction = null;
    window.clearTimeout(toastTimer);
    transactions = backup.transactions.map((transaction) => ({ recurrence: "none", note: "", ...transaction }));
    preferences = normalizePreferences(backup.preferences);
    const transactionsSaved = saveTransactions();
    const preferencesSaved = savePreferences();
    applyPreferences(false);
    renderSettings();
    refreshCategoryFilter();
    recurringTransactionCount = materializeRecurringTransactions();
    if (recurringTransactionCount) {
      saveTransactions();
    }
    render();
    showToast(
      transactionsSaved && preferencesSaved ? "Cadangan berhasil dipulihkan." : "Cadangan dibuka, tetapi gagal disimpan di browser.",
      transactionsSaved && preferencesSaved ? "success" : "error",
    );
  } catch (error) {
    showToast(error instanceof SyntaxError ? "File cadangan bukan JSON yang valid." : error.message, "error");
  } finally {
    elements.backupFileInput.value = "";
  }
}

function deleteAllData() {
  if (!window.confirm("Hapus semua transaksi, kategori, anggaran, dan pengaturan? Tindakan ini tidak dapat dibatalkan.")) {
    return;
  }
  lastDeletedTransaction = null;
  window.clearTimeout(toastTimer);
  transactions = [];
  preferences = { ...defaultPreferences, categoryBudgets: {}, customCategories: { income: [], expense: [] } };
  const transactionsSaved = saveTransactions();
  const preferencesSaved = savePreferences();
  applyPreferences(false);
  renderSettings();
  refreshCategoryFilter();
  render();
  if (transactionsSaved && preferencesSaved) {
    showToast("Semua data sudah dihapus.");
  } else {
    showToast("Data dihapus untuk sesi ini, tetapi sebagian perubahan tidak tersimpan.", "error");
  }
}

function showUndoToast() {
  let toast = document.querySelector("#appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }
  toast.replaceChildren();
  const message = document.createElement("span");
  message.textContent = "Transaksi dihapus.";
  const undo = document.createElement("button");
  undo.type = "button";
  undo.className = "toast-action";
  undo.textContent = "Urungkan";
  undo.addEventListener("click", () => {
    if (lastDeletedTransaction) {
      transactions = [lastDeletedTransaction, ...transactions];
      const saved = saveTransactions();
      render();
      lastDeletedTransaction = null;
      if (saved) {
        showToast("Penghapusan dibatalkan.");
      }
    }
  });
  toast.append(message, undo);
  toast.dataset.type = "success";
  toast.classList.add("has-action", "is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible", "has-action");
    lastDeletedTransaction = null;
  }, 6000);
}

function calculateExpression(source) {
  const expression = source.trim();
  const tokenPattern = /\s*(\d+(?:\.\d*)?|\.\d+|[()+\-*/])/gy;
  const tokens = [];
  let cursor = 0;
  while (cursor < expression.length) {
    tokenPattern.lastIndex = cursor;
    const match = tokenPattern.exec(expression);
    if (!match) {
      throw new Error("Periksa kembali perhitungannya.");
    }
    tokens.push(match[1]);
    cursor = tokenPattern.lastIndex;
  }
  let index = 0;

  function parsePrimary() {
    const token = tokens[index];
    if (token === "+" || token === "-") {
      index += 1;
      const value = parsePrimary();
      return token === "-" ? -value : value;
    }
    if (token === "(") {
      index += 1;
      const value = parseExpression();
      if (tokens[index] !== ")") {
        throw new Error("Tanda kurung belum lengkap.");
      }
      index += 1;
      return value;
    }
    if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
      throw new Error("Masukkan angka dan operator yang valid.");
    }
    index += 1;
    return Number(token);
  }

  function parseTerm() {
    let value = parsePrimary();
    while (tokens[index] === "*" || tokens[index] === "/") {
      const operator = tokens[index++];
      const right = parsePrimary();
      if (operator === "/" && right === 0) {
        throw new Error("Tidak bisa membagi dengan nol.");
      }
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseExpression() {
    let value = parseTerm();
    while (tokens[index] === "+" || tokens[index] === "-") {
      const operator = tokens[index++];
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  const result = parseExpression();
  if (index !== tokens.length || !Number.isFinite(result)) {
    throw new Error("Perhitungan tidak valid.");
  }
  return result;
}

function handleCalculatorKey(key) {
  const display = elements.calculatorDisplay;
  if (key === "clear") {
    display.value = "";
    return;
  }
  if (key === "backspace") {
    display.value = display.value.slice(0, -1);
    return;
  }
  if (key === "equals") {
    try {
      const result = calculateExpression(display.value);
      display.value = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(8)));
    } catch (error) {
      showToast(error.message, "error");
    }
    return;
  }
  if (/^[\d.+\-*/()]$/.test(key)) {
    display.value += key;
  }
}

function handleKeyboardShortcuts(event) {
  if (event.ctrlKey || event.metaKey || event.altKey || elements.dialog.open || elements.settingsDialog.open || elements.calculatorDialog.open) {
    return;
  }
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))) {
    return;
  }
  if (event.key.toLocaleLowerCase("id") === "n") {
    event.preventDefault();
    openDialog();
  } else if (event.key === "/") {
    event.preventDefault();
    elements.searchInput.focus();
  } else if (event.key === "?") {
    event.preventDefault();
    elements.calculatorDisplay.value = "";
    elements.calculatorDialog.showModal();
  }
}

function initialize() {
  const now = new Date();
  elements.todayLabel.textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  elements.monthFilter.value = monthKey(now);
  applyPreferences();
  renderSettings();
  refreshCategoryFilter();
  populateCategoryOptions("expense");
  recurringTransactionCount = materializeRecurringTransactions();
  if (recurringTransactionCount) {
    saveTransactions();
  }

  document.querySelector("#openAddModal").addEventListener("click", () => openDialog());
  document.querySelector("#closeModal").addEventListener("click", closeDialog);
  document.querySelector("#cancelModal").addEventListener("click", closeDialog);
  document.querySelector("#exportButton").addEventListener("click", exportCSV);
  document.querySelector("#printButton").addEventListener("click", () => window.print());
  document.querySelector("#openCalculator").addEventListener("click", () => {
    elements.calculatorDisplay.value = "";
    elements.calculatorDialog.showModal();
    elements.calculatorDisplay.focus();
  });
  document.querySelector("#closeCalculator").addEventListener("click", () => elements.calculatorDialog.close());
  elements.calculatorDialog.addEventListener("click", (event) => {
    if (event.target === elements.calculatorDialog) {
      elements.calculatorDialog.close();
    }
  });
  document.querySelector("#calculatorKeys").addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (button) {
      handleCalculatorKey(button.dataset.key);
      elements.calculatorDisplay.focus();
    }
  });
  elements.calculatorDisplay.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCalculatorKey("equals");
    } else if (event.key === "Escape") {
      elements.calculatorDialog.close();
    }
  });
  document.querySelector("#clearFilters").addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.typeFilter.value = "all";
    elements.categoryFilter.value = "all";
    renderTransactions();
  });
  document.querySelector("#openSettings").addEventListener("click", () => {
    renderSettings();
    elements.settingsDialog.showModal();
  });
  document.querySelector("#closeSettings").addEventListener("click", () => elements.settingsDialog.close());
  document.querySelector("#cancelSettings").addEventListener("click", () => elements.settingsDialog.close());
  document.querySelector("#settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveSettingsForm();
  });
  document.querySelector("#addCustomCategory").addEventListener("click", addCustomCategory);
  elements.customCategoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-category]");
    if (button) {
      removeCustomCategory(button);
    }
  });
  document.querySelector("#backupExport").addEventListener("click", exportBackup);
  document.querySelector("#backupImport").addEventListener("click", () => elements.backupFileInput.click());
  elements.backupFileInput.addEventListener("change", () => importBackup(elements.backupFileInput.files?.[0]));
  document.querySelector("#resetData").addEventListener("click", deleteAllData);

  elements.form.addEventListener("submit", handleSubmit);
  elements.form.querySelectorAll('input[name="type"]').forEach((input) => {
    input.addEventListener("change", () => populateCategoryOptions(input.value));
  });
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) {
      closeDialog();
    }
  });
  elements.settingsDialog.addEventListener("click", (event) => {
    if (event.target === elements.settingsDialog) {
      elements.settingsDialog.close();
    }
  });
  elements.monthFilter.addEventListener("change", render);
  elements.searchInput.addEventListener("input", renderTransactions);
  elements.typeFilter.addEventListener("change", renderTransactions);
  elements.categoryFilter.addEventListener("change", renderTransactions);
  elements.sortFilter.addEventListener("change", renderTransactions);
  window.addEventListener("keydown", handleKeyboardShortcuts);
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (preferences.theme === "system") {
      applyPreferences();
    }
  });

  elements.transactionRows.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const transaction = transactions.find((item) => item.id === button.dataset.id);
    if (!transaction) {
      showToast("Transaksi tidak ditemukan.", "error");
      return;
    }

    if (button.dataset.action === "edit") {
      openDialog(transaction);
    } else if (button.dataset.action === "duplicate") {
      transactions = [{ ...transaction, id: createId(), recurrence: "none", recurrenceParentId: undefined }, ...transactions];
      const saved = saveTransactions();
      render();
      if (saved) {
        showToast("Transaksi berhasil disalin.");
      }
    } else if (button.dataset.action === "delete") {
      const confirmed = window.confirm(`Hapus transaksi "${transaction.description}"?`);
      if (confirmed) {
        lastDeletedTransaction = transaction;
        transactions = transactions.filter((item) => item.id !== transaction.id);
        const saved = saveTransactions();
        render();
        if (saved) {
          showUndoToast();
        }
      }
    }
  });

  document.querySelectorAll(".side-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".side-nav a").forEach((item) => {
        item.classList.remove("is-active");
        item.removeAttribute("aria-current");
      });
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    });
  });

  render();
}

initialize();
