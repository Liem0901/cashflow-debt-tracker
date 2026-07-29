import { getDashboardStats, getCombinedCategoryTotals } from './calculations';
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

export function formatTopCategorySummary({
  topCategory,
  topCategoryPaid,
  topCategoryUpcoming,
  topCategoryAmount,
}) {
  if (topCategory === '—') return '—';

  if (topCategoryUpcoming > 0 && topCategoryPaid > 0) {
    return `**${topCategory}** (${formatCurrency(topCategoryAmount)} — ${formatCurrency(topCategoryPaid)} paid + ${formatCurrency(topCategoryUpcoming)} debts)`;
  }

  if (topCategoryUpcoming > 0) {
    return `**${topCategory}** (${formatCurrency(topCategoryUpcoming)} debts)`;
  }

  return `**${topCategory}** (${formatCurrency(topCategoryPaid || topCategoryAmount)} paid)`;
}

export function buildAIInsights(data, monthKey) {
  const stats = getDashboardStats(data, monthKey);
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevStats = getDashboardStats(data, prevMonth);
  const combined = getCombinedCategoryTotals(data.transactions, data.debts, monthKey);

  const topCombined = Object.entries(combined).sort(([, a], [, b]) => b.total - a.total)[0];
  const topCategory = topCombined?.[0] || '—';
  const topCategoryPaid = topCombined?.[1]?.paid || 0;
  const topCategoryUpcoming = topCombined?.[1]?.upcoming || 0;
  const topCategoryAmount = topCombined?.[1]?.total || 0;

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
    topCategory,
    topCategoryAmount,
    topCategoryPaid,
    topCategoryUpcoming,
    topCategorySummary: formatTopCategorySummary({
      topCategory,
      topCategoryPaid,
      topCategoryUpcoming,
      topCategoryAmount,
    }),
    potentialSavings: potentialSavings || 0,
    monthlyRemaining: stats.monthlyRemaining,
    safeToSpend: stats.safeBalance,
    upcomingBills: stats.debtsDueThisMonth.slice(0, 3),
    totalExpenses: stats.totalExpenses,
    salary: stats.salary,
  };
}

export function formatInsightCurrency(amount) {
  return formatCurrency(amount);
}
