import { COLLECTIONS } from '../config/collections.js';
import { USER_SETTINGS_FIELDS } from '../config/collections.js';
import {
  toUserDocument,
  fromUserDocument,
  extractUserSettings,
  prepareUserSettingsForStorage,
} from '../models/User.js';

export class UserRepository {
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
    const prepared = prepareUserSettingsForStorage(settings);
    const nextDoc = toUserDocument(userId, prepared, existing);

    const setFields = {
      userId: nextDoc.userId,
      updatedAt: nextDoc.updatedAt,
    };
    for (const key of USER_SETTINGS_FIELDS) {
      setFields[key] = nextDoc[key];
    }

    await this.collection.updateOne(
      { userId },
      {
        $set: setFields,
        $setOnInsert: {
          createdAt: nextDoc.createdAt,
          disabled: false,
        },
        $unset: { data: '', version: '', savingsHistory: '' },
      },
      { upsert: true }
    );

    return {
      ok: true,
      updatedAt: nextDoc.updatedAt,
    };
  }

  async clearLegacyDataField(userId) {
    await this.collection.updateOne({ userId }, { $unset: { data: '' } });
  }

  async unsetEmbeddedSavingsHistory(userId) {
    await this.collection.updateOne({ userId }, { $unset: { savingsHistory: '' } });
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

/** @deprecated use UserRepository */
export const UserDataRepository = UserRepository;
