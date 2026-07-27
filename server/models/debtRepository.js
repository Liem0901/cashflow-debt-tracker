import { COLLECTIONS } from './constants.js';

export function toClientDebt(doc) {
  return {
    id: doc.debtId,
    name: doc.name,
    amount: Number(doc.amount || 0),
    remaining: Number(doc.remaining ?? doc.amount ?? 0),
    dueDate: doc.dueDate,
    category: doc.category || 'Other',
    status: doc.status || 'active',
  };
}

export function toDebtDocument(userId, debt) {
  return {
    userId,
    debtId: debt.id,
    name: debt.name,
    amount: Number(debt.amount || 0),
    remaining: Number(debt.remaining ?? debt.amount ?? 0),
    dueDate: debt.dueDate,
    category: debt.category || 'Other',
    status: debt.status || 'active',
    updatedAt: new Date(),
  };
}

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
