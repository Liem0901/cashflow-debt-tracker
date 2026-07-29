/**
 * Monthly budget limits are stored on the user document (`settings.budgets`).
 * Persistence goes through UserService / AppDataService.save — no separate collection.
 */
export class BudgetService {
  static extractBudgets(settings = {}) {
    return settings.budgets || {};
  }
}
