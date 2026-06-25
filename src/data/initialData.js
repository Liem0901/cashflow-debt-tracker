export const STORAGE_KEY = 'cashflow_app_data';

export function getStorageKey(userId = 'default-user') {
  return `${STORAGE_KEY}_${userId}`;
}

export const CATEGORY_CONFIG = {
  Food: 'bi-cup-hot',
  Transport: 'bi-car-front',
  Rent: 'bi-house',
  Shopping: 'bi-bag',
  Entertainment: 'bi-film',
  Other: 'bi-grid',
};

export const CATEGORIES = ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Other'];

/** Budget rows the user has added (saved keys only). */
export function getBudgetCategories(budgets = {}) {
  const keys = Object.keys(budgets);
  return [
    ...CATEGORIES.filter((cat) => keys.includes(cat)),
    ...keys.filter((cat) => !CATEGORIES.includes(cat)),
  ];
}

/** Categories from expenses not yet added to budgets. */
export function getAvailableBudgetCategories(budgets = {}) {
  return CATEGORIES.filter((cat) => budgets[cat] === undefined);
}

/** Expense picker always includes defaults; custom budget names are appended. */
export function getTransactionCategories(budgets = {}) {
  const merged = [...CATEGORIES];
  Object.keys(budgets).forEach((cat) => {
    if (!merged.includes(cat)) merged.push(cat);
  });
  return merged;
}

export function normalizeBudgets(budgets) {
  if (!budgets || typeof budgets !== 'object') return {};
  return budgets;
}

export const INCOME_SOURCES = ['Transfer', 'Side income', 'Other'];

export const INCOME_SOURCE_CONFIG = {
  Transfer: 'bi-bank',
  'Family transfer': 'bi-bank',
  'Side income': 'bi-briefcase',
  Other: 'bi-grid',
};

export function getCategoryIcon(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
}

export function getIncomeSourceIcon(source) {
  return INCOME_SOURCE_CONFIG[source] || INCOME_SOURCE_CONFIG.Other;
}

export const DEBT_PROVIDERS = [
  'Shopee PayLater',
  'Credit Card',
  'Bank Loan',
  'Friend Loan',
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'bi-cash-coin' },
  { id: 'bank', label: 'Bank', icon: 'bi-bank' },
  { id: 'qr', label: 'QR', icon: 'bi-qr-code' },
];

export function createInitialBudgets() {
  return {};
}

export function createInitialData() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return {
    salary: 0,
    salaryByMonth: {},
    paydayDate: 1,
    currentMonth,
    budgets: createInitialBudgets(),
    transactions: [],
    debts: [],
    archivedMonths: [],
  };
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
