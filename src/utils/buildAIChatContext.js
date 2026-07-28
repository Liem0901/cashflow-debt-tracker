import { buildAIInsights } from './aiInsights';
import { getDashboardStats, getCombinedCategoryTotals } from './calculations';
import { buildSavingsAnalysis } from './savingsAnalysis';
import { shiftMonthKey } from './formatters';

export function buildAIChatContext(data, monthKey) {
  const insights = buildAIInsights(data, monthKey);
  const stats = getDashboardStats(data, monthKey);
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevStats = getDashboardStats(data, prevMonth);
  const combined = getCombinedCategoryTotals(data.transactions, data.debts, monthKey);
  const savingsAnalysis = buildSavingsAnalysis(data, monthKey);

  return {
    monthKey,
    monthLabel: insights.monthLabel,
    currency: 'MYR',
    insights: {
      healthScore: insights.healthScore,
      expenseDeltaPercent: insights.expenseDelta,
      spentLessThanLastMonth: insights.spentLess,
      topCategory: insights.topCategory,
      topCategoryAmount: insights.topCategoryAmount,
      topCategorySummary: insights.topCategorySummary,
      potentialSavings: insights.potentialSavings,
      potentialSavingsNote: 'Sum of 15% of each category with spending > RM100',
      safeBalance: insights.safeBalance,
      totalExpenses: insights.totalExpenses,
      salary: insights.salary,
      upcomingBills: insights.upcomingBills.map((bill) => ({
        category: bill.category,
        remaining: bill.remaining,
        dueDate: bill.dueDate,
      })),
    },
    stats: {
      safeBalance: stats.safeBalance,
      salary: stats.salary,
      totalExpenses: stats.totalExpenses,
      upcomingDebt: stats.upcomingDebt,
      totalActiveDebt: stats.totalActiveDebt,
      categorySpending: stats.categorySpending,
    },
    comparison: {
      previousMonthExpenses: prevStats.totalExpenses,
      previousMonthSalary: prevStats.salary,
    },
    savings: {
      balance: data.savingsBalance ?? 0,
      goal: data.savingsGoal ?? 0,
      analysis: savingsAnalysis,
    },
    budgets: data.budgets?.[monthKey] || {},
    topCategoriesByTotal: Object.entries(combined)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 6)
      .map(([category, value]) => ({
        category,
        total: value.total,
        paid: value.paid,
        upcoming: value.upcoming,
      })),
  };
}
