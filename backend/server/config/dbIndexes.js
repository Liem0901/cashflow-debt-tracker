import { COLLECTIONS } from '../config/collections.js';

/** @param {import('mongodb').Db} db */
export async function ensureIndexes(db) {
  const users = db.collection(COLLECTIONS.USERS);
  const transactions = db.collection(COLLECTIONS.TRANSACTIONS);
  const debts = db.collection(COLLECTIONS.DEBTS);
  const userCategories = db.collection(COLLECTIONS.USER_CATEGORIES);
  const auditLogs = db.collection(COLLECTIONS.AUDIT_LOGS);

  await users.createIndex({ userId: 1 }, { unique: true });
  await users.createIndex({ updatedAt: -1 });
  await users.createIndex({ disabled: 1 });
  await users.createIndex({ createdAt: -1 });

  await transactions.createIndex({ userId: 1, txId: 1 }, { unique: true });
  await transactions.createIndex({ userId: 1, date: -1 });
  await transactions.createIndex({ type: 1, date: -1 });
  await transactions.createIndex({ category: 1 });
  await transactions.createIndex({ date: -1 });

  await debts.createIndex({ userId: 1, debtId: 1 }, { unique: true });
  await debts.createIndex({ userId: 1, dueDate: -1 });
  await debts.createIndex({ status: 1 });

  const savingsEntries = db.collection(COLLECTIONS.SAVINGS_ENTRIES);
  await savingsEntries.createIndex({ userId: 1, entryId: 1 }, { unique: true });
  await savingsEntries.createIndex({ userId: 1, date: -1 });
  await savingsEntries.createIndex({ userId: 1, month: -1 });

  await userCategories.createIndex({ userId: 1 }, { unique: true });

  await auditLogs.createIndex({ createdAt: -1 });
  await auditLogs.createIndex({ adminId: 1, createdAt: -1 });
  await auditLogs.createIndex({ targetUserId: 1, createdAt: -1 });

  const aiUsage = db.collection(COLLECTIONS.AI_USAGE);
  await aiUsage.createIndex({ userId: 1, date: 1 }, { unique: true });
  await aiUsage.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
}

/** @param {import('mongodb').Db} db */
export async function initCollections(db) {
  const existing = await db.listCollections().toArray();
  const names = new Set(existing.map((collection) => collection.name));

  const collections = [
    COLLECTIONS.USERS,
    COLLECTIONS.TRANSACTIONS,
    COLLECTIONS.DEBTS,
    COLLECTIONS.SAVINGS_ENTRIES,
    COLLECTIONS.USER_CATEGORIES,
    COLLECTIONS.APP_CONFIG,
    COLLECTIONS.AUDIT_LOGS,
    COLLECTIONS.AI_USAGE,
  ];

  for (const name of collections) {
    if (!names.has(name)) {
      await db.createCollection(name);
    }
  }

  await ensureIndexes(db);

  return {
    database: db.databaseName,
    collections,
  };
}
