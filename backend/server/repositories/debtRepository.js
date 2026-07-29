import { COLLECTIONS } from '../config/collections.js';
import { toClientDebt, toDebtDocument } from '../models/Debt.js';

export class DebtRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.DEBTS);
  }

  async findByUserId(userId) {
    const docs = await this.collection.find({ userId }).sort({ dueDate: -1 }).toArray();
    return docs.map(toClientDebt);
  }

  async replaceAllForUser(userId, debts = []) {
    await this.collection.deleteMany({ userId });
    if (!debts.length) return;

    const now = new Date();
    await this.collection.insertMany(
      debts.map((debt) => ({
        ...toDebtDocument(userId, debt),
        createdAt: now,
      }))
    );
  }

  async deleteByUserId(userId) {
    await this.collection.deleteMany({ userId });
  }

  async countByUserId(userId) {
    return this.collection.countDocuments({ userId });
  }
}

export { toClientDebt, toDebtDocument };
