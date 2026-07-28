import { UserCategoryRepository } from '../repositories/userCategoryRepository.js';
import { extractCustomCategories } from '../models/User.js';

export class CategoryService {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.repo = new UserCategoryRepository(db);
  }

  extractFromAppData(data, budgets) {
    return extractCustomCategories(data, budgets);
  }

  upsert(userId, categories) {
    return this.repo.upsert(userId, categories);
  }

  deleteByUserId(userId) {
    return this.repo.deleteByUserId(userId);
  }
}
