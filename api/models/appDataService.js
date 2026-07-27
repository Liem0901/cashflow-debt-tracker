import { extractUserSettings, extractCustomCategories } from './mongoModels.js';
import { UserDataRepository } from './userRepository.js';
import { TransactionRepository } from './transactionRepository.js';
import { DebtRepository } from './debtRepository.js';
import { UserCategoryRepository } from './userCategoryRepository.js';

function buildAppData(settings, transactions, debts) {
  return {
    ...settings,
    transactions,
    debts,
  };
}

export class AppDataService {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.users = new UserDataRepository(db);
    this.transactions = new TransactionRepository(db);
    this.debts = new DebtRepository(db);
    this.categories = new UserCategoryRepository(db);
  }

  async migrateLegacyUser(userId, legacyData) {
    const settings = extractUserSettings(legacyData);
    const txs = legacyData.transactions || [];
    const debts = legacyData.debts || [];
    const categories = extractCustomCategories(legacyData, settings.budgets);

    await Promise.all([
      this.users.upsertSettings(userId, settings),
      this.transactions.replaceAllForUser(userId, txs),
      this.debts.replaceAllForUser(userId, debts),
      this.categories.upsert(userId, categories),
      this.users.clearLegacyDataField(userId),
    ]);
  }

  async load(userId) {
    let user = await this.users.findByUserId(userId);
    if (!user) return null;

    if (user.legacyData) {
      await this.migrateLegacyUser(userId, user.legacyData);
      user = await this.users.findByUserId(userId);
    }

    const [transactions, debts] = await Promise.all([
      this.transactions.findByUserId(userId),
      this.debts.findByUserId(userId),
    ]);

    return {
      data: buildAppData(user.settings, transactions, debts),
      updatedAt: user.updatedAt,
      version: user.version,
      disabled: user.disabled,
    };
  }

  async save(userId, data) {
    const settings = extractUserSettings(data);
    const categories = extractCustomCategories(data, settings.budgets);

    const existing = await this.users.findByUserId(userId);
    if (existing?.legacyData) {
      await this.migrateLegacyUser(userId, existing.legacyData);
    }

    const [userResult] = await Promise.all([
      this.users.upsertSettings(userId, settings),
      this.transactions.replaceAllForUser(userId, data.transactions || []),
      this.debts.replaceAllForUser(userId, data.debts || []),
      this.categories.upsert(userId, categories),
    ]);

    return userResult;
  }

  async deleteUser(userId) {
    await Promise.all([
      this.users.deleteByUserId(userId),
      this.transactions.deleteByUserId(userId),
      this.debts.deleteByUserId(userId),
      this.categories.deleteByUserId(userId),
    ]);
    return true;
  }
}
