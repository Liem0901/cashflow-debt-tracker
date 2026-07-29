import { COLLECTIONS } from '../config/collections.js';
import { toClientSavingsEntry, toSavingsEntryDocument } from '../models/SavingsEntry.js';

export class SavingsRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.SAVINGS_ENTRIES);
  }

  async findByUserId(userId) {
    const docs = await this.collection
      .find({ userId })
      .sort({ date: -1, entryId: -1 })
      .toArray();
    return docs.map(toClientSavingsEntry);
  }

  async replaceAllForUser(userId, entries = []) {
    await this.collection.deleteMany({ userId });
    if (!entries.length) return;

    const now = new Date();
    await this.collection.insertMany(
      entries.map((entry) => ({
        ...toSavingsEntryDocument(userId, entry),
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

/** @deprecated use SavingsRepository */
export const SavingsEntryRepository = SavingsRepository;

export { toClientSavingsEntry, toSavingsEntryDocument };
