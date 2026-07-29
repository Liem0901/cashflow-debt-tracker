import { COLLECTIONS } from '../config/collections.js';
import { toClientTransaction, toTransactionDocument } from '../models/Transaction.js';

export class TransactionRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.TRANSACTIONS);
  }

  async findByUserId(userId) {
    const docs = await this.collection.find({ userId }).sort({ date: -1, txId: -1 }).toArray();
    return docs.map(toClientTransaction);
  }

  async replaceAllForUser(userId, transactions = []) {
    await this.collection.deleteMany({ userId });
    if (!transactions.length) return;

    const now = new Date();
    await this.collection.insertMany(
      transactions.map((tx) => ({
        ...toTransactionDocument(userId, tx),
        createdAt: now,
      }))
    );
  }

  async deleteByUserId(userId) {
    await this.collection.deleteMany({ userId });
  }

  async countAll(filter = {}) {
    return this.collection.countDocuments(filter);
  }

  async aggregateByCategory(match = {}) {
    return this.collection
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
      ])
      .toArray();
  }

  async listFiltered({
    userId = '',
    type = '',
    category = '',
    dateFrom = '',
    dateTo = '',
    page = 1,
    limit = 50,
  } = {}) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const [docs, total] = await Promise.all([
      this.collection.find(filter).sort({ date: -1 }).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter),
    ]);

    return {
      items: docs.map((doc) => ({ ...toClientTransaction(doc), userId: doc.userId })),
      total,
      page: Math.max(1, page),
      limit,
    };
  }
}

export { toClientTransaction, toTransactionDocument };
