import { isSameMonth } from './formatters';
import { getTransactionPaidStatus } from './transactionStatus';

export function getCashExpenses(transactions, monthKey) {
  return transactions
    .filter((t) => t.type === 'cash' && isSameMonth(t.date, monthKey))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function getTotalExpenses(transactions, monthKey, debts = []) {
  return transactions
    .filter((t) => isSameMonth(getTransactionCalendarDate(t, debts), monthKey))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function isDebtCountedInExpenses(debt, transactions, debts, monthKey) {
  const linkedTx = transactions.find((t) => t.debtId === debt.id);
  if (!linkedTx) return false;
  return isSameMonth(getTransactionCalendarDate(linkedTx, debts), monthKey);
}

export function getUpcomingDebtTotal(debts, monthKey, transactions = []) {
  return debts
    .filter((d) => d.status !== 'paid' && isSameMonth(d.dueDate, monthKey))
    .reduce((sum, d) => {
      if (isDebtCountedInExpenses(d, transactions, debts, monthKey)) return sum;
      return sum + Number(d.remaining);
    }, 0);
}

export function getTotalActiveDebt(debts) {
  return debts
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + Number(d.remaining), 0);
}

export function getSafeBalance(salary, totalExpenses, upcomingDebt) {
  return Number(salary) - totalExpenses - upcomingDebt;
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

function getTransactionCalendarDate(transaction, debts = []) {
  if (transaction.type === 'debt' && transaction.debtId) {
    const debt = debts.find((d) => d.id === transaction.debtId);
    if (debt?.dueDate) return debt.dueDate;
  }
  return transaction.date;
}

export { getTransactionCalendarDate };

export function getDailyExpenses(transactions, monthKey, type = 'all', debts = []) {
  const daily = {};
  transactions
    .filter((t) => type === 'all' || t.type === type)
    .forEach((t) => {
      const calendarDate = getTransactionCalendarDate(t, debts);
      if (!isSameMonth(calendarDate, monthKey)) return;
      daily[calendarDate] = (daily[calendarDate] || 0) + Number(t.amount);
    });
  return daily;
}

export function getDailyUnpaidDates(transactions, monthKey, debts = []) {
  const unpaidDates = {};
  transactions.forEach((t) => {
    const calendarDate = getTransactionCalendarDate(t, debts);
    if (!isSameMonth(calendarDate, monthKey)) return;
    if (getTransactionPaidStatus(t, debts) === 'unpaid') {
      unpaidDates[calendarDate] = true;
    }
  });
  return unpaidDates;
}

export function getTransactionsForDate(transactions, dateStr, debts = []) {
  return transactions
    .filter((t) => getTransactionCalendarDate(t, debts) === dateStr)
    .sort((a, b) => Number(b.amount) - Number(a.amount));
}

export function getMonthExpenseTotal(dailyExpenses) {
  return Object.values(dailyExpenses).reduce((sum, n) => sum + n, 0);
}
