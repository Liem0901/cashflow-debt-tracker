import { daysUntil } from './formatters';

export function getWarnings({ salary, safeBalance, upcomingDebt, debts }) {
  const warnings = [];

  if (salary > 0 && upcomingDebt / salary > 0.5) {
    warnings.push({
      id: 'debt-ratio',
      type: 'danger',
      title: 'High debt load',
      message: `Debt obligations exceed 50% of your salary (${Math.round((upcomingDebt / salary) * 100)}%).`,
    });
  }

  if (safeBalance < 500) {
    warnings.push({
      id: 'low-safe',
      type: safeBalance < 0 ? 'danger' : 'warning',
      title: safeBalance < 0 ? 'Overspent!' : 'Low safe balance',
      message:
        safeBalance < 0
          ? `You're RM ${Math.abs(safeBalance).toFixed(0)} over budget this month.`
          : `Safe balance is below RM 500. Consider reducing spending.`,
    });
  }

  const urgentDebts = debts.filter(
    (d) => d.status !== 'paid' && daysUntil(d.dueDate) >= 0 && daysUntil(d.dueDate) <= 7
  );

  urgentDebts.forEach((debt) => {
    const days = daysUntil(debt.dueDate);
    warnings.push({
      id: `due-${debt.id}`,
      type: 'warning',
      title: 'Debt due soon',
      message: `${debt.name}: ${days === 0 ? 'Due today' : `Due in ${days} day${days > 1 ? 's' : ''}`} — RM ${debt.remaining}`,
    });
  });

  return warnings;
}
