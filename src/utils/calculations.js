import { isSameMonth } from './formatters';

export function getCashExpenses(transactions, monthKey) {
  return transactions
    .filter((t) => t.type === 'cash' && isSameMonth(t.date, monthKey))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function getUpcomingDebtTotal(debts, monthKey) {
  return debts
    .filter((d) => d.status !== 'paid' && isSameMonth(d.dueDate, monthKey))
    .reduce((sum, d) => sum + Number(d.remaining), 0);
}

export function getTotalActiveDebt(debts) {
  return debts
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + Number(d.remaining), 0);
}

export function getSafeBalance(salary, cashExpenses, upcomingDebt) {
  return Number(salary) - cashExpenses - upcomingDebt;
}

export function getCategorySpending(transactions, monthKey) {
  const spending = {};
  transactions
    .filter((t) => t.type === 'cash' && isSameMonth(t.date, monthKey))
    .forEach((t) => {
      spending[t.category] = (spending[t.category] || 0) + Number(t.amount);
    });
  return spending;
}

export function getDebtsDueThisMonth(debts, monthKey) {
  return debts
    .filter((d) => d.status !== 'paid' && isSameMonth(d.dueDate, monthKey))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

export function getRecentTransactions(transactions, limit = 5) {
  return [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function getDailyExpenses(transactions, monthKey, type = 'cash') {
  const daily = {};
  transactions
    .filter((t) => t.type === type && isSameMonth(t.date, monthKey))
    .forEach((t) => {
      daily[t.date] = (daily[t.date] || 0) + Number(t.amount);
    });
  return daily;
}

export function getTransactionsForDate(transactions, dateStr) {
  return transactions
    .filter((t) => t.date === dateStr)
    .sort((a, b) => Number(b.amount) - Number(a.amount));
}

export function getMonthExpenseTotal(dailyExpenses) {
  return Object.values(dailyExpenses).reduce((sum, n) => sum + n, 0);
}
