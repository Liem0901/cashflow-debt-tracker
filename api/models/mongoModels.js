import { COLLECTIONS, USER_SETTINGS_FIELDS } from './constants.js';

const SETTINGS_DEFAULTS = {
  salary: 0,
  salaryByMonth: {},
  paydayDate: 1,
  currentMonth: null,
  budgets: {},
  archivedMonths: [],
};

export function extractUserSettings(data = {}) {
  const settings = {};
  for (const key of USER_SETTINGS_FIELDS) {
    settings[key] = data[key] ?? SETTINGS_DEFAULTS[key];
  }
  return settings;
}

export function extractCustomCategories(data = {}, budgets = {}) {
  const expenseFromBudgets = Object.keys(budgets || {}).filter(Boolean);
  const expenseCategories = [
    ...new Set([...(data.expenseCategories || []), ...expenseFromBudgets]),
  ];
  const incomeCategories = [...new Set(data.incomeCategories || [])];

  return { expenseCategories, incomeCategories };
}

/**
 * @typedef {Object} UserDocument
 * @property {string} userId
 * @property {boolean} [disabled]
 * @property {number} salary
 * @property {Object} salaryByMonth
 * @property {number} paydayDate
 * @property {string|null} currentMonth
 * @property {Object} budgets
 * @property {Array} archivedMonths
 * @property {Object} [data] legacy embedded blob
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {number} version
 */

export function toUserDocument(userId, settings, existing = null) {
  const now = new Date();

  return {
    userId,
    disabled: existing?.disabled ?? false,
    ...settings,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
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
      version: doc.version ?? 1,
      createdAt: doc.createdAt,
    };
  }

  const settings = extractUserSettings(doc);

  return {
    userId: doc.userId,
    settings,
    disabled: Boolean(doc.disabled),
    updatedAt: doc.updatedAt,
    version: doc.version ?? 1,
    createdAt: doc.createdAt,
  };
}

export { COLLECTIONS };
