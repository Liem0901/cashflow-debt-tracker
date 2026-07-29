import { generateId } from '../data/initialData';
import { utcNowIso, monthKeyFromTimestamp, normalizeSavingsHistory } from './dates';

export const DEFAULT_SAVINGS_GOAL = 5000;

export function normalizeSavingsData(data) {
  return {
    ...data,
    savingsBalance: Number(data.savingsBalance) || 0,
    savingsGoal: Number(data.savingsGoal) || DEFAULT_SAVINGS_GOAL,
    savingsHistory: normalizeSavingsHistory(data.savingsHistory),
  };
}

export function createSavingsEntry({ type, amount, month, note = '' }) {
  return {
    id: generateId('save'),
    type,
    amount: Number(amount),
    month: month || null,
    note,
    date: utcNowIso(),
  };
}

export function hasAutoSaveForMonth(savingsHistory, monthKey) {
  return (savingsHistory || []).some((entry) => entry.type === 'auto' && entry.month === monthKey);
}

export function applyAutoMonthEndSave(data, monthKey, leftover) {
  const amount = Math.max(0, Number(leftover) || 0);
  if (amount <= 0 || hasAutoSaveForMonth(data.savingsHistory, monthKey)) {
    return data;
  }

  const entry = createSavingsEntry({
    type: 'auto',
    amount,
    month: monthKey,
    note: 'Month-end leftover',
  });

  return {
    ...data,
    savingsBalance: (Number(data.savingsBalance) || 0) + amount,
    savingsHistory: [entry, ...(data.savingsHistory || [])],
  };
}

export function applySavingsDeposit(data, amount, note = '') {
  const value = Number(amount);
  if (!value || value <= 0) return data;

  const entry = createSavingsEntry({
    type: 'deposit',
    amount: value,
    month: data.currentMonth || null,
    note: note.trim() || 'Manual deposit',
  });

  return {
    ...data,
    savingsBalance: (Number(data.savingsBalance) || 0) + value,
    savingsHistory: [entry, ...(data.savingsHistory || [])],
  };
}

export function applySavingsWithdraw(data, amount, note = '') {
  const value = Number(amount);
  if (!value || value <= 0) return data;

  const balance = Number(data.savingsBalance) || 0;
  const withdrawn = Math.min(value, balance);
  if (withdrawn <= 0) return data;

  const entry = createSavingsEntry({
    type: 'withdraw',
    amount: withdrawn,
    month: data.currentMonth || null,
    note: note.trim() || 'Manual withdrawal',
  });

  return {
    ...data,
    savingsBalance: balance - withdrawn,
    savingsHistory: [entry, ...(data.savingsHistory || [])],
  };
}

export function getSavingsProgress(balance, goal) {
  const target = Number(goal) || DEFAULT_SAVINGS_GOAL;
  if (target <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, Number(balance) || 0) / target) * 100));
}

function getSavingsEntryMonth(entry) {
  return entry.month || monthKeyFromTimestamp(entry.date);
}

/** Net manual savings set aside this month (deposits − withdrawals). Excludes auto month-end saves. */
export function getMonthlyManualSavingsNet(savingsHistory, monthKey) {
  return (savingsHistory || []).reduce((net, entry) => {
    if (entry.type === 'auto') return net;
    if (getSavingsEntryMonth(entry) !== monthKey) return net;
    const amount = Number(entry.amount) || 0;
    if (entry.type === 'deposit') return net + amount;
    if (entry.type === 'withdraw') return net - amount;
    return net;
  }, 0);
}
