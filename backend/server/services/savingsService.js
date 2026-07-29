import { SavingsRepository } from '../repositories/savingsRepository.js';
import { UserRepository } from '../repositories/userRepository.js';
import { normalizeSavingsHistoryForClient } from '../utils/dates.js';

export class SavingsService {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.repo = new SavingsRepository(db);
    this.users = new UserRepository(db);
  }

  findByUserId(userId) {
    return this.repo.findByUserId(userId);
  }

  replaceAllForUser(userId, entries) {
    return this.repo.replaceAllForUser(userId, entries);
  }

  deleteByUserId(userId) {
    return this.repo.deleteByUserId(userId);
  }

  async migrateEmbeddedHistory(userId, embeddedHistory) {
    if (!Array.isArray(embeddedHistory) || embeddedHistory.length === 0) return;

    const existing = await this.repo.countByUserId(userId);
    if (existing > 0) {
      await this.users.unsetEmbeddedSavingsHistory(userId);
      return;
    }

    await this.repo.replaceAllForUser(
      userId,
      normalizeSavingsHistoryForClient(embeddedHistory)
    );
    await this.users.unsetEmbeddedSavingsHistory(userId);
  }

  async ensureMigrated(userId) {
    const raw = await this.users.findRawByUserId(userId);
    if (raw?.savingsHistory?.length) {
      await this.migrateEmbeddedHistory(userId, raw.savingsHistory);
    }
  }
}
