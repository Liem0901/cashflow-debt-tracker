import { isSameMonth } from './formatters';
import { getMonthlyManualSavingsNet } from './savings';
import { getTransactionPaidStatus } from './transactionStatus';
import { getWarnings } from './warnings';

function getTransactionCalendarDate(transaction, debts = []) {
  if (transaction.type === 'debt' && transaction.debtId) {
    const debt = debts.find((d) => d.id === transaction.debtId);
    if (debt?.dueDate) return debt.dueDate;
  }
  return transaction.date;
}

function isPaidExpenseInMonth(transaction, monthKey, debts = []) {
  if (transaction.type === 'income') return false;
  if (!isSameMonth(getTransactionCalendarDate(transaction, debts), monthKey)) return false;
  if (getTransactionPaidStatus(transaction, debts) === 'unpaid') return false;
  return true;
}

export { getTransactionCalendarDate };

export function getCashExpenses(transactions, monthKey) {
  return transactions
    .filter((t) => t.type === 'cash' && isSameMonth(t.date, monthKey))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function getTotalExpenses(transactions, monthKey, debts = []) {
  return transactions
    .filter((t) => isPaidExpenseInMonth(t, monthKey, debts))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function getUpcomingDebtTotal(debts, monthKey, transactions = []) {
  const fromDebts = debts
    .filter((d) => d.status !== 'paid' && isSameMonth(d.dueDate, monthKey))
    .reduce((sum, d) => sum + Number(d.remaining), 0);

  const fromUnpaidExpenses = transactions
    .filter((t) => {
      if (t.type === 'income' || t.debtId) return false;
      if (getTransactionPaidStatus(t, debts) !== 'unpaid') return false;
      return isSameMonth(getTransactionCalendarDate(t, debts), monthKey);
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return fromDebts + fromUnpaidExpenses;
}

export function getTotalActiveDebt(debts) {
  return debts
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + Number(d.remaining), 0);
}

export function getBaseSalaryForMonth(data, monthKey) {
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

/** Base salary + income transactions for the month (shown as Monthly Salary). */
export function getSalaryForMonth(data, monthKey) {
  const base = getBaseSalaryForMonth(data, monthKey);
  const income = getOtherIncomeTotal(data.transactions, monthKey);
  return base + income;
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

export function getCategorySpending(transactions, monthKey, debts = []) {
  const spending = {};
  transactions
    .filter((t) => isPaidExpenseInMonth(t, monthKey, debts))
    .forEach((t) => {
      const category = t.category || 'Other';
      spending[category] = (spending[category] || 0) + Number(t.amount);
    });
  return spending;
}

export function getCategoryUpcoming(debts, transactions, monthKey) {
  const upcoming = {};
  getUpcomingItemsThisMonth(debts, transactions, monthKey).forEach((item) => {
    const category = item.category || 'Other';
    upcoming[category] = (upcoming[category] || 0) + Number(item.remaining);
  });
  return upcoming;
}

/** Paid + upcoming amounts per category for the month. */
export function getCombinedCategoryTotals(transactions, debts, monthKey) {
  const paid = getCategorySpending(transactions, monthKey, debts);
  const upcoming = getCategoryUpcoming(debts, transactions, monthKey);
  const categories = new Set([...Object.keys(paid), ...Object.keys(upcoming)]);
  const combined = {};

  for (const category of categories) {
    const paidAmount = paid[category] || 0;
    const upcomingAmount = upcoming[category] || 0;
    combined[category] = {
      paid: paidAmount,
      upcoming: upcomingAmount,
      total: paidAmount + upcomingAmount,
    };
  }

  return combined;
}

export function getDebtsDueThisMonth(debts, monthKey) {
  return debts
    .filter((d) => d.status !== 'paid' && isSameMonth(d.dueDate, monthKey))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/** Debts due this month plus unlinked unpaid expenses (same rules as getUpcomingDebtTotal). */
export function getUpcomingItemsThisMonth(debts, transactions, monthKey) {
  const debtItems = getDebtsDueThisMonth(debts, monthKey).map((d) => ({
    id: d.id,
    category: d.category || 'Other',
    dueDate: d.dueDate,
    amount: Number(d.amount),
    remaining: Number(d.remaining),
  }));

  const unpaidExpenseItems = transactions
    .filter((t) => {
      if (t.type === 'income' || t.debtId) return false;
      if (getTransactionPaidStatus(t, debts) !== 'unpaid') return false;
      return isSameMonth(getTransactionCalendarDate(t, debts), monthKey);
    })
    .map((t) => ({
      id: `unpaid-${t.id}`,
      category: t.category || 'Other',
      dueDate: getTransactionCalendarDate(t, debts),
      amount: Number(t.amount),
      remaining: Number(t.amount),
    }));

  return [...debtItems, ...unpaidExpenseItems].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );
}

export function getRecentTransactions(transactions, limit = 5) {
  return [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export function getDailyExpenses(
  transactions,
  monthKey,
  type = 'all',
  debts = [],
  paidOnly = false
) {
  const daily = {};
  transactions
    .filter((t) => {
      if (t.type === 'income') return false;
      if (type !== 'all' && t.type !== type) return false;
      if (paidOnly && getTransactionPaidStatus(t, debts) === 'unpaid') return false;
      return true;
    })
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
  const baseSalary = getBaseSalaryForMonth(data, monthKey);
  const otherIncome = getOtherIncomeTotal(data.transactions, monthKey);
  const salary = baseSalary + otherIncome;
  const cashAvailable = salary;
  const totalExpenses = getTotalExpenses(data.transactions, monthKey, data.debts);
  const cashExpenses = getCashExpenses(data.transactions, monthKey);
  const upcomingDebt = getUpcomingDebtTotal(data.debts, monthKey, data.transactions);
  const savingsSetAside = getMonthlyManualSavingsNet(data.savingsHistory, monthKey);
  const safeBalance =
    getSafeBalance(salary, 0, totalExpenses, upcomingDebt) - savingsSetAside;
  const totalActiveDebt = getTotalActiveDebt(data.debts);
  const categorySpending = getCategorySpending(data.transactions, monthKey, data.debts);
  const debtsDueThisMonth = getUpcomingItemsThisMonth(
    data.debts,
    data.transactions,
    monthKey
  );
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
