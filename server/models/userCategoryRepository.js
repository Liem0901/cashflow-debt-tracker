import { COLLECTIONS } from './constants.js';

export class UserCategoryRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.USER_CATEGORIES);
  }

  async findByUserId(userId) {
    const doc = await this.collection.findOne({ userId });
    if (!doc) {
      return { expenseCategories: [], incomeCategories: [] };
    }

    return {
      expenseCategories: doc.expenseCategories || [],
      incomeCategories: doc.incomeCategories || [],
    };
  }

  async upsert(userId, { expenseCategories = [], incomeCategories = [] } = {}) {
    const updatedAt = new Date();
    await this.collection.updateOne(
      { userId },
      {
        $set: {
          userId,
          expenseCategories,
          incomeCategories,
          updatedAt,
        },
        $setOnInsert: { createdAt: updatedAt },
      },
      { upsert: true }
    );
  }

  async deleteByUserId(userId) {
    await this.collection.deleteOne({ userId });
  }
}
