import { getDashboardStats } from './calculations';
import { formatCurrency, getMonthName, shiftMonthKey } from './formatters';

export function computeFinancialHealthScore(stats) {
  const { safeBalance, salary, totalExpenses, upcomingDebt, totalActiveDebt } = stats;
  if (salary <= 0 && totalExpenses === 0) return 72;

  let score = 70;
  if (safeBalance > 0) score += Math.min(20, safeBalance / salary * 40);
  if (safeBalance < 0) score -= 25;
  if (upcomingDebt > salary * 0.3) score -= 10;
  if (totalActiveDebt === 0) score += 8;
  if (totalExpenses > salary) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildAIInsights(data, monthKey) {
  const stats = getDashboardStats(data, monthKey);
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevStats = getDashboardStats(data, prevMonth);

  const topCategory = Object.entries(stats.categorySpending).sort(([, a], [, b]) => b - a)[0];
  const prevExpenses = prevStats.totalExpenses || 0;
  const expenseDelta =
    prevExpenses > 0
      ? Math.round(((stats.totalExpenses - prevExpenses) / prevExpenses) * 100)
      : 0;

  const healthScore = computeFinancialHealthScore(stats);

  const potentialSavings = Object.entries(stats.categorySpending)
    .filter(([, amount]) => amount > 100)
    .reduce((sum, [, amount]) => sum + Math.round(amount * 0.15), 0);

  return {
    healthScore,
    monthLabel: getMonthName(monthKey),
    expenseDelta,
    spentLess: expenseDelta < 0,
    topCategory: topCategory?.[0] || '—',
    topCategoryAmount: topCategory?.[1] || 0,
    potentialSavings: potentialSavings || 0,
    safeBalance: stats.safeBalance,
    upcomingBills: stats.debtsDueThisMonth.slice(0, 3),
    totalExpenses: stats.totalExpenses,
    salary: stats.salary,
  };
}

export function formatInsightCurrency(amount) {
  return formatCurrency(amount);
}
