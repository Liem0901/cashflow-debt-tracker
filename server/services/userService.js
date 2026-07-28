import { UserRepository } from '../repositories/userRepository.js';
import { extractUserSettings } from '../models/User.js';

export class UserService {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.repo = new UserRepository(db);
  }

  findByUserId(userId) {
    return this.repo.findByUserId(userId);
  }

  findRawByUserId(userId) {
    return this.repo.findRawByUserId(userId);
  }

  upsertSettings(userId, settings) {
    return this.repo.upsertSettings(userId, settings);
  }

  extractSettings(data) {
    return extractUserSettings(data);
  }

  clearLegacyDataField(userId) {
    return this.repo.clearLegacyDataField(userId);
  }

  unsetEmbeddedSavingsHistory(userId) {
    return this.repo.unsetEmbeddedSavingsHistory(userId);
  }

  deleteByUserId(userId) {
    return this.repo.deleteByUserId(userId);
  }
}
