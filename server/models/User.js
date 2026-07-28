import { USER_SETTINGS_FIELDS } from '../config/collections.js';
import {
  prepareUserSettingsForClient,
  prepareUserSettingsForStorage,
} from '../utils/dates.js';

export { USER_SETTINGS_FIELDS };

const SETTINGS_DEFAULTS = {
  salary: 0,
  salaryByMonth: {},
  paydayDate: 1,
  currentMonth: null,
  budgets: {},
  archivedMonths: [],
  savingsBalance: 0,
  savingsGoal: 5000,
};

export function extractUserSettings(data = {}) {
  const settings = {};
  for (const key of USER_SETTINGS_FIELDS) {
    settings[key] = data[key] ?? SETTINGS_DEFAULTS[key];
  }
  return prepareUserSettingsForClient(settings);
}

export { prepareUserSettingsForStorage };

export function extractCustomCategories(data = {}, budgets = {}) {
  const expenseFromBudgets = Object.keys(budgets || {}).filter(Boolean);
  const expenseCategories = [
    ...new Set([...(data.expenseCategories || []), ...expenseFromBudgets]),
  ];
  const incomeCategories = [...new Set(data.incomeCategories || [])];

  return { expenseCategories, incomeCategories };
}

export function toUserDocument(userId, settings, existing = null) {
  const now = new Date();

  return {
    userId,
    disabled: existing?.disabled ?? false,
    ...settings,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function fromUserDocument(doc) {
  if (!doc) return null;

  if (doc.data && typeof doc.data === 'object') {
    return {
      userId: doc.userId,
      legacyData: doc.data,
      disabled: Boolean(doc.disabled),
      updatedAt: doc.updatedAt,
      createdAt: doc.createdAt,
    };
  }

  const settings = extractUserSettings(doc);

  return {
    userId: doc.userId,
    settings,
    disabled: Boolean(doc.disabled),
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
  };
}
