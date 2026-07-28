import { DebtRepository } from '../repositories/debtRepository.js';

export class DebtService {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.repo = new DebtRepository(db);
  }

  findByUserId(userId) {
    return this.repo.findByUserId(userId);
  }

  replaceAllForUser(userId, debts) {
    return this.repo.replaceAllForUser(userId, debts);
  }

  deleteByUserId(userId) {
    return this.repo.deleteByUserId(userId);
  }
}
