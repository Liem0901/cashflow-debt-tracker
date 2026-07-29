import { COLLECTIONS } from '../config/collections.js';

export class AiUsageRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.AI_USAGE);
  }

  async incrementAndCheck(userId, limit) {
    const date = new Date().toISOString().slice(0, 10);
    const doc = await this.collection.findOneAndUpdate(
      { userId, date },
      { $inc: { count: 1 }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    const count = doc.count;
    return { count, limit, allowed: count <= limit };
  }
}
