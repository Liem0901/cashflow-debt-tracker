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

export function getCategoryIcon(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
}

export const DEBT_PROVIDERS = [
  'Shopee PayLater',
  'Credit Card',
  'Bank Loan',
  'Friend Loan',
];

export const BUDGET_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping'];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'bi-cash-coin' },
  { id: 'bank', label: 'Bank', icon: 'bi-bank' },
  { id: 'qr', label: 'QR', icon: 'bi-qr-code' },
];

export function createInitialBudgets() {
  return Object.fromEntries(BUDGET_CATEGORIES.map((cat) => [cat, 0]));
}

export function createInitialData() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return {
    salary: 0,
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
