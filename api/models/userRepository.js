import { COLLECTIONS, toUserDocument, fromUserDocument, extractUserSettings } from './mongoModels.js';

export class UserDataRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  async findRawByUserId(userId) {
    return this.collection.findOne({ userId });
  }

  async findByUserId(userId) {
    const doc = await this.collection.findOne({ userId });
    return fromUserDocument(doc);
  }

  async upsertSettings(userId, settings) {
    const existing = await this.collection.findOne({ userId });
    const nextDoc = toUserDocument(userId, settings, existing);

    await this.collection.updateOne(
      { userId },
      {
        $set: {
          userId: nextDoc.userId,
          salary: nextDoc.salary,
          salaryByMonth: nextDoc.salaryByMonth,
          paydayDate: nextDoc.paydayDate,
          currentMonth: nextDoc.currentMonth,
          budgets: nextDoc.budgets,
          archivedMonths: nextDoc.archivedMonths,
          updatedAt: nextDoc.updatedAt,
          version: nextDoc.version,
        },
        $setOnInsert: {
          createdAt: nextDoc.createdAt,
          disabled: false,
        },
        $unset: { data: '' },
      },
      { upsert: true }
    );

    return {
      ok: true,
      updatedAt: nextDoc.updatedAt,
      version: nextDoc.version,
    };
  }

  async clearLegacyDataField(userId) {
    await this.collection.updateOne({ userId }, { $unset: { data: '' } });
  }

  async setDisabled(userId, disabled) {
    const result = await this.collection.updateOne(
      { userId },
      { $set: { disabled: Boolean(disabled), updatedAt: new Date() } }
    );
    return result.matchedCount > 0;
  }

  async deleteByUserId(userId) {
    const result = await this.collection.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  async listAll() {
    return this.collection.find({}).toArray();
  }

  /** @deprecated use AppDataService — kept for compatibility during migration */
  async upsert(userId, data) {
    return this.upsertSettings(userId, extractUserSettings(data));
  }
}
