import { TransactionRepository } from '../repositories/transactionRepository.js';

export class TransactionService {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.repo = new TransactionRepository(db);
  }

  findByUserId(userId) {
    return this.repo.findByUserId(userId);
  }

  replaceAllForUser(userId, transactions) {
    return this.repo.replaceAllForUser(userId, transactions);
  }

  deleteByUserId(userId) {
    return this.repo.deleteByUserId(userId);
  }
}
