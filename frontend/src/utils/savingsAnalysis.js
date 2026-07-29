import {
  getBaseSalaryForMonth,
  getDashboardStats,
} from './calculations';
import { getMonthlyManualSavingsNet } from './savings';
import { buildAIInsights } from './aiInsights';

export function computeSavingsCapacity(stats, manualSavingsSetAside = 0, salaryOverride = null) {
  const salary = salaryOverride ?? stats.salary;
  const amountAvailableToSave =
    salary - stats.totalExpenses - stats.upcomingDebt - manualSavingsSetAside;

  return {
    salary,
    totalExpenses: stats.totalExpenses,
    upcomingDebt: stats.upcomingDebt,
    manualSavingsSetAside,
    amountAvailableToSave,
  };
}

export function buildSavingsAnalysis(data, monthKey) {
  const stats = getDashboardStats(data, monthKey);
  const insights = buildAIInsights(data, monthKey);
  const manualSavingsSetAside = getMonthlyManualSavingsNet(data.savingsHistory, monthKey);
  const capacity = computeSavingsCapacity(stats, manualSavingsSetAside);

  return {
    ...capacity,
    baseSalary: getBaseSalaryForMonth(data, monthKey),
    otherIncome: stats.otherIncome,
    monthlyRemaining: stats.monthlyRemaining,
    safeToSpend: stats.safeBalance,
    potentialSavingsFromCuts: insights.potentialSavings,
    potentialSavingsNote: 'Sum of 15% of each category with spending > RM100 — extra if you trim spending',
    formulas: {
      monthlyRemaining: 'salary - paidExpenses - upcomingBills',
      safeToSpend: 'monthlyRemaining - manualSavingsSetAsideThisMonth',
      amountAvailableToSave: 'same as safeToSpend',
    },
  };
}

export function extractSalaryFromQuestion(text) {
  const lower = text.toLowerCase();
  if (!/salary|income|earn|make|paid/.test(lower)) return null;

  const patterns = [
    /salary(?:\s+is|\s+of|\s+at)?\s*(?:rm\s?)?(\d[\d,]*(?:\.\d{1,2})?)/i,
    /income(?:\s+is|\s+of|\s+at)?\s*(?:rm\s?)?(\d[\d,]*(?:\.\d{1,2})?)/i,
    /earn(?:ing)?\s*(?:rm\s?)?(\d[\d,]*(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1].replace(/,/g, ''));
  }

  const amountMatch = text.match(/(?:rm\s?)?(\d[\d,]*(?:\.\d{1,2})?)/i);
  return amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : null;
}
