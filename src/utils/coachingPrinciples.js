import { formatCurrency, shiftMonthKey } from './formatters';
import { getDashboardStats } from './calculations';

/** Core coaching principles — shared by Gemini context and offline fallback. */
export const COACHING_PRINCIPLES = [
  {
    id: 'emergencyFund',
    rule: 'Recommend building 3–6 months of essential expenses in an emergency fund before aggressive discretionary spending.',
  },
  {
    id: 'savings',
    rule: 'Encourage saving before spending, but never suggest saving all available money — leave room for essentials and small joys.',
  },
  {
    id: 'budget',
    rule: 'Use the 50/30/20 rule as a flexible guideline: ~50% needs, ~30% wants, ~20% savings/debt — adapt to Malaysian costs and the user’s data.',
  },
  {
    id: 'purchases',
    rule: 'Evaluate purchases against income, paid expenses, upcoming bills, savings goals, and emergency buffer — not safe-to-spend alone.',
  },
  {
    id: 'debt',
    rule: 'Prioritize high-interest debt; discourage unnecessary new borrowing when cash flow is tight.',
  },
  {
    id: 'goals',
    rule: 'Tie advice to savings.goal and savings.progressPercent when relevant.',
  },
  {
    id: 'behaviour',
    rule: 'Call out unusual spending (over-budget categories, big month-over-month jumps) when the data supports it.',
  },
];

function estimateEssentialMonthlyExpenses(stats) {
  return Math.max(0, stats.totalExpenses + stats.upcomingDebt);
}

export function build503020Guide(salary) {
  if (salary <= 0) return null;
  return {
    needs50: Math.round(salary * 0.5),
    wants30: Math.round(salary * 0.3),
    savings20: Math.round(salary * 0.2),
    note: 'Flexible guideline — adjust for rent, debt, and local costs',
  };
}

/** Savings to encourage this month — not the full safe-to-spend balance. */
export function getEncouragedMonthlySavings(stats, amountAvailableToSave) {
  if (amountAvailableToSave <= 0) return 0;

  const salary = stats.salary || 0;
  const capFromSalary = salary > 0 ? Math.round(salary * 0.2) : amountAvailableToSave;
  const capFromAvailable = Math.round(amountAvailableToSave * 0.6);
  const encouraged = Math.min(amountAvailableToSave, capFromSalary, capFromAvailable);

  return Math.max(0, encouraged);
}

export function detectUnusualSpending(stats, prevCategorySpending = {}) {
  const flags = [];

  for (const [category, spent] of Object.entries(stats.categorySpending || {})) {
    const prev = prevCategorySpending[category] || 0;
    if (spent > 100 && prev > 0) {
      const jump = (spent - prev) / prev;
      if (jump >= 0.5) {
        flags.push({
          category,
          spent,
          previousSpent: prev,
          increasePercent: Math.round(jump * 100),
        });
      }
    } else if (spent > 500 && prev === 0) {
      flags.push({
        category,
        spent,
        previousSpent: 0,
        note: 'New large category this month',
      });
    }
  }

  return flags.sort((a, b) => b.spent - a.spent).slice(0, 3);
}

export function buildCoachingSnapshot(data, monthKey, insights, stats) {
  const essentials = estimateEssentialMonthlyExpenses(stats);
  const savingsBalance = Number(data.savingsBalance) || 0;
  const savingsGoal = Number(data.savingsGoal) || 0;
  const emergency3Mo = essentials * 3;
  const emergency6Mo = essentials * 6;
  const prevMonth = shiftMonthKey(monthKey, -1);
  const prevStats = getDashboardStats(data, prevMonth);

  const amountAvailableToSave = stats.safeBalance;
  const encouragedSavings = getEncouragedMonthlySavings(stats, Math.max(0, amountAvailableToSave));

  return {
    principles: COACHING_PRINCIPLES.map((p) => p.rule),
    emergencyFund: {
      essentialMonthlyExpenses: essentials,
      target3Months: emergency3Mo,
      target6Months: emergency6Mo,
      currentSavingsJar: savingsBalance,
      gapTo3Months: Math.max(0, emergency3Mo - savingsBalance),
      gapTo6Months: Math.max(0, emergency6Mo - savingsBalance),
      note: 'Use savings jar balance as emergency progress; 3–6× essentials is the coaching target',
    },
    savingsGuidance: {
      amountAvailableToSave: Math.max(0, amountAvailableToSave),
      encouragedMonthlySavings: encouragedSavings,
      note: 'Encourage saving before spending, but do NOT tell user to save all available money',
    },
    budget503020: build503020Guide(stats.salary),
    debt: {
      totalActiveDebt: stats.totalActiveDebt,
      upcomingDebtThisMonth: stats.upcomingDebt,
      note:
        stats.totalActiveDebt > 0
          ? 'Prioritize high-interest debt; avoid new borrowing when safe-to-spend is low'
          : 'No active debt recorded',
    },
    goals: {
      savingsGoal,
      savingsBalance,
      progressPercent: savingsGoal > 0 ? Math.min(100, Math.round((savingsBalance / savingsGoal) * 100)) : null,
    },
    unusualSpending: detectUnusualSpending(stats, prevStats.categorySpending),
  };
}

export function formatEmergencyFundNote(snapshot) {
  const { emergencyFund, goals } = snapshot;
  if (emergencyFund.essentialMonthlyExpenses <= 0) return null;

  if (emergencyFund.gapTo3Months > 0) {
    return `**Emergency fund:** aim for **${formatCurrency(emergencyFund.target3Months)}–${formatCurrency(emergencyFund.target6Months)}** (3–6 months of essentials). Your jar has **${formatCurrency(goals.savingsBalance)}** — **${formatCurrency(emergencyFund.gapTo3Months)}** to go for a 3-month cushion.`;
  }
  return `**Emergency fund:** you've built a solid 3-month essentials cushion (**${formatCurrency(goals.savingsBalance)}** in your jar).`;
}

export function formatSavingsCoachNote(snapshot) {
  const { savingsGuidance, goals } = snapshot;
  if (savingsGuidance.amountAvailableToSave <= 0) {
    return `Cover essentials and bills first — little room to save this month.`;
  }

  let note = `I'd aim to save **${formatCurrency(savingsGuidance.encouragedMonthlySavings)}** this month — not the full **${formatCurrency(savingsGuidance.amountAvailableToSave)}** available, so you still have breathing room.`;

  if (goals.savingsGoal > 0) {
    note += ` That moves you toward your **${formatCurrency(goals.savingsGoal)}** goal (${goals.progressPercent ?? 0}% now).`;
  }

  return note;
}

export function formatPurchaseCoachNote(price, stats, snapshot) {
  const safe = stats.safeBalance;
  const lines = [];

  if (safe < price) {
    lines.push(
      `This **${formatCurrency(price)}** purchase would exceed your safe-to-spend (**${formatCurrency(safe)}**).`
    );
  }

  if (snapshot.emergencyFund.gapTo3Months > 0 && snapshot.emergencyFund.gapTo3Months > snapshot.goals.savingsBalance) {
    lines.push(
      `You still need **${formatCurrency(snapshot.emergencyFund.gapTo3Months)}** for a 3-month emergency fund — factor that before discretionary buys.`
    );
  }

  if (stats.totalActiveDebt > 0) {
    lines.push(
      `With **${formatCurrency(stats.totalActiveDebt)}** in active debt, prioritize repayments over non-essentials when cash is tight.`
    );
  }

  if (snapshot.goals.savingsGoal > 0 && snapshot.goals.progressPercent < 100) {
    lines.push(
      `Your savings goal is **${formatCurrency(snapshot.goals.savingsGoal)}** — weigh this purchase against that progress.`
    );
  }

  return lines.join(' ');
}

export function format503020BudgetHint(stats) {
  const guide = build503020Guide(stats.salary);
  if (!guide) return null;
  return `**50/30/20 guide** (flexible): ~**${formatCurrency(guide.needs50)}** needs · ~**${formatCurrency(guide.wants30)}** wants · ~**${formatCurrency(guide.savings20)}** savings/debt`;
}

export function formatUnusualSpendingNote(snapshot) {
  const { unusualSpending } = snapshot;
  if (!unusualSpending?.length) return null;

  const top = unusualSpending[0];
  if (top.increasePercent != null) {
    return `**Unusual spending:** **${top.category}** is up **${top.increasePercent}%** vs last month (**${formatCurrency(top.spent)}**). Worth a quick review.`;
  }
  return `**Unusual spending:** **${formatCurrency(top.spent)}** on **${top.category}** — a new large category this month.`;
}
