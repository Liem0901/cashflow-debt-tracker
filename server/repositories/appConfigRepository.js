import { COLLECTIONS } from '../config/collections.js';

const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Shopping',
  'Entertainment',
  'Other',
];

const DEFAULT_INCOME_CATEGORIES = ['Transfer', 'Side income', 'Other', 'Salary', 'Investment'];

export const DEFAULT_APP_CONFIG = {
  expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
  incomeCategories: DEFAULT_INCOME_CATEGORIES,
};

export class AppConfigRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.APP_CONFIG);
  }

  async getGlobalConfig() {
    const doc = await this.collection.findOne({ _id: 'global' });
    if (!doc) return { ...DEFAULT_APP_CONFIG, updatedAt: null };

    return {
      expenseCategories: doc.expenseCategories || DEFAULT_APP_CONFIG.expenseCategories,
      incomeCategories: doc.incomeCategories || DEFAULT_APP_CONFIG.incomeCategories,
      updatedAt: doc.updatedAt || null,
    };
  }

  async updateGlobalConfig(payload) {
    const expenseCategories = Array.isArray(payload.expenseCategories)
      ? payload.expenseCategories.map(String).filter(Boolean)
      : DEFAULT_APP_CONFIG.expenseCategories;
    const incomeCategories = Array.isArray(payload.incomeCategories)
      ? payload.incomeCategories.map(String).filter(Boolean)
      : DEFAULT_APP_CONFIG.incomeCategories;

    const updatedAt = new Date();
    await this.collection.updateOne(
      { _id: 'global' },
      {
        $set: { expenseCategories, incomeCategories, updatedAt },
        $setOnInsert: { createdAt: updatedAt },
      },
      { upsert: true }
    );

    return { expenseCategories, incomeCategories, updatedAt };
  }
}
