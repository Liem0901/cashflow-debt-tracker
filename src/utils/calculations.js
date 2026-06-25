import { isSameMonth } from './formatters';
import { getTransactionPaidStatus } from './transactionStatus';
import { getWarnings } from './warnings';

export function getCashExpenses(transactions, monthKey) {
  return transactions
    .filter((t) => t.type === 'cash' && isSameMonth(t.date, monthKey))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function getTotalExpenses(transactions, monthKey, debts = []) {
  return transactions
    .filter((t) => {
      if (t.type === 'income') return false;
      if (!isSameMonth(getTransactionCalendarDate(t, debts), monthKey)) return false;
      if (t.type === 'debt' && getTransactionPaidStatus(t, debts) === 'unpaid') return false;
      return true;
    })
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

export function getSalaryForMonth(data, monthKey) {
  if (data.salaryByMonth?.[monthKey] != null) {
    return Number(data.salaryByMonth[monthKey]);
  }

  if (data.salaryByMonth) {
    const priorMonth = Object.keys(data.salaryByMonth)
      .filter((key) => key < monthKey)
      .sort()
      .pop();
    if (priorMonth != null) return Number(data.salaryByMonth[priorMonth]);
  }

  if (data.salary != null) return Number(data.salary);
  return 0;
}

export function hasSalaryOverride(data, monthKey) {
  return data.salaryByMonth?.[monthKey] != null;
}

export function getOtherIncomeTotal(transactions, monthKey) {
  return transactions
    .filter((t) => t.type === 'income' && isSameMonth(t.date, monthKey))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function getCashAvailable(salary, otherIncome) {
  return Number(salary) + Number(otherIncome);
}

export function getSafeBalance(salary, otherIncome, totalExpenses, upcomingDebt) {
  return getCashAvailable(salary, otherIncome) - totalExpenses - upcomingDebt;
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
    .filter((t) => t.type !== 'income' && (type === 'all' || t.type === type))
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

export function getDashboardStats(data, monthKey) {
  const salary = getSalaryForMonth(data, monthKey);
  const otherIncome = getOtherIncomeTotal(data.transactions, monthKey);
  const cashAvailable = getCashAvailable(salary, otherIncome);
  const totalExpenses = getTotalExpenses(data.transactions, monthKey, data.debts);
  const cashExpenses = getCashExpenses(data.transactions, monthKey);
  const upcomingDebt = getUpcomingDebtTotal(data.debts, monthKey);
  const safeBalance = getSafeBalance(salary, otherIncome, totalExpenses, upcomingDebt);
  const totalActiveDebt = getTotalActiveDebt(data.debts);
  const categorySpending = getCategorySpending(data.transactions, monthKey);
  const debtsDueThisMonth = getDebtsDueThisMonth(data.debts, monthKey);
  const recentTransactions = getRecentTransactions(data.transactions);
  const warnings = getWarnings({
    salary: cashAvailable,
    safeBalance,
    upcomingDebt,
    debts: data.debts,
  });

  return {
    salary,
    otherIncome,
    cashAvailable,
    cashExpenses,
    totalExpenses,
    upcomingDebt,
    safeBalance,
    totalActiveDebt,
    categorySpending,
    debtsDueThisMonth,
    recentTransactions,
    warnings,
  };
}
