import { UserService } from './userService.js';
import { TransactionService } from './transactionService.js';
import { DebtService } from './debtService.js';
import { SavingsService } from './savingsService.js';
import { CategoryService } from './categoryService.js';
import { normalizeSavingsHistoryForClient } from '../utils/dates.js';
import { sanitizeAppDataForStorage } from '../utils/sanitizeAppData.js';

function buildAppData(settings, transactions, debts, savingsHistory) {
  return {
    ...settings,
    savingsHistory,
    transactions,
    debts,
  };
}

export class AppDataService {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.users = new UserService(db);
    this.transactions = new TransactionService(db);
    this.debts = new DebtService(db);
    this.savings = new SavingsService(db);
    this.categories = new CategoryService(db);
  }

  async migrateLegacyUser(userId, legacyData) {
    const settings = this.users.extractSettings(legacyData);
    const txs = legacyData.transactions || [];
    const debts = legacyData.debts || [];
    const savingsHistory = legacyData.savingsHistory || [];
    const categories = this.categories.extractFromAppData(legacyData, settings.budgets);

    await Promise.all([
      this.users.upsertSettings(userId, settings),
      this.transactions.replaceAllForUser(userId, txs),
      this.debts.replaceAllForUser(userId, debts),
      this.savings.replaceAllForUser(userId, savingsHistory),
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

    await this.savings.ensureMigrated(userId);

    const [transactions, debts, savingsHistory] = await Promise.all([
      this.transactions.findByUserId(userId),
      this.debts.findByUserId(userId),
      this.savings.findByUserId(userId),
    ]);

    return {
      data: buildAppData(user.settings, transactions, debts, savingsHistory),
      updatedAt: user.updatedAt,
      disabled: user.disabled,
    };
  }

  async save(userId, data) {
    const sanitized = sanitizeAppDataForStorage(data);
    const settings = this.users.extractSettings(sanitized);
    const savingsHistory = normalizeSavingsHistoryForClient(sanitized.savingsHistory || []);
    const categories = this.categories.extractFromAppData(sanitized, settings.budgets);

    const existing = await this.users.findByUserId(userId);
    if (existing?.legacyData) {
      await this.migrateLegacyUser(userId, existing.legacyData);
    }

    const [userResult] = await Promise.all([
      this.users.upsertSettings(userId, settings),
      this.transactions.replaceAllForUser(userId, sanitized.transactions || []),
      this.debts.replaceAllForUser(userId, sanitized.debts || []),
      this.savings.replaceAllForUser(userId, savingsHistory),
      this.categories.upsert(userId, categories),
    ]);

    return userResult;
  }

  async isAccountDisabled(userId) {
    const user = await this.users.findByUserId(userId);
    return Boolean(user?.disabled);
  }

  async deleteUser(userId) {
    await Promise.all([
      this.users.deleteByUserId(userId),
      this.transactions.deleteByUserId(userId),
      this.debts.deleteByUserId(userId),
      this.savings.deleteByUserId(userId),
      this.categories.deleteByUserId(userId),
    ]);
    return true;
  }
}
