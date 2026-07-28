import { COLLECTIONS } from '../config/collections.js';

export class AuditLogRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.collection = db.collection(COLLECTIONS.AUDIT_LOGS);
  }

  async log({ adminId, adminEmail, action, targetUserId = null, meta = {} }) {
    const entry = {
      adminId,
      adminEmail,
      action,
      targetUserId,
      meta,
      createdAt: new Date(),
    };
    await this.collection.insertOne(entry);
    return entry;
  }

  async listRecent(limit = 50) {
    return this.collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  }
}
