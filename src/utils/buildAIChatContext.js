import { buildAIInsights } from './aiInsights';
import {
  getDashboardStats,
  getCombinedCategoryTotals,
  getRecentTransactions,
} from './calculations';
import { buildSavingsAnalysis } from './savingsAnalysis';
import { getSavingsProgress } from './savings';
import { shiftMonthKey, isSameMonth } from './formatters';
import { CATEGORIES } from '../data/initialData';
import { buildCategoryBudgetRecommendations } from './budgetRecommendations';
import { buildCoachingSnapshot } from './coachingPrinciples';

function getOverBudgetCategories(budgets, categorySpending) {
  return Object.entries(categorySpending)
    .map(([category, spent]) => {
      const limit = Number(budgets[category]) || 0;
      if (limit <= 0 || spent <= limit) return null;
      return { category, spent, limit, overBy: spent - limit };
    })
    .filter(Boolean)
    .sort((a, b) => b.overBy - a.overBy);
}

function getRecentExpenseSnapshot(transactions, monthKey, limit = 5) {
  const monthExpenses = transactions.filter(
    (tx) => tx.type !== 'income' && isSameMonth(tx.date, monthKey)
  );

  return getRecentTransactions(monthExpenses, limit).map((tx) => ({
    category: tx.category || 'Other',
    amount: Number(tx.amount) || 0,
    date: tx.date,
    type: tx.type,
  }));
}

function getBillsDueSoon(bills, withinDays = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + withinDays);

  return bills
    .filter((bill) => {
      if (!bill.dueDate) return false;
      const due = new Date(`${bill.dueDate}T00:00:00`);
      return due >= today && due <= cutoff;
    })
    .map((bill) => ({
      category: bill.category,
      remaining: bill.remaining,
      dueDate: bill.dueDate,
    }));
}

function buildCategorySpendLimits(budgets, categorySpending, safeToSpend) {
  const categories = new Set([
    ...Object.keys(budgets || {}),
    ...Object.keys(categorySpending || {}),
  ]);

  return [...categories].map((category) => {
    const spent = categorySpending[category] || 0;
    const limit = Number(budgets[category]) || 0;
    const budgetRemaining = limit > 0 ? Math.max(0, limit - spent) : null;
    const maxAdditionalSpend =
      budgetRemaining != null
        ? Math.max(0, Math.min(budgetRemaining, safeToSpend))
        : Math.max(0, safeToSpend);

    return {
      category,
      spent,
      limit: limit || null,
      budgetRemaining,
      maxAdditionalSpend,
      note: 'maxAdditionalSpend = min(budget remaining, safeToSpend) when budget set; else safeToSpend',
    };
  });
}

export function buildAIChatContext(data, monthKey) {
  const insights = buildAIInsights(data, monthKey);
  const stats = getDashboardStats(data, monthKey);
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevStats = getDashboardStats(data, prevMonth);
  const combined = getCombinedCategoryTotals(data.transactions, data.debts, monthKey);
  const savingsAnalysis = buildSavingsAnalysis(data, monthKey);
  const budgets = data.budgets || {};
  const savingsBalance = data.savingsBalance ?? 0;
  const savingsGoal = data.savingsGoal ?? 0;

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
      monthlyRemaining: insights.monthlyRemaining,
      safeToSpend: insights.safeToSpend,
      totalExpenses: insights.totalExpenses,
      salary: insights.salary,
      upcomingBills: insights.upcomingBills.map((bill) => ({
        category: bill.category,
        remaining: bill.remaining,
        dueDate: bill.dueDate,
      })),
    },
    stats: {
      monthlyRemaining: stats.monthlyRemaining,
      safeToSpend: stats.safeBalance,
      salary: stats.salary,
      totalExpenses: stats.totalExpenses,
      upcomingDebt: stats.upcomingDebt,
      totalActiveDebt: stats.totalActiveDebt,
      categorySpending: stats.categorySpending,
    },
    questionInterpretation: {
      balanceOrRemaining:
        '"How much left?", "What\'s my balance?", "How much remains?" → use stats.monthlyRemaining (salary - paidExpenses - upcomingDebt). Do NOT subtract manual savings.',
      safeToSpendOrAfford:
        '"How much can I spend?", affordability, category limits → use stats.safeToSpend (monthlyRemaining minus manual savings set aside this month).',
      savingsCapacity:
        '"How much should I save?" → use savings.analysis.amountAvailableToSave (same as safeToSpend).',
      categoryBudget:
        '"What budget for X?", "How much budget for Shopping?" → budgetRecommendations for that category; use benchmarks when user has no spending in X yet.',
    },
    comparison: {
      previousMonthExpenses: prevStats.totalExpenses,
      previousMonthSalary: prevStats.salary,
    },
    savings: {
      balance: savingsBalance,
      goal: savingsGoal,
      progressPercent: getSavingsProgress(savingsBalance, savingsGoal),
      analysis: savingsAnalysis,
    },
    budgets,
    availableCategories: CATEGORIES,
    budgetRecommendations: buildCategoryBudgetRecommendations(stats, budgets),
    coaching: buildCoachingSnapshot(data, monthKey, insights, stats),
    overBudgetCategories: getOverBudgetCategories(budgets, stats.categorySpending),
    categorySpendLimits: buildCategorySpendLimits(budgets, stats.categorySpending, stats.safeBalance),
    recentExpenses: getRecentExpenseSnapshot(data.transactions, monthKey),
    billsDueSoon: getBillsDueSoon(stats.debtsDueThisMonth),
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
